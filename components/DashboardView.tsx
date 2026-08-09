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
  Award,
  ShieldCheck,
} from "lucide-react";
import { DailyRateData, calculateTrend, MetalRate } from "@/lib/types";
import { useCurrency } from "@/context/CurrencyContext";
import PdfDownloadButton from "@/components/PdfDownloadButton";
import AdBanner from "@/components/AdBanner";
import Link from "next/link";

interface DashboardViewProps {
  currentData: DailyRateData;
  previousData: DailyRateData | null;
  allAvailableDates: { year: string; month: string; day: string }[];
  title?: string;
  isArchivePage?: boolean;
}

export default function DashboardView({
  currentData,
  previousData,
  allAvailableDates,
  title = "Institutional Spot Rates & Market Vault",
  isArchivePage = false,
}: DashboardViewProps) {
  const { currencyMode } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "metals" | "forex">("all");

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

  // Metal → card glow class mapping
  const metalCardClass = (id: string) => {
    if (id.startsWith("gold")) return "card-gold";
    if (id === "silver")        return "card-silver";
    if (id === "platinum")      return "card-platinum";
    if (id === "aluminum")      return "card-blue";
    return "card-bronze";
  };

  // Metal → accent colour for price display
  const metalAccentColor = (id: string) => {
    if (id.startsWith("gold")) return "#d4a843";
    if (id === "silver")        return "#a8b8cc";
    if (id === "platinum")      return "#d0dae8";
    if (id === "aluminum")      return "#38bdf8";
    return "#b97340";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Ad Banner */}
      <AdBanner slot="9876543210" format="horizontal" className="mb-8" />

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          {/* Mode pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-vault-gold/20 bg-vault-gold/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#d4a843", background: "rgba(212,168,67,0.08)" }}>
            <Sparkles className="h-3.5 w-3.5" />
            {isINR ? "Indian Market · GoodReturns / IBJA Aligned" : "International Standard · USD · Troy Ounce"}
          </div>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {title}
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Institutional-grade data for{" "}
            <span className="font-semibold price-num" style={{ color: "#f0c860" }}>{currentData.date}</span>.
            {" "}Displaying in{" "}
            <span className="font-bold text-white">{isINR ? "Indian Rupees (₹)" : "US Dollars ($)"}</span>.
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
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Gold 24K", sub: "99.9% Fine",
            val: g24Val, prevVal: g24PrevVal, trend: gold24kTrend,
            unit: isINR ? "/ 10g" : "/ oz",
            subLine: isINR ? `₹${getInrRateGram(gold24k).toLocaleString()} /g` : `$${gold24k.priceUsdGram.toFixed(2)} /g`,
            color: "#d4a843", borderColor: "rgba(212,168,67,0.30)", glowColor: "rgba(212,168,67,0.12)",
          },
          {
            label: "Gold 22K", sub: "Jewelry Grade",
            val: g22Val, prevVal: g22PrevVal, trend: gold22kTrend,
            unit: isINR ? "/ 10g" : "/ oz",
            subLine: isINR ? `₹${getInrRateGram(gold22k).toLocaleString()} /g` : `$${gold22k?.priceUsdGram.toFixed(2)} /g`,
            color: "#f0c860", borderColor: "rgba(240,200,96,0.25)", glowColor: "rgba(240,200,96,0.08)",
          },
          {
            label: "Silver", sub: "99.9% Fine",
            val: silverVal, prevVal: silverPrevVal, trend: silverTrend,
            unit: isINR ? "/ 1kg" : "/ oz",
            subLine: isINR ? `₹${getInrRateGram(silver || gold24k).toLocaleString()} /g` : `$${silver?.priceUsdGram.toFixed(2)} /g`,
            color: "#a8b8cc", borderColor: "rgba(168,184,204,0.25)", glowColor: "rgba(168,184,204,0.08)",
          },
          {
            label: "EUR/Rate", sub: "Euro Exchange",
            val: eurVal, prevVal: eurPrevVal, trend: eurTrend,
            unit: isINR ? "(1 EUR)" : "(1 EUR)",
            subLine: isINR ? `1 EUR = ₹${eurVal.toFixed(2)}` : `1 EUR = $${eur?.rateToUsd}`,
            color: "#38bdf8", borderColor: "rgba(56,189,248,0.25)", glowColor: "rgba(56,189,248,0.08)",
          },
        ].map(({ label, sub, val, trend, unit, subLine, color, borderColor, glowColor }) => (
          <div
            key={label}
            className="relative overflow-hidden rounded-2xl p-4 transition-all duration-300"
            style={{
              background: "rgba(14,19,48,0.75)",
              border: `1px solid ${borderColor}`,
              boxShadow: `0 0 20px ${glowColor}, 0 4px 16px rgba(0,0,0,0.4)`,
              backdropFilter: "blur(16px)",
            }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
              </div>
              {/* Trend badge */}
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
                <span className="text-[10px] text-slate-500">{unit}</span>
              </div>
              <p className="price-num mt-1 text-[11px]" style={{ color: "rgba(212,168,67,0.7)" }}>{subLine}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter & Control Bar ─────────────────────────────────── */}
      <div
        className="mb-6 flex flex-col justify-between gap-3 rounded-2xl p-3 sm:flex-row sm:items-center"
        style={{ background: "rgba(14,19,48,0.7)", border: "1px solid rgba(26,37,80,0.9)", backdropFilter: "blur(16px)" }}
      >
        {/* Category Tabs */}
        <div className="flex items-center gap-1 rounded-xl p-1 text-xs" style={{ background: "rgba(7,9,26,0.8)" }}>
          {(["all", "metals", "forex"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-lg px-3 py-1.5 font-semibold capitalize transition-all duration-200 ${
                activeCategory === cat
                  ? "text-slate-950 shadow-gold-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              style={activeCategory === cat ? {
                background: "linear-gradient(135deg, #d4a843, #f0c860)",
              } : {}}
            >
              {cat === "all" ? "All Markets" : cat === "metals" ? "⚙ Metals" : "💱 Forex"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-300" style={{ background: "rgba(7,9,26,0.6)", border: "1px solid rgba(26,37,80,0.9)" }}>
            <Globe className="h-3.5 w-3.5" style={{ color: "#d4a843" }} />
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
              className="w-40 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 outline-none sm:w-48"
              style={{ background: "rgba(7,9,26,0.8)", border: "1px solid rgba(26,37,80,0.9)" }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(212,168,67,0.5)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(26,37,80,0.9)"; }}
            />
          </div>
        </div>
      </div>

      {/* ── Main Report Container ─────────────────────────────────── */}
      <div id="rates-report-container" className="space-y-10 rounded-2xl p-2 sm:p-4" style={{ background: "rgba(7,9,26,0.5)" }}>
        {/* PDF / Report Header */}
        <div
          className="relative overflow-hidden rounded-2xl p-4"
          style={{ background: "rgba(14,19,48,0.8)", border: "1px solid rgba(212,168,67,0.15)", backdropFilter: "blur(16px)" }}
        >
          {/* Subtle gold shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(212,168,67,0.5), transparent)" }} />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-950 text-xs font-black tracking-tight shadow-gold-sm"
                style={{ background: "linear-gradient(135deg, #b88c2a, #f0c860)" }}
              >
                DVR
              </div>
              <div>
                <h2 className="text-base font-bold text-white">DailyVaultRates Official Spot Report</h2>
                <p className="text-xs text-slate-500">
                  {currentData.date} &nbsp;·&nbsp; {currencyMode} ({currencySymbol})
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="price-num text-xs font-bold" style={{ color: "#10b981" }}>✓ VERIFIED</p>
              <p className="price-num mt-0.5 text-xs text-slate-400">1 USD = ₹{usdToInr.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* SECTION 1: Metals */}
        {(activeCategory === "all" || activeCategory === "metals") && (
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-vault-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-400" />
                <h2 className="text-xl font-bold text-white">
                  {isINR ? "Precious Metals (24K, 22K, 18K Gold & Silver in INR ₹)" : "Precious & Industrial Metals (USD $)"}
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                {isINR ? "Indian Market Retail Standards (1g, 10g, 1kg)" : "US Standard Rates (Troy Oz, Gram)"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                    className={`metal-card glass relative overflow-hidden rounded-2xl p-5 ${metalCardClass(metal.id)}`}
                  >
                    {/* Top colour accent line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                      style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
                    />
                    {/* Ambient glow corner */}
                    <div
                      className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-40"
                      style={{ background: `radial-gradient(circle, ${accentColor}30 0%, transparent 70%)` }}
                    />

                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-widest"
                            style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30` }}
                          >
                            {metal.symbol}
                          </span>
                          {metal.carat && (
                            <span
                              className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                              style={{ background: "rgba(212,168,67,0.10)", color: "#d4a843", border: "1px solid rgba(212,168,67,0.20)" }}
                            >
                              {metal.carat}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2.5 text-base font-bold text-white leading-tight">{metal.name}</h3>
                        <p className="mt-0.5 text-[11px] text-slate-500">{metal.purity ? `Purity: ${metal.purity}` : metal.category}</p>
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
                    <div className="mt-5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="price-num text-2xl font-black text-white tracking-tight">
                          {currencySymbol}{displayPrimaryVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[11px] text-slate-500">{primaryUnitLabel}</span>
                      </div>
                    </div>

                    {/* Breakdown Table */}
                    <div className="mt-4 space-y-1.5 pt-3 text-xs" style={{ borderTop: "1px solid rgba(26,37,80,0.8)" }}>
                      {isINR ? (
                        <>
                          {[{l:"1 Gram",v:getInrRateGram(metal),hi:false},{l:"8g (1 Sovereign)",v:getInrRateGram(metal)*8,hi:false},{l:"10 Grams",v:getInrRate10Gram(metal),hi:true},{l:"100 Grams",v:getInrRateGram(metal)*100,hi:false},{l:"1 Kilogram",v:getInrRateKg(metal),hi:false}].map(({l,v,hi})=>(
                            <div key={l} className="flex justify-between">
                              <span className="text-slate-500">{l}</span>
                              <span className={`price-num font-semibold ${hi ? "" : "text-slate-200"}`} style={hi ? { color: accentColor } : {}}>
                                ₹{v.toLocaleString(undefined,{maximumFractionDigits:2})}
                              </span>
                            </div>
                          ))}
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between"><span className="text-slate-500">Troy Ounce</span><span className="price-num font-semibold" style={{ color: accentColor }}>${metal.priceUsdOunce.toLocaleString(undefined,{minimumFractionDigits:2})}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Per Gram</span><span className="price-num font-semibold text-slate-200">${metal.priceUsdGram.toFixed(2)}</span></div>
                          {metal.priceUsdTon && <div className="flex justify-between"><span className="text-slate-500">Metric Ton</span><span className="price-num font-semibold text-slate-200">${metal.priceUsdTon.toLocaleString()}</span></div>}
                        </>
                      )}
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
            <div className="mb-4 flex items-center justify-between border-b border-vault-border/60 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-vault-accent" />
                <h2 className="text-xl font-bold text-white">
                  {isINR ? "Global Currencies Compared to Indian Rupee (INR ₹)" : "Major Forex Exchange Rates (Base: USD $)"}
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                {isINR ? "Base Currency: INR (₹)" : "Base Currency: USD ($)"}
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid rgba(26,37,80,0.8)", backdropFilter: "blur(16px)", background: "rgba(14,19,48,0.7)" }}>
              <table className="w-full text-left text-xs">
                <thead style={{ borderBottom: "1px solid rgba(26,37,80,0.8)", background: "rgba(7,9,26,0.6)" }}>
                  <tr>
                    {["Currency", "Symbol", isINR ? "Rate in INR (₹)" : "Rate to USD ($)", isINR ? "1 INR Equiv." : "USD → Currency", "24h Δ"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ borderTop: "none" }}>
                  {/* USD row (INR mode only) */}
                  {isINR && (
                    <tr className="fx-row" style={{ borderBottom: "1px solid rgba(26,37,80,0.5)", background: "rgba(212,168,67,0.04)" }}>
                      <td className="px-5 py-3.5 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="price-num rounded-md px-2 py-0.5 text-[10px] font-black" style={{ background: "linear-gradient(135deg,#b88c2a,#f0c860)", color: "#07091a" }}>
                            USD
                          </span>
                          <span>US Dollar</span>
                        </div>
                      </td>
                      <td className="price-num px-5 py-3.5 font-bold" style={{ color: "#d4a843" }}>$</td>
                      <td className="price-num px-5 py-3.5 font-bold" style={{ color: "#f0c860" }}>₹{usdToInr.toFixed(2)}</td>
                      <td className="price-num px-5 py-3.5 text-slate-400">{(1 / usdToInr).toFixed(4)} USD</td>
                      <td className="px-5 py-4 font-bold">
                        {(() => {
                          const t = calculateTrend(usdToInr, prevUsdToInr);
                          return (
                            <span className={`inline-flex items-center gap-1 ${t.isUp ? "text-emerald-400" : "text-rose-400"}`}>
                              {t.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {t.isUp ? "+" : ""}{t.percentage}%
                            </span>
                          );
                        })()}
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
                      <tr key={curr.code} className="fx-row" style={{ borderBottom: "1px solid rgba(26,37,80,0.4)" }}>
                        <td className="px-5 py-3.5 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span
                              className="price-num rounded-md px-2 py-0.5 text-[10px] font-black uppercase"
                              style={{ background: "rgba(56,189,248,0.10)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.20)" }}
                            >
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
      <div
        className="mt-12 rounded-2xl p-6"
        style={{ background: "rgba(14,19,48,0.6)", border: "1px solid rgba(26,37,80,0.8)", backdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center justify-between pb-4" style={{ borderBottom: "1px solid rgba(26,37,80,0.7)" }}>
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "rgba(212,168,67,0.12)", border: "1px solid rgba(212,168,67,0.20)" }}
            >
              <Calendar className="h-4 w-4" style={{ color: "#d4a843" }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Historical Spot Archives</h3>
              <p className="text-[11px] text-slate-500">Git-backed · immutable daily records</p>
            </div>
          </div>
          <span className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: "rgba(16,185,129,0.10)", color: "#34d399", border: "1px solid rgba(16,185,129,0.20)" }}>
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
                {isCurrent && <span className="ml-1 text-[9px] uppercase font-black" style={{ color: "#d4a843" }}>LIVE</span>}
                {!isCurrent && <ChevronRight className="h-3 w-3 opacity-40" />}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
