"use client";

import { useState } from "react";
import { X, TrendingUp, TrendingDown, Minus, Activity, PieChart, ShieldCheck, Target, Building, AlertTriangle } from "lucide-react";
import useSWR from "swr";
import PdfDownloadButton from "@/components/PdfDownloadButton";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

interface StockDetailModalProps {
  symbol: string | null;
  onClose: () => void;
}

export default function StockDetailModal({ symbol, onClose }: StockDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "ratios" | "ratings">("overview");

  // Fetch 10-second price quote
  const { data: stockData, isLoading: isStockLoading, error: stockError } = useSWR(
    symbol ? `/api/stock?symbol=${encodeURIComponent(symbol)}` : null,
    fetcher
  );

  // Fetch 12-hour fundamental analysis
  const { data: analysisData, isLoading: isAnalysisLoading } = useSWR(
    symbol ? `/api/analysis?symbol=${encodeURIComponent(symbol)}` : null,
    fetcher
  );

  if (!symbol) return null;

  const quote = stockData?.data;
  const analysis = analysisData?.data;

  const isUp = quote ? quote.change >= 0 : true;

  // Format large numbers (e.g. Market Cap)
  const formatMarketCap = (val: number | null | undefined) => {
    if (!val) return "N/A";
    if (val >= 1e12) return `₹${(val / 1e12).toFixed(2)} Lakh Cr`;
    if (val >= 1e7) return `₹${(val / 1e7).toFixed(2)} Cr`;
    if (val >= 1e5) return `₹${(val / 1e5).toFixed(2)} Lakh`;
    return `₹${val.toLocaleString()}`;
  };

  const formatPercentage = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "N/A";
    return `${(val * 100).toFixed(2)}%`;
  };

  const formatNumber = (val: number | null | undefined, decimals = 2) => {
    if (val === null || val === undefined) return "N/A";
    return val.toFixed(decimals);
  };

  // Helper for 52-week position calculation
  const calc52WeekPosition = () => {
    const low = analysis?.metrics?.fiftyTwoWeekLow || quote?.dayLow || 0;
    const high = analysis?.metrics?.fiftyTwoWeekHigh || quote?.dayHigh || 100;
    const price = quote?.price || 50;

    if (high <= low) return 50;
    const pct = ((price - low) / (high - low)) * 100;
    return Math.max(0, Math.min(100, pct));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-950/95 shadow-2xl shadow-amber-950/40 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glowing Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-500" />

        {/* ── Modal Header ────────────────────────────────────────── */}
        <div className="flex items-start justify-between border-b border-slate-800/80 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-black text-white">{symbol}</span>
              <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400">
                {quote?.exchange || "NSE"}
              </span>
              {analysis?.profile?.sector && (
                <span className="hidden sm:inline-block rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                  {analysis.profile.sector}
                </span>
              )}
            </div>
            <h2 className="mt-1 text-sm font-medium text-slate-400">
              {quote?.longName || quote?.shortName || "Indian Stock Market Intelligence"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <PdfDownloadButton
              targetId="stock-analysis-report-container"
              filename={`${symbol || "Stock"}-Financial-Analysis-Report.pdf`}
              label="Export Stock PDF"
              variant="emerald"
            />
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-800 bg-slate-800/50 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div id="stock-analysis-report-container" className="flex flex-col">

        {/* ── Price Banner ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-950/40 px-6 py-4">
          {isStockLoading ? (
            <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-800" />
          ) : stockError ? (
            <div className="text-rose-400 text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Unable to fetch live price data.
            </div>
          ) : (
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-3xl font-black text-white">
                ₹{quote?.price ? quote.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold tabular-nums ${
                  isUp
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                }`}
              >
                {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {isUp ? "+" : ""}
                {quote?.change ? quote.change.toFixed(2) : "0.00"} (
                {quote?.changePercent ? quote.changePercent.toFixed(2) : "0.00"}%)
              </span>
            </div>
          )}

          <div className="text-right">
            {quote?.timestamp && (
              <span className="text-[11px] font-bold text-slate-300 block">
                Last Fetched: <span className="font-mono text-emerald-400">{formatISTTime(quote.timestamp)}</span>
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-medium">15-Min Delayed SEBI Public Feed</span>
          </div>
        </div>

        {/* ── Tab Navigation ─────────────────────────────────────── */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/60 px-6">
          {[
            { id: "overview", label: "Overview & Stats", icon: Activity },
            { id: "ratios", label: "Key Ratios & Health", icon: ShieldCheck },
            { id: "ratings", label: "Analyst Ratings & Profile", icon: Target },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all ${
                  isActive
                    ? "border-emerald-400 text-emerald-400 bg-emerald-500/5"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Modal Tab Body (Scrollable) ─────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: OVERVIEW & STATS */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* 52-Week Range Slider Bar */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                  <span>52-Week Low</span>
                  <span className="text-emerald-400 uppercase tracking-wider">52-Week High Range</span>
                  <span>52-Week High</span>
                </div>
                <div className="relative h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full opacity-30 w-full" />
                  <div
                    className="absolute top-0 bottom-0 w-3 -ml-1.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50"
                    style={{ left: `${calc52WeekPosition()}%` }}
                  />
                </div>
                <div className="flex items-center justify-between font-mono text-xs font-bold text-white mt-2">
                  <span>₹{analysis?.metrics?.fiftyTwoWeekLow ? analysis.metrics.fiftyTwoWeekLow.toFixed(2) : (quote?.dayLow ? (quote.dayLow * 0.85).toFixed(2) : "N/A")}</span>
                  <span className="text-emerald-400">Current: ₹{quote?.price?.toFixed(2) || "0.00"}</span>
                  <span>₹{analysis?.metrics?.fiftyTwoWeekHigh ? analysis.metrics.fiftyTwoWeekHigh.toFixed(2) : (quote?.dayHigh ? (quote.dayHigh * 1.15).toFixed(2) : "N/A")}</span>
                </div>
              </div>

              {/* Quick Stat Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Open Price", val: quote?.open ? `₹${quote.open.toFixed(2)}` : "N/A" },
                  { label: "Previous Close", val: quote?.previousClose ? `₹${quote.previousClose.toFixed(2)}` : "N/A" },
                  { label: "Day High", val: quote?.dayHigh ? `₹${quote.dayHigh.toFixed(2)}` : "N/A" },
                  { label: "Day Low", val: quote?.dayLow ? `₹${quote.dayLow.toFixed(2)}` : "N/A" },
                  { label: "Trading Volume", val: quote?.volume ? quote.volume.toLocaleString() : "N/A" },
                  { label: "Market Capitalization", val: formatMarketCap(quote?.marketCap) },
                ].map((stat, i) => (
                  <div key={i} className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5">
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">{stat.label}</span>
                    <span className="font-mono text-sm font-bold text-white">{stat.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: KEY RATIOS & FINANCIAL HEALTH */}
          {activeTab === "ratios" && (
            <div className="space-y-6">
              {isAnalysisLoading ? (
                <div className="py-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                  <span>Loading fundamental ratios &amp; balance sheet data…</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {/* Trailing P/E */}
                    <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
                      <span className="text-[11px] font-medium text-slate-400 block mb-1">Trailing P/E Ratio</span>
                      <span className="font-mono text-lg font-bold text-white">
                        {formatNumber(analysis?.metrics?.trailingPE)}
                      </span>
                      <div className="mt-2">
                        {analysis?.metrics?.trailingPE && analysis.metrics.trailingPE < 25 ? (
                          <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            Reasonable Valuation
                          </span>
                        ) : (
                          <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                            Rich Valuation
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Forward P/E */}
                    <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
                      <span className="text-[11px] font-medium text-slate-400 block mb-1">Forward P/E</span>
                      <span className="font-mono text-lg font-bold text-white">
                        {formatNumber(analysis?.metrics?.forwardPE)}
                      </span>
                      <div className="mt-2">
                        <span className="text-[10px] text-slate-500 font-medium">Forward Earnings Multiple</span>
                      </div>
                    </div>

                    {/* Price to Book */}
                    <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
                      <span className="text-[11px] font-medium text-slate-400 block mb-1">Price to Book (P/B)</span>
                      <span className="font-mono text-lg font-bold text-white">
                        {formatNumber(analysis?.metrics?.priceToBook)}
                      </span>
                      <div className="mt-2">
                        <span className="text-[10px] text-slate-500 font-medium">Book Value Multiple</span>
                      </div>
                    </div>

                    {/* Debt to Equity */}
                    <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
                      <span className="text-[11px] font-medium text-slate-400 block mb-1">Debt-to-Equity (D/E)</span>
                      <span className="font-mono text-lg font-bold text-white">
                        {formatNumber(analysis?.metrics?.debtToEquity)}
                      </span>
                      <div className="mt-2">
                        {analysis?.metrics?.debtToEquity && analysis.metrics.debtToEquity < 100 ? (
                          <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            Healthy Leverage
                          </span>
                        ) : (
                          <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                            Higher Leverage
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Return on Equity (ROE) */}
                    <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
                      <span className="text-[11px] font-medium text-slate-400 block mb-1">Return on Equity (ROE)</span>
                      <span className="font-mono text-lg font-bold text-emerald-400">
                        {formatPercentage(analysis?.metrics?.returnOnEquity)}
                      </span>
                      <div className="mt-2">
                        {analysis?.metrics?.returnOnEquity && analysis.metrics.returnOnEquity > 0.15 ? (
                          <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            High Efficiency
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-medium">Capital Return Rate</span>
                        )}
                      </div>
                    </div>

                    {/* Profit Margin */}
                    <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
                      <span className="text-[11px] font-medium text-slate-400 block mb-1">Profit Margin</span>
                      <span className="font-mono text-lg font-bold text-white">
                        {formatPercentage(analysis?.metrics?.profitMargins)}
                      </span>
                      <div className="mt-2">
                        <span className="text-[10px] text-slate-500 font-medium">Net Profit Margin</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: ANALYST RATINGS & PROFILE */}
          {activeTab === "ratings" && (
            <div className="space-y-6">
              {isAnalysisLoading ? (
                <div className="py-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                  <span>Fetching institutional analyst ratings &amp; consensus targets…</span>
                </div>
              ) : (
                <>
                  {/* Analyst Consensus Rating Bar */}
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Analyst Recommendation Breakdown ({analysis?.recommendations?.total || 0} Analysts)
                      </h3>
                      <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-extrabold uppercase text-indigo-400">
                        Consensus: {analysis?.targets?.recommendationKey?.toUpperCase() || "HOLD"}
                      </span>
                    </div>

                    {/* Visual Bar */}
                    {analysis?.recommendations?.total ? (
                      <div className="space-y-2">
                        <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-800">
                          <div
                            style={{ width: `${((analysis.recommendations.strongBuy + analysis.recommendations.buy) / analysis.recommendations.total) * 100}%` }}
                            className="bg-emerald-500"
                            title="Buy / Strong Buy"
                          />
                          <div
                            style={{ width: `${(analysis.recommendations.hold / analysis.recommendations.total) * 100}%` }}
                            className="bg-amber-400"
                            title="Hold"
                          />
                          <div
                            style={{ width: `${((analysis.recommendations.sell + analysis.recommendations.strongSell) / analysis.recommendations.total) * 100}%` }}
                            className="bg-rose-500"
                            title="Sell / Strong Sell"
                          />
                        </div>

                        <div className="flex justify-between text-xs font-bold text-slate-300">
                          <span className="text-emerald-400">
                            Buy: {analysis.recommendations.strongBuy + analysis.recommendations.buy}
                          </span>
                          <span className="text-amber-400">
                            Hold: {analysis.recommendations.hold}
                          </span>
                          <span className="text-rose-400">
                            Sell: {analysis.recommendations.sell + analysis.recommendations.strongSell}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">Analyst consensus data not available for this ticker.</p>
                    )}
                  </div>

                  {/* Target Price Visualizer */}
                  {analysis?.targets?.targetMeanPrice && (
                    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Consensus Price Targets
                      </h3>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                          <span className="text-[10px] text-slate-500 font-bold block">Target Low</span>
                          <span className="font-mono text-sm font-bold text-rose-400">
                            ₹{analysis.targets.targetLowPrice?.toFixed(2) || "N/A"}
                          </span>
                        </div>
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                          <span className="text-[10px] text-emerald-400 font-bold block">Mean Target</span>
                          <span className="font-mono text-base font-bold text-white">
                            ₹{analysis.targets.targetMeanPrice?.toFixed(2) || "N/A"}
                          </span>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                          <span className="text-[10px] text-slate-500 font-bold block">Target High</span>
                          <span className="font-mono text-sm font-bold text-emerald-400">
                            ₹{analysis.targets.targetHighPrice?.toFixed(2) || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Company Description */}
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5 space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      About {quote?.shortName || symbol}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-300">
                      {analysis?.profile?.summary || "No company profile description available."}
                    </p>
                    {analysis?.profile?.industry && (
                      <div className="pt-2 text-[11px] text-slate-400">
                        <strong>Industry:</strong> {analysis.profile.industry}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
