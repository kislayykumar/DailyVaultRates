"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, BarChart3, Clock, Sparkles, Building2, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";
import useSWR from "swr";
import StockSearchBar from "./StockSearchBar";
import StockDetailModal from "./StockDetailModal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date) + " IST";
  } catch (e) {
    return isoString;
  }
};

const DEFAULT_SYMBOLS = ["^NSEI", "^BSESN", "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS", "BHARTIARTL.NS"];

export default function StockDashboardSection() {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_SYMBOLS);

  // Check Indian Stock Market Status (IST 9:15 AM to 3:30 PM Mon-Fri)
  useEffect(() => {
    const checkMarketStatus = () => {
      const now = new Date();
      // Convert to IST (UTC+5:30)
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const istTime = new Date(utcTime + 5.5 * 3600000);

      const day = istTime.getDay(); // 0 is Sunday, 6 is Saturday
      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();
      const timeInMinutes = hours * 60 + minutes;

      const isWeekday = day >= 1 && day <= 5;
      const isOpenTime = timeInMinutes >= 9 * 60 + 15 && timeInMinutes <= 15 * 60 + 30;

      setIsMarketOpen(isWeekday && isOpenTime);
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch live quotes for watchlist stocks
  const { data, error, isLoading, mutate } = useSWR(
    `/api/stock?symbol=${watchlist.join(",")}`,
    fetcher,
    { refreshInterval: 10000 } // Poll every 10 seconds
  );

  const quotesList: StockQuote[] = Array.isArray(data?.data) ? data.data : data?.data ? [data.data] : [];

  const quotesMap = new Map<string, StockQuote>();
  quotesList.forEach((q) => quotesMap.set(q.symbol, q));

  // Separate Benchmarks from Stocks
  const niftyQuote = quotesMap.get("^NSEI");
  const sensexQuote = quotesMap.get("^BSESN");

  const stockCardsSymbols = watchlist.filter((s) => s !== "^NSEI" && s !== "^BSESN");

  const handleSelectStockFromSearch = (sym: string) => {
    if (!watchlist.includes(sym)) {
      setWatchlist((prev) => [...prev, sym]);
    }
    setSelectedStock(sym);
  };

  return (
    <section className="space-y-6">
      {/* ── Section Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              <BarChart3 className="h-3 w-3" />
              NSE / BSE Live Tracker
            </span>

            {/* Market Status Badge */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
                isMarketOpen
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                  : "border-slate-700 bg-slate-800/60 text-slate-400"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isMarketOpen ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
              {isMarketOpen ? "Market Open (IST)" : "Market Closed"}
            </span>

            {/* 15-min Delay Disclosure Pill */}
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-[10px] font-semibold text-slate-400">
              <Clock className="h-3 w-3 text-slate-500" />
              15-Min Delayed Feed
            </span>

            {/* Last Fetched IST Timestamp Badge */}
            {quotesList[0]?.timestamp && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-mono font-bold text-emerald-400">
                <Clock className="h-3 w-3 text-emerald-400" />
                Fetched: {formatISTTime(quotesList[0].timestamp)}
              </span>
            )}
          </div>

          <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
            Indian Equity Markets
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Real-time blue-chip stock quotes, benchmark indices, and deep financial health analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => mutate()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-emerald-500/40 hover:text-white transition-all"
            title="Refresh prices"
          >
            <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Search Bar Component ────────────────────────────────── */}
      <StockSearchBar onSelectStock={handleSelectStockFromSearch} />

      {/* ── Top Benchmarks (Nifty 50 & Sensex) ─────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { symbol: "^NSEI", title: "NIFTY 50", desc: "National Stock Exchange Index", quote: niftyQuote },
          { symbol: "^BSESN", title: "SENSEX", desc: "BSE Benchmark Index", quote: sensexQuote },
        ].map((item) => {
          const q = item.quote;
          const isUp = q ? q.change >= 0 : true;

          return (
            <button
              key={item.symbol}
              onClick={() => setSelectedStock(item.symbol)}
              className="group relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-slate-900/70 p-5 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/30"
            >
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />

              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-400">
                    BENCHMARK INDEX
                  </span>
                  <h3 className="mt-2 text-lg font-black text-white">{item.title}</h3>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>

                {isLoading ? (
                  <div className="h-6 w-16 animate-pulse rounded bg-slate-800" />
                ) : q ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold tabular-nums ${
                      isUp
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {isUp ? "+" : ""}
                    {q.changePercent.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">N/A</span>
                )}
              </div>

              <div className="mt-4 flex items-baseline justify-between border-t border-slate-800/80 pt-3">
                <p className="font-mono text-2xl font-black text-white">
                  {q ? q.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}
                </p>
                <p className="font-mono text-xs font-bold text-slate-400">
                  {q ? `${isUp ? "+" : ""}${q.change.toFixed(2)} pts` : ""}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Watchlist Grid Section Header ───────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Watchlist Stocks ({stockCardsSymbols.length})
          </h3>
        </div>
        <span className="text-xs text-slate-500">Click card for deep financial analysis</span>
      </div>

      {/* ── Watchlist Cards Grid ───────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Error loading stock market quotes. Please refresh.</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        {stockCardsSymbols.map((sym) => {
          const q = quotesMap.get(sym);
          const isUp = q ? q.change >= 0 : true;

          return (
            <button
              key={sym}
              onClick={() => setSelectedStock(sym)}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3.5 sm:p-5 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-emerald-950/20"
            >
              <div>
                {/* Symbol & Exchange */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-white group-hover:text-emerald-400 transition-colors">
                        {sym}
                      </span>
                      <span className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.2 text-[9px] font-extrabold text-slate-300">
                        {q?.exchange || (sym.endsWith(".NS") ? "NSE" : "BSE")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-1">
                      {q?.shortName || q?.longName || sym}
                    </p>
                  </div>

                  {isLoading ? (
                    <div className="h-5 w-14 animate-pulse rounded bg-slate-800" />
                  ) : q ? (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-extrabold tabular-nums ${
                        isUp
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {isUp ? "+" : ""}
                      {q.changePercent.toFixed(2)}%
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">—</span>
                  )}
                </div>

                {/* Price Display */}
                <div className="mt-4">
                  <p className="font-mono text-2xl font-black text-white">
                    ₹{q ? q.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}
                  </p>
                  <p className="font-mono text-xs text-slate-400 mt-0.5">
                    {q ? `${isUp ? "+" : ""}₹${q.change.toFixed(2)} Today` : ""}
                  </p>
                </div>
              </div>

              {/* Card Footer Details */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px]">
                <span className="text-slate-500 font-medium">
                  {q?.volume ? `Vol: ${(q.volume / 1000).toFixed(0)}K` : "Day Range"}
                </span>
                <span className="flex items-center gap-1 font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Deep Analysis <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Deep Analysis Modal Drawer ─────────────────────────── */}
      <StockDetailModal
        symbol={selectedStock}
        onClose={() => setSelectedStock(null)}
      />
    </section>
  );
}
