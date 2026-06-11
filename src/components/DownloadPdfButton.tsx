import * as React from "react";

export function DownloadPdfButton({
  targetId,
  diagId,
}: {
  targetId: string;
  diagId: string;
}) {
  const [loading, setLoading] = React.useState(false);

  const handleDownload = async () => {
    const el = document.getElementById(targetId);
    if (!el) return;
    setLoading(true);
    const btn = document.activeElement as HTMLElement | null;
    btn?.scrollIntoView({ behavior: "smooth", block: "center" });
    document.body.classList.add("pdf-export");
    document.documentElement.style.fontSize = "18px";
    // small delay so styles apply
    await new Promise((r) => setTimeout(r, 100));

    try {
      const [{ default: html2canvas }, jspdfMod] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);
      const { jsPDF } = jspdfMod as typeof import("jspdf");

      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: "#FFFFFF",
        useCORS: true,
        logging: false,
        windowWidth: el.scrollWidth,
      });

      const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 18;
      const headerH = 70;
      const footerH = 24;
      const contentW = pageW - margin * 2;
      const contentTop = headerH + 12;
      const contentBottom = pageH - footerH;
      const contentH = contentBottom - contentTop;

      const today = new Date().toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const drawHeader = (pageNum: number, totalPages: number) => {
        // Header band
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageW, headerH, "F");
        // Logo
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(26, 43, 69); // #1A2B45
        pdf.setFontSize(18);
        pdf.text("PayRank", margin, 32);
        // Meta right
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(12, 12, 12);
        pdf.text(`ID: ${diagId}`, pageW - margin, 24, { align: "right" });
        pdf.text(`Generado: ${today}`, pageW - margin, 36, { align: "right" });
        pdf.text("Confidencial · Uso personal exclusivo", pageW - margin, 48, { align: "right" });
        // accent line
        pdf.setDrawColor(46, 74, 110);
        pdf.setLineWidth(1);
        pdf.line(margin, headerH - 6, pageW - margin, headerH - 6);
        // footer
        pdf.setFontSize(7);
        pdf.setTextColor(100, 100, 100);
        pdf.text(
          "PayRank LLC · Confidencial · Uso personal exclusivo",
          margin,
          pageH - 10,
        );
        pdf.text(`${pageNum} / ${totalPages}`, pageW - margin, pageH - 10, { align: "right" });
      };

      // Pagination: slice canvas vertically
      const pxPerPt = canvas.width / contentW;
      const pageSliceHpx = Math.floor(contentH * pxPerPt);
      let totalPages = Math.max(1, Math.ceil(canvas.height / pageSliceHpx));

      // Skip trailing near-empty pages caused by bottom padding overflow.
      // Scan from the bottom of the last slice to find real pixel content.
      // Drop the last page if it has less than 15% of a full page of real content.
      if (totalPages > 1) {
        const lastSliceHpx = canvas.height - (totalPages - 1) * pageSliceHpx;
        const minContentPx = Math.floor(pageSliceHpx * 0.15);
        if (lastSliceHpx < minContentPx) {
          totalPages -= 1;
        }
      }



      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();
        drawHeader(i + 1, totalPages);

        const sy = i * pageSliceHpx;
        const sh = Math.min(pageSliceHpx, canvas.height - sy);

        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = sh;
        const ctx = slice.getContext("2d")!;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);

        const imgData = slice.toDataURL("image/jpeg", 0.92);
        const renderH = sh / pxPerPt;
        pdf.addImage(imgData, "JPEG", margin, contentTop, contentW, renderH);
      }

      pdf.save(`PayRank_${diagId}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("No se pudo generar el PDF. Intentá de nuevo.");
    } finally {
      document.body.classList.remove("pdf-export");
      document.documentElement.style.fontSize = "";
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div className="flex justify-center py-10 bg-white">
        <button
          onClick={handleDownload}
          disabled={loading}
          style={{
            backgroundColor: "#1A2B45",
            color: "#F5F2ED",
            fontFamily: "Arial, sans-serif",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            padding: "16px 32px",
            fontSize: "13px",
            fontWeight: 700,
            border: "none",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Generando PDF…
            </span>
          ) : "Descargar mi PayRank (PDF)"}
        </button>
      </div>
    </>
  );
}
