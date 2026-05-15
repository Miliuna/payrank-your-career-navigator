// Extracción de texto de PDFs en el cliente con pdfjs-dist.
// Limita tokens enviados a Anthropic para no superar el rate limit de Tier 1.

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// Desactivar worker para simplificar (corre en main thread; ok para CVs cortos).
// @ts-expect-error pdfjs typing
pdfjsLib.GlobalWorkerOptions.workerSrc = "";

export async function extractPdfText(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buf),
    disableWorker: true,
    isEvalSupported: false,
    useSystemFonts: true,
  } as unknown as Parameters<typeof pdfjsLib.getDocument>[0]);
  const pdf = await loadingTask.promise;

  const out: string[] = [];
  const maxPages = Math.min(pdf.numPages, 10);
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((it) => ("str" in it ? (it as { str: string }).str : ""))
      .join(" ");
    out.push(pageText);
  }
  return out.join("\n\n").replace(/\s+/g, " ").trim();
}
