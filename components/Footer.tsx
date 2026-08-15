import Link from "next/link";
import { Vault, Database, Shield, Zap, Globe, TrendingUp } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-24 text-slate-400"
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(2,4,9,0.98)" }}>

      {/* V3 Top Gradient Accent Line */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 via-30% to-transparent" />
      <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 via-70% to-transparent mt-px opacity-60" />

      {/* ── Feature Strip ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-12">
          {[
            { icon: Shield, title: "SEBI & IBJA Verified",  desc: "Spot rates cross-checked with IBJA and GoodReturns",        color: "#10B981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.20)" },
            { icon: Zap,    title: "Dual-Session Updates",  desc: "Automated at 9:00 AM & 5:30 PM IST daily",                   color: "#F59E0B", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.20)" },
            { icon: Globe,  title: "Global Coverage",       desc: "Metals, currencies & equities in one tamper-proof vault",    color: "#00D4FF", bg: "rgba(0,212,255,0.08)",   border: "rgba(0,212,255,0.20)"  },
          ].map(({ icon: Icon, title, desc, color, bg, border }) => (
            <div key={title}
              className="flex items-start gap-3 rounded-2xl p-4 transition-all hover:scale-[1.01]"
              style={{ background: bg, border: `1px solid ${border}` }}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${color}15`, border: `1px solid ${color}28` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div>
                <p className="text-[12px] font-bold text-white">{title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main 4-col Grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">

          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.28)]"
                style={{ background: "linear-gradient(135deg, #D97706, #F59E0B, #FBBF24)" }}>
                <Vault className="h-4 w-4 text-[#020409]" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-black tracking-tight text-white"
                style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                Daily<span className="text-gold-gradient-v3">Vault</span>Rates
              </span>
            </div>

            <p className="mt-4 text-[12px] leading-relaxed text-slate-400">
              Institutional market intelligence platform providing live Indian stock quotes, precious metals spot rates, and global currency exchange archives.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { icon: Shield, label: "Verified" },
                { icon: Zap,    label: "Realtime" },
                { icon: Globe,  label: "Global"   },
              ].map(({ icon: Icon, label }) => (
                <div key={label}
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold text-slate-300"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Icon className="h-3 w-3 text-emerald-400" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Indian Equities */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" /> Indian Equities (NSE/BSE)
            </h3>
            <div className="mt-3 glow-divider-emerald" />
            <ul className="mt-4 space-y-2.5 text-[12px]">
              {["NIFTY 50 Index (^NSEI)", "SENSEX Benchmark (^BSESN)", "Reliance Industries (RELIANCE.NS)", "TCS — Tata Consultancy (TCS.NS)", "HDFC Bank (HDFCBANK.NS)", "Infosys Ltd (INFY.NS)"].map((label) => (
                <li key={label}>
                  <Link href="/" className="flex items-center gap-2 text-slate-400 transition-colors hover:text-emerald-400 group">
                    <span className="h-1 w-1 rounded-full bg-emerald-400/40 group-hover:bg-emerald-400 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Precious Metals */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Precious Metals</h3>
            <div className="mt-3 glow-divider-gold" />
            <ul className="mt-4 space-y-2.5 text-[12px]">
              {["Gold 24K Spot Rate (XAU)", "Gold 22K Jewelry Grade", "Silver Spot Rate (XAG)", "Platinum Price Index (XPT)", "Aluminum Spot Rate (ALI)"].map((label) => (
                <li key={label}>
                  <Link href="/" className="flex items-center gap-2 text-slate-400 transition-colors hover:text-amber-400 group">
                    <span className="h-1 w-1 rounded-full bg-amber-400/40 group-hover:bg-amber-400 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Features */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Vault Platform</h3>
            <div className="mt-3 glow-divider-cyan" />
            <div className="mt-4 space-y-3">
              {[
                { icon: Database, title: "Immutable Market Vault",  desc: "Tamper-proof daily historical records" },
                { icon: Zap,      title: "Dual Session Updates",    desc: "Automated at 9:00 AM & 5:30 PM IST" },
                { icon: Shield,   title: "SEBI & IBJA Aligned",     desc: "Verified public spot rates & delayed feeds" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title}
                  className="flex items-start gap-2.5 rounded-xl p-2.5 transition-colors hover:bg-white/2"
                  style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(6,11,20,0.60)" }}>
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                  <div>
                    <p className="text-[11px] font-semibold text-white">{title}</p>
                    <p className="text-[10px] text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-12 border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <p className="text-slate-600">© {new Date().getFullYear()} DailyVaultRates. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-600">Verified SEBI Public Data</span>
            <span className="text-slate-800">·</span>
            <span className="text-slate-600">Non-Commercial Market Intelligence</span>
            <span className="text-slate-800">·</span>
            <span className="text-slate-600">Built with ❤️ for India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
