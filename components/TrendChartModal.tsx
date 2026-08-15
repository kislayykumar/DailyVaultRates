"use client";

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted || !isOpen || !selectedAsset) return null;

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
          const baseGramPrice = metal.priceInrGram || ((metal.priceUsdGram || 0) * usdToInr * 1.09);
          if (selectedUnit === "1g") priceValue = baseGramPrice;
          else if (selectedUnit === "10g") priceValue = metal.priceInr10Gram || baseGramPrice * 10;
          else if (selectedUnit === "1kg") priceValue = metal.priceInrKg || baseGramPrice * 1000;
          else priceValue = metal.priceUsdOunce ? metal.priceUsdOunce * usdToInr : baseGramPrice * 31.1035;
        } else {
          const baseGramPriceUsd = metal.priceUsdGram || 0;
          if (selectedUnit === "1g") priceValue = baseGramPriceUsd;
          else if (selectedUnit === "10g") priceValue = baseGramPriceUsd * 10;
          else if (selectedUnit === "1kg") priceValue = baseGramPriceUsd * 1000;
          else priceValue = metal.priceUsdOunce || baseGramPriceUsd * 31.1035;
        }
      }
    } else {
      const curr = dayData.currencies.find((c) => c.code === selectedAsset.id);
      if (curr) {
        priceValue = isINR ? (curr.usdToRate ? usdToInr / curr.usdToRate : 0) : (curr.usdToRate || 0);
        if (selectedAsset.id === "USD") {
          priceValue = isINR ? usdToInr : 1;
        }
      }
    }

    return {
      date: dayData.date,
      price: Number(priceValue.toFixed(2)),
    };
  });

  // Calculate metrics
  const prices = chartData.map((d) => d.price).filter((p) => p > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const latestPrice = prices.length ? prices[prices.length - 1] : 0;
  const firstPrice = prices.length ? prices[0] : 0;

  const totalChange = latestPrice - firstPrice;
  const percentageChange = firstPrice > 0 ? ((totalChange / firstPrice) * 100).toFixed(2) : "0.00";
  const isUp = totalChange >= 0;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(2,4,9,0.88)", backdropFilter: "blur(20px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl"
        style={{
          background: "linear-gradient(145deg, rgba(12,17,32,0.99) 0%, rgba(6,10,22,0.99) 100%)",
          border: "1px solid rgba(245,158,11,0.20)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.85), 0 0 60px rgba(245,158,11,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Shimmer Accent Line */}
        <div
          className="h-[2px] w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #F59E0B 40%, #10B981 60%, transparent 100%)",
          }}
        />

        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest"
                style={{
                  background: "rgba(245,158,11,0.12)",
                  border: "1px solid rgba(245,158,11,0.30)",
                  color: "#F59E0B",
                }}
              >
                {selectedAsset.type === "metal" ? "PRECIOUS METAL" : "FOREX PAIR"}
              </span>
              <span className="text-[11px] text-slate-500 font-mono font-bold">
                {selectedAsset.symbol}
              </span>
            </div>
            <h2
              className="mt-1 text-xl font-black text-white"
              style={{
                fontFamily: "'Outfit', 'Inter', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              {selectedAsset.name} Historical Trend
            </h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-all hover:text-white hover:bg-white/8"
            style={{ border: "1px solid rgba(255,255,255,0.09)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Price Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className="rounded-xl p-3.5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">
                Latest Spot Price
              </span>
              <span className="font-mono text-base font-black text-white">
                {currencySymbol}
                {latestPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div
              className="rounded-xl p-3.5"
              style={{
                background: isUp ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${isUp ? "rgba(16,185,129,0.22)" : "rgba(239,68,68,0.22)"}`,
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">
                Period Trend
              </span>
              <span
                className="font-mono text-base font-black flex items-center gap-1"
                style={{ color: isUp ? "#10B981" : "#EF4444" }}
              >
                {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {isUp ? "+" : ""}
                {percentageChange}%
              </span>
            </div>

            <div
              className="rounded-xl p-3.5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">
                Period Low
              </span>
              <span className="font-mono text-base font-black text-rose-400">
                {currencySymbol}
                {minPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div
              className="rounded-xl p-3.5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">
                Period High
              </span>
              <span className="font-mono text-base font-black text-emerald-400">
                {currencySymbol}
                {maxPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Unit Toggle for metals */}
          {selectedAsset.type === "metal" && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Display Unit:
              </span>
              {(["1g", "10g", "1kg", "oz"] as const).map((unit) => (
                <button
                  key={unit}
                  onClick={() => setSelectedUnit(unit)}
                  className="rounded-lg px-3 py-1 text-xs font-bold transition-all"
                  style={{
                    background:
                      selectedUnit === unit
                        ? "rgba(245,158,11,0.20)"
                        : "rgba(255,255,255,0.04)",
                    border:
                      selectedUnit === unit
                        ? "1px solid rgba(245,158,11,0.50)"
                        : "1px solid rgba(255,255,255,0.08)",
                    color: selectedUnit === unit ? "#F59E0B" : "#94A3B8",
                  }}
                >
                  {unit}
                </button>
              ))}
            </div>
          )}

          {/* Chart Graphic Area */}
          <div
            className="h-64 w-full rounded-2xl p-4"
            style={{
              background: "rgba(6,11,20,0.70)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={isUp ? "#10B981" : "#EF4444"}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={isUp ? "#10B981" : "#EF4444"}
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  domain={["auto", "auto"]}
                  tickFormatter={(v) => `${currencySymbol}${v}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div
                          className="rounded-xl p-3 shadow-xl"
                          style={{
                            background: "rgba(12,17,32,0.95)",
                            border: "1px solid rgba(245,158,11,0.3)",
                          }}
                        >
                          <p className="text-[10px] text-slate-500 font-mono">
                            {data.date}
                          </p>
                          <p className="text-sm font-black text-white font-mono mt-0.5">
                            {currencySymbol}
                            {data.price.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
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
                  stroke={isUp ? "#10B981" : "#EF4444"}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#chartGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Historical Data Table */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(6,11,20,0.70)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              className="px-4 py-3 border-b flex items-center justify-between"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Verified Spot Entries ({chartData.length} records)
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead
                  className="border-b text-slate-500"
                  style={{
                    background: "rgba(2,4,9,0.80)",
                    borderColor: "rgba(255,255,255,0.06)",
                  }}
                >
                  <tr>
                    <th className="px-4 py-2 font-semibold">Date</th>
                    <th className="px-4 py-2 font-semibold">
                      Spot Rate ({currencySymbol})
                    </th>
                    <th className="px-4 py-2 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y text-slate-300"
                  style={{ borderColor: "rgba(255,255,255,0.04)" }}
                >
                  {chartData
                    .slice()
                    .reverse()
                    .map((row) => (
                      <tr key={row.date} className="hover:bg-white/3 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-slate-400">
                          {row.date}
                        </td>
                        <td className="px-4 py-2.5 font-mono font-bold text-white">
                          {currencySymbol}
                          {row.price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
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

        {/* Footer */}
        <div
          className="px-6 py-3.5 flex items-center justify-between text-xs text-slate-500"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span>DailyVaultRates Analytics Engine</span>
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-1.5 font-bold text-white transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
              color: "#020409",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
