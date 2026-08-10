"use client";


import React, { useState } from "react";
import {
 Calculator,
 Copy,
 Check,
 ShieldCheck,
 Info,
 BarChart3,
} from "lucide-react";
import { DailyRateData, MetalRate, TaxStructure } from "@/lib/types";


interface JewelryCalculatorProps {
 currentData: DailyRateData;
 currencyMode: "INR" | "USD";
}


export default function JewelryCalculator({ currentData, currencyMode }: JewelryCalculatorProps) {
 const isINR = currencyMode === "INR";
 const inrCurrency = currentData?.currencies?.find((c) => c.code === "INR");
 const usdToInr = inrCurrency?.usdToRate || 83.88;


 const metals = currentData?.metals || [];
 const gold24k = metals.find((m) => m.id === "gold-24k") || metals[0];
 const gold22k = metals.find((m) => m.id === "gold-22k") || metals[1] || gold24k;
 const gold18k = metals.find((m) => m.id === "gold-18k") || metals[2] || gold24k;
 const silver = metals.find((m) => m.id === "silver") || metals[3] || gold24k;


 const getGramRate = (metal?: MetalRate): number => {
   if (!metal) return 0;
   if (metal.priceInrGram) return metal.priceInrGram;
   const dutyMultiplier = metal.id.startsWith("gold") ? 1.09 : 1.145;
   return Number(((metal.priceUsdGram || 0) * usdToInr * dutyMultiplier).toFixed(2));
 };


 const [selectedMetalId, setSelectedMetalId] = useState<string>("gold-22k");
 const [weightGrams, setWeightGrams] = useState<number>(10);
 const [makingChargeType, setMakingChargeType] = useState<"percent" | "per_gram">("percent");
 const [makingChargeValue, setMakingChargeValue] = useState<number>(12);
 const [includeHallmark, setIncludeHallmark] = useState<boolean>(true);
 const [copied, setCopied] = useState<boolean>(false);


 const activeMetal = metals.find((m) => m.id === selectedMetalId) || gold22k || gold24k;
 const baseGramRate = activeMetal ? (isINR ? getGramRate(activeMetal) : activeMetal.priceUsdGram || 0) : 0;


 const gstRate = currentData?.taxes?.gstPercentage || 3.0;
 const hallmarkBase = currentData?.taxes?.hallmarkFeeInr || 45.0;
 const hallmarkGst = currentData?.taxes?.hallmarkGstPercentage || 18.0;
 const hallmarkTotal = Number((hallmarkBase * (1 + hallmarkGst / 100)).toFixed(2));


 const rawMetalCost = Number((baseGramRate * weightGrams).toFixed(2));
 let makingChargeAmount = 0;
 if (makingChargeType === "percent") {
   makingChargeAmount = Number(((rawMetalCost * makingChargeValue) / 100).toFixed(2));
 } else {
   makingChargeAmount = Number((makingChargeValue * weightGrams).toFixed(2));
 }


 const hallmarkFeeApplied = includeHallmark ? (isINR ? hallmarkTotal : Number((hallmarkTotal / usdToInr).toFixed(2))) : 0;
 const subtotalBeforeGst = rawMetalCost + makingChargeAmount;
 const gstAmount = Number(((subtotalBeforeGst * gstRate) / 100).toFixed(2));
 const finalTotalAmount = Number((subtotalBeforeGst + gstAmount + hallmarkFeeApplied).toFixed(2));


 const presets = [
   { label: "Ring / Earring", weight: 4 },
   { label: "10g Bar/Coin", weight: 10 },
   { label: "Gold Chain", weight: 16 },
   { label: "Bangle Pair", weight: 24 },
   { label: "Bridal Set", weight: 48 },
 ];


 const handleCopyReceipt = () => {
   const sym = isINR ? "₹" : "$";
   const text = `DailyVaultRates — Purchase Estimate
Date: ${currentData?.date || ""}
Metal: ${activeMetal?.name || "Gold"} · Weight: ${weightGrams}g · Rate: ${sym}${baseGramRate}/g
Raw Cost: ${sym}${rawMetalCost.toLocaleString()}
Making Charges: ${sym}${makingChargeAmount.toLocaleString()}
Hallmark: ${sym}${hallmarkFeeApplied.toLocaleString()} · GST (${gstRate}%): ${sym}${gstAmount.toLocaleString()}
TOTAL: ${sym}${finalTotalAmount.toLocaleString()}
Source: DailyVaultRates`.trim();


   if (navigator?.clipboard) {
     navigator.clipboard.writeText(text);
     setCopied(true);
     setTimeout(() => setCopied(false), 2500);
   }
 };


 const metalOptions = [
   { id: "gold-24k", label: "24K Gold", sub: "99.9% Pure", metal: gold24k, color: "#F0B429" },
   { id: "gold-22k", label: "22K Gold", sub: "91.6% Jewelry", metal: gold22k, color: "#FBBF24" },
   { id: "gold-18k", label: "18K Gold", sub: "75.0% Diamond", metal: gold18k, color: "#D97706" },
   { id: "silver", label: "Silver 999", sub: "99.9% Fine", metal: silver, color: "#CBD5E1" },
 ];


 return (
   <div className="relative overflow-hidden rounded-2xl border border-[rgba(240,180,41,0.20)] bg-[rgba(6,12,24,0.92)] p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(240,180,41,0.05)]">
     <div className="glow-divider-gold absolute top-0 left-0 right-0" />
     <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-[rgba(240,180,41,0.03)] blur-3xl pointer-events-none" />


     {/* Header */}
     <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-[rgba(255,255,255,0.05)] pb-5">
       <div>
         <div className="flex items-center gap-2">
           <span className="rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest tag-gold flex items-center gap-1.5">
             <Calculator className="h-3 w-3" /> Calculator
           </span>
           <span className="rounded-md px-2 py-0.5 text-[10px] font-bold tag-emerald">
             GST {gstRate}% Applied
           </span>
         </div>
         <h2 className="mt-2.5 text-xl font-black text-white">Gold &amp; Jewelry Cost Calculator</h2>
         <p className="text-[11px] text-slate-500 mt-0.5">
           Final showroom price — includes Making Charges, BIS Hallmarking &amp; GST
         </p>
       </div>


       {/* Preset Buttons */}
       <div className="flex flex-wrap items-center gap-1.5 shrink-0">
         {presets.map((p) => (
           <button
             key={p.label}
             onClick={() => setWeightGrams(p.weight)}
             className={`rounded-xl border px-3 py-1.5 text-[11px] font-bold transition-all ${
               weightGrams === p.weight
                 ? "border-[rgba(240,180,41,0.45)] bg-[rgba(240,180,41,0.12)] text-[#F0B429]"
                 : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-slate-500 hover:border-[rgba(255,255,255,0.10)] hover:text-slate-300"
             }`}
           >
             {p.label}
           </button>
         ))}
       </div>
     </div>


     <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
       {/* LEFT: Inputs */}
       <div className="lg:col-span-7 space-y-5">


         {/* 1. Metal Selector */}
         <div>
           <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2.5">
             1 · Select Metal &amp; Purity Grade
           </label>
           <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
             {metalOptions.map((item) => (
               <button
                 key={item.id}
                 onClick={() => setSelectedMetalId(item.id)}
                 className={`rounded-xl border p-3 text-left transition-all ${
                   selectedMetalId === item.id
                     ? "shadow-md"
                     : "border-[rgba(255,255,255,0.06)] bg-[rgba(4,8,16,0.6)] hover:border-[rgba(255,255,255,0.10)]"
                 }`}
                 style={selectedMetalId === item.id ? {
                   borderColor: `${item.color}50`,
                   background: `${item.color}10`,
                   boxShadow: `0 0 20px ${item.color}12`,
                 } : {}}
               >
                 <span className="text-[11px] font-black block" style={{ color: item.color }}>{item.label}</span>
                 <span className="text-[9px] text-slate-500 block mt-0.5">{item.sub}</span>
                 <span className="price-num text-xs font-bold text-white block mt-1.5">
                   {item.metal ? (isINR ? `₹${getGramRate(item.metal).toLocaleString()}/g` : `$${(item.metal.priceUsdGram || 0).toFixed(2)}/g`) : "N/A"}
                 </span>
               </button>
             ))}
           </div>
         </div>


         {/* 2. Weight */}
         <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(4,8,16,0.6)] p-4">
           <div className="flex items-center justify-between mb-3">
             <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
               2 · Weight in Grams
             </label>
             <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
               <span>{(weightGrams / 11.6638).toFixed(2)} Tola</span>
               <span className="text-slate-600">·</span>
               <span>{(weightGrams / 8).toFixed(2)} Sovereign</span>
             </div>
           </div>


           <div className="flex items-center gap-3">
             <input
               type="number"
               min="0.1"
               step="0.1"
               value={weightGrams}
               onChange={(e) => setWeightGrams(Math.max(0.1, parseFloat(e.target.value) || 0))}
               className="price-num w-28 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2.5 text-lg font-black text-white outline-none focus:border-[rgba(240,180,41,0.45)] transition-colors"
             />
             <span className="text-sm font-bold text-slate-500">g</span>
             <input
               type="range"
               min="1"
               max="100"
               step="0.5"
               value={weightGrams}
               onChange={(e) => setWeightGrams(parseFloat(e.target.value))}
               className="flex-1 accent-[#F0B429] cursor-pointer"
             />
           </div>
         </div>


         {/* 3. Making Charges */}
         <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(4,8,16,0.6)] p-4">
           <div className="flex items-center justify-between mb-3">
             <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
               3 · Making Charges
             </label>
             <div className="flex items-center rounded-xl bg-[rgba(255,255,255,0.03)] p-0.5 text-[11px] border border-[rgba(255,255,255,0.06)]">
               <button
                 onClick={() => { setMakingChargeType("percent"); setMakingChargeValue(12); }}
                 className={`rounded-lg px-3 py-1 font-bold transition-all ${
                   makingChargeType === "percent" ? "bg-[#F0B429] text-[#040810]" : "text-slate-500 hover:text-white"
                 }`}
               >
                 % Rate
               </button>
               <button
                 onClick={() => { setMakingChargeType("per_gram"); setMakingChargeValue(350); }}
                 className={`rounded-lg px-3 py-1 font-bold transition-all ${
                   makingChargeType === "per_gram" ? "bg-[#F0B429] text-[#040810]" : "text-slate-500 hover:text-white"
                 }`}
               >
                 {isINR ? "₹" : "$"}/Gram
               </button>
             </div>
           </div>


           <div className="flex items-center gap-3">
             <input
               type="number"
               min="0"
               step={makingChargeType === "percent" ? "0.5" : "10"}
               value={makingChargeValue}
               onChange={(e) => setMakingChargeValue(Math.max(0, parseFloat(e.target.value) || 0))}
               className="price-num w-28 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-base font-bold text-white outline-none focus:border-[rgba(240,180,41,0.45)] transition-colors"
             />
             <span className="text-sm font-bold text-slate-500">
               {makingChargeType === "percent" ? "% of metal cost" : `${isINR ? "₹" : "$"}/gram`}
             </span>
           </div>
           <p className="text-[10px] text-slate-600 mt-2">
             Typical range: 8%–18% in major retail stores (Tanishq, Malabar, Kalyan, etc.)
           </p>
         </div>


         {/* 4. Hallmark & GST */}
         <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(4,8,16,0.6)] p-4">
           <div className="flex items-center gap-3">
             <input
               type="checkbox"
               id="hallmarkToggle"
               checked={includeHallmark}
               onChange={(e) => setIncludeHallmark(e.target.checked)}
               className="h-4 w-4 accent-[#F0B429] cursor-pointer"
             />
             <label htmlFor="hallmarkToggle" className="cursor-pointer">
               <span className="text-[11px] font-bold text-white block">Include BIS Hallmark Charge</span>
               <span className="text-[10px] text-slate-500 block">₹45 + 18% GST = ₹53.10 / item</span>
             </label>
           </div>
           <div className="rounded-xl px-3 py-1.5 text-right tag-emerald">
             <span className="text-[9px] font-bold uppercase tracking-wider block">Govt. GST</span>
             <span className="text-xs font-black text-white">{gstRate}% Applied</span>
           </div>
         </div>
       </div>


       {/* RIGHT: Invoice */}
       <div className="lg:col-span-5">
         <div className="sticky top-24 rounded-2xl border border-[rgba(240,180,41,0.22)] bg-[rgba(4,8,16,0.8)] p-5 shadow-[0_0_30px_rgba(240,180,41,0.06)]">
           <div className="glow-divider-gold absolute top-0 left-0 right-0 rounded-t-2xl" />


           <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4">
             <div className="flex items-center gap-2">
               <ShieldCheck className="h-4 w-4 text-[#F0B429]" />
               <h3 className="text-sm font-black text-white">Showroom Estimate</h3>
             </div>
             <span className="rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest tag-emerald">
               LIVE
             </span>
           </div>


           <div className="mt-4 space-y-2.5 text-xs">
             <div className="flex justify-between items-center">
               <span className="text-slate-500">Metal:</span>
               <span className="font-bold text-[#F0B429]">{activeMetal?.name || "Gold"}</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-slate-500">Weight:</span>
               <span className="font-bold text-white">{weightGrams} Grams</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-slate-500">Spot Rate:</span>
               <span className="price-num font-bold text-white">{isINR ? "₹" : "$"}{baseGramRate.toLocaleString()}/g</span>
             </div>


             <div className="h-px bg-[rgba(255,255,255,0.05)] my-1" />


             <div className="flex justify-between items-center">
               <span className="text-slate-400">1. Raw Metal Cost:</span>
               <span className="price-num font-bold text-white">{isINR ? "₹" : "$"}{rawMetalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-slate-400">2. Making Charges ({makingChargeType === "percent" ? `${makingChargeValue}%` : `${isINR ? "₹" : "$"}${makingChargeValue}/g`}):</span>
               <span className="price-num font-bold text-[#F0B429]">{isINR ? "₹" : "$"}{makingChargeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
             </div>
             {includeHallmark && (
               <div className="flex justify-between items-center">
                 <span className="text-slate-400">3. BIS Hallmark (incl. 18% GST):</span>
                 <span className="price-num font-bold text-slate-300">{isINR ? "₹" : "$"}{hallmarkFeeApplied.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
             )}
             <div className="flex justify-between items-center">
               <span className="text-slate-400">4. GST ({gstRate}%):</span>
               <span className="price-num font-bold text-[#F0B429]">{isINR ? "₹" : "$"}{gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
             </div>


             <div className="h-px bg-[rgba(255,255,255,0.05)] my-1" />


             {/* Total */}
             <div className="rounded-xl border border-[rgba(240,180,41,0.25)] bg-[rgba(240,180,41,0.08)] p-4">
               <span className="text-[10px] font-bold uppercase tracking-widest text-[#F0B429] block">Total Estimated Payable</span>
               <div className="mt-1.5 flex items-baseline gap-1">
                 <span className="price-num text-3xl font-black text-white">
                   {isINR ? "₹" : "$"}{finalTotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </span>
               </div>
               <p className="text-[9px] text-[rgba(240,180,41,0.60)] mt-1">
                 Final billing price in Indian retail jewelry showrooms.
               </p>
             </div>


             {/* Copy Button */}
             <button
               onClick={handleCopyReceipt}
               className="w-full mt-1 flex items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] py-2.5 text-xs font-bold text-slate-300 transition-all hover:border-[rgba(255,255,255,0.14)] hover:text-white"
             >
               {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
               {copied ? "Receipt Copied!" : "Copy Estimate"}
             </button>


             {/* Tip */}
             <div className="mt-3 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-3 text-[10px] text-slate-500 leading-relaxed flex items-start gap-2">
               <Info className="h-3.5 w-3.5 text-[#F0B429] shrink-0 mt-0.5" />
               <span>
                 <strong className="text-slate-400">Buyer Tip:</strong> Negotiate making charges — most stores allow 2–5% discount during festive offers.
               </span>
             </div>
           </div>
         </div>
       </div>
     </div>
   </div>
 );
}
