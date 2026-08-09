import Link from "next/link";
import { Vault, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
        <Vault className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-black text-white">404 — Page Not Found</h1>
      <p className="mt-2 text-sm text-slate-400 max-w-md">
        The spot rate archive page or requested route could not be found.
      </p>
      <Link
        href="/"
        className="mt-6 btn-gold rounded-xl px-5 py-2.5 text-xs font-bold shadow-lg flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Spot Terminal</span>
      </Link>
    </div>
  );
}
