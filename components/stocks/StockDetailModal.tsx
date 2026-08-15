"use client";

import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  X, TrendingUp, TrendingDown, Activity, ShieldCheck, Target,
  AlertTriangle, ChevronRight, Clock, Building,
} from "lucide-react";
import useSWR from "swr";
import PdfDownloadButton from "@/components/PdfDownloadButton";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const formatISTTime = (iso?: string) => {
  if (!iso) return "";
  try {
    return (
      new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      }).format(new Date(iso)) + " IST"
    );
  } catch { return iso; }
};

const fmt  = (v: number | null | undefined, d = 2) => v == null ? "N/A" : v.toFixed(d);
const fmtP = (v: number | null | undefined) => v == null ? "N/A" : `${(v * 100).toFixed(2)}%`;
const fmtCap = (v: number | null | undefined) => {
  if (!v) return "N/A";
  if (v >= 1e12) return `₹${(v / 1e12).toFixed(2)} L.Cr`;
  if (v >= 1e7)  return `₹${(v / 1e7).toFixed(2)} Cr`;
  if (v >= 1e5)  return `₹${(v / 1e5).toFixed(2)} L`;
  return `₹${v.toLocaleString()}`;
};

interface Props { symbol: string | null; onClose: () => void; }

/* ── Shared stat tile ─────────────────────────────────────────────── */
function StatTile({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: "green" | "amber" | "red" }) {
  const colors = {
    green: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.22)", text: "#10B981" },
    amber: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.22)", text: "#F59E0B" },
    red:   { bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.22)",  text: "#EF4444" },
  };
  const c = highlight ? colors[highlight] : null;
  return (
    <div className="rounded-xl p-3.5"
      style={{
        background: c ? c.bg : "rgba(6,11,20,0.70)",
        border: `1px solid ${c ? c.border : "rgba(255,255,255,0.07)"}`,
      }}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">{label}</span>
      <span className="font-mono text-sm font-black" style={{ color: c ? c.text : "#fff" }}>{value}</span>
      {sub && <p className="mt-1.5 text-[10px] text-slate-600">{sub}</p>}
    </div>
  );
}

