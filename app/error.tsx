"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Router Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
      <p className="mt-2 text-sm text-slate-400 max-w-md">
        An error occurred while loading this page. Please try refreshing or return to homepage.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 btn-gold rounded-xl px-5 py-2.5 text-xs font-bold shadow-lg flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
