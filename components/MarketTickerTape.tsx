"use client";

import { Coins, Globe, BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface MarketTickerTapeProps {
  gold24kPrice: number;
  silverPrice: number;
  usdToInr: number;
  currencyMode: "INR" | "USD";
}

export default function MarketTickerTape({
  gold24kPrice,
  silverPrice,
  usdToInr,
  currencyMode,
}: MarketTickerTapeProps) {
  const isINR = currencyMode === "INR";
  const sym = isINR ? "₹" : "$";

  const { data: stockData } = useSWR("/api/stock?symbol=^NSEI,^BSESN", fetcher, {
    refreshInterval: 15000,
  });

  const quotesList = Array.isArray(stockData?.data) ? stockData.data : [];
  const nifty  = quotesList.find((q: any) => q.symbol === "^NSEI");
  const sensex = quotesList.find((q: any) => q.symbol === "^BSESN");

  const tickerItems = [
    {
      label: "GOLD 24K",
      val: `${sym}${gold24kPrice.toLocaleString()}`,
      unit: isINR ? "/10g" : "/oz",
      icon: Coins,
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.10)",
      border: "rgba(245,158,11,0.28)",
    },
    {
      label: "SILVER 999",
      val: `${sym}${silverPrice.toLocaleString()}`,
      unit: isINR ? "/kg" : "/oz",
      icon: Coins,
      color: "#CBD5E1",
      bg: "rgba(203,213,225,0.08)",
      border: "rgba(203,213,225,0.18)",
    },
    {
      label: "USD/INR",
      val: `₹${usdToInr.toFixed(2)}`,
      unit: "/ 1 USD",
      icon: Globe,
      color: "#00D4FF",
      bg: "rgba(0,212,255,0.08)",
      border: "rgba(0,212,255,0.22)",
    },
    {
      label: "NIFTY 50",
      val: nifty?.price ? nifty.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—",
      unit: "",
      change: nifty?.changePercent != null ? `${nifty.changePercent >= 0 ? "+" : ""}${nifty.changePercent.toFixed(2)}%` : null,
      isUp: nifty?.changePercent != null ? nifty.changePercent >= 0 : true,
      icon: BarChart3,
      color: nifty?.changePercent != null ? (nifty.changePercent >= 0 ? "#10B981" : "#F43F5E") : "#10B981",
      bg: nifty?.changePercent != null ? (nifty.changePercent >= 0 ? "rgba(16,185,129,0.08)" : "rgba(244,63,94,0.08)") : "rgba(16,185,129,0.08)",
      border: nifty?.changePercent != null ? (nifty.changePercent >= 0 ? "rgba(16,185,129,0.22)" : "rgba(244,63,94,0.22)") : "rgba(16,185,129,0.22)",
    },
    {
      label: "SENSEX",
      val: sensex?.price ? sensex.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—",
      unit: "",
      change: sensex?.changePercent != null ? `${sensex.changePercent >= 0 ? "+" : ""}${sensex.changePercent.toFixed(2)}%` : null,
      isUp: sensex?.changePercent != null ? sensex.changePercent >= 0 : true,
      icon: BarChart3,
      color: sensex?.changePercent != null ? (sensex.changePercent >= 0 ? "#10B981" : "#F43F5E") : "#10B981",
      bg: sensex?.changePercent != null ? (sensex.changePercent >= 0 ? "rgba(16,185,129,0.08)" : "rgba(244,63,94,0.08)") : "rgba(16,185,129,0.08)",
      border: sensex?.changePercent != null ? (sensex.changePercent >= 0 ? "rgba(16,185,129,0.22)" : "rgba(244,63,94,0.22)") : "rgba(16,185,129,0.22)",
    },
    {
      label: "XAU/USD",
      val: `$${(gold24kPrice / 32.15).toFixed(2)}`,
      unit: "/oz",
      icon: Coins,
      color: "#FBBF24",
      bg: "rgba(251,191,36,0.08)",
      border: "rgba(251,191,36,0.22)",
    },
  ];

  // Duplicate items for seamless loop
  const allItems = [...tickerItems, ...tickerItems];

  return (
    <div
      className="w-full border-b py-2"
      style={{
        background: "rgba(2, 4, 9, 0.95)",
        borderColor: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="mx-auto max-w-7xl flex items-center gap-4 px-4 sm:px-6 lg:px-8">

        {/* Label */}
        <div className="shrink-0 flex items-center gap-2 pr-3 border-r border-white/7">
          <span className="live-dot" />
          <span className="hidden sm:block font-mono text-[9px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
            LIVE
          </span>
        </div>

        {/* Infinite Scroll Track */}
        <div className="ticker-wrapper flex-1 overflow-hidden">
          <div className="ticker-track">
            {allItems.map((item, idx) => {
              const Icon = item.icon;
              const isDown = item.change && !item.isUp;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-4 py-0.5 shrink-0"
                >
                  <div
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs"
                    style={{
                      background: item.bg,
                      border: `1px solid ${item.border}`,
                    }}
                  >
                    <Icon className="h-3 w-3 shrink-0" style={{ color: item.color }} />
                    <span className="font-mono text-[10px] font-bold text-slate-400">{item.label}</span>
                    <span className="font-mono text-[11px] font-black" style={{ color: item.color }}>
                      {item.val}
                    </span>
                    {item.unit && (
                      <span className="font-mono text-[9px] text-slate-600">{item.unit}</span>
                    )}
                    {item.change && (
                      <span
                        className="flex items-center gap-0.5 font-mono text-[10px] font-extrabold px-1 rounded"
                        style={{
                          color: item.isUp ? "#34D399" : "#FB7185",
                          background: item.isUp ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)",
                        }}
                      >
                        {item.isUp
                          ? <TrendingUp className="h-2.5 w-2.5" />
                          : <TrendingDown className="h-2.5 w-2.5" />}
                        {item.change}
                      </span>
                    )}
                  </div>
                  {/* Separator dot */}
                  <span className="text-slate-700 text-[8px]">◆</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
