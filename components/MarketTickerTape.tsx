"use client";

import { Coins, Globe, BarChart3 } from "lucide-react";
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

  // Fetch Nifty 50 and Sensex for the ticker tape
  const { data: stockData } = useSWR("/api/stock?symbol=^NSEI,^BSESN", fetcher, {
    refreshInterval: 10000,
  });

  const quotesList = Array.isArray(stockData?.data) ? stockData.data : [];
  const nifty = quotesList.find((q: any) => q.symbol === "^NSEI");
  const sensex = quotesList.find((q: any) => q.symbol === "^BSESN");

  const tickerItems = [
    {
      label: "GOLD 24K",
      val: `${sym}${gold24kPrice.toLocaleString()}${isINR ? "/10g" : "/oz"}`,
      type: "metal",
      icon: Coins,
      color: "text-amber-400",
      border: "border-amber-500/30 bg-amber-500/10",
    },
    {
      label: "SILVER 999",
      val: `${sym}${silverPrice.toLocaleString()}${isINR ? "/kg" : "/oz"}`,
      type: "metal",
      icon: Coins,
      color: "text-slate-300",
      border: "border-slate-700/80 bg-slate-800/50",
    },
    {
      label: "NIFTY 50",
      val: nifty?.price ? nifty.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "24,150.00",
      change: nifty?.changePercent ? `${nifty.changePercent >= 0 ? "+" : ""}${nifty.changePercent.toFixed(2)}%` : null,
      isUp: nifty?.changePercent ? nifty.changePercent >= 0 : true,
      type: "stock",
      icon: BarChart3,
      color: "text-emerald-400",
      border: "border-emerald-500/30 bg-emerald-500/10",
    },
    {
      label: "SENSEX",
      val: sensex?.price ? sensex.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "79,200.00",
      change: sensex?.changePercent ? `${sensex.changePercent >= 0 ? "+" : ""}${sensex.changePercent.toFixed(2)}%` : null,
      isUp: sensex?.changePercent ? sensex.changePercent >= 0 : true,
      type: "stock",
      icon: BarChart3,
      color: "text-emerald-400",
      border: "border-emerald-500/30 bg-emerald-500/10",
    },
    {
      label: "USD / INR",
      val: `₹${usdToInr.toFixed(2)}`,
      type: "forex",
      icon: Globe,
      color: "text-cyan-400",
      border: "border-cyan-500/30 bg-cyan-500/10",
    },
  ];

  return (
    <div className="w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl py-2 px-3 sm:px-4">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
        {/* Live Indicator Header */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <span className="live-dot" />
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-slate-300">
            Live Market Pulse
          </span>
        </div>

        {/* Wrapped Ticker Grid (No Mobile Slider - All Items Wrapped & Visible) */}
        <div className="flex flex-wrap items-center justify-start gap-1.5 sm:gap-3 w-full sm:w-auto">
          {tickerItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs backdrop-blur-md transition-all ${item.border}`}
              >
                <Icon className={`h-3 w-3 ${item.color} shrink-0`} />
                <span className="font-mono text-[10px] font-bold text-slate-400">{item.label}:</span>
                <span className={`font-mono text-xs font-black ${item.color}`}>{item.val}</span>
                {item.change && (
                  <span
                    className={`font-mono text-[10px] font-extrabold px-1 rounded ${
                      item.isUp ? "text-emerald-400 bg-emerald-500/20" : "text-rose-400 bg-rose-500/20"
                    }`}
                  >
                    {item.change}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
