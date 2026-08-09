import Link from "next/link";
import { Vault, Database, Shield, Zap, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-slate-800/80 bg-slate-950/95 text-slate-400">
      {/* Top Gold Shimmer Border Line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">

          {/* ── Brand Column ─────────────────────────── */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-md shadow-amber-500/20">
                <Vault className="h-4 w-4 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Daily<span className="text-gold-gradient">Vault</span>Rates
              </span>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Open financial data platform delivering automated daily spot rate archives for precious metals and global exchange rates.
            </p>

            {/* Trust Badges */}
            <div className="mt-5 flex items-center gap-2.5">
              {[
                { icon: Shield, label: "Verified" },
                { icon: Zap, label: "Daily" },
                { icon: Globe, label: "Global" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                  <Icon className="h-3 w-3 text-amber-400" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Metals Links ─────────────────────────── */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-amber-400">Precious Metals</h3>
            <div className="mt-3 h-[1px] w-full bg-gradient-to-r from-amber-500/30 to-transparent" />
            <ul className="mt-4 space-y-2.5 text-xs">
              {[
                "Gold Spot Rate (XAU)",
                "Silver Spot Rate (XAG)",
                "Platinum Price Index (XPT)",
                "Aluminum Spot Rate (ALI)",
              ].map((label) => (
                <li key={label}>
                  <Link href="/" className="flex items-center gap-2 text-slate-400 transition-colors hover:text-amber-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400/50" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Forex Links ──────────────────────────── */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-sky-400">Currencies &amp; FX</h3>
            <div className="mt-3 h-[1px] w-full bg-gradient-to-r from-sky-500/30 to-transparent" />
            <ul className="mt-4 space-y-2.5 text-xs">
              {[
                "EUR / USD Rate",
                "GBP / USD Rate",
                "USD / JPY Rate",
                "USD / INR Rate",
              ].map((label) => (
                <li key={label}>
                  <Link href="/" className="flex items-center gap-2 text-slate-400 transition-colors hover:text-sky-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400/50" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Platform Trust Features ─────────────────────── */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-300">Institutional Platform</h3>
            <div className="mt-3 h-[1px] w-full bg-gradient-to-r from-slate-700/30 to-transparent" />

            <div className="mt-4 space-y-2.5">
              {[
                { icon: Database, title: "Immutable Market Vault", desc: "Tamper-proof daily historical archives" },
                { icon: Zap, title: "Dual Session Updates", desc: "Automated at 9:00 AM & 5:30 PM IST" },
                { icon: Shield, title: "Institutional Precision", desc: "Verified IBJA, GoodReturns & Forex data" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5">
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <div>
                    <p className="text-[11px] font-semibold text-white">{title}</p>
                    <p className="text-[10px] text-slate-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ────────────────────────────── */}
        <div className="mt-12 border-t border-slate-800/80 pt-6">
          <p className="text-[11px] leading-relaxed text-slate-500">
            <strong className="text-slate-400">Disclaimer:</strong> Spot rates and forex values on DailyVaultRates are for informational and historical archiving purposes only. They do not constitute financial advice or binding trading quotes. Always consult a certified financial advisor before executing commodity or currency transactions.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} DailyVaultRates. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-slate-300">
                Institutional Market Feed
              </span>
              <span className="rounded-full border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-slate-300">
                Certified Rate Archives
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
