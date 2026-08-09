"use client";

import { useState } from "react";
import { Download, FileText, Loader2, CheckCircle } from "lucide-react";

interface PdfDownloadButtonProps {
  targetId?: string;
  filename?: string;
  dateStr?: string;
  className?: string;
}

export default function PdfDownloadButton({
  targetId = "rates-report-container",
  filename,
  dateStr = new Date().toISOString().split("T")[0],
  className = "",
}: PdfDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const pdfFilename = filename || `DailyVaultRates-Report-${dateStr}.pdf`;

  const handleDownloadPdf = async () => {
    setLoading(true);
    setDownloaded(false);

    try {
      const element = document.getElementById(targetId);
      if (!element) {
        throw new Error(`Element with id '${targetId}' not found.`);
      }

      // Ensure html2pdf script is loaded dynamically
      if (!(window as any).html2pdf) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.min.js";
          script.integrity =
            "sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==";
          script.crossOrigin = "anonymous";
          script.referrerPolicy = "no-referrer";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load html2pdf script"));
          document.body.appendChild(script);
        });
      }

      const html2pdf = (window as any).html2pdf;
      if (!html2pdf) {
        throw new Error("html2pdf library is unavailable.");
      }

      const options = {
        margin: [10, 10, 10, 10],
        filename: pdfFilename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#0a1128", // Match navy theme
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(options).from(element).save();

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 4000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      // Fallback: browser print dialog
      window.print();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadPdf}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] hover:shadow-amber-500/30 active:scale-[0.98] disabled:opacity-70 ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
          <span>Generating PDF...</span>
        </>
      ) : downloaded ? (
        <>
          <CheckCircle className="h-4 w-4 text-emerald-950" />
          <span>Downloaded!</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span>Download PDF Report</span>
        </>
      )}
    </button>
  );
}
