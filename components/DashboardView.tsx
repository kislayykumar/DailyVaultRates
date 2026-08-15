"use client";

import { useState, useEffect } from "react";
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
  BarChart2,
  Zap,
  Activity,
} from "lucide-react";
import { DailyRateData, calculateTrend, MetalRate } from "@/lib/types";
import { useCurrency } from "@/context/CurrencyContext";
import PdfDownloadButton from "@/components/PdfDownloadButton";
import AdBanner from "@/components/AdBanner";
import TrendChartModal from "@/components/TrendChartModal";
import JewelryCalculator from "@/components/JewelryCalculator";
import SubscribeForm from "@/components/SubscribeForm";
import StockDashboardSection from "@/components/stocks/StockDashboardSection";
import StockEducationSection from "@/components/stocks/StockEducationSection";
import MarketTickerTape from "@/components/MarketTickerTape";
import ReleaseAnnouncementModal from "@/components/ReleaseAnnouncementModal";
import Link from "next/link";

interface DashboardViewProps {
  currentData: DailyRateData;
  previousData: DailyRateData | null;
  allAvailableDates: { year: string; month: string; day: string }[];
  historicalHistory?: DailyRateData[];
  title?: string;
  isArchivePage?: boolean;
}

function TrendBadge({ trend }: { trend: ReturnType<typeof calculateTrend> }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
      trend.isFlat ? "badge-flat" : trend.isUp ? "badge-up" : "badge-down"
    }`}>
      {trend.isFlat
        ? <Minus className="h-2.5 w-2.5" />
        : trend.isUp
          ? <TrendingUp className="h-2.5 w-2.5" />
          : <TrendingDown className="h-2.5 w-2.5" />}
      {trend.isUp && !trend.isFlat ? "+" : ""}{trend.percentage}%
    </span>
  );
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
  const [activeCategory, setActiveCategory] = useState<"all" | "metals" | "stocks" | "forex">("metals");
  const [selectedGoldCarat, setSelectedGoldCarat] = useState<"gold-24k" | "gold-22k" | "gold-18k">("gold-24k");
  const [chartModalAsset, setChartModalAsset] = useState<{
    type: "metal" | "forex";
    id: string;
    name: string;
    symbol: string;
  } | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "1") setActiveCategory("metals");
      if (e.key === "2") setActiveCategory("stocks");
      if (e.key === "3") setActiveCategory("forex");

    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Data helpers
  const inrCurrency    = currentData.currencies.find((c) => c.code === "INR");
  const usdToInr       = inrCurrency?.usdToRate || 83.88;
  const prevInrCurrency = previousData?.currencies.find((c) => c.code === "INR");
  const prevUsdToInr   = prevInrCurrency?.usdToRate || usdToInr;

  const prevMetalsMap = new Map(previousData?.metals ? previousData.metals.map((m) => [m.id, m]) : []);
  const prevForexMap  = new Map(previousData?.currencies ? previousData.currencies.map((c) => [c.code, c]) : []);

  const isINR = currencyMode === "INR";
  const sym   = isINR ? "₹" : "$";

  const getInrG   = (m?: MetalRate) => !m ? 0 : (m.priceInrGram    ?? Number(((m.priceUsdGram || 0) * usdToInr * (m.id?.startsWith("gold") ? 1.09 : 1.145)).toFixed(2)));
  const getInr10g = (m?: MetalRate) => !m ? 0 : (m.priceInr10Gram  ?? Number((getInrG(m) * 10).toFixed(2)));
  const getInrKg  = (m?: MetalRate) => !m ? 0 : (m.priceInrKg      ?? Number((getInrG(m) * 1000).toFixed(2)));
  const getPrevG  = (p?: MetalRate) => !p ? 0 : (p.priceInrGram ?? Number(((p.priceUsdGram || 0) * prevUsdToInr * (p.id?.startsWith("gold") ? 1.09 : 1.145)).toFixed(2)));

  const gold24k  = currentData.metals.find((m) => m.id === "gold-24k") || currentData.metals[0];
  const gold22k  = currentData.metals.find((m) => m.id === "gold-22k") || currentData.metals[1];
  const gold18k  = currentData.metals.find((m) => m.id === "gold-18k") || currentData.metals[2];
  const silver   = currentData.metals.find((m) => m.id === "silver");
  const platinum = currentData.metals.find((m) => m.id === "platinum");
  const aluminum = currentData.metals.find((m) => m.id === "aluminum");

  const fallbackMetal: MetalRate = { id: "gold-24k", name: "Gold 24K", symbol: "XAU-24K", priceUsdOunce: 0, priceUsdGram: 0, unit: "Troy Ounce", category: "Precious Metals" };
  const activeGold        = (selectedGoldCarat === "gold-24k" ? gold24k : selectedGoldCarat === "gold-22k" ? gold22k : gold18k) || gold24k || fallbackMetal;
  const prevActiveGold    = prevMetalsMap.get(activeGold.id);
  const activeGoldVal     = isINR ? getInr10g(activeGold) : (activeGold?.priceUsdOunce || 0);
  const prevActiveGoldVal = prevActiveGold ? (isINR ? getPrevG(prevActiveGold) * 10 : prevActiveGold.priceUsdOunce) : undefined;
  const activeGoldTrend   = calculateTrend(activeGoldVal, prevActiveGoldVal);

  const g24Val    = isINR ? getInr10g(gold24k) : (gold24k?.priceUsdOunce || 0);
  const prevG24   = prevMetalsMap.get(gold24k?.id);
  const g24Trend  = calculateTrend(g24Val, prevG24 ? (isINR ? getPrevG(prevG24) * 10 : prevG24.priceUsdOunce) : undefined);

  const silverVal   = isINR ? (silver ? getInrKg(silver) : 0) : silver?.priceUsdOunce || 0;
  const prevSilver  = prevMetalsMap.get("silver");
  const silverTrend = calculateTrend(silverVal, prevSilver ? (isINR ? getPrevG(prevSilver) * 1000 : prevSilver.priceUsdOunce) : undefined);

  const eur      = currentData.currencies.find((c) => c.code === "EUR");
  const eurVal   = eur ? (isINR ? eur.rateToUsd * usdToInr : eur.rateToUsd) : 0;
  const prevEur  = prevForexMap.get("EUR");
  const eurTrend = calculateTrend(eurVal, prevEur ? (isINR ? prevEur.rateToUsd * prevUsdToInr : prevEur.rateToUsd) : undefined);

  const filteredCurrencies = currentData.currencies.filter(
    (c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryTabs: { id: "all" | "metals" | "stocks" | "forex"; label: string }[] = [
    { id: "all",    label: "All"     },
    { id: "metals", label: "Metals"  },
    { id: "stocks", label: "NSE/BSE" },
    { id: "forex",  label: "Forex"   },
  ];

  return (
    <>
      <MarketTickerTape
        gold24kPrice={isINR ? getInr10g(gold24k) : (gold24k?.priceUsdOunce || 0)}
        silverPrice={isINR ? getInrKg(silver) : (silver?.priceUsdOunce || 0)}
        usdToInr={usdToInr}
        currencyMode={currencyMode}
      />

      {/* ══════════════════════ V3 HERO SECTION ══════════════════════ */}
      <div
        className="relative overflow-hidden border-b"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        {/* Atmospheric glow orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(245,158,11,0.10) 0%, transparent 70%)" }} />
          <div className="absolute top-0 right-0 h-[250px] w-[350px] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 70%)" }} />
          <div className="absolute top-0 left-0 h-[200px] w-[300px] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(0,212,255,0.05) 0%, transparent 70%)" }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Top label */}
          <div className="flex items-center justify-center mb-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-amber-400">
              <Sparkles className="h-3 w-3" />
              {isINR ? "IBJA & GoodReturns Aligned · Indian Market Data" : "International Spot Markets · USD / Troy Oz"}
            </span>
          </div>

          {/* Hero Heading */}
          <h1
            className="text-center text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight animate-fade-up"
            style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
          >
            <span className="text-gold-gradient-v3 hero-glow-gold">{title}</span>
          </h1>

          <p className="mt-3 text-center text-[13px] text-slate-500 animate-fade-up-delay-1">
            Verified spot data for{" "}
            <span className="price-num font-bold text-[#00D4FF]">{currentData.date}</span>
            <span className="mx-2 text-slate-700">·</span>
            <span className="font-semibold text-slate-300">{isINR ? "Indian Rupees (₹)" : "US Dollars ($)"}</span>
            {!isArchivePage && (
              <>
                <span className="mx-2 text-slate-700">·</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                  <Activity className="h-3 w-3" /> Live Today
                </span>
              </>
            )}
          </p>

          {/* ── Hero Quick Stat Orb Cards ──────────────────────────── */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 animate-fade-up-delay-2">
            {[
              { id: "gold-24k", type: "metal" as const, label: "Gold 24K", val: g24Val, trend: g24Trend, unit: isINR ? "/10g" : "/oz", color: "#F59E0B", border: "rgba(245,158,11,0.22)", glow: "rgba(245,158,11,0.12)", icon: Coins },
              { id: "silver",   type: "metal" as const, label: "Silver",   val: silverVal, trend: silverTrend, unit: isINR ? "/kg" : "/oz", color: "#CBD5E1", border: "rgba(203,213,225,0.15)", glow: "rgba(203,213,225,0.06)", icon: Coins },
              { id: "USD",      type: "forex" as const, label: "USD/INR",  val: usdToInr, trend: calculateTrend(usdToInr, prevUsdToInr), unit: "/ 1 USD", color: "#00D4FF", border: "rgba(0,212,255,0.22)", glow: "rgba(0,212,255,0.10)", icon: Globe },
              { id: "EUR",      type: "forex" as const, label: "EUR",      val: eurVal, trend: eurTrend, unit: isINR ? "/ 1 EUR" : "/ 1 EUR", color: "#818CF8", border: "rgba(129,140,248,0.22)", glow: "rgba(129,140,248,0.08)", icon: DollarSign },
            ].map(({ id, type, label, val, trend, unit, color, border, glow, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setChartModalAsset({ type, id, name: label, symbol: id })}
                className="spot-card group relative overflow-hidden rounded-2xl p-4 text-left focus:outline-none"
                style={{
                  background: "rgba(6, 11, 20, 0.88)",
                  border: `1px solid ${border}`,
                  boxShadow: `0 0 40px ${glow}, 0 8px 32px rgba(0,0,0,0.7)`,
                }}
              >
                {/* Accent line */}
                <div className="absolute inset-x-0 top-0 h-[1.5px]"
                  style={{ background: `linear-gradient(90deg, transparent, ${color} 45%, transparent)` }} />
                {/* Inner glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(ellipse at top, ${glow} 0%, transparent 60%)` }} />

                <div className="relative">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                      <p className="text-[11px] font-black uppercase tracking-wider" style={{ color }}>{label}</p>
                    </div>
                    <TrendBadge trend={trend} />
                  </div>
                  <p className="price-num text-xl font-black leading-none text-white">
                    {sym}{val.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    <span className="ml-1 text-[9px] font-medium text-slate-500">{unit}</span>
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-[10px] font-bold text-slate-600 opacity-0 transition-opacity group-hover:opacity-100" style={{ color }}>
                    <LineChartIcon className="h-3 w-3" /> View Chart
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════ MAIN CONTENT AREA ══════════════════════ */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AdBanner slot="9876543210" format="horizontal" className="mb-8" />

        {/* ── V3 Filter Bar ─────────────────────────────────────────── */}
        <div
          className="mb-8 rounded-2xl p-1.5"
          style={{
            background: "rgba(6, 11, 20, 0.80)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
          }}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1">
              {categoryTabs.map((tab) => {
                const isActive = activeCategory === tab.id;
                const isStocks = tab.id === "stocks";
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`relative rounded-xl px-4 py-2 text-[12px] font-bold transition-all duration-250 ${
                      isActive
                        ? isStocks
                          ? "bg-emerald-500 text-[#020409] shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                          : "btn-gold text-[#020409]"
                        : "text-slate-400 hover:text-white hover:bg-white/4"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px]"
                style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.18)" }}>
                <Globe className="h-3.5 w-3.5 text-[#00D4FF] shrink-0" />
                <span className="font-bold text-white">{isINR ? "₹ INR" : "$ USD"}</span>
              </div>
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-terminal w-full rounded-xl py-1.5 pl-8 pr-3 text-[11px] sm:w-44"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════ V3 LAYOUT ═══════════════ */}
        <div id="rates-report-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── Left Column ──────────────────────────────────────────── */}
          <div className={[
            "space-y-8",
            activeCategory === "stocks" || activeCategory === "forex"
              ? "lg:col-span-12"
              : "lg:col-span-8",
          ].join(" ")}>

            {/* ── Report Identity Strip ─────────────────────────── */}
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{
                background: "rgba(6,11,20,0.80)",
                border: "1px solid rgba(245,158,11,0.14)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-black text-[#020409]"
                  style={{ background: "linear-gradient(135deg, #D97706, #F59E0B, #FBBF24)" }}>
                  DVR
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white">DailyVaultRates Spot Report</p>
                  <p className="text-[11px] text-slate-500">{currentData.date} · {currencyMode} · Verified</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-black text-emerald-400 flex items-center gap-1 justify-end">
                  <Zap className="h-3 w-3" /> VERIFIED
                </p>
                <p className="price-num text-[11px] text-slate-500">1 USD = ₹{usdToInr.toFixed(2)}</p>
              </div>
            </div>

            {/* ══════════ METALS SECTION ══════════ */}
            {(activeCategory === "all" || activeCategory === "metals") && (
              <section className="space-y-5">

                {/* Section Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-3">
                    <div className="section-header-gold flex items-center gap-2 rounded-lg pl-3 pr-4 py-2">
                      <Coins className="h-4 w-4 text-amber-400" />
                      <h2 className="text-[14px] font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {isINR ? "Precious Metals — ₹ INR" : "Precious Metals — $ USD"}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setChartModalAsset({ type: "metal", id: activeGold.id, name: activeGold.name, symbol: activeGold.symbol })}
                    className="hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all hover:scale-[1.02]"
                    style={{ background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.20)", color: "#00D4FF" }}
                  >
                    <BarChart2 className="h-3.5 w-3.5" /> Trend Charts
                  </button>
                </div>

                {/* ── GOLD MASTER CARD ──────────────────────────── */}
                <div
                  className="shimmer-border-gold relative overflow-hidden rounded-2xl"
                  style={{
                    background: "rgba(6, 11, 20, 0.94)",
                    border: "1px solid rgba(245,158,11,0.18)",
                    boxShadow: "0 0 60px rgba(245,158,11,0.08), 0 20px 60px rgba(0,0,0,0.90)",
                  }}
                >
                  {/* Top glow line */}
                  <div className="glow-divider-gold absolute inset-x-0 top-0" />

                  {/* Card header */}
                  <div className="border-b px-5 py-4" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-widest tag-gold">XAU SPOT</span>
                          <span className="text-[10px] font-semibold text-slate-500">Bullion &amp; Jewelry</span>
                        </div>
                        <h3 className="mt-1.5 text-lg font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          Gold Spot Rate Terminal
                        </h3>
                      </div>
                      {/* Carat Tabs */}
                      <div className="flex items-center rounded-xl p-1 text-[11px]"
                        style={{ background: "rgba(2,4,9,0.90)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        {(["gold-24k", "gold-22k", "gold-18k"] as const).map((id) => {
                          const labels: Record<string, string>   = { "gold-24k": "24K", "gold-22k": "22K", "gold-18k": "18K" };
                          const purities: Record<string, string> = { "gold-24k": "99.9%", "gold-22k": "91.6%", "gold-18k": "75.0%" };
                          return (
                            <button
                              key={id}
                              onClick={() => setSelectedGoldCarat(id)}
                              className={`rounded-lg px-3.5 py-1.5 font-bold transition-all duration-250 ${
                                selectedGoldCarat === id ? "btn-gold text-[#020409]" : "text-slate-400 hover:text-white"
                              }`}
                            >
                              <span className="block text-[11px] font-black">{labels[id]}</span>
                              <span className={`block text-[9px] ${selectedGoldCarat === id ? "text-[rgba(2,4,9,0.65)]" : "text-slate-600"}`}>{purities[id]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Carat comparison row */}
                  <div className="grid grid-cols-3 divide-x divide-[rgba(255,255,255,0.05)] border-b border-[rgba(255,255,255,0.05)]">
                    {[
                      { metal: gold24k, id: "gold-24k", label: "24K Gold", purity: "99.9%", color: "#F0B429" },
                      { metal: gold22k, id: "gold-22k", label: "22K Gold", purity: "91.6%", color: "#FBBF24" },
                      { metal: gold18k || gold24k, id: "gold-18k", label: "18K Gold", purity: "75.0%", color: "#D97706" },
                    ].map(({ metal, id, label, purity, color }) => {
                      if (!metal) return null;
                      const isSelected = selectedGoldCarat === id as any;
                      return (
                        <button
                          key={id}
                          onClick={() => setSelectedGoldCarat(id as any)}
                          className="flex flex-col items-center py-4 px-2 text-center transition-all duration-200"
                          style={{ background: isSelected ? "rgba(240,180,41,0.07)" : "transparent" }}
                        >
                          <span className="text-[10px] font-black uppercase tracking-wide" style={{ color }}>{label}</span>
                          <span className="mt-0.5 text-[9px] text-slate-600">{purity}</span>
                          <p className="price-num mt-2 text-[14px] font-black text-white">
                            {isINR ? `₹${getInrG(metal).toLocaleString()}` : `$${metal.priceUsdGram.toFixed(2)}`}
                            <span className="text-[9px] font-normal text-slate-500">/g</span>
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Main price + weight table */}
                  <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:divide-x sm:divide-[rgba(255,255,255,0.05)]">
                    <div className="px-5 py-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] text-slate-400">{activeGold.name}</span>
                        <TrendBadge trend={activeGoldTrend} />
                      </div>
                      <p className="price-num text-4xl sm:text-5xl font-black leading-none text-white">
                        {sym}{activeGoldVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="ml-2 text-sm font-semibold text-slate-500">{isINR ? "/ 10g" : "/ oz"}</span>
                      </p>
                      <p className="price-num mt-2.5 text-[12px] font-semibold text-amber-400">
                        {isINR
                          ? `₹${getInrG(activeGold).toLocaleString()} /g · ₹${getInrKg(activeGold).toLocaleString()} /kg`
                          : `$${activeGold.priceUsdGram.toFixed(2)} per gram`}
                      </p>
                      <button
                        onClick={() => setChartModalAsset({ type: "metal", id: activeGold.id, name: activeGold.name, symbol: activeGold.symbol })}
                        className="btn-gold mt-5 flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-black"
                      >
                        <LineChartIcon className="h-3.5 w-3.5" />
                        {activeGold.carat || "Gold"} Trend Chart
                      </button>
                    </div>

                    {/* Weight table */}
                    <div className="px-5 py-6">
                      <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {activeGold.carat || "24K"} Weight Breakdown
                      </p>
                      <div className="space-y-2.5">
                        {isINR ? [
                          { label: "1 Gram",                  val: getInrG(activeGold),          hi: false },
                          { label: "8g · 1 Sovereign/Pavan",  val: getInrG(activeGold) * 8,      hi: false },
                          { label: "10 Grams (Benchmark)",     val: getInr10g(activeGold),        hi: true  },
                          { label: "100 Grams",                val: getInrG(activeGold) * 100,    hi: false },
                          { label: "1 Kilogram",               val: getInrKg(activeGold),         hi: false },
                        ].map(({ label, val, hi }) => (
                          <div key={label} className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-[12px] transition-colors ${hi ? "bg-amber-500/8" : "hover:bg-white/2"}`}>
                            <span className={hi ? "font-semibold text-white" : "text-slate-500"}>{label}</span>
                            <span className={`price-num font-bold ${hi ? "text-amber-400" : "text-slate-300"}`}>
                              ₹{val.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )) : (
                          <>
                            <div className="flex justify-between rounded-lg px-3 py-1.5 text-[12px]"><span className="text-slate-500">Troy Ounce</span><span className="price-num font-bold text-amber-400">${activeGold.priceUsdOunce.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                            <div className="flex justify-between rounded-lg px-3 py-1.5 text-[12px]"><span className="text-slate-500">Per Gram</span><span className="price-num font-bold text-slate-300">${activeGold.priceUsdGram.toFixed(2)}</span></div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Other Metals Grid ──────────────────────────── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { metal: silver,   id: "silver",   symbol: "XAG", color: "#CBD5E1", bg: "rgba(203,213,225,0.06)", border: "rgba(203,213,225,0.14)", glow: "rgba(203,213,225,0.06)" },
                    { metal: platinum, id: "platinum", symbol: "XPT", color: "#E2E8F0", bg: "rgba(226,232,240,0.06)", border: "rgba(226,232,240,0.14)", glow: "rgba(226,232,240,0.05)" },
                    { metal: aluminum, id: "aluminum", symbol: "ALI", color: "#00D4FF", bg: "rgba(0,212,255,0.06)",   border: "rgba(0,212,255,0.16)",   glow: "rgba(0,212,255,0.08)"  },
                  ].map(({ metal, id, symbol, color, bg, border, glow }) => {
                    if (!metal) return null;
                    const prev = prevMetalsMap.get(id);
                    let displayVal = 0, unitLabel = "", prevVal: number | undefined;
                    if (isINR) {
                      if (id === "silver" || id === "aluminum") {
                        displayVal = getInrKg(metal); unitLabel = "/ kg";
                        if (prev) prevVal = getPrevG(prev) * 1000;
                      } else {
                        displayVal = getInr10g(metal); unitLabel = "/ 10g";
                        if (prev) prevVal = getPrevG(prev) * 10;
                      }
                    } else {
                      displayVal = metal.priceUsdOunce; unitLabel = `/ ${metal.unit}`;
                      if (prev) prevVal = prev.priceUsdOunce;
                    }
                    const trend = calculateTrend(displayVal, prevVal);
                    return (
                      <button
                        key={id}
                        onClick={() => setChartModalAsset({ type: "metal", id, name: metal.name, symbol: metal.symbol })}
                        className="metal-card group relative overflow-hidden rounded-2xl p-5 text-left focus:outline-none"
                        style={{ background: bg, border: `1px solid ${border}`, boxShadow: `0 0 40px ${glow}, 0 8px 32px rgba(0,0,0,0.7)` }}
                      >
                        {/* Accent top line */}
                        <div className="absolute inset-x-0 top-0 h-[1.5px]"
                          style={{ background: `linear-gradient(90deg, transparent, ${color} 45%, transparent)` }} />

                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <span className="rounded px-2 py-0.5 text-[10px] font-black uppercase" style={{ color, background: `${color}18`, border: `1px solid ${color}28` }}>{symbol}</span>
                            <p className="mt-2 text-[15px] font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{metal.name}</p>
                            <p className="text-[10px] text-slate-500">{metal.purity ? `Purity: ${metal.purity}` : metal.category}</p>
                          </div>
                          <TrendBadge trend={trend} />
                        </div>

                        <p className="price-num mt-2 text-2xl font-black text-white">
                          {sym}{displayVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <span className="ml-1 text-[10px] font-normal text-slate-500">{unitLabel}</span>
                        </p>

                        <div className="mt-4 space-y-1.5 border-t pt-3 text-[12px]" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                          {isINR ? (
                            <>
                              <div className="flex justify-between"><span className="text-slate-500">Per Gram</span><span className="price-num font-semibold text-slate-300">₹{getInrG(metal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Per 10g</span><span className="price-num font-bold" style={{ color }}>₹{getInr10g(metal).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Per Kg</span><span className="price-num font-semibold text-slate-300">₹{getInrKg(metal).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between"><span className="text-slate-500">Troy Ounce</span><span className="price-num font-bold" style={{ color }}>${metal.priceUsdOunce.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Per Gram</span><span className="price-num font-semibold text-slate-300">${metal.priceUsdGram.toFixed(2)}</span></div>
                            </>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t pt-2.5 text-[11px] font-bold text-slate-600 transition-colors group-hover:text-[#00D4FF]" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                          <span className="flex items-center gap-1"><LineChartIcon className="h-3 w-3" /> View Trend</span>
                          <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}


            {/* ══════════ STOCKS ══════════ */}
            {(activeCategory === "all" || activeCategory === "stocks") && (
              <>
                <StockDashboardSection />
                <StockEducationSection />
              </>
            )}

            <AdBanner slot="5432167890" format="auto" className="my-4" />

            {/* ══════════ FOREX TABLE ══════════ */}
            {(activeCategory === "all" || activeCategory === "forex") && (
              <section>
                <div className="mb-5 flex items-center justify-between px-1">
                  <div className="section-header-cyan flex items-center gap-2 rounded-lg pl-3 pr-4 py-2">
                    <Globe className="h-4 w-4 text-[#00D4FF]" />
                    <h2 className="text-[14px] font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {isINR ? "Global Currencies vs. ₹ INR" : "Forex Exchange Rates ($)"}
                    </h2>
                  </div>
                  <span className="hidden text-[11px] text-slate-500 sm:block">Click row for chart</span>
                </div>

                <div className="overflow-x-auto rounded-2xl"
                  style={{ background: "rgba(6,11,20,0.90)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(24px)" }}>
                  <table className="w-full min-w-[480px] text-left text-[12px]">
                    <thead className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(2,4,9,0.50)" }}>
                      <tr>
                        {["Currency", "Rate", isINR ? "1 INR Equiv." : "USD → Curr.", "24h Δ", ""].map((h, i) => (
                          <th key={i} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                      {isINR && (
                        <tr
                          onClick={() => setChartModalAsset({ type: "forex", id: "USD", name: "US Dollar", symbol: "$" })}
                          className="fx-row group cursor-pointer"
                          style={{ background: "rgba(245,158,11,0.03)" }}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="price-num rounded px-2 py-0.5 text-[10px] font-black text-[#020409]"
                                style={{ background: "linear-gradient(135deg, #D97706, #F59E0B)" }}>USD</span>
                              <span className="font-semibold text-white">US Dollar</span>
                            </div>
                          </td>
                          <td className="price-num px-4 py-3 font-bold text-amber-400">₹{usdToInr.toFixed(2)}</td>
                          <td className="price-num px-4 py-3 text-slate-500">{(1 / usdToInr).toFixed(4)} USD</td>
                          <td className="px-4 py-3">{(() => { const t = calculateTrend(usdToInr, prevUsdToInr); return <TrendBadge trend={t} />; })()}</td>
                          <td className="px-4 py-3 text-[10px] font-bold text-[#00D4FF] opacity-0 transition-opacity group-hover:opacity-100">CHART</td>
                        </tr>
                      )}
                      {filteredCurrencies.map((curr) => {
                        if (isINR && curr.code === "INR") return null;
                        const prev    = prevForexMap.get(curr.code);
                        const rate    = isINR ? curr.rateToUsd * usdToInr : curr.rateToUsd;
                        const prevRate = prev ? (isINR ? prev.rateToUsd * prevUsdToInr : prev.rateToUsd) : undefined;
                        const trend   = calculateTrend(rate, prevRate);
                        const equiv   = isINR ? `${(1 / rate).toFixed(4)} ${curr.code}` : `${curr.usdToRate} ${curr.code}`;
                        return (
                          <tr key={curr.code}
                            onClick={() => setChartModalAsset({ type: "forex", id: curr.code, name: curr.name, symbol: curr.symbol })}
                            className="fx-row group cursor-pointer">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="price-num rounded px-2 py-0.5 text-[10px] font-black tag-cyan">{curr.code}</span>
                                <span className="font-medium text-slate-300">{curr.name}</span>
                              </div>
                            </td>
                            <td className="price-num px-4 py-3 font-bold text-white">{sym}{rate.toFixed(4)}</td>
                            <td className="price-num px-4 py-3 text-slate-500">{equiv}</td>
                            <td className="px-4 py-3"><TrendBadge trend={trend} /></td>
                            <td className="px-4 py-3 text-[10px] font-bold text-[#00D4FF] opacity-0 transition-opacity group-hover:opacity-100">CHART</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          {/* ── Right Sidebar: visible on Metals / All tabs ── */}
          {(activeCategory === "all" || activeCategory === "metals") && (
            <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">

              {/* Jewelry Calculator Panel */}
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(6,11,20,0.90)", border: "1px solid rgba(245,158,11,0.16)", boxShadow: "0 0 40px rgba(245,158,11,0.06), 0 12px 40px rgba(0,0,0,0.80)" }}>
                <div className="glow-divider-gold" />
                <div className="p-4">
                  <JewelryCalculator currentData={currentData} currencyMode={currencyMode} />
                </div>
              </div>

              {/* PDF Export Card */}
              <div className="rounded-2xl p-5"
                style={{ background: "rgba(6,11,20,0.88)", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 8px 32px rgba(0,0,0,0.7)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-amber-400"
                    style={{ background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.25)" }}>
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Daily PDF Export</h3>
                    <p className="text-[11px] text-slate-500">Verified spot data · {currentData.date}</p>
                  </div>
                </div>
                <PdfDownloadButton
                  targetId="rates-report-container"
                  filename={`DailyVaultRates-${currentData.date}-${currencyMode}.pdf`}
                  dateStr={currentData.date}
                  label="Download Full PDF Report"
                  variant="gold"
                />
              </div>

              {/* Keyboard Shortcuts */}
              <div className="rounded-2xl p-4"
                style={{ background: "rgba(2,4,9,0.85)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                  <span>⌨️</span> Terminal Shortcuts
                </h4>
                <div className="space-y-2 text-xs font-mono">
                  {[
                    { label: "Search Markets",  kbd: "⌘K" },
                    { label: "Metals Terminal", kbd: "1"  },
                    { label: "NSE/BSE Stocks",  kbd: "2"  },
                    { label: "Forex Matrix",    kbd: "3"  },
                  ].map(({ label, kbd }) => (
                    <div key={label} className="flex items-center justify-between text-slate-400 hover:text-slate-300 transition-colors">
                      <span>{label}</span>
                      <kbd className="rounded border px-1.5 py-0.5 text-[10px] text-amber-400"
                        style={{ borderColor: "rgba(245,158,11,0.25)", background: "rgba(245,158,11,0.06)" }}>{kbd}</kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>



        {/* ── Subscription Form ──────────────────────────────────────── */}
        <div className="mt-10">
          <SubscribeForm />
        </div>

        {/* ── Historical Archive ─────────────────────────────────────── */}
        <div className="mt-8 rounded-2xl p-5"
          style={{ background: "rgba(6,11,20,0.88)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
          <div className="mb-5 flex items-center justify-between border-b pb-4" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="section-header-cyan flex items-center gap-2.5 rounded-lg pl-3 pr-4 py-2">
              <Calendar className="h-4 w-4 text-[#00D4FF]" />
              <div>
                <p className="text-[13px] font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Historical Archives</p>
                <p className="text-[10px] text-slate-500">Tamper-proof daily records</p>
              </div>
            </div>
            <span className="rounded-full px-3 py-1 text-[10px] font-bold tag-emerald">{allAvailableDates.length} days</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allAvailableDates.map((d) => {
              const dateStr  = `${d.year}-${d.month.padStart(2, "0")}-${d.day.padStart(2, "0")}`;
              const isCurrent = dateStr === currentData.date;
              return (
                <Link
                  key={dateStr}
                  href={`/archive/${d.year}/${d.month}/${d.day}`}
                  className={`price-num flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-all duration-200 ${
                    isCurrent ? "archive-chip-active" : "archive-chip-idle"
                  }`}
                >
                  {dateStr}
                  {isCurrent && <span className="text-[8px] font-black text-[#00D4FF]">LIVE</span>}
                  {!isCurrent && <ChevronRight className="h-2.5 w-2.5 opacity-30" />}
                </Link>
              );
            })}
          </div>
        </div>

        <TrendChartModal
          isOpen={Boolean(chartModalAsset)}
          onClose={() => setChartModalAsset(null)}
          selectedAsset={chartModalAsset}
          historicalHistory={historicalHistory}
          currencyMode={currencyMode}
        />
        <ReleaseAnnouncementModal />
      </div>
    </>
  );
}
