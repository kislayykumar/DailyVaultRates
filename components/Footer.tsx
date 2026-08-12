import Link from "next/link";
import { Vault, Database, Shield, Zap, Globe, TrendingUp } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-slate-800/80 bg-slate-950/95 text-slate-400">
      <div className="h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">

          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 shadow-lg shadow-amber-500/20">
                <Vault className="h-4 w-4 text-amber-400" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Daily<span className="text-gold-gradient">Vault</span>Rates
              </span>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Institutional market intelligence platform providing live Indian stock quotes, precious metals spot rates, and global currency exchange archives.
            </p>

            <div className="mt-5 flex items-center gap-2">
              {[
                { icon: Shield, label: "Verified" },
                { icon: Zap, label: "Realtime" },
                { icon: Globe, label: "Global" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-slate-300">
                  <Icon className="h-3 w-3 text-emerald-400" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Indian Equity Markets Links */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Indian Equities (NSE/BSE)
            </h3>
            <div className="mt-3 h-px w-full bg-gradient-to-r from-emerald-500/30 to-transparent" />
            <ul className="mt-4 space-y-2.5 text-xs">
              {["NIFTY 50 Index (^NSEI)", "SENSEX Benchmark (^BSESN)", "Reliance Industries (RELIANCE.NS)", "Tata Consultancy Services (TCS.NS)", "HDFC Bank (HDFCBANK.NS)", "Infosys Ltd (INFY.NS)"].map((label) => (
                <li key={label}>
                  <Link href="/" className="flex items-center gap-2 text-slate-400 transition-colors hover:text-emerald-400">
                    <span className="h-1 w-1 rounded-full bg-emerald-400/60" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Metals Links */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Precious Metals</h3>
            <div className="mt-3 h-px w-full bg-gradient-to-r from-amber-500/30 to-transparent" />
            <ul className="mt-4 space-y-2.5 text-xs">
              {["Gold 24K Spot Rate (XAU)", "Gold 22K Jewelry Grade", "Silver Spot Rate (XAG)", "Platinum Price Index (XPT)", "Aluminum Spot Rate (ALU)"].map((label) => (
                <li key={label}>
                  <Link href="/" className="flex items-center gap-2 text-slate-400 transition-colors hover:text-amber-400">
                    <span className="h-1 w-1 rounded-full bg-amber-400/60" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institutional Platform */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Currencies &amp; Vault</h3>
            <div className="mt-3 h-px w-full bg-gradient-to-r from-cyan-500/30 to-transparent" />
            <div className="mt-4 space-y-2.5">
              {[
                { icon: Database, title: "Immutable Market Vault", desc: "Tamper-proof daily historical records" },
                { icon: Zap, title: "Dual Session Updates", desc: "Automated at 9:00 AM & 5:30 PM IST" },
                { icon: Shield, title: "SEBI & IBJA Aligned", desc: "Verified public spot rates & delayed feeds" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5">
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                  <div>
                    <p className="text-[11px] font-semibold text-white">{title}</p>
                    <p className="text-[10px] text-slate-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} DailyVaultRates. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Verified SEBI Public Data</span>
            <span>·</span>
            <span>Non-Commercial Market Intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
