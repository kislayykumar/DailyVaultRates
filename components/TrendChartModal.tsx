"use client";

import React, { useState } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Sparkles,
  BarChart2,
  Activity,
  Layers,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { DailyRateData, MetalRate, CurrencyRate } from "@/lib/types";

interface TrendChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsset: {
    type: "metal" | "forex";
    id: string;
    name: string;
    symbol: string;
    subtext?: string;
  } | null;
  historicalHistory: DailyRateData[];
  currencyMode: "INR" | "USD";
}

export default function TrendChartModal({
  isOpen,
  onClose,
  selectedAsset,
  historicalHistory,
  currencyMode,
}: TrendChartModalProps) {
  const [selectedUnit, setSelectedUnit] = useState<"1g" | "10g" | "1kg" | "oz">("10g");

  if (!isOpen || !selectedAsset) return null;

  const isINR = currencyMode === "INR";
  const currencySymbol = isINR ? "₹" : "$";

  // Build chart dataset from historical JSON records
  const chartData = historicalHistory.map((dayData) => {
    const inrCurrency = dayData.currencies.find((c) => c.code === "INR");
    const usdToInr = inrCurrency?.usdToRate || 83.88;

    let priceValue = 0;

    if (selectedAsset.type === "metal") {
      const metal = dayData.metals.find((m) => m.id === selectedAsset.id);
      if (metal) {
        if (isINR) {
          const dutyMultiplier = metal.id.startsWith("gold") ? 1.09 : 1.145;
          const gramInr = metal.priceInrGram || (metal.priceUsdGram * usdToInr * dutyMultiplier);
          if (selectedAsset.id === "silver" || selectedAsset.id === "aluminum") {
            priceValue = Number((gramInr * 1000).toFixed(2));
          } else {
            priceValue = Number((gramInr * 10).toFixed(2));
          }
        } else {
          priceValue = metal.priceUsdOunce;
        }
      }
    } else {
      // Forex
      const curr = dayData.currencies.find((c) => c.code === selectedAsset.id);
      if (curr) {
        priceValue = isINR ? Number((curr.rateToUsd * usdToInr).toFixed(4)) : curr.rateToUsd;
      } else if (selectedAsset.id === "USD" && isINR) {
        priceValue = Number(usdToInr.toFixed(2));
      }
    }

    return {
      date: dayData.date,
      shortDate: dayData.date.substring(5), // MM-DD
      price: priceValue,
    };
  });

  const prices = chartData.map((d) => d.price).filter((p) => p > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const latestPrice = prices.length ? prices[prices.length - 1] : 0;
  const oldestPrice = prices.length ? prices[0] : latestPrice;
  
  const priceDiff = latestPrice - oldestPrice;
  const percentChange = oldestPrice > 0 ? (priceDiff / oldestPrice) * 100 : 0;
  const isUp = priceDiff >= 0;

  // Primary chart color based on asset type
  const strokeColor = selectedAsset.type === "metal"
    ? selectedAsset.id.startsWith("gold")
      ? "#d4a843"
      : selectedAsset.id === "silver"
      ? "#a8b8cc"
      : "#38bdf8"
    : "#38bdf8";

  const gradientId = `trendGradient-${selectedAsset.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-vault-border bg-vault-card shadow-2xl transition-all" style={{ background: "#0b1021", borderColor: "#162038" }}>
        
        {/* Top Header Shimmer Line */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${strokeColor}, transparent)` }} />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-vault-border/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-xs shadow-md"
              style={{ background: `${strokeColor}18`, color: strokeColor, border: `1px solid ${strokeColor}35` }}
            >
              {selectedAsset.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">{selectedAsset.name}</h2>
                <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700">
                  {selectedAsset.type === "metal" ? "Precious Metal" : "Forex Rate"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Historical Spot Trend Analysis ({currencyMode} {currencySymbol})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
            <div className="rounded-2xl border border-vault-border bg-vault-dark/80 p-3.5">
              <span className="text-[11px] font-medium text-slate-400">Current Spot</span>
              <p className="price-num mt-1 text-lg font-black text-white">
                {currencySymbol}{latestPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="rounded-2xl border border-vault-border bg-vault-dark/80 p-3.5">
              <span className="text-[11px] font-medium text-slate-400">Period High</span>
              <p className="price-num mt-1 text-lg font-bold text-emerald-400">
                {currencySymbol}{maxPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="rounded-2xl border border-vault-border bg-vault-dark/80 p-3.5">
              <span className="text-[11px] font-medium text-slate-400">Period Low</span>
              <p className="price-num mt-1 text-lg font-bold text-rose-400">
                {currencySymbol}{minPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="rounded-2xl border border-vault-border bg-vault-dark/80 p-3.5">
              <span className="text-[11px] font-medium text-slate-400">Recorded Change</span>
              <div className="mt-1 flex items-center gap-1">
                <span className={`inline-flex items-center text-xs font-black ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                  {isUp ? <TrendingUp className="mr-0.5 h-3.5 w-3.5" /> : <TrendingDown className="mr-0.5 h-3.5 w-3.5" />}
                  {isUp ? "+" : ""}{percentChange.toFixed(2)}%
                </span>
                <span className="price-num text-[10px] text-slate-400">
                  ({priceDiff >= 0 ? "+" : ""}{priceDiff.toFixed(2)})
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Recharts Line Chart */}
          <div className="rounded-2xl border border-vault-border/80 bg-vault-dark/60 p-4 mb-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" style={{ color: strokeColor }} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Spot Price Movement Chart
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                {chartData.length} Archive Snapshots
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#162038" vertical={false} />
                  <XAxis
                    dataKey="shortDate"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#162038" }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={["auto", "auto"]}
                    tickLine={false}
                    axisLine={{ stroke: "#162038" }}
                    tickFormatter={(val) => `${currencySymbol}${val}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0];
                        return (
                          <div className="rounded-xl border border-vault-border bg-slate-950 p-3 shadow-xl text-xs">
                            <p className="font-semibold text-slate-300">Date: {item.payload.date}</p>
                            <p className="price-num mt-1 text-sm font-bold text-amber-400">
                              Price: {currencySymbol}{Number(item.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={strokeColor}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill={`url(#${gradientId})`}
                    activeDot={{ r: 6, fill: strokeColor, stroke: "#050811", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Data Log Table */}
          <div className="rounded-2xl border border-vault-border/80 bg-vault-dark/40 overflow-hidden">
            <div className="border-b border-vault-border/60 bg-vault-dark/80 px-4 py-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Daily Historical Log</span>
              <span className="text-[10px] text-slate-400">Verified Spot Entries</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-vault-border bg-vault-dark/90 text-slate-400">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Date</th>
                    <th className="px-4 py-2 font-semibold">Spot Rate ({currencySymbol})</th>
                    <th className="px-4 py-2 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vault-border/40 text-slate-200">
                  {chartData.slice().reverse().map((row, idx) => (
                    <tr key={row.date} className="hover:bg-vault-border/20 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-slate-300">{row.date}</td>
                      <td className="px-4 py-2.5 price-num font-bold text-white">
                        {currencySymbol}{row.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                          <CheckCircle2 className="h-3 w-3" /> Immutable
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="border-t border-vault-border/80 bg-vault-dark/90 px-6 py-3 flex items-center justify-between text-xs text-slate-400">
          <span>DailyVaultRates Analytics Engine</span>
          <button
            onClick={onClose}
            className="rounded-xl bg-vault-border px-4 py-1.5 font-bold text-white transition-colors hover:bg-amber-500 hover:text-slate-950"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
