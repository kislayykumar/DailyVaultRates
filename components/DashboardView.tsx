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
  Layers,
  Award,
} from "lucide-react";
import { DailyRateData, calculateTrend, MetalRate } from "@/lib/types";
import { useCurrency } from "@/context/CurrencyContext";
import PdfDownloadButton from "@/components/PdfDownloadButton";
import AdBanner from "@/components/AdBanner";
import TrendChartModal from "@/components/TrendChartModal";
import JewelryCalculator from "@/components/JewelryCalculator";
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
  const [activeCategory, setActiveCategory] = useState<"all" | "metals" | "forex" | "calculator">("all");
  const [selectedGoldCarat, setSelectedGoldCarat] = useState<"gold-24k" | "gold-22k" | "gold-18k">("gold-24k");

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

  // Metals
  const gold24k = currentData.metals.find((m) => m.id === "gold-24k") || currentData.metals[0];
  const gold22k = currentData.metals.find((m) => m.id === "gold-22k") || currentData.metals[1];
  const gold18k = currentData.metals.find((m) => m.id === "gold-18k") || currentData.metals[2];
  const silver = currentData.metals.find((m) => m.id === "silver");
  const platinum = currentData.metals.find((m) => m.id === "platinum");
  const aluminum = currentData.metals.find((m) => m.id === "aluminum");

  // Active Gold item based on user carat tab selection
  const activeGoldMetal =
    selectedGoldCarat === "gold-24k"
      ? gold24k
      : selectedGoldCarat === "gold-22k"
      ? gold22k
      : gold18k || gold24k;

  const prevActiveGoldMetal = prevMetalsMap.get(activeGoldMetal.id);
  const activeGoldVal = isINR ? getInrRate10Gram(activeGoldMetal) : activeGoldMetal.priceUsdOunce;
  const prevActiveGoldVal = prevActiveGoldMetal
    ? isINR
      ? getPrevInrRateGram(prevActiveGoldMetal) * 10
      : prevActiveGoldMetal.priceUsdOunce
    : undefined;
  const activeGoldTrend = calculateTrend(activeGoldVal, prevActiveGoldVal);

  // Spot Ticker Items
  const prevGold24k = prevMetalsMap.get(gold24k?.id);
  const g24Val = isINR ? getInrRate10Gram(gold24k) : gold24k.priceUsdOunce;
  const g24PrevVal = prevGold24k ? (isINR ? getPrevInrRateGram(prevGold24k) * 10 : prevGold24k.priceUsdOunce) : undefined;
  const gold24kTrend = calculateTrend(g24Val, g24PrevVal);

  const prevSilver = prevMetalsMap.get("silver");
  const silverVal = isINR ? (silver ? getInrRateKg(silver) : 0) : silver?.priceUsdOunce || 0;
  const silverPrevVal = prevSilver ? (isINR ? getPrevInrRateGram(prevSilver) * 1000 : prevSilver.priceUsdOunce) : undefined;
  const silverTrend = calculateTrend(silverVal, silverPrevVal);

  const eur = currentData.currencies.find((c) => c.code === "EUR");
  const prevEur = prevForexMap.get("EUR");
  const eurVal = eur ? (isINR ? eur.rateToUsd * usdToInr : eur.rateToUsd) : 0;
  const eurPrevVal = prevEur ? (isINR ? prevEur.rateToUsd * prevUsdToInr : prevEur.rateToUsd) : undefined;
  const eurTrend = calculateTrend(eurVal, eurPrevVal);

  // Filter metals and currencies
  const filteredCurrencies = currentData.currencies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Ad Banner */}
      <AdBanner slot="9876543210" format="horizontal" className="mb-8" />

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          {/* Standard Indicator Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-amber-400">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            {isINR ? "Indian Market Retail Standard (GoodReturns & IBJA Aligned)" : "International Standard Spot (USD / Troy Oz)"}
          </div>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {title}
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Verified spot market rates for{" "}
            <span className="font-bold price-num text-amber-400">{currentData.date}</span>.
            {" "}Displaying in{" "}
            <span className="font-extrabold text-white">{isINR ? "Indian Rupees (₹)" : "US Dollars ($)"}</span>.
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
            val: isINR ? getInrRate10Gram(gold22k) : gold22k.priceUsdOunce,
            trend: calculateTrend(isINR ? getInrRate10Gram(gold22k) : gold22k.priceUsdOunce, prevMetalsMap.get("gold-22k") ? (isINR ? getPrevInrRateGram(prevMetalsMap.get("gold-22k")) * 10 : prevMetalsMap.get("gold-22k")?.priceUsdOunce) : undefined),
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
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-xs font-black uppercase tracking-wider" style={{ color }}>{label}</p>
                  <LineChartIcon className="h-3 w-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5">{sub}</p>
              </div>

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

      {/* ── Filter & Category Controls Bar ────────────────────────────── */}
      <div className="mb-6 flex flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 sm:flex-row sm:items-center backdrop-blur-md">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-950 p-1 text-xs">
          {(["all", "metals", "forex", "calculator"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-lg px-3.5 py-1.5 font-bold capitalize transition-all duration-200 ${
                activeCategory === cat
                  ? "btn-gold text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {cat === "all"
                ? "All Markets"
                : cat === "metals"
                ? "⚙ Metals"
                : cat === "forex"
                ? "💱 Forex"
                : "🧮 Jewelry Calculator"}
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
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-400" />
                <h2 className="text-xl font-bold text-white">
                  {isINR ? "Precious Metals Spot Market (INR ₹)" : "Precious & Industrial Metals (USD $)"}
                </h2>
              </div>
              <span className="text-xs font-semibold text-amber-400">
                📈 Click card to view interactive trend chart
              </span>
            </div>

            {/* ── MASTER GOLD CARD (Unified Carat Selector: 24K, 22K, 18K) ── */}
            <div className="rounded-3xl border border-amber-500/30 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

              {/* Master Gold Header & Carat Tabs */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-black uppercase text-amber-400 tracking-wider">
                      XAU SPOT
                    </span>
                    <span className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[11px] font-bold text-slate-300">
                      Bullion &amp; Jewelry
                    </span>
                  </div>
                  <h3 className="mt-2 text-2xl font-black text-white">Gold Spot Rate Terminal</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live purity standards &amp; weight rates in {currencyMode} ({currencySymbol})
                  </p>
                </div>

                {/* Carat Selector Tabs */}
                <div className="flex items-center rounded-2xl border border-slate-800 bg-slate-950 p-1.5 text-xs">
                  {[
                    { id: "gold-24k" as const, label: "24K Gold", purity: "99.9% Pure" },
                    { id: "gold-22k" as const, label: "22K Gold", purity: "91.6% Jewelry" },
                    { id: "gold-18k" as const, label: "18K Gold", purity: "75.0% Jewelry" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedGoldCarat(tab.id)}
                      className={`flex flex-col items-center rounded-xl px-4 py-2 transition-all duration-200 ${
                        selectedGoldCarat === tab.id
                          ? "btn-gold text-slate-950 shadow-lg"
                          : "text-slate-400 hover:text-white hover:bg-slate-900"
                      }`}
                    >
                      <span className="font-black text-xs">{tab.label}</span>
                      <span className={`text-[10px] font-medium ${selectedGoldCarat === tab.id ? "text-slate-900" : "text-slate-500"}`}>
                        {tab.purity}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Side-by-Side Quick Carat Comparison Strip */}
              <div className="my-5 grid grid-cols-3 gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
                {[
                  { metal: gold24k, caratLabel: "24K Gold (99.9%)", color: "#F59E0B" },
                  { metal: gold22k, caratLabel: "22K Gold (91.6%)", color: "#FBBF24" },
                  { metal: gold18k || gold24k, caratLabel: "18K Gold (75.0%)", color: "#D97706" },
                ].map(({ metal, caratLabel, color }) => {
                  if (!metal) return null;
                  const gramRate = getInrRateGram(metal);
                  const isSelected = selectedGoldCarat === metal.id;

                  return (
                    <div
                      key={metal.id}
                      onClick={() => setSelectedGoldCarat(metal.id as any)}
                      className={`cursor-pointer rounded-xl p-3 text-center transition-all ${
                        isSelected
                          ? "border border-amber-500/40 bg-amber-500/10 shadow-md"
                          : "border border-slate-800/60 bg-slate-900/50 hover:border-slate-700"
                      }`}
                    >
                      <span className="text-[11px] font-bold" style={{ color }}>{caratLabel}</span>
                      <p className="price-num mt-1 text-sm font-black text-white">
                        {isINR ? `₹${gramRate.toLocaleString()}` : `$${metal.priceUsdGram.toFixed(2)}`}
                        <span className="text-[10px] font-normal text-slate-400"> / g</span>
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Main Active Gold Rates Display */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-slate-400">
                      Selected View: <strong className="text-white font-extrabold">{activeGoldMetal.name}</strong>
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      activeGoldTrend.isFlat ? "badge-flat" : activeGoldTrend.isUp ? "badge-up" : "badge-down"
                    }`}>
                      {activeGoldTrend.isFlat ? <Minus className="h-2.5 w-2.5" /> : activeGoldTrend.isUp ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                      {activeGoldTrend.isUp && !activeGoldTrend.isFlat ? "+" : ""}{activeGoldTrend.percentage}%
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="price-num text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {currencySymbol}{activeGoldVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{isINR ? "/ 10 Grams" : "/ troy oz"}</span>
                  </div>

                  <p className="mt-2 text-xs text-amber-400 font-semibold">
                    {isINR
                      ? `₹${getInrRateGram(activeGoldMetal).toLocaleString()} per 1 gram · ₹${getInrRateKg(activeGoldMetal).toLocaleString()} per 1 kg`
                      : `$${activeGoldMetal.priceUsdGram.toFixed(2)} per gram`}
                  </p>
                </div>

                {/* Weight Breakdown Table */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-800">
                    {activeGoldMetal.carat || "24K"} Weight Rate Breakdown
                  </div>
                  {isINR ? (
                    <>
                      {[
                        { label: "1 Gram", value: getInrRateGram(activeGoldMetal), isPopular: false },
                        { label: "8 Grams (1 Sovereign / Pavan)", value: getInrRateGram(activeGoldMetal) * 8, isPopular: false },
                        { label: "10 Grams (Standard Benchmark)", value: getInrRate10Gram(activeGoldMetal), isPopular: true },
                        { label: "100 Grams", value: getInrRateGram(activeGoldMetal) * 100, isPopular: false },
                        { label: "1 Kilogram (1000g Bar)", value: getInrRateKg(activeGoldMetal), isPopular: false },
                      ].map(({ label, value, isPopular }) => (
                        <div key={label} className="flex justify-between items-center">
                          <span className={isPopular ? "font-bold text-white" : "text-slate-400"}>{label}</span>
                          <span className={`price-num font-bold ${isPopular ? "text-amber-400 text-sm" : "text-slate-200"}`}>
                            ₹{value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between"><span className="text-slate-400">Troy Ounce (oz)</span><span className="price-num font-bold text-amber-400">${activeGoldMetal.priceUsdOunce.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Per Gram</span><span className="price-num font-bold text-slate-200">${activeGoldMetal.priceUsdGram.toFixed(2)}</span></div>
                    </>
                  )}
                </div>
              </div>

              {/* Master Gold Card Footer Trigger */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="text-xs text-slate-400">Verified Bullion Spot Data</span>
                <button
                  onClick={() =>
                    setChartModalAsset({
                      type: "metal",
                      id: activeGoldMetal.id,
                      name: activeGoldMetal.name,
                      symbol: activeGoldMetal.symbol,
                    })
                  }
                  className="btn-gold rounded-xl px-5 py-2.5 text-xs font-black shadow-lg flex items-center gap-2"
                >
                  <LineChartIcon className="h-4 w-4" />
                  <span>View {activeGoldMetal.carat || "Gold"} Historical Trend Chart 📈</span>
                </button>
              </div>
            </div>

            {/* ── OTHER METALS GRID (Silver, Platinum, Aluminum) ── */}
            <div className="grid grid-cols-1 gap-4.5 md:grid-cols-3">
              {[
                { metal: silver, id: "silver", name: "Silver", symbol: "XAG", color: "#94A3B8" },
                { metal: platinum, id: "platinum", name: "Platinum", symbol: "XPT", color: "#E2E8F0" },
                { metal: aluminum, id: "aluminum", name: "Aluminum", symbol: "ALI", color: "#38BDF8" },
              ].map(({ metal, id, name, symbol, color }) => {
                if (!metal) return null;

                let displayVal = 0;
                let unitLabel = "";
                let prevMetalVal = undefined;
                const prev = prevMetalsMap.get(id);

                if (isINR) {
                  if (id === "silver" || id === "aluminum") {
                    displayVal = getInrRateKg(metal);
                    unitLabel = "/ 1 Kg (1000g)";
                    if (prev) prevMetalVal = getPrevInrRateGram(prev) * 1000;
                  } else {
                    displayVal = getInrRate10Gram(metal);
                    unitLabel = "/ 10 Grams";
                    if (prev) prevMetalVal = getPrevInrRateGram(prev) * 10;
                  }
                } else {
                  displayVal = metal.priceUsdOunce;
                  unitLabel = `/ ${metal.unit}`;
                  if (prev) prevMetalVal = prev.priceUsdOunce;
                }

                const trend = calculateTrend(displayVal, prevMetalVal);

                return (
                  <div
                    key={id}
                    onClick={() =>
                      setChartModalAsset({
                        type: "metal",
                        id,
                        name: metal.name,
                        symbol: metal.symbol,
                      })
                    }
                    className="metal-card glass-card group relative overflow-hidden rounded-2xl p-5 border border-slate-800 hover:border-amber-500/40"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

                    <div className="flex items-start justify-between">
                      <div>
                        <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-black uppercase text-slate-200">
                          {symbol}
                        </span>
                        <h3 className="mt-2 text-base font-bold text-white">{metal.name}</h3>
                        <p className="text-[11px] text-slate-400">{metal.purity ? `Purity: ${metal.purity}` : metal.category}</p>
                      </div>

                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        trend.isFlat ? "badge-flat" : trend.isUp ? "badge-up" : "badge-down"
                      }`}>
                        {trend.isFlat ? <Minus className="h-3 w-3" /> : trend.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {trend.isUp && !trend.isFlat ? "+" : ""}{trend.percentage}%
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-baseline gap-1">
                        <span className="price-num text-2xl font-black text-white">
                          {currencySymbol}{displayVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{unitLabel}</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 border-t border-slate-800/80 pt-3 text-xs">
                      {isINR ? (
                        <>
                          <div className="flex justify-between"><span className="text-slate-400">1 Gram Rate:</span><span className="price-num font-bold text-white">₹{getInrRateGram(metal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">10 Grams Rate:</span><span className="price-num font-bold text-amber-400">₹{getInrRate10Gram(metal).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">1 Kilogram (1000g):</span><span className="price-num font-bold text-slate-200">₹{getInrRateKg(metal).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between"><span className="text-slate-400">Troy Ounce:</span><span className="price-num font-bold text-amber-400">${metal.priceUsdOunce.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">Per Gram:</span><span className="price-num font-bold text-slate-200">${metal.priceUsdGram.toFixed(2)}</span></div>
                        </>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-2.5 text-[11px] font-bold text-amber-400 group-hover:text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <LineChartIcon className="h-3.5 w-3.5" /> View Trend Graph
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: Interactive Jewelry Cost Calculator */}
        {(activeCategory === "all" || activeCategory === "calculator") && (
          <div className="my-8">
            <JewelryCalculator currentData={currentData} currencyMode={currencyMode} />
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
              <h3 className="text-base font-bold text-white">Historical Daily Archives</h3>
              <p className="text-[11px] text-slate-400">Verified Daily Historical Records</p>
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
