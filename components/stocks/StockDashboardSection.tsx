"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, BarChart3, Clock, Building2,
  ChevronRight, RefreshCw, AlertCircle, Activity,
} from "lucide-react";
import useSWR from "swr";
import StockSearchBar from "./StockSearchBar";
import StockDetailModal from "./StockDetailModal";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(errorText || `HTTP ${res.status}`);
  }
  return res.json();
};

interface StockQuote {
  symbol: string;
  shortName: string;
  longName: string;
  price: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  open: number;
  previousClose: number;
  volume: number;
  marketCap: number;
  currency: string;
  exchange: string;
  timestamp?: string;
}

const formatISTTime = (isoString?: string) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return (
      new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(date) + " IST"
    );
  } catch {
    return isoString;
  }
};

const DEFAULT_SYMBOLS = [
  "^NSEI", "^BSESN", "RELIANCE.NS", "TCS.NS",
  "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS", "BHARTIARTL.NS",
];

/* ── Inline trend badge (matches gold-rate card style) ──────────── */
function TrendPill({ pct, change }: { pct: number; change: number }) {
  const isUp = change >= 0;
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums"
      style={{
        background: isUp ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
        border: `1px solid ${isUp ? "rgba(16,185,129,0.28)" : "rgba(239,68,68,0.28)"}`,
        color: isUp ? "#10B981" : "#EF4444",
      }}
    >
      {isUp ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
      {isUp ? "+" : ""}{pct.toFixed(2)}%
    </span>
  );
}

