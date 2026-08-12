"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Layout Error:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Application Error</h2>
        <p className="mt-2 text-sm text-slate-400 max-w-md">
          A critical error occurred while loading the application shell.
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reload Application</span>
        </button>
      </body>
    </html>
  );
}
