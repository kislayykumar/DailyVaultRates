import Link from "next/link";
import { Vault, Database, Shield, Zap, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden" style={{ borderTop: "1px solid rgba(26,37,80,0.7)", background: "rgba(4,6,15,0.96)" }}>
      {/* CSS-only hover styles — no JS handlers needed */}
      <style>{`
        .footer-link-gold { color: #64748b; transition: color 0.2s ease; }
        .footer-link-gold:hover { color: #d4a843; }
        .footer-link-blue { color: #64748b; transition: color 0.2s ease; }
        .footer-link-blue:hover { color: #38bdf8; }
        .archive-chip { color: #94a3b8; background: rgba(7,9,26,0.7); border: 1px solid rgba(26,37,80,0.8); transition: border-color 0.2s, color 0.2s; }
        .archive-chip:hover { border-color: rgba(212,168,67,0.30); color: #e2e8f0; }
        .archive-chip-live { color: #d4a843; background: rgba(212,168,67,0.12); border: 1px solid rgba(212,168,67,0.35); }
      `}</style>

      {/* Subtle gold gradient top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(212,168,67,0.5) 40%, rgba(240,200,96,0.7) 50%, rgba(212,168,67,0.5) 60%, transparent 100%)" }}
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[500px] -translate-x-1/2 rounded-full opacity-20"
        style={{ background: "radial-gradient(ellipse, rgba(212,168,67,0.3) 0%, transparent 70%)", filter: "blur(40px)" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">

          {/* ── Brand Column ─────────────────────────── */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl shadow-gold-sm"
                style={{ background: "linear-gradient(135deg, #b88c2a, #f0c860)" }}
              >
                <Vault className="h-4 w-4 text-slate-950" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Daily<span className="text-gold-gradient">Vault</span>Rates
              </span>
            </div>

            <p className="mt-4 text-xs leading-relaxed" style={{ color: "#64748b" }}>
              Open-architecture financial data platform delivering automated daily spot rate archives for precious metals and major global exchange rates.
            </p>

            {/* Trust badges */}
            <div className="mt-5 flex items-center gap-3">
              {[
                { icon: Shield, label: "Verified" },
                { icon: Zap, label: "Daily" },
                { icon: Globe, label: "Global" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: "rgba(14,19,48,0.8)", border: "1px solid rgba(26,37,80,0.9)", color: "#64748b" }}>
                  <Icon className="h-3 w-3" style={{ color: "#d4a843" }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Metals Links ─────────────────────────── */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#d4a843" }}>Precious Metals</h3>
            <div className="mt-4 h-px" style={{ background: "linear-gradient(90deg, rgba(212,168,67,0.4), transparent)" }} />
            <ul className="mt-3 space-y-2.5 text-xs">
              {[
                "Gold Spot Rate (XAU)",
                "Silver Spot Rate (XAG)",
                "Platinum Index (XPT)",
                "Aluminum Rate (ALI)",
              ].map((label) => (
                <li key={label}>
                  <Link href="/" className="footer-link-gold flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full flex-shrink-0" style={{ background: "rgba(212,168,67,0.5)" }} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Forex Links ──────────────────────────── */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#38bdf8" }}>Currencies &amp; FX</h3>
            <div className="mt-4 h-px" style={{ background: "linear-gradient(90deg, rgba(56,189,248,0.4), transparent)" }} />
            <ul className="mt-3 space-y-2.5 text-xs">
              {[
                "EUR / USD Rate",
                "GBP / USD Rate",
                "USD / JPY Rate",
                "USD / INR Rate",
              ].map((label) => (
                <li key={label}>
                  <Link href="/" className="footer-link-blue flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full flex-shrink-0" style={{ background: "rgba(56,189,248,0.5)" }} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Architecture Info ─────────────────────── */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>Architecture</h3>
            <div className="mt-4 h-px" style={{ background: "linear-gradient(90deg, rgba(148,163,184,0.3), transparent)" }} />

            <div className="mt-3 space-y-2.5">
              {[
                { icon: Database, title: "Git-as-a-Database", desc: "Zero-latency static JSON snapshots" },
                { icon: Zap, title: "GitHub Actions", desc: "Automated at 9 AM & 5:30 PM IST" },
                { icon: Shield, title: "ISR Revalidation", desc: "60s Next.js incremental cache" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-2.5 rounded-xl p-2.5" style={{ background: "rgba(14,19,48,0.6)", border: "1px solid rgba(26,37,80,0.7)" }}>
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "#d4a843" }} />
                  <div>
                    <p className="text-[11px] font-semibold text-white">{title}</p>
                    <p className="text-[10px]" style={{ color: "#475569" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ────────────────────────────── */}
        <div className="mt-12 pt-6" style={{ borderTop: "1px solid rgba(26,37,80,0.6)" }}>
          <p className="text-[11px] leading-relaxed" style={{ color: "#334155" }}>
            <strong className="text-slate-500">Disclaimer:</strong> Spot rates and forex values on DailyVaultRates are for informational and historical archiving purposes only. They do not constitute financial advice or binding trading quotes. Always consult a certified financial advisor before executing commodity or currency transactions.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[11px]" style={{ color: "#334155" }}>
            <p>© {new Date().getFullYear()} DailyVaultRates. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <span className="rounded-full px-2.5 py-1" style={{ background: "rgba(14,19,48,0.8)", border: "1px solid rgba(26,37,80,0.7)", color: "#475569" }}>
                Next.js 14 App Router
              </span>
              <span className="rounded-full px-2.5 py-1" style={{ background: "rgba(14,19,48,0.8)", border: "1px solid rgba(26,37,80,0.7)", color: "#475569" }}>
                Programmatic SEO
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
