"use client";

import { useState } from "react";
import {
  Coins,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Calendar,
  Sparkles,
  ChevronRight,
  Globe,
  LineChart as LineChartIcon,
  Info,
} from "lucide-react";
import { DailyRateData, calculateTrend, MetalRate } from "@/lib/types";
import { useCurrency } from "@/context/CurrencyContext";
import PdfDownloadButton from "@/components/PdfDownloadButton";
import AdBanner from "@/components/AdBanner";
import TrendChartModal from "@/components/TrendChartModal";
import Link from "next/link";

interface DashboardViewProps {
  currentData: DailyRateData;
  previousData: DailyRateData | null;
  allAvailableDates: { year: string; month: string; day: string }[];
  historicalHistory?: DailyRateData[];
  title?: string;
  isArchivePage?: boolean;
}

export default function DashboardView({
  currentData,
  previousData,
  allAvailableDates,
  historicalHistory = [],
  title = "Institutional Spot Rates & Market Vault",
  isArchivePage = false,
}: DashboardViewProps) {
  const { currencyMode } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "metals" | "forex">("all");

  // State for interactive Trend Chart Modal
  const [chartModalAsset, setChartModalAsset] = useState<{
    type: "metal" | "forex";
    id: string;
    name: string;
    symbol: string;
    subtext?: string;
  } | null>(null);

  const inrCurrency = currentData.currencies.find((c) => c.code === "INR");
  const usdToInr = inrCurrency?.usdToRate || 83.88;

  const prevInrCurrency = previousData?.currencies.find((c) => c.code === "INR");
  const prevUsdToInr = prevInrCurrency?.usdToRate || usdToInr;

  const prevMetalsMap = new Map(previousData?.metals.map((m) => [m.id, m]));
  const prevForexMap = new Map(previousData?.currencies.map((c) => [c.code, c]));

  const isINR = currencyMode === "INR";
  const currencySymbol = isINR ? "₹" : "$";

  // Helper for metal rates in INR
  const getInrRateGram = (metal: MetalRate): number => {
    if (metal.priceInrGram) return metal.priceInrGram;
    const dutyMultiplier = metal.id.startsWith("gold") ? 1.09 : 1.145;
    return Number((metal.priceUsdGram * usdToInr * dutyMultiplier).toFixed(2));
  };

  const getInrRate10Gram = (metal: MetalRate): number => {
    if (metal.priceInr10Gram) return metal.priceInr10Gram;
    return Number((getInrRateGram(metal) * 10).toFixed(2));
  };

  const getInrRateKg = (metal: MetalRate): number => {
    if (metal.priceInrKg) return metal.priceInrKg;
    return Number((getInrRateGram(metal) * 1000).toFixed(2));
  };

  const getPrevInrRateGram = (prevMetal?: MetalRate): number => {
    if (!prevMetal) return 0;
    if (prevMetal.priceInrGram) return prevMetal.priceInrGram;
    const dutyMultiplier = prevMetal.id.startsWith("gold") ? 1.09 : 1.145;
    return Number((prevMetal.priceUsdGram * prevUsdToInr * dutyMultiplier).toFixed(2));
  };

  // Filter metals and currencies
  const filteredMetals = currentData.metals.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCurrencies = currentData.currencies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Spotlight Items
  const gold24k = currentData.metals.find((m) => m.id === "gold-24k") || currentData.metals[0];
  const prevGold24k = prevMetalsMap.get(gold24k?.id);
  const g24Val = isINR ? getInrRate10Gram(gold24k) : gold24k.priceUsdOunce;
  const g24PrevVal = prevGold24k ? (isINR ? getPrevInrRateGram(prevGold24k) * 10 : prevGold24k.priceUsdOunce) : undefined;
  const gold24kTrend = calculateTrend(g24Val, g24PrevVal);

  const gold22k = currentData.metals.find((m) => m.id === "gold-22k") || currentData.metals[1];
  const prevGold22k = prevMetalsMap.get(gold22k?.id);
  const g22Val = isINR ? getInrRate10Gram(gold22k) : gold22k?.priceUsdOunce || 0;
  const g22PrevVal = prevGold22k ? (isINR ? getPrevInrRateGram(prevGold22k) * 10 : prevGold22k.priceUsdOunce) : undefined;
  const gold22kTrend = calculateTrend(g22Val, g22PrevVal);

  const silver = currentData.metals.find((m) => m.id === "silver");
  const prevSilver = prevMetalsMap.get("silver");
  const silverVal = isINR ? (silver ? getInrRateKg(silver) : 0) : silver?.priceUsdOunce || 0;
  const silverPrevVal = prevSilver ? (isINR ? getPrevInrRateGram(prevSilver) * 1000 : prevSilver.priceUsdOunce) : undefined;
  const silverTrend = calculateTrend(silverVal, silverPrevVal);

  const eur = currentData.currencies.find((c) => c.code === "EUR");
  const prevEur = prevForexMap.get("EUR");
  const eurVal = eur ? (isINR ? eur.rateToUsd * usdToInr : eur.rateToUsd) : 0;
  const eurPrevVal = prevEur ? (isINR ? prevEur.rateToUsd * prevUsdToInr : prevEur.rateToUsd) : undefined;
  const eurTrend = calculateTrend(eurVal, eurPrevVal);

  // Metal → accent colors
  const metalAccentColor = (id: string) => {
    if (id.startsWith("gold")) return "#F59E0B";
    if (id === "silver")        return "#94A3B8";
    if (id === "platinum")      return "#E2E8F0";
    if (id === "aluminum")      return "#38BDF8";
    return "#D97706";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Ad Banner */}
      <AdBanner slot="9876543210" format="horizontal" className="mb-8" />

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          {/* Mode Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-amber-400">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            {isINR ? "Indian Retail Standard (GoodReturns & IBJA Aligned)" : "International Standard Spot (USD / Troy Oz)"}
          </div>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {title}
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Verified spot data archived for{" "}
            <span className="font-bold price-num text-amber-400">{currentData.date}</span>.
            {" "}Displaying in{" "}
            <span className="font-extrabold text-white">{isINR ? "Indian Rupees (₹)" : "US Dollars ($)"}</span>.
            <span className="ml-2.5 inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-300">
              <Info className="h-3.5 w-3.5" /> Click any card to view historical trend chart!
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <PdfDownloadButton
            targetId="rates-report-container"
            filename={`DailyVaultRates-Report-${currentData.date}-${currencyMode}.pdf`}
            dateStr={currentData.date}
          />
        </div>
      </div>

      {/* ── Market Spotlight Ticker ──────────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {[
          {
            id: "gold-24k", type: "metal" as const,
            label: "Gold 24K", sub: "99.9% Fine",
            val: g24Val, trend: gold24kTrend,
            unit: isINR ? "/ 10g" : "/ oz",
            subLine: isINR ? `₹${getInrRateGram(gold24k).toLocaleString()} /g` : `$${gold24k.priceUsdGram.toFixed(2)} /g`,
            color: "#F59E0B", border: "border-amber-500/30",
          },
          {
            id: "gold-22k", type: "metal" as const,
            label: "Gold 22K", sub: "Jewelry Grade",
            val: g22Val, trend: gold22kTrend,
            unit: isINR ? "/ 10g" : "/ oz",
            subLine: isINR ? `₹${getInrRateGram(gold22k).toLocaleString()} /g` : `$${gold22k?.priceUsdGram.toFixed(2)} /g`,
            color: "#FBBF24", border: "border-yellow-500/30",
          },
          {
            id: "silver", type: "metal" as const,
            label: "Silver", sub: "99.9% Fine",
            val: silverVal, trend: silverTrend,
            unit: isINR ? "/ 1kg" : "/ oz",
            subLine: isINR ? `₹${getInrRateGram(silver || gold24k).toLocaleString()} /g` : `$${silver?.priceUsdGram.toFixed(2)} /g`,
            color: "#94A3B8", border: "border-slate-700",
          },
          {
            id: "EUR", type: "forex" as const,
            label: "EUR Rate", sub: "Euro Exchange",
            val: eurVal, trend: eurTrend,
            unit: isINR ? "(1 EUR)" : "(1 EUR)",
            subLine: isINR ? `1 EUR = ₹${eurVal.toFixed(2)}` : `1 EUR = $${eur?.rateToUsd}`,
            color: "#38BDF8", border: "border-sky-500/30",
          },
        ].map(({ id, type, label, sub, val, trend, unit, subLine, color, border }) => (
          <div
            key={id}
            onClick={() => setChartModalAsset({ type, id, name: label, symbol: id })}
            className={`metal-card group relative cursor-pointer overflow-hidden rounded-2xl border ${border} bg-slate-900/90 p-4 backdrop-blur-md shadow-lg transition-all hover:scale-[1.02]`}
          >
            {/* Top Gradient Shimmer Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-xs font-black uppercase tracking-wider" style={{ color }}>{label}</p>
                  <LineChartIcon className="h-3 w-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5">{sub}</p>
              </div>

              {/* Trend Badge */}
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                trend.isFlat ? "badge-flat" : trend.isUp ? "badge-up" : "badge-down"
              }`}>
                {trend.isFlat ? <Minus className="h-2.5 w-2.5" /> : trend.isUp ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                {trend.isUp && !trend.isFlat ? "+" : ""}{trend.percentage}%
              </span>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-1">
                <span className="price-num text-xl font-black text-white">
                  {currencySymbol}{val.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{unit}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <p className="price-num text-[11px] text-amber-400/90 font-medium">{subLine}</p>
                <span className="text-[10px] font-bold text-amber-400 group-hover:underline">
                  Chart 📈
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter & Control Bar ─────────────────────────────────── */}
      <div className="mb-6 flex flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 sm:flex-row sm:items-center backdrop-blur-md">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-950 p-1 text-xs">
          {(["all", "metals", "forex"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-lg px-3.5 py-1.5 font-bold capitalize transition-all duration-200 ${
                activeCategory === cat
                  ? "btn-gold text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {cat === "all" ? "All Markets" : cat === "metals" ? "⚙ Metals" : "💱 Forex"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300">
            <Globe className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-bold text-white">
              {isINR ? "₹ INR · 1g / 10g / 1kg" : "$ USD · Troy Oz"}
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search asset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-40 rounded-xl border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500/50 sm:w-48"
            />
          </div>
        </div>
      </div>

      {/* ── Main Report Container ─────────────────────────────────── */}
      <div id="rates-report-container" className="space-y-10 rounded-2xl bg-slate-950/60 p-2 sm:p-4">
        {/* Report Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-slate-900/90 p-4 backdrop-blur-md">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 text-xs font-black shadow-md">
                DVR
              </div>
              <div>
                <h2 className="text-base font-bold text-white">DailyVaultRates Official Spot Report</h2>
                <p className="text-xs text-slate-400">
                  {currentData.date} &nbsp;·&nbsp; Base: {currencyMode} ({currencySymbol})
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="price-num text-xs font-bold text-emerald-400">✓ VERIFIED</p>
              <p className="price-num mt-0.5 text-xs text-slate-400">1 USD = ₹{usdToInr.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* SECTION 1: Metals */}
        {(activeCategory === "all" || activeCategory === "metals") && (
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-400" />
                <h2 className="text-xl font-bold text-white">
                  {isINR ? "Precious Metals (24K, 22K, 18K Gold & Silver in INR ₹)" : "Precious & Industrial Metals (USD $)"}
                </h2>
              </div>
              <span className="text-xs font-semibold text-amber-400">
                📈 Click card to view trend chart
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4.5 md:grid-cols-2 lg:grid-cols-3">
              {filteredMetals.map((metal) => {
                const prev = prevMetalsMap.get(metal.id);

                let displayPrimaryVal = 0;
                let primaryUnitLabel = "";
                let prevVal = undefined;

                if (isINR) {
                  if (metal.id === "silver" || metal.id === "aluminum") {
                    displayPrimaryVal = getInrRateKg(metal);
                    primaryUnitLabel = "/ 1 Kg (1000g)";
                    if (prev) prevVal = getPrevInrRateGram(prev) * 1000;
                  } else {
                    displayPrimaryVal = getInrRate10Gram(metal);
                    primaryUnitLabel = "/ 10 Grams";
                    if (prev) prevVal = getPrevInrRateGram(prev) * 10;
                  }
                } else {
                  displayPrimaryVal = metal.priceUsdOunce;
                  primaryUnitLabel = `/ ${metal.unit}`;
                  if (prev) prevVal = prev.priceUsdOunce;
                }

                const trend = calculateTrend(displayPrimaryVal, prevVal);
                const accentColor = metalAccentColor(metal.id);

                return (
                  <div
                    key={metal.id}
                    onClick={() =>
                      setChartModalAsset({
                        type: "metal",
                        id: metal.id,
                        name: metal.name,
                        symbol: metal.symbol,
                        subtext: metal.purity || metal.category,
                      })
                    }
                    className="metal-card glass-card group relative overflow-hidden rounded-2xl p-5 border border-slate-800 hover:border-amber-500/40"
                  >
                    {/* Top Accent Line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
                    />

                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-widest"
                            style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}35` }}
                          >
                            {metal.symbol}
                          </span>
                          {metal.carat && (
                            <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                              {metal.carat}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2.5 text-base font-bold text-white leading-tight">{metal.name}</h3>
                        <p className="mt-0.5 text-[11px] text-slate-400">{metal.purity ? `Purity: ${metal.purity}` : metal.category}</p>
                      </div>

                      {/* Trend Badge */}
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        trend.isFlat ? "badge-flat" : trend.isUp ? "badge-up" : "badge-down"
                      }`}>
                        {trend.isFlat ? <Minus className="h-3 w-3" /> : trend.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {trend.isUp && !trend.isFlat ? "+" : ""}{trend.percentage}%
                      </span>
                    </div>

                    {/* Primary Price */}
                    <div className="mt-4">
                      <div className="flex items-baseline gap-1.5">
                        <span className="price-num text-2xl font-black text-white tracking-tight">
                          {currencySymbol}{displayPrimaryVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{primaryUnitLabel}</span>
                      </div>
                    </div>

                    {/* Breakdown Table */}
                    <div className="mt-4 space-y-1.5 border-t border-slate-800/80 pt-3 text-xs">
                      {isINR ? (
                        <>
                          {[{l:"1 Gram",v:getInrRateGram(metal),hi:false},{l:"8g (1 Sovereign)",v:getInrRateGram(metal)*8,hi:false},{l:"10 Grams",v:getInrRate10Gram(metal),hi:true},{l:"100 Grams",v:getInrRateGram(metal)*100,hi:false},{l:"1 Kilogram",v:getInrRateKg(metal),hi:false}].map(({l,v,hi})=>(
                            <div key={l} className="flex justify-between">
                              <span className="text-slate-400">{l}</span>
                              <span className={`price-num font-semibold ${hi ? "" : "text-slate-200"}`} style={hi ? { color: accentColor } : {}}>
                                ₹{v.toLocaleString(undefined,{maximumFractionDigits:2})}
                              </span>
                            </div>
                          ))}
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between"><span className="text-slate-400">Troy Ounce</span><span className="price-num font-semibold" style={{ color: accentColor }}>${metal.priceUsdOunce.toLocaleString(undefined,{minimumFractionDigits:2})}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">Per Gram</span><span className="price-num font-semibold text-slate-200">${metal.priceUsdGram.toFixed(2)}</span></div>
                          {metal.priceUsdTon && <div className="flex justify-between"><span className="text-slate-400">Metric Ton</span><span className="price-num font-semibold text-slate-200">${metal.priceUsdTon.toLocaleString()}</span></div>}
                        </>
                      )}
                    </div>

                    {/* Card Footer Button */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-2.5 text-[11px] font-bold text-amber-400 group-hover:text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <LineChartIcon className="h-3.5 w-3.5" /> View Interactive Chart
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Strategic In-Grid Ad Banner */}
        <AdBanner slot="5432167890" format="auto" className="my-6" />

        {/* SECTION 2: Forex Exchange Rates */}
        {(activeCategory === "all" || activeCategory === "forex") && (
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-sky-400" />
                <h2 className="text-xl font-bold text-white">
                  {isINR ? "Global Currencies Compared to Indian Rupee (INR ₹)" : "Major Forex Exchange Rates (Base: USD $)"}
                </h2>
              </div>
              <span className="text-xs font-semibold text-amber-400">
                📈 Click currency row to view trend chart
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950 text-slate-400">
                  <tr>
                    {["Currency", "Symbol", isINR ? "Rate in INR (₹)" : "Rate to USD ($)", isINR ? "1 INR Equiv." : "USD → Currency", "24h Δ", "Analytics"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {/* USD Row */}
                  {isINR && (
                    <tr
                      onClick={() => setChartModalAsset({ type: "forex", id: "USD", name: "US Dollar", symbol: "$" })}
                      className="fx-row group bg-amber-500/5 hover:bg-amber-500/10"
                    >
                      <td className="px-5 py-3.5 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="price-num rounded-md bg-gradient-to-r from-amber-400 to-amber-600 px-2 py-0.5 text-[10px] font-black text-slate-950">
                            USD
                          </span>
                          <span>US Dollar</span>
                        </div>
                      </td>
                      <td className="price-num px-5 py-3.5 font-bold text-amber-400">$</td>
                      <td className="price-num px-5 py-3.5 font-bold text-amber-300">₹{usdToInr.toFixed(2)}</td>
                      <td className="price-num px-5 py-3.5 text-slate-400">{(1 / usdToInr).toFixed(4)} USD</td>
                      <td className="px-5 py-3.5 font-bold">
                        {(() => {
                          const t = calculateTrend(usdToInr, prevUsdToInr);
                          return (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              t.isFlat ? "badge-flat" : t.isUp ? "badge-up" : "badge-down"
                            }`}>
                              {t.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {t.isUp ? "+" : ""}{t.percentage}%
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-amber-400 group-hover:underline text-[11px]">
                        Chart 📈
                      </td>
                    </tr>
                  )}

                  {filteredCurrencies.map((curr) => {
                    if (isINR && curr.code === "INR") return null;
                    const prev = prevForexMap.get(curr.code);
                    const currentRateVal = isINR ? curr.rateToUsd * usdToInr : curr.rateToUsd;
                    const prevRateVal = prev ? (isINR ? prev.rateToUsd * prevUsdToInr : prev.rateToUsd) : undefined;
                    const trend = calculateTrend(currentRateVal, prevRateVal);
                    const equivalentStr = isINR ? `${(1/currentRateVal).toFixed(4)} ${curr.code}` : `${curr.usdToRate} ${curr.code}`;

                    return (
                      <tr
                        key={curr.code}
                        onClick={() => setChartModalAsset({ type: "forex", id: curr.code, name: curr.name, symbol: curr.symbol })}
                        className="fx-row group"
                      >
                        <td className="px-5 py-3.5 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span className="price-num rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-sky-400">
                              {curr.code}
                            </span>
                            <span className="text-slate-200">{curr.name}</span>
                          </div>
                        </td>
                        <td className="price-num px-5 py-3.5 text-slate-400 font-bold">{curr.symbol}</td>
                        <td className="price-num px-5 py-3.5 font-bold text-white">{currencySymbol}{currentRateVal.toFixed(4)}</td>
                        <td className="price-num px-5 py-3.5 text-slate-400">{equivalentStr}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            trend.isFlat ? "badge-flat" : trend.isUp ? "badge-up" : "badge-down"
                          }`}>
                            {trend.isFlat ? <Minus className="h-2.5 w-2.5" /> : trend.isUp ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                            {trend.isUp && !trend.isFlat ? "+" : ""}{trend.percentage}%
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-amber-400 group-hover:underline text-[11px]">
                          Chart 📈
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Historical Archive Timeline ───────────────────────────── */}
      <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
              <Calendar className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Historical Spot Archives</h3>
              <p className="text-[11px] text-slate-400">Git-backed · immutable daily records</p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
            {allAvailableDates.length} records
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {allAvailableDates.map((d) => {
            const dateStr = `${d.year}-${d.month.padStart(2,"0")}-${d.day.padStart(2,"0")}`;
            const isCurrent = dateStr === currentData.date;
            return (
              <Link
                key={dateStr}
                href={`/archive/${d.year}/${d.month}/${d.day}`}
                className={`price-num flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all duration-200 ${
                  isCurrent
                    ? "archive-chip-active"
                    : "archive-chip-idle"
                }`}
              >
                {dateStr}
                {isCurrent && <span className="ml-1 text-[9px] uppercase font-black text-amber-400">LIVE</span>}
                {!isCurrent && <ChevronRight className="h-3 w-3 opacity-40" />}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Interactive Trend Chart Modal */}
      <TrendChartModal
        isOpen={Boolean(chartModalAsset)}
        onClose={() => setChartModalAsset(null)}
        selectedAsset={chartModalAsset}
        historicalHistory={historicalHistory}
        currencyMode={currencyMode}
      />
    </div>
  );
}
