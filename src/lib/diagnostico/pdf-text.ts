// Extracción de texto de PDFs en el cliente con pdfjs-dist.
// Limita tokens enviados a Anthropic para no superar el rate limit de Tier 1.

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
// Vite resuelve la URL del worker correctamente con `?url`.
import workerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

(pdfjsLib as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = workerUrl;

export async function extractPdfText(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buf),
    isEvalSupported: false,
    useSystemFonts: true,
  } as unknown as Parameters<typeof pdfjsLib.getDocument>[0]);
  const pdf = await loadingTask.promise;

  const out: string[] = [];
  const maxPages = Math.min(pdf.numPages, 10);
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // Reconstruimos saltos de línea según la coordenada Y real de cada fragmento —
    // un join() plano sin esto puede mezclar filas de tablas (ej. "Payment Currency"
    // y su valor en columnas separadas) en el orden interno del PDF, no el visual.
    let pageText = "";
    let lastY: number | null = null;
    for (const it of content.items) {
      if (!("str" in it)) continue;
      const str = (it as { str: string }).str;
      const transform = (it as { transform?: number[] }).transform;
      const y = Array.isArray(transform) ? transform[5] : null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 3) {
        pageText += "\n";
      } else if (pageText && !pageText.endsWith("\n") && !pageText.endsWith(" ")) {
        pageText += " ";
      }
      pageText += str;
      if (y !== null) lastY = y;
    }
    out.push(pageText);
  }
  return out.join("\n\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
