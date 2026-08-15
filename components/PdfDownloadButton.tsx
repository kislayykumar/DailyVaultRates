"use client";

import { useState } from "react";
import { Download, Loader2, CheckCircle } from "lucide-react";

interface PdfDownloadButtonProps {
  targetId?: string;
  filename?: string;
  dateStr?: string;
  label?: string;
  className?: string;
  variant?: "gold" | "emerald" | "slate";
}

export default function PdfDownloadButton({
  targetId = "rates-report-container",
  filename,
  dateStr = new Date().toISOString().split("T")[0],
  label,
  className = "",
  variant = "gold",
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
            "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
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
        margin: [8, 8, 8, 8],
        filename: pdfFilename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#040810", // Match deep space dark theme
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

  const variantStyles = {
    gold: "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 shadow-amber-500/20 hover:shadow-amber-500/30",
    emerald: "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 text-slate-950 shadow-emerald-500/20 hover:shadow-emerald-500/30",
    slate: "border border-slate-700 bg-slate-800/80 text-slate-200 hover:border-emerald-500/40 hover:text-white",
  };

  return (
    <button
      onClick={handleDownloadPdf}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 ${variantStyles[variant]} ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          <span>Generating PDF…</span>
        </>
      ) : downloaded ? (
        <>
          <CheckCircle className="h-4 w-4 text-emerald-950 shrink-0" />
          <span>PDF Exported!</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4 shrink-0" />
          <span>{label || "Download PDF Report"}</span>
        </>
      )}
    </button>
  );
}
