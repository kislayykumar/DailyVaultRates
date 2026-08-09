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
    <header className="sticky top-0 z-50 shadow-navbar border-b border-amber-500/10 bg-slate-950/90 backdrop-blur-xl">
      {/* Royal Gold Shimmer Header Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* ── Brand Logo ─────────────────────────────────────────── */}
        <Link href="/" className="group flex items-center gap-3">
          {/* Logo Icon */}
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-lg shadow-amber-500/25 transition-all duration-300 group-hover:scale-105">
            <Vault className="h-5 w-5 text-slate-950" strokeWidth={2.5} />
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          {/* Name & Tagline */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">
                Daily<span className="text-gold-gradient">Vault</span>Rates
              </span>
              {/* Animated Live Badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-400">
                <span className="live-dot" />
                LIVE
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 tracking-wide">
              Institutional Spot Metal &amp; Forex Archive
            </p>
          </div>
        </Link>

        {/* ── Controls & Controls Bar ───────────────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* INR / USD Currency Toggle */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/90 p-1 text-xs backdrop-blur-md">
            <button
              type="button"
              onClick={() => setCurrencyMode("INR")}
              title="Indian Rupee (₹) - Metric standard (1g, 10g, 1kg)"
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-bold transition-all duration-200 ${
                currencyMode === "INR"
                  ? "btn-gold text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span className="text-sm font-black">₹</span>
              <span className="hidden sm:inline">INR · Metric</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrencyMode("USD")}
              title="US Dollar ($) - Troy Ounce standard"
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-bold transition-all duration-200 ${
                currencyMode === "USD"
                  ? "btn-gold text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <DollarSign className="h-3.5 w-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">USD · Troy Oz</span>
            </button>
          </div>

          {/* Quick Date Archive Picker */}
          <div className="relative hidden items-center lg:flex">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-300 backdrop-blur-md transition-colors hover:border-amber-500/40">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-slate-400">Archive:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="cursor-pointer bg-transparent font-medium text-white outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Today Button */}
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-all hover:border-amber-500/30 hover:text-white"
          >
            <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
            <span>Today</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
