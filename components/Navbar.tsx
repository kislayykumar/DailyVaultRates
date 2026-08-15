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
    <header className="sticky top-0 z-40 bg-[#020409]/92 backdrop-blur-2xl shadow-[0_1px_0_rgba(255,255,255,0.05)]">
      {/* V3 Animated Shimmer Gradient Line */}
      <div className="h-[2px] w-full navbar-shimmer" />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

        {/* ── Brand Logo ──────────────────────────────────────────── */}
        <Link href="/" className="group flex items-center gap-3">
          {/* Logo Icon with Halo Glow */}
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FBBF24] via-[#F59E0B] to-[#D97706] shadow-[0_0_24px_rgba(245,158,11,0.40)] transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(245,158,11,0.65)] group-hover:scale-110">
            <Vault className="h-5 w-5 text-[#020409]" strokeWidth={2.5} />
            {/* Inner glint */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent via-white/10 to-white/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Brand Name */}
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-[20px] font-black tracking-tight text-white"
                style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
              >
                Daily<span className="text-gold-gradient-v3">Vault</span>Rates
              </span>
              {/* Live Badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/12 px-2 py-0.5 text-[10px] font-extrabold tracking-widest text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.20)]">
                <span className="live-dot" />
                LIVE
              </span>
            </div>
            <p className="text-[10px] font-medium tracking-wide text-slate-500">
              Bullion · Forex · Stock Intelligence
            </p>
          </div>
        </Link>

        {/* ── Controls ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-2.5">

          {/* Cmd-K Search */}
          <button
            type="button"
            id="navbar-search-btn"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-white/7 bg-white/3 px-3 py-1.5 text-xs text-slate-400 backdrop-blur-md transition-all duration-200 hover:border-emerald-500/30 hover:text-white hover:bg-white/6 hover:shadow-[0_0_16px_rgba(16,185,129,0.12)]"
          >
            <Search className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden md:inline font-medium">Search Markets…</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>

          {/* INR / USD Toggle */}
          <div className="flex items-center rounded-xl border border-white/7 bg-[#020409]/80 p-1 text-xs backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
            <button
              type="button"
              id="navbar-inr-toggle"
              onClick={() => setCurrencyMode("INR")}
              title="Indian Rupee (₹)"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all duration-250 ${currencyMode === "INR"
                ? "btn-gold text-[#020409] shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <span className="text-sm font-black">₹</span>
              <span className="hidden sm:inline text-[11px]">INR</span>
            </button>
            <button
              type="button"
              id="navbar-usd-toggle"
              onClick={() => setCurrencyMode("USD")}
              title="US Dollar ($)"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all duration-250 ${currencyMode === "USD"
                ? "btn-gold text-[#020409] shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <DollarSign className="h-3.5 w-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline text-[11px]">USD</span>
            </button>
          </div>

          {/* Date Archive Picker */}
          <div className="relative hidden lg:flex items-center">
            <div className="flex items-center gap-2 rounded-xl border border-white/7 bg-[#020409]/80 px-3 py-1.5 text-xs text-slate-300 backdrop-blur-md transition-all hover:border-[rgba(245,158,11,0.30)] hover:shadow-[0_0_16px_rgba(245,158,11,0.08)]">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-slate-500 text-[11px]">Archive:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="cursor-pointer bg-transparent font-medium text-white outline-none [color-scheme:dark] text-[11px]"
              />
            </div>
          </div>

          {/* Today Button */}
          <Link
            href="/"
            id="navbar-today-btn"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/7 bg-[#020409]/80 px-3.5 py-1.5 text-[11px] font-semibold text-slate-400 transition-all hover:border-[rgba(245,158,11,0.28)] hover:text-white hover:shadow-[0_0_16px_rgba(245,158,11,0.10)]"
          >
            <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
            <span>Today</span>
          </Link>
        </div>
      </div>

      {/* Subtle bottom glow line */}
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(245,158,11,0.12)] to-transparent" />

      {/* Search Bar Modal */}
      <StockSearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectStock={(sym) => {
          setSelectedStockSymbol(sym);
          setIsSearchOpen(false);
        }}
      />

      <StockDetailModal
        symbol={selectedStockSymbol}
        onClose={() => setSelectedStockSymbol(null)}
      />
    </header>
  );
}
