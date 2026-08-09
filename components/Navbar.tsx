"use client";

import Link from "next/link";
import { Vault, Calendar, TrendingUp, DollarSign } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/context/CurrencyContext";

export default function Navbar() {
  const [selectedDate, setSelectedDate] = useState("");
  const router = useRouter();
  const { currencyMode, setCurrencyMode } = useCurrency();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedDate(val);
    if (val) {
      const [year, month, day] = val.split("-");
      router.push(`/archive/${year}/${month}/${day}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 shadow-navbar" style={{ background: "rgba(7,9,26,0.88)" }}>
      {/* Gold shimmer top border */}
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(212,168,67,0.6) 30%, rgba(240,200,96,0.9) 50%, rgba(212,168,67,0.6) 70%, transparent 100%)" }} />

      <div
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
        style={{ backdropFilter: "blur(24px) saturate(200%)" }}
      >
        {/* ── Brand Logo ─────────────────────────────────────────── */}
        <Link href="/" className="group flex items-center gap-3">
          {/* Icon */}
          <div
            className="relative flex h-10 w-10 items-center justify-center rounded-xl shadow-gold-sm transition-all duration-300 group-hover:shadow-gold-md group-hover:scale-105"
            style={{ background: "linear-gradient(135deg, #b88c2a 0%, #f0c860 50%, #d4a843 100%)" }}
          >
            <Vault className="h-5 w-5 text-slate-950" strokeWidth={2.5} />
            {/* Corner glow */}
            <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100" style={{ background: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)" }} />
          </div>

          {/* Name + tagline */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">
                Daily<span className="text-gold-gradient">Vault</span>Rates
              </span>
              {/* Live badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                <span className="live-dot" />
                LIVE
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 tracking-wide">
              Institutional Spot Metal &amp; Forex Archive
            </p>
          </div>
        </Link>

        {/* ── Controls ───────────────────────────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* INR / USD Toggle */}
          <div
            className="flex items-center rounded-xl p-1 text-xs"
            style={{ background: "rgba(14,19,48,0.8)", border: "1px solid rgba(26,37,80,0.9)", backdropFilter: "blur(12px)" }}
          >
            <button
              type="button"
              onClick={() => setCurrencyMode("INR")}
              title="Indian Rupee ₹ — per gram / 10g / kg"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all duration-200 ${
                currencyMode === "INR"
                  ? "btn-gold text-slate-950 shadow-gold-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-sm font-extrabold">₹</span>
              <span className="hidden sm:inline">INR · Metric</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrencyMode("USD")}
              title="US Dollar $ — per troy ounce"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all duration-200 ${
                currencyMode === "USD"
                  ? "btn-gold text-slate-950 shadow-gold-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <DollarSign className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">USD · Oz</span>
            </button>
          </div>

          {/* Archive Date Picker */}
          <div className="relative hidden items-center lg:flex">
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-300 transition-all hover:border-vault-gold/40"
              style={{ background: "rgba(14,19,48,0.7)", border: "1px solid rgba(26,37,80,0.9)", backdropFilter: "blur(12px)" }}
            >
              <Calendar className="h-3.5 w-3.5 text-vault-gold" />
              <span className="text-slate-400">Archive:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="cursor-pointer bg-transparent font-medium text-white outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Today button */}
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 transition-all hover:text-white"
            style={{ background: "rgba(14,19,48,0.7)", border: "1px solid rgba(26,37,80,0.9)" }}
          >
            <TrendingUp className="h-3.5 w-3.5 text-vault-gold" />
            <span>Today</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
