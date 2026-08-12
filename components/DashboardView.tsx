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
 BarChart2,
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
 const [activeCategory, setActiveCategory] = useState<"all" | "metals" | "stocks" | "forex" | "calculator">("metals");
 const [selectedGoldCarat, setSelectedGoldCarat] = useState<"gold-24k" | "gold-22k" | "gold-18k">("gold-24k");
 const [chartModalAsset, setChartModalAsset] = useState<{
   type: "metal" | "forex";
   id: string;
   name: string;
   symbol: string;
 } | null>(null);


 const inrCurrency = currentData.currencies.find((c) => c.code === "INR");
 const usdToInr = inrCurrency?.usdToRate || 83.88;
 const prevInrCurrency = previousData?.currencies.find((c) => c.code === "INR");
 const prevUsdToInr = prevInrCurrency?.usdToRate || usdToInr;


 const prevMetalsMap = new Map(previousData?.metals.map((m) => [m.id, m]));
 const prevForexMap = new Map(previousData?.currencies.map((c) => [c.code, c]));


 const isINR = currencyMode === "INR";
 const sym = isINR ? "₹" : "$";


 const getInrG   = (m?: MetalRate) => !m ? 0 : (m.priceInrGram    ?? Number(((m.priceUsdGram || 0) * usdToInr * (m.id?.startsWith("gold") ? 1.09 : 1.145)).toFixed(2)));
 const getInr10g = (m?: MetalRate) => !m ? 0 : (m.priceInr10Gram  ?? Number((getInrG(m) * 10).toFixed(2)));
 const getInrKg  = (m?: MetalRate) => !m ? 0 : (m.priceInrKg      ?? Number((getInrG(m) * 1000).toFixed(2)));
 const getPrevG  = (p?: MetalRate) => !p ? 0 : (p.priceInrGram ?? Number(((p.priceUsdGram || 0) * prevUsdToInr * (p.id?.startsWith("gold") ? 1.09 : 1.145)).toFixed(2)));


 const gold24k = currentData.metals.find((m) => m.id === "gold-24k") || currentData.metals[0];
 const gold22k = currentData.metals.find((m) => m.id === "gold-22k") || currentData.metals[1];
 const gold18k = currentData.metals.find((m) => m.id === "gold-18k") || currentData.metals[2];
 const silver   = currentData.metals.find((m) => m.id === "silver");
 const platinum = currentData.metals.find((m) => m.id === "platinum");
 const aluminum = currentData.metals.find((m) => m.id === "aluminum");


 const fallbackMetal: MetalRate = { id: "gold-24k", name: "Gold 24K", symbol: "XAU-24K", priceUsdOunce: 0, priceUsdGram: 0, unit: "Troy Ounce", category: "Precious Metals" };
 const activeGold = (selectedGoldCarat === "gold-24k" ? gold24k : selectedGoldCarat === "gold-22k" ? gold22k : gold18k) || gold24k || fallbackMetal;
 const prevActiveGold = prevMetalsMap.get(activeGold.id);
 const activeGoldVal = isINR ? getInr10g(activeGold) : (activeGold?.priceUsdOunce || 0);
 const prevActiveGoldVal = prevActiveGold ? (isINR ? getPrevG(prevActiveGold) * 10 : prevActiveGold.priceUsdOunce) : undefined;
 const activeGoldTrend = calculateTrend(activeGoldVal, prevActiveGoldVal);


 const g24Val = isINR ? getInr10g(gold24k) : (gold24k?.priceUsdOunce || 0);
 const g24Trend = calculateTrend(g24Val, prevMetalsMap.get(gold24k?.id) ? (isINR ? getPrevG(prevMetalsMap.get(gold24k?.id)) * 10 : prevMetalsMap.get(gold24k?.id)?.priceUsdOunce) : undefined);
 const silverVal = isINR ? (silver ? getInrKg(silver) : 0) : silver?.priceUsdOunce || 0;
 const silverTrend = calculateTrend(silverVal, prevMetalsMap.get("silver") ? (isINR ? getPrevG(prevMetalsMap.get("silver")) * 1000 : prevMetalsMap.get("silver")?.priceUsdOunce) : undefined);
 const eur = currentData.currencies.find((c) => c.code === "EUR");
 const eurVal = eur ? (isINR ? eur.rateToUsd * usdToInr : eur.rateToUsd) : 0;
 const eurTrend = calculateTrend(eurVal, prevForexMap.get("EUR") ? (isINR ? prevForexMap.get("EUR")!.rateToUsd * prevUsdToInr : prevForexMap.get("EUR")!.rateToUsd) : undefined);


 const filteredCurrencies = currentData.currencies.filter(
   (c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase())
 );


 const TrendBadge = ({ trend }: { trend: ReturnType<typeof calculateTrend> }) => (
   <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
     trend.isFlat ? "badge-flat" : trend.isUp ? "badge-up" : "badge-down"
   }`}>
     {trend.isFlat ? <Minus className="h-2.5 w-2.5" /> : trend.isUp ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
     {trend.isUp && !trend.isFlat ? "+" : ""}{trend.percentage}%
   </span>
 );


 return (
   <>
     <MarketTickerTape
       gold24kPrice={isINR ? getInr10g(gold24k) : (gold24k?.priceUsdOunce || 0)}
       silverPrice={isINR ? getInrKg(silver) : (silver?.priceUsdOunce || 0)}
       usdToInr={usdToInr}
       currencyMode={currencyMode}
     />
     <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
       <AdBanner slot="9876543210" format="horizontal" className="mb-6" />


     {/* ── Page Header ─────────────────────────────────────── */}
     <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
       <div>
         <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest tag-cyan">
           <Sparkles className="h-3 w-3" />
           {isINR ? "IBJA & GoodReturns Aligned" : "International Spot · USD / Troy Oz"}
         </span>
         <h1 className="mt-2.5 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
           {title}
         </h1>
         <p className="mt-1.5 text-[13px] text-slate-400">
           Verified spot data for{" "}
           <span className="price-num font-bold text-[#00D4FF]">{currentData.date}</span>
           <span className="mx-1.5 text-slate-600">·</span>
           <span className="font-semibold text-white">{isINR ? "Indian Rupees (₹)" : "US Dollars ($)"}</span>
         </p>
       </div>
       <div className="shrink-0">
         <PdfDownloadButton
           targetId="rates-report-container"
           filename={`DailyVaultRates-${currentData.date}-${currencyMode}.pdf`}
           dateStr={currentData.date}
         />
       </div>
     </div>


     {/* ── Spot Ticker — 2 cols mobile / 4 cols desktop ────── */}
     <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
       {[
         { id: "gold-24k", type: "metal" as const, label: "Gold 24K",   sub: "99.9% Fine",     val: g24Val,   trend: g24Trend,   unit: isINR ? "/10g" : "/oz",  sub2: isINR ? `${sym}${getInrG(gold24k).toLocaleString()} /g`   : `${sym}${(gold24k?.priceUsdGram || 0).toFixed(2)} /g`, color: "#F0B429", bc: "rgba(240,180,41,0.18)" },
         { id: "gold-22k", type: "metal" as const, label: "Gold 22K",   sub: "Jewelry Grade",  val: isINR ? getInr10g(gold22k) : (gold22k?.priceUsdOunce || 0), trend: calculateTrend(isINR ? getInr10g(gold22k) : (gold22k?.priceUsdOunce || 0), prevMetalsMap.get("gold-22k") ? (isINR ? getPrevG(prevMetalsMap.get("gold-22k")) * 10 : prevMetalsMap.get("gold-22k")?.priceUsdOunce) : undefined), unit: isINR ? "/10g" : "/oz", sub2: isINR ? `${sym}${getInrG(gold22k).toLocaleString()} /g` : `${sym}${(gold22k?.priceUsdGram || 0).toFixed(2)} /g`, color: "#FBBF24", bc: "rgba(251,191,36,0.16)" },
         { id: "silver",   type: "metal" as const, label: "Silver",     sub: "99.9% Fine",     val: silverVal, trend: silverTrend, unit: isINR ? "/kg"  : "/oz", sub2: isINR ? `${sym}${getInrG(silver).toLocaleString()} /g` : `${sym}${(silver?.priceUsdGram || 0).toFixed(2)} /g`, color: "#CBD5E1", bc: "rgba(203,213,225,0.12)" },
         { id: "EUR",      type: "forex" as const, label: "EUR",        sub: "Euro Exchange",  val: eurVal,   trend: eurTrend,   unit: "per 1 EUR",              sub2: isINR ? `1 EUR = ${sym}${eurVal.toFixed(2)}` : `1 EUR = $${(eur?.rateToUsd || 0).toFixed(4)}`, color: "#00D4FF", bc: "rgba(0,212,255,0.15)" },
       ].map(({ id, type, label, sub, val, trend, unit, sub2, color, bc }) => (
         <button
           key={id}
           onClick={() => setChartModalAsset({ type, id, name: label, symbol: id })}
           className="group relative overflow-hidden rounded-2xl border bg-[rgba(6,12,24,0.88)] p-4 text-left backdrop-blur-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none"
           style={{ borderColor: bc }}
         >
           {/* accent line */}
           <div className="absolute inset-x-0 top-0 h-[1.5px]" style={{ background: `linear-gradient(90deg, transparent, ${color} 40%, transparent)` }} />


           {/* header row */}
           <div className="flex items-start justify-between gap-2">
             <div className="min-w-0">
               <p className="truncate text-[11px] font-black uppercase tracking-wider" style={{ color }}>{label}</p>
               <p className="text-[10px] text-slate-500">{sub}</p>
             </div>
             <TrendBadge trend={trend} />
           </div>


           {/* price */}
           <p className="price-num mt-3 text-lg font-black leading-none text-white sm:text-xl">
             {sym}{val.toLocaleString(undefined, { maximumFractionDigits: 2 })}
             <span className="ml-1 text-[10px] font-medium text-slate-500">{unit}</span>
           </p>


           {/* sub rate */}
           <p className="price-num mt-1.5 text-[10px] font-medium" style={{ color }}>{sub2}</p>


           {/* chart hint */}
           <p className="mt-2 flex items-center gap-1 text-[10px] font-bold text-slate-600 opacity-0 transition-opacity group-hover:opacity-100" style={{ color }}>
             <LineChartIcon className="h-3 w-3" /> Chart
           </p>
         </button>
       ))}
     </div>


     {/* ── Filter Bar ──────────────────────────────────────── */}
     <div className="mb-6 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(6,12,24,0.85)] p-2 backdrop-blur-xl">
       <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
         {/* Category tabs */}
         <div className="flex flex-wrap items-center gap-1 rounded-xl bg-[rgba(4,8,16,0.7)] p-1 text-[11px]">
           {(["all", "metals", "stocks", "forex", "calculator"] as const).map((cat) => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={`rounded-lg px-3 py-1.5 font-bold capitalize transition-all duration-200 ${
                 activeCategory === cat
                   ? cat === "stocks"
                     ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                     : "btn-gold text-[#040810] shadow-sm"
                   : "text-slate-400 hover:text-white"
               }`}
             >
               {cat === "all" ? "All" : cat === "metals" ? "Metals" : cat === "stocks" ? "Stocks (NSE)" : cat === "forex" ? "Forex" : "Calc"}
             </button>
           ))}
         </div>


         {/* Right controls */}
         <div className="flex items-center gap-2">
           <div className="flex items-center gap-1.5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(4,8,16,0.7)] px-2.5 py-1.5 text-[11px]">
             <Globe className="h-3.5 w-3.5 shrink-0 text-[#00D4FF]" />
             <span className="font-bold text-white">{isINR ? "₹ INR" : "$ USD"}</span>
           </div>
           <div className="relative flex-1 sm:flex-none">
             <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
             <input
               type="text"
               placeholder="Search…"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(4,8,16,0.7)] py-1.5 pl-8 pr-3 text-[11px] text-white placeholder-slate-600 outline-none transition-colors focus:border-[rgba(0,212,255,0.35)] sm:w-44"
             />
           </div>
         </div>
       </div>
     </div>


     {/* ── Main content ────────────────────────────────────── */}
     <div id="rates-report-container" className="space-y-8">


       {/* Report strip */}
       <div className="flex items-center justify-between rounded-xl border border-[rgba(0,212,255,0.10)] bg-[rgba(6,12,24,0.88)] px-4 py-3">
         <div className="flex items-center gap-3">
           <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[rgba(0,212,255,0.20)] bg-[rgba(0,212,255,0.07)] text-[10px] font-black text-[#00D4FF]">DVR</div>
           <div>
             <p className="text-[13px] font-bold text-white">DailyVaultRates Spot Report</p>
             <p className="text-[11px] text-slate-500">{currentData.date} · {currencyMode}</p>
           </div>
         </div>
         <div className="text-right">
           <p className="text-[11px] font-bold text-emerald-400">✓ VERIFIED</p>
           <p className="price-num text-[11px] text-slate-500">1 USD = ₹{usdToInr.toFixed(2)}</p>
         </div>
       </div>


       {/* ── METALS SECTION ──────────────────────────────── */}
       {(activeCategory === "all" || activeCategory === "metals") && (
         <section className="space-y-5">


           {/* Section header */}
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[rgba(240,180,41,0.25)] bg-[rgba(240,180,41,0.10)]">
                 <Coins className="h-3.5 w-3.5 text-[#F0B429]" />
               </div>
               <h2 className="text-[13px] font-bold text-white">
                 {isINR ? "Precious Metals — INR (₹)" : "Precious Metals — USD ($)"}
               </h2>
             </div>
             <button
               onClick={() => setChartModalAsset({ type: "metal", id: activeGold.id, name: activeGold.name, symbol: activeGold.symbol })}
               className="hidden items-center gap-1.5 rounded-xl border border-[rgba(0,212,255,0.18)] bg-[rgba(0,212,255,0.06)] px-3 py-1.5 text-[11px] font-bold text-[#00D4FF] transition-all hover:bg-[rgba(0,212,255,0.10)] sm:flex"
             >
               <BarChart2 className="h-3.5 w-3.5" /> Trend Charts
             </button>
           </div>


           {/* ── GOLD MASTER CARD ────────────────────────── */}
           <div className="relative overflow-hidden rounded-2xl border border-[rgba(240,180,41,0.20)] bg-[rgba(6,12,24,0.92)] backdrop-blur-xl">
             <div className="glow-divider-gold absolute inset-x-0 top-0" />


             {/* Card header */}
             <div className="border-b border-[rgba(255,255,255,0.05)] px-5 py-4">
               <div className="flex flex-wrap items-center justify-between gap-3">
                 <div>
                   <div className="flex items-center gap-2">
                     <span className="rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-widest tag-gold">XAU SPOT</span>
                     <span className="text-[10px] font-semibold text-slate-500">Bullion &amp; Jewelry</span>
                   </div>
                   <h3 className="mt-1.5 text-lg font-black text-white">Gold Spot Rate Terminal</h3>
                 </div>
                 {/* Carat tabs */}
                 <div className="flex items-center rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(4,8,16,0.8)] p-1 text-[11px]">
                   {(["gold-24k", "gold-22k", "gold-18k"] as const).map((id) => {
                     const labels: Record<string, string> = { "gold-24k": "24K", "gold-22k": "22K", "gold-18k": "18K" };
                     const purities: Record<string, string> = { "gold-24k": "99.9%", "gold-22k": "91.6%", "gold-18k": "75.0%" };
                     return (
                       <button
                         key={id}
                         onClick={() => setSelectedGoldCarat(id)}
                         className={`rounded-lg px-3.5 py-1.5 font-bold transition-all duration-200 ${
                           selectedGoldCarat === id ? "btn-gold text-[#040810]" : "text-slate-400 hover:text-white"
                         }`}
                       >
                         <span className="block text-[11px] font-black">{labels[id]}</span>
                         <span className={`block text-[9px] ${selectedGoldCarat === id ? "text-[rgba(4,8,16,0.65)]" : "text-slate-600"}`}>{purities[id]}</span>
                       </button>
                     );
                   })}
                 </div>
               </div>
             </div>


             {/* Carat comparison — 3 equal columns, always horizontal */}
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
                     className={`flex flex-col items-center py-3.5 px-2 text-center transition-all ${
                       isSelected ? "bg-[rgba(240,180,41,0.07)]" : "hover:bg-[rgba(255,255,255,0.02)]"
                     }`}
                   >
                     <span className="text-[10px] font-black uppercase tracking-wide" style={{ color }}>{label}</span>
                     <span className="mt-0.5 text-[9px] text-slate-500">{purity}</span>
                     <p className="price-num mt-2 text-sm font-black text-white">
                       {isINR ? `₹${getInrG(metal).toLocaleString()}` : `$${metal.priceUsdGram.toFixed(2)}`}
                       <span className="text-[9px] font-normal text-slate-500">/g</span>
                     </p>
                   </button>
                 );
               })}
             </div>


             {/* Main price + table */}
             <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:divide-x sm:divide-[rgba(255,255,255,0.05)]">
               {/* Price block */}
               <div className="px-5 py-5">
                 <div className="flex items-center gap-2">
                   <span className="text-[11px] text-slate-400">
                     {activeGold.name}
                   </span>
                   <TrendBadge trend={activeGoldTrend} />
                 </div>
                 <p className="price-num mt-2 text-4xl font-black leading-none text-white">
                   {sym}{activeGoldVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   <span className="ml-1.5 text-sm font-semibold text-slate-500">{isINR ? "/ 10g" : "/ oz"}</span>
                 </p>
                 <p className="price-num mt-2 text-[12px] font-semibold text-[#F0B429]">
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
               <div className="px-5 py-5">
                 <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                   {activeGold.carat || "24K"} Weight Breakdown
                 </p>
                 <div className="space-y-2">
                   {isINR ? [
                     { label: "1 Gram",                   val: getInrG(activeGold),         hi: false },
                     { label: "8g · 1 Sovereign/Pavan",   val: getInrG(activeGold) * 8,     hi: false },
                     { label: "10 Grams (Benchmark)",      val: getInr10g(activeGold),       hi: true  },
                     { label: "100 Grams",                 val: getInrG(activeGold) * 100,   hi: false },
                     { label: "1 Kilogram",                val: getInrKg(activeGold),        hi: false },
                   ].map(({ label, val, hi }) => (
                     <div key={label} className="flex items-center justify-between text-[12px]">
                       <span className={hi ? "font-semibold text-white" : "text-slate-500"}>{label}</span>
                       <span className={`price-num font-bold ${hi ? "text-[#F0B429]" : "text-slate-300"}`}>
                         ₹{val.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                       </span>
                     </div>
                   )) : (
                     <>
                       <div className="flex justify-between text-[12px]"><span className="text-slate-500">Troy Ounce</span><span className="price-num font-bold text-[#F0B429]">${activeGold.priceUsdOunce.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                       <div className="flex justify-between text-[12px]"><span className="text-slate-500">Per Gram</span><span className="price-num font-bold text-slate-300">${activeGold.priceUsdGram.toFixed(2)}</span></div>
                     </>
                   )}
                 </div>
               </div>
             </div>
           </div>


           {/* ── OTHER METALS GRID — 1 col mobile / 3 col desktop ── */}
           <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
             {[
               { metal: silver,   id: "silver",   symbol: "XAG", color: "#CBD5E1", bc: "rgba(203,213,225,0.12)" },
               { metal: platinum, id: "platinum", symbol: "XPT", color: "#E2E8F0", bc: "rgba(226,232,240,0.12)" },
               { metal: aluminum, id: "aluminum", symbol: "ALI", color: "#00D4FF", bc: "rgba(0,212,255,0.15)"   },
             ].map(({ metal, id, symbol, color, bc }) => {
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
                   className="group relative overflow-hidden rounded-2xl border bg-[rgba(6,12,24,0.88)] p-5 text-left backdrop-blur-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none"
                   style={{ borderColor: bc }}
                 >
                   <div className="absolute inset-x-0 top-0 h-[1.5px]" style={{ background: `linear-gradient(90deg, transparent, ${color} 40%, transparent)` }} />


                   {/* Header */}
                   <div className="flex items-start justify-between gap-2">
                     <div>
                       <span className="rounded px-2 py-0.5 text-[10px] font-black uppercase border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.04)]" style={{ color }}>{symbol}</span>
                       <p className="mt-2 text-[15px] font-bold text-white">{metal.name}</p>
                       <p className="text-[11px] text-slate-500">{metal.purity ? `Purity: ${metal.purity}` : metal.category}</p>
                     </div>
                     <TrendBadge trend={trend} />
                   </div>


                   {/* Price */}
                   <p className="price-num mt-4 text-2xl font-black text-white">
                     {sym}{displayVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     <span className="ml-1 text-[11px] font-normal text-slate-500">{unitLabel}</span>
                   </p>


                   {/* Rate rows */}
                   <div className="mt-4 space-y-1.5 border-t border-[rgba(255,255,255,0.05)] pt-3 text-[12px]">
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


                   {/* Chart link */}
                   <div className="mt-3 flex items-center justify-between border-t border-[rgba(255,255,255,0.04)] pt-2.5 text-[11px] font-bold text-slate-600 transition-colors group-hover:text-[#00D4FF]">
                     <span className="flex items-center gap-1"><LineChartIcon className="h-3 w-3" /> View Trend</span>
                     <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                   </div>
                 </button>
               );
             })}
           </div>
         </section>
       )}


       {/* ── JEWELRY CALCULATOR ──────────────────────────── */}
       {(activeCategory === "all" || activeCategory === "calculator") && (
         <JewelryCalculator currentData={currentData} currencyMode={currencyMode} />
       )}

       {/* ── INDIAN EQUITY MARKETS (STOCKS) ─────────────── */}
       {(activeCategory === "all" || activeCategory === "stocks") && (
         <>
           <StockDashboardSection />
           <StockEducationSection />
         </>
       )}


       <AdBanner slot="5432167890" format="auto" className="my-4" />


       {/* ── FOREX TABLE ─────────────────────────────────── */}
       {(activeCategory === "all" || activeCategory === "forex") && (
         <section>
           <div className="mb-4 flex items-center justify-between">
             <div className="flex items-center gap-2">
               <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[rgba(0,212,255,0.22)] bg-[rgba(0,212,255,0.08)]">
                 <DollarSign className="h-3.5 w-3.5 text-[#00D4FF]" />
               </div>
               <h2 className="text-[13px] font-bold text-white">
                 {isINR ? "Global Currencies vs. INR (₹)" : "Forex Exchange Rates (USD $)"}
               </h2>
             </div>
             <span className="hidden text-[11px] text-slate-500 sm:block">Click row for chart</span>
           </div>


           <div className="overflow-x-auto rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(6,12,24,0.88)] backdrop-blur-xl">
             <table className="w-full min-w-[480px] text-left text-[12px]">
               <thead className="border-b border-[rgba(255,255,255,0.05)] bg-[rgba(4,8,16,0.5)]">
                 <tr>
                   {["Currency", "Rate", isINR ? "1 INR Equiv." : "USD → Curr.", "24h Δ", ""].map((h, i) => (
                     <th key={i} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">{h}</th>
                   ))}
                 </tr>
               </thead>
               <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                 {isINR && (
                   <tr onClick={() => setChartModalAsset({ type: "forex", id: "USD", name: "US Dollar", symbol: "$" })} className="fx-row group cursor-pointer bg-[rgba(240,180,41,0.03)]">
                     <td className="px-4 py-3">
                       <div className="flex items-center gap-2">
                         <span className="price-num rounded bg-gradient-to-r from-[#D97706] to-[#F0B429] px-2 py-0.5 text-[10px] font-black text-[#040810]">USD</span>
                         <span className="font-semibold text-white">US Dollar</span>
                       </div>
                     </td>
                     <td className="price-num px-4 py-3 font-bold text-[#F0B429]">₹{usdToInr.toFixed(2)}</td>
                     <td className="price-num px-4 py-3 text-slate-500">{(1 / usdToInr).toFixed(4)} USD</td>
                     <td className="px-4 py-3">
                       {(() => { const t = calculateTrend(usdToInr, prevUsdToInr); return <TrendBadge trend={t} />; })()}
                     </td>
                     <td className="px-4 py-3 text-[10px] font-bold text-[#00D4FF] opacity-0 transition-opacity group-hover:opacity-100">CHART</td>
                   </tr>
                 )}


                 {filteredCurrencies.map((curr) => {
                   if (isINR && curr.code === "INR") return null;
                   const prev = prevForexMap.get(curr.code);
                   const rate = isINR ? curr.rateToUsd * usdToInr : curr.rateToUsd;
                   const prevRate = prev ? (isINR ? prev.rateToUsd * prevUsdToInr : prev.rateToUsd) : undefined;
                   const trend = calculateTrend(rate, prevRate);
                   const equiv = isINR ? `${(1 / rate).toFixed(4)} ${curr.code}` : `${curr.usdToRate} ${curr.code}`;
                   return (
                     <tr key={curr.code} onClick={() => setChartModalAsset({ type: "forex", id: curr.code, name: curr.name, symbol: curr.symbol })} className="fx-row group cursor-pointer">
                       <td className="px-4 py-3">
                         <div className="flex items-center gap-2">
                           <span className="price-num rounded px-2 py-0.5 text-[10px] font-black uppercase tag-cyan">{curr.code}</span>
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

     {/* ── Daily Email Digest Subscription Form ─────────────── */}
     <div className="mt-8">
       <SubscribeForm />
     </div>

     {/* ── Historical Archive ───────────────────────────── */}
     <div className="mt-8 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(6,12,24,0.88)] p-5 backdrop-blur-xl">
       <div className="mb-4 flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4">
         <div className="flex items-center gap-2.5">
           <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[rgba(0,212,255,0.22)] bg-[rgba(0,212,255,0.08)]">
             <Calendar className="h-3.5 w-3.5 text-[#00D4FF]" />
           </div>
           <div>
             <p className="text-[13px] font-bold text-white">Historical Archives</p>
             <p className="text-[10px] text-slate-500">Verified daily records</p>
           </div>
         </div>
         <span className="rounded-full px-2.5 py-1 text-[10px] font-bold tag-emerald">{allAvailableDates.length} days</span>
       </div>


       <div className="flex flex-wrap gap-1.5">
         {allAvailableDates.map((d) => {
           const dateStr = `${d.year}-${d.month.padStart(2, "0")}-${d.day.padStart(2, "0")}`;
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
    </div>
    </>
  );
}