export default function StockDashboardSection() {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_SYMBOLS);

  /* ── IST market status ─────────────────────────────────────────── */
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const ist = new Date(utc + 5.5 * 3600000);
      const day = ist.getDay();
      const mins = ist.getHours() * 60 + ist.getMinutes();
      setIsMarketOpen(day >= 1 && day <= 5 && mins >= 555 && mins <= 930);
    };
    check();
    const iv = setInterval(check, 60000);
    return () => clearInterval(iv);
  }, []);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/stock?symbol=${watchlist.join(",")}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  const quotesList: StockQuote[] = Array.isArray(data?.data)
    ? data.data
    : data?.data
    ? [data.data]
    : [];

  const quotesMap = new Map<string, StockQuote>();
  quotesList.forEach((q) => quotesMap.set(q.symbol, q));

  const niftyQ  = quotesMap.get("^NSEI");
  const sensexQ = quotesMap.get("^BSESN");
  const stockSymbols = watchlist.filter((s) => s !== "^NSEI" && s !== "^BSESN");

  const handleSelectFromSearch = (sym: string) => {
    if (!watchlist.includes(sym)) setWatchlist((p) => [...p, sym]);
    setSelectedStock(sym);
  };

  /* ── Shared card styles matching the gold-card design language ── */
  const CARD_BASE = {
    background: "rgba(6,11,20,0.88)",
    backdropFilter: "blur(20px)",
  } as React.CSSProperties;

  return (
    <section className="space-y-6">

      {/* ── Section Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5"
        style={{ borderBottom: "1px solid rgba(16,185,129,0.15)" }}>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* NSE/BSE badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.25)",
                color: "#10B981",
              }}>
              <BarChart3 className="h-3 w-3" />
              NSE / BSE Live Tracker
            </span>

            {/* Market status */}
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase"
              style={{
                background: isMarketOpen ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.04)",
                border: isMarketOpen ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(255,255,255,0.08)",
                color: isMarketOpen ? "#10B981" : "#64748B",
              }}>
              <span className={`h-2 w-2 rounded-full ${isMarketOpen ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
              {isMarketOpen ? "Market Open (IST)" : "Market Closed"}
            </span>

            {/* Delay pill */}
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#64748B" }}>
              <Clock className="h-3 w-3" />
              15-Min Delayed
            </span>

            {/* Fetch timestamp */}
            {quotesList[0]?.timestamp && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-mono font-bold"
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.20)",
                  color: "#10B981",
                }}>
                <Activity className="h-3 w-3" />
                {formatISTTime(quotesList[0].timestamp)}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-black text-white sm:text-3xl"
            style={{ fontFamily: "'Outfit','Inter',sans-serif", letterSpacing: "-0.02em" }}>
            Indian Equity Markets
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Real-time blue-chip stock quotes, benchmark indices, and deep financial analytics.
          </p>
        </div>

        <button
          onClick={() => mutate()}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 transition-all hover:text-white"
          style={{
            background: "rgba(6,11,20,0.88)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          title="Refresh prices"
        >
          <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* ── Search Bar ─────────────────────────────────────────────── */}
      <StockSearchBar onSelectStock={handleSelectFromSearch} />

      {/* ── Benchmark Cards (Nifty + Sensex) ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { symbol: "^NSEI",  title: "NIFTY 50",  desc: "National Stock Exchange Index", quote: niftyQ,  color: "#10B981", border: "rgba(16,185,129,0.22)", glow: "rgba(16,185,129,0.10)" },
          { symbol: "^BSESN", title: "SENSEX",    desc: "BSE Benchmark Index",           quote: sensexQ, color: "#F59E0B", border: "rgba(245,158,11,0.22)",  glow: "rgba(245,158,11,0.10)"  },
        ].map(({ symbol, title, desc, quote: q, color, border, glow }) => {
          const isUp = q ? q.change >= 0 : true;
          return (
            <button
              key={symbol}
              onClick={() => setSelectedStock(symbol)}
              className="spot-card group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-0.5 focus:outline-none"
              style={{ ...CARD_BASE, border: `1px solid ${border}`, boxShadow: `0 0 40px ${glow}, 0 8px 32px rgba(0,0,0,0.7)` }}
            >
              {/* Accent line */}
              <div className="absolute inset-x-0 top-0 h-[1.5px]"
                style={{ background: `linear-gradient(90deg, transparent, ${color} 45%, transparent)` }} />
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(ellipse at top, ${glow} 0%, transparent 60%)` }} />

              <div className="relative">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest"
                      style={{ color }}>
                      BENCHMARK INDEX
                    </span>
                    <h3 className="mt-1 text-lg font-black text-white">{title}</h3>
                    <p className="text-[11px] text-slate-500">{desc}</p>
                  </div>
                  {isLoading
                    ? <div className="h-6 w-16 animate-pulse rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
                    : q
                    ? <TrendPill pct={q.changePercent} change={q.change} />
                    : <span className="text-xs text-slate-600">N/A</span>
                  }
                </div>

                <div className="flex items-baseline justify-between pt-3"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="price-num font-mono text-2xl font-black text-white">
                    {q ? q.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}
                  </p>
                  <p className="font-mono text-xs font-bold" style={{ color: q && q.change >= 0 ? "#10B981" : "#EF4444" }}>
                    {q ? `${q.change >= 0 ? "+" : ""}${q.change.toFixed(2)} pts` : ""}
                  </p>
                </div>

                <p className="mt-2 flex items-center gap-1 text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100" style={{ color }}>
                  <Activity className="h-3 w-3" /> Deep Analysis
                  <ChevronRight className="h-3 w-3" />
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Watchlist Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Watchlist ({stockSymbols.length})
          </h3>
        </div>
        <span className="text-[11px] text-slate-600">Click any card for deep analysis</span>
      </div>

      {/* ── Error ──────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl p-4 text-sm"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", color: "#EF4444" }}>
          <AlertCircle className="h-4 w-4 shrink-0" />
          Error loading market quotes. Please refresh.
        </div>
      )}

      {/* ── Watchlist Stock Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {stockSymbols.map((sym) => {
          const q = quotesMap.get(sym);
          const isUp = q ? q.change >= 0 : true;
          const accentColor = isUp ? "#10B981" : "#EF4444";
          const accentBorder = isUp ? "rgba(16,185,129,0.20)" : "rgba(239,68,68,0.16)";
          const accentGlow   = isUp ? "rgba(16,185,129,0.06)"  : "rgba(239,68,68,0.04)";

          return (
            <button
              key={sym}
              onClick={() => setSelectedStock(sym)}
              className="spot-card group relative flex flex-col justify-between overflow-hidden rounded-2xl p-4 sm:p-5 text-left transition-all duration-300 hover:-translate-y-1 focus:outline-none"
              style={{
                ...CARD_BASE,
                border: `1px solid ${accentBorder}`,
                boxShadow: `0 0 28px ${accentGlow}, 0 8px 32px rgba(0,0,0,0.7)`,
              }}
            >
              {/* Top accent line */}
              <div className="absolute inset-x-0 top-0 h-[1.5px]"
                style={{ background: `linear-gradient(90deg, transparent, ${accentColor} 45%, transparent)` }} />
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(ellipse at top, ${accentGlow} 0%, transparent 60%)` }} />

              <div className="relative">
                {/* Symbol row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-sm font-black text-white group-hover:opacity-90 transition-opacity truncate">
                        {sym.replace(".NS", "").replace(".BO", "")}
                      </span>
                      <span className="rounded px-1.5 py-0.5 text-[9px] font-extrabold shrink-0"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#94A3B8",
                        }}>
                        {q?.exchange || (sym.endsWith(".NS") ? "NSE" : "BSE")}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
                      {q?.shortName || q?.longName || sym}
                    </p>
                  </div>

                  {isLoading
                    ? <div className="h-5 w-14 animate-pulse rounded-full shrink-0" style={{ background: "rgba(255,255,255,0.06)" }} />
                    : q
                    ? <TrendPill pct={q.changePercent} change={q.change} />
                    : <span className="text-xs text-slate-600">—</span>
                  }
                </div>

                {/* Price */}
                <div className="mt-3">
                  <p className="price-num font-mono text-2xl font-black text-white">
                    ₹{q ? q.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}
                  </p>
                  <p className="font-mono text-xs mt-0.5" style={{ color: accentColor }}>
                    {q ? `${isUp ? "+" : ""}₹${q.change.toFixed(2)} today` : ""}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="relative mt-4 flex items-center justify-between pt-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-[11px] text-slate-600 font-medium">
                  {q?.volume ? `Vol: ${(q.volume / 1000).toFixed(0)}K` : "—"}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "#10B981" }}>
                  Analysis <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Detail Modal ─────────────────────────────────────────────── */}
      <StockDetailModal symbol={selectedStock} onClose={() => setSelectedStock(null)} />
    </section>
  );
}