export default function StockDetailModal({ symbol, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "ratios" | "ratings">("overview");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!symbol) return;
    setActiveTab("overview");
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [symbol, onClose]);

  useEffect(() => {
    document.body.style.overflow = symbol ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [symbol]);

  const { data: stockData,    isLoading: loadingQ  } = useSWR(symbol ? `/api/stock?symbol=${encodeURIComponent(symbol)}`    : null, fetcher);
  const { data: analysisData, isLoading: loadingA  } = useSWR(symbol ? `/api/analysis?symbol=${encodeURIComponent(symbol)}` : null, fetcher);

  if (!mounted || !symbol) return null;

  const quote    = stockData?.data;
  const analysis = analysisData?.data;
  const isUp     = quote ? quote.change >= 0 : true;
  const upColor  = isUp ? "#10B981" : "#EF4444";

  const calc52 = () => {
    const lo  = analysis?.metrics?.fiftyTwoWeekLow  || quote?.dayLow  || 0;
    const hi  = analysis?.metrics?.fiftyTwoWeekHigh || quote?.dayHigh || 100;
    const cur = quote?.price || 50;
    if (hi <= lo) return 50;
    return Math.max(0, Math.min(100, ((cur - lo) / (hi - lo)) * 100));
  };

  const TABS = [
    { id: "overview", label: "Overview",      Icon: Activity     },
    { id: "ratios",   label: "Key Ratios",    Icon: ShieldCheck  },
    { id: "ratings",  label: "Analyst Rating",Icon: Target       },
  ] as const;

  return ReactDOM.createPortal(
    /* Backdrop */
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: "rgba(2,4,9,0.88)", backdropFilter: "blur(18px)" }}
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        id="stock-analysis-report-container"
        className="relative flex flex-col w-full sm:max-w-3xl overflow-hidden sm:rounded-2xl"
        style={{
          maxHeight: "92vh",
          background: "rgba(6,11,20,0.97)",
          border: "1px solid rgba(16,185,129,0.18)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.9), 0 0 60px rgba(16,185,129,0.05)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top shimmer line */}
        <div className="h-[2px] w-full shrink-0"
          style={{ background: "linear-gradient(90deg, transparent 0%, #10B981 40%, #F59E0B 60%, transparent 100%)" }} />

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xl font-black text-white">{symbol}</span>
              <span className="rounded-md px-2 py-0.5 text-[10px] font-extrabold"
                style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.25)", color: "#10B981" }}>
                {quote?.exchange || "NSE"}
              </span>
              {analysis?.profile?.sector && (
                <span className="hidden sm:inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#94A3B8" }}>
                  {analysis.profile.sector}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {quote?.longName || quote?.shortName || "Indian Stock Market Intelligence"}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <PdfDownloadButton
              targetId="stock-analysis-report-container"
              filename={`${symbol}-Analysis.pdf`}
              label="Export PDF"
              variant="emerald"
            />
            <button onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition-all hover:text-white hover:bg-white/8"
              style={{ border: "1px solid rgba(255,255,255,0.09)" }}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Price Banner ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 shrink-0"
          style={{
            background: "rgba(6,11,20,0.60)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
          {loadingQ ? (
            <div className="h-10 w-48 animate-pulse rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }} />
          ) : quote ? (
            <div className="flex items-baseline gap-3">
              <span className="price-num font-mono text-3xl font-black text-white">
                ₹{quote.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold tabular-nums"
                style={{
                  background: isUp ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                  border: `1px solid ${isUp ? "rgba(16,185,129,0.28)" : "rgba(239,68,68,0.28)"}`,
                  color: upColor,
                }}>
                {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {isUp ? "+" : ""}{quote.change.toFixed(2)} ({quote.changePercent.toFixed(2)}%)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm" style={{ color: "#EF4444" }}>
              <AlertTriangle className="h-4 w-4" /> Unable to fetch live price
            </div>
          )}

          <div className="text-right">
            {quote?.timestamp && (
              <span className="text-[11px] font-mono block" style={{ color: "#10B981" }}>
                <Clock className="inline h-3 w-3 mr-1" />{formatISTTime(quote.timestamp)}
              </span>
            )}
            <span className="text-[10px] text-slate-600">15-min delayed SEBI public feed</span>
          </div>
        </div>

        {/* ── Tab Nav ─────────────────────────────────────────────────── */}
        <div className="flex shrink-0 px-5"
          style={{ background: "rgba(6,11,20,0.80)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {TABS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id}
                onClick={() => setActiveTab(id)}
                className="flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-bold transition-all"
                style={{
                  borderColor: active ? "#10B981" : "transparent",
                  color: active ? "#10B981" : "#64748B",
                  background: active ? "rgba(16,185,129,0.05)" : "transparent",
                }}>
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Scrollable Tab Body ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* 52-week range */}
              <div className="rounded-2xl p-4"
                style={{ background: "rgba(6,11,20,0.70)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-3">
                  <span>52-Wk Low</span>
                  <span style={{ color: "#10B981" }}>52-Week Range</span>
                  <span>52-Wk High</span>
                </div>
                <div className="relative h-2 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="absolute inset-0 rounded-full opacity-20"
                    style={{ background: "linear-gradient(90deg, #10B981, #F59E0B)" }} />
                  <div className="absolute top-0 bottom-0 w-3 -ml-1.5 rounded-full shadow-md"
                    style={{ left: `${calc52()}%`, background: "#10B981", boxShadow: "0 0 8px rgba(16,185,129,0.6)" }} />
                </div>
                <div className="flex items-center justify-between font-mono text-xs font-bold text-white mt-2">
                  <span className="text-slate-500">
                    ₹{fmt(analysis?.metrics?.fiftyTwoWeekLow ?? (quote?.dayLow ? quote.dayLow * 0.85 : null))}
                  </span>
                  <span style={{ color: "#10B981" }}>Current: ₹{fmt(quote?.price)}</span>
                  <span className="text-slate-500">
                    ₹{fmt(analysis?.metrics?.fiftyTwoWeekHigh ?? (quote?.dayHigh ? quote.dayHigh * 1.15 : null))}
                  </span>
                </div>
              </div>

              {/* Stat grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatTile label="Open Price"       value={quote?.open          ? `₹${quote.open.toFixed(2)}`          : "N/A"} />
                <StatTile label="Prev. Close"      value={quote?.previousClose  ? `₹${quote.previousClose.toFixed(2)}` : "N/A"} />
                <StatTile label="Day High"         value={quote?.dayHigh        ? `₹${quote.dayHigh.toFixed(2)}`       : "N/A"} highlight="green" />
                <StatTile label="Day Low"          value={quote?.dayLow         ? `₹${quote.dayLow.toFixed(2)}`        : "N/A"} highlight="red" />
                <StatTile label="Volume"           value={quote?.volume         ? quote.volume.toLocaleString()         : "N/A"} />
                <StatTile label="Market Cap"       value={fmtCap(quote?.marketCap)} />
              </div>
            </div>
          )}

          {/* TAB: KEY RATIOS */}
          {activeTab === "ratios" && (
            <div className="space-y-4">
              {loadingA ? (
                <div className="py-12 flex items-center justify-center gap-2 text-sm text-slate-500">
                  <div className="h-4 w-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                  Loading financial ratios…
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <StatTile label="Trailing P/E"
                    value={fmt(analysis?.metrics?.trailingPE)}
                    sub={analysis?.metrics?.trailingPE < 25 ? "Reasonable valuation" : "Rich valuation"}
                    highlight={analysis?.metrics?.trailingPE < 25 ? "green" : "amber"} />
                  <StatTile label="Forward P/E"
                    value={fmt(analysis?.metrics?.forwardPE)}
                    sub="Forward earnings multiple" />
                  <StatTile label="Price / Book"
                    value={fmt(analysis?.metrics?.priceToBook)}
                    sub="Book value multiple" />
                  <StatTile label="Debt / Equity"
                    value={fmt(analysis?.metrics?.debtToEquity)}
                    sub={analysis?.metrics?.debtToEquity < 100 ? "Healthy leverage" : "High leverage"}
                    highlight={analysis?.metrics?.debtToEquity < 100 ? "green" : "amber"} />
                  <StatTile label="Return on Equity"
                    value={fmtP(analysis?.metrics?.returnOnEquity)}
                    sub={analysis?.metrics?.returnOnEquity > 0.15 ? "High efficiency" : "Capital return rate"}
                    highlight={analysis?.metrics?.returnOnEquity > 0.15 ? "green" : undefined} />
                  <StatTile label="Profit Margin"
                    value={fmtP(analysis?.metrics?.profitMargins)}
                    sub="Net profit margin" />
                </div>
              )}
            </div>
          )}

          {/* TAB: ANALYST RATINGS */}
          {activeTab === "ratings" && (
            <div className="space-y-4">
              {loadingA ? (
                <div className="py-12 flex items-center justify-center gap-2 text-sm text-slate-500">
                  <div className="h-4 w-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                  Fetching analyst consensus…
                </div>
              ) : (
                <>
                  {/* Analyst breakdown */}
                  <div className="rounded-2xl p-5 space-y-4"
                    style={{ background: "rgba(6,11,20,0.70)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                        Analyst Breakdown ({analysis?.recommendations?.total || 0} analysts)
                      </h3>
                      <span className="rounded-md px-2.5 py-0.5 text-[10px] font-extrabold uppercase"
                        style={{ background: "rgba(99,102,241,0.10)", border: "1px solid rgba(99,102,241,0.25)", color: "#818CF8" }}>
                        {analysis?.targets?.recommendationKey?.toUpperCase() || "HOLD"}
                      </span>
                    </div>

                    {analysis?.recommendations?.total ? (
                      <div className="space-y-2">
                        <div className="flex h-2.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div style={{ width: `${((analysis.recommendations.strongBuy + analysis.recommendations.buy) / analysis.recommendations.total) * 100}%`, background: "#10B981" }} />
                          <div style={{ width: `${(analysis.recommendations.hold / analysis.recommendations.total) * 100}%`, background: "#F59E0B" }} />
                          <div style={{ width: `${((analysis.recommendations.sell + analysis.recommendations.strongSell) / analysis.recommendations.total) * 100}%`, background: "#EF4444" }} />
                        </div>
                        <div className="flex justify-between text-xs font-bold">
                          <span style={{ color: "#10B981" }}>Buy: {analysis.recommendations.strongBuy + analysis.recommendations.buy}</span>
                          <span style={{ color: "#F59E0B" }}>Hold: {analysis.recommendations.hold}</span>
                          <span style={{ color: "#EF4444" }}>Sell: {analysis.recommendations.sell + analysis.recommendations.strongSell}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600">No analyst data available for this ticker.</p>
                    )}
                  </div>

                  {/* Price targets */}
                  {analysis?.targets?.targetMeanPrice && (
                    <div className="rounded-2xl p-5 space-y-3"
                      style={{ background: "rgba(6,11,20,0.70)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Consensus Price Targets</h3>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-xl p-3"
                          style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)" }}>
                          <span className="text-[10px] font-bold text-slate-600 block">Low</span>
                          <span className="font-mono text-sm font-black" style={{ color: "#EF4444" }}>
                            ₹{analysis.targets.targetLowPrice?.toFixed(2) || "N/A"}
                          </span>
                        </div>
                        <div className="rounded-xl p-3"
                          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
                          <span className="text-[10px] font-bold block" style={{ color: "#10B981" }}>Mean</span>
                          <span className="font-mono text-base font-black text-white">
                            ₹{analysis.targets.targetMeanPrice?.toFixed(2) || "N/A"}
                          </span>
                        </div>
                        <div className="rounded-xl p-3"
                          style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.18)" }}>
                          <span className="text-[10px] font-bold text-slate-600 block">High</span>
                          <span className="font-mono text-sm font-black" style={{ color: "#10B981" }}>
                            ₹{analysis.targets.targetHighPrice?.toFixed(2) || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Company summary */}
                  <div className="rounded-2xl p-5 space-y-2"
                    style={{ background: "rgba(6,11,20,0.70)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1.5">
                      <Building className="h-3 w-3" /> About {quote?.shortName || symbol}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-400">
                      {analysis?.profile?.summary || "No company profile available."}
                    </p>
                    {analysis?.profile?.industry && (
                      <p className="text-[11px] text-slate-600 pt-1">
                        Industry: <span className="text-slate-400 font-semibold">{analysis.profile.industry}</span>
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
