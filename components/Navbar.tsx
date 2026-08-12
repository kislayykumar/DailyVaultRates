"use client";

import Link from "next/link";
import { Vault, Calendar, TrendingUp, DollarSign, Search, Command } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/context/CurrencyContext";
import StockSearchBar from "@/components/stocks/StockSearchBar";
import StockDetailModal from "@/components/stocks/StockDetailModal";

export default function Navbar() {
  const [selectedDate, setSelectedDate] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null);

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
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-2xl">
      {/* High-Tech Dynamic Shimmer Gradient Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500 via-amber-400 to-cyan-500 opacity-90" />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* ── Brand Logo ─────────────────────────────────────────── */}
        <Link href="/" className="group flex items-center gap-3">
          {/* Logo Icon */}
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-lg shadow-amber-500/20 transition-all duration-300 group-hover:scale-105">
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
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-emerald-400">
                <span className="live-dot" />
                LIVE
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 tracking-wide">
              Bullion, Forex &amp; Stock Intelligence
            </p>
          </div>
        </Link>

        {/* ── Search & Navigation Controls ────────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Command-K Stock / Market Search Trigger */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-800/90 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-400 backdrop-blur-md transition-all hover:border-emerald-500/40 hover:text-white hover:bg-slate-800/80"
          >
            <Search className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden md:inline font-medium">Search Markets…</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>

          {/* INR / USD Currency Toggle */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/90 p-1 text-xs backdrop-blur-md">
            <button
              type="button"
              onClick={() => setCurrencyMode("INR")}
              title="Indian Rupee (₹) - Metric standard (1g, 10g, 1kg)"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all duration-200 ${
                currencyMode === "INR"
                  ? "btn-gold text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span className="text-sm font-black">₹</span>
              <span className="hidden sm:inline">INR</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrencyMode("USD")}
              title="US Dollar ($) - Troy Ounce standard"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all duration-200 ${
                currencyMode === "USD"
                  ? "btn-gold text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <DollarSign className="h-3.5 w-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">USD</span>
            </button>
          </div>

          {/* Quick Date Archive Picker */}
          <div className="relative hidden lg:flex items-center">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 backdrop-blur-md transition-colors hover:border-amber-500/40">
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
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:border-amber-500/30 hover:text-white"
          >
            <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
            <span>Today</span>
          </Link>
        </div>
      </div>

      {/* Global Stock Search Bar Modal triggered from Navbar */}
      <StockSearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectStock={(sym) => {
          setSelectedStockSymbol(sym);
          setIsSearchOpen(false);
        }}
      />

      {/* Stock Detail Modal triggered from Navbar search */}
      <StockDetailModal
        symbol={selectedStockSymbol}
        onClose={() => setSelectedStockSymbol(null)}
      />
    </header>
  );
}
