"use client";

import React, { useState } from "react";
import {
  Calculator,
  Sparkles,
  Copy,
  Check,
  Percent,
  Coins,
  ShieldCheck,
  Info,
  DollarSign,
  Share2,
  FileText,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { DailyRateData, MetalRate, TaxStructure } from "@/lib/types";

interface JewelryCalculatorProps {
  currentData: DailyRateData;
  currencyMode: "INR" | "USD";
}

export default function JewelryCalculator({
  currentData,
  currencyMode,
}: JewelryCalculatorProps) {
  const isINR = currencyMode === "INR";
  const inrCurrency = currentData?.currencies?.find((c) => c.code === "INR");
  const usdToInr = inrCurrency?.usdToRate || 83.88;

  // Extract metals safely with fallbacks
  const metals = currentData?.metals || [];
  const gold24k = metals.find((m) => m.id === "gold-24k") || metals[0];
  const gold22k = metals.find((m) => m.id === "gold-22k") || metals[1] || gold24k;
  const gold18k = metals.find((m) => m.id === "gold-18k") || metals[2] || gold24k;
  const silver = metals.find((m) => m.id === "silver") || metals[3] || gold24k;

  // Helper for INR gram rate
  const getGramRate = (metal?: MetalRate): number => {
    if (!metal) return 0;
    if (metal.priceInrGram) return metal.priceInrGram;
    const dutyMultiplier = metal.id.startsWith("gold") ? 1.09 : 1.145;
    return Number(((metal.priceUsdGram || 0) * usdToInr * dutyMultiplier).toFixed(2));
  };

  // State
  const [selectedMetalId, setSelectedMetalId] = useState<string>("gold-22k");
  const [weightGrams, setWeightGrams] = useState<number>(10);
  const [makingChargeType, setMakingChargeType] = useState<"percent" | "per_gram">("percent");
  const [makingChargeValue, setMakingChargeValue] = useState<number>(12); // 12% default making charge
  const [includeHallmark, setIncludeHallmark] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Active metal
  const activeMetal =
    metals.find((m) => m.id === selectedMetalId) || gold22k || gold24k;

  const baseGramRate = activeMetal
    ? isINR
      ? getGramRate(activeMetal)
      : activeMetal.priceUsdGram || 0
    : 0;

  // Taxes from daily JSON dataset (or defaults)
  const gstRate = currentData?.taxes?.gstPercentage || 3.0; // 3.0% GST
  const hallmarkBase = currentData?.taxes?.hallmarkFeeInr || 45.0;
  const hallmarkGst = currentData?.taxes?.hallmarkGstPercentage || 18.0;
  const hallmarkTotal = Number((hallmarkBase * (1 + hallmarkGst / 100)).toFixed(2)); // ₹53.10

  // Calculations
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

  // Item Presets
  const presets = [
    { label: "💍 Ring / Earring", weight: 4 },
    { label: "🪙 10g Bar / Coin", weight: 10 },
    { label: "📿 Gold Chain", weight: 16 },
    { label: "👑 Bangle Pair", weight: 24 },
    { label: "✨ Bridal Set", weight: 48 },
  ];

  // Copy receipt text to clipboard
  const handleCopyReceipt = () => {
    const currencySym = isINR ? "₹" : "$";
    const receiptText = `
DailyVaultRates — Gold & Jewelry Purchase Estimate
─────────────────────────────────────────────────
Date: ${currentData?.date || ""}
Item Purity: ${activeMetal?.name || "Gold"} (${activeMetal?.carat || "Spot"})
Weight: ${weightGrams} grams
Spot Rate: ${currencySym}${baseGramRate.toLocaleString()}/g

1. Raw Metal Cost:    ${currencySym}${rawMetalCost.toLocaleString()}
2. Making Charges (${makingChargeType === "percent" ? `${makingChargeValue}%` : `${currencySym}${makingChargeValue}/g`}): ${currencySym}${makingChargeAmount.toLocaleString()}
3. BIS Hallmark Fee:  ${currencySym}${hallmarkFeeApplied.toLocaleString()}
4. GST (${gstRate}%):        ${currencySym}${gstAmount.toLocaleString()}
─────────────────────────────────────────────────
TOTAL ESTIMATED PAYABLE: ${currencySym}${finalTotalAmount.toLocaleString()}
─────────────────────────────────────────────────
Verified by DailyVaultRates (https://dailyvaultrates.com)
    `.trim();

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(receiptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Top Gradient Shimmer Line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-black uppercase text-amber-400 tracking-wider">
              🧮 Interactive Calculator
            </span>
            <span className="rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              Live GST Rate: {gstRate}%
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-black text-white">Gold &amp; Jewelry Purchase Cost Calculator</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Calculate exact showroom final price including Making Charges, BIS Hallmarking &amp; GST in {currencyMode} ({isINR ? "₹" : "$"})
          </p>
        </div>

        {/* Preset Item Quick Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setWeightGrams(p.weight)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                weightGrams === p.weight
                  ? "border-amber-500 bg-amber-500/20 text-amber-300 shadow-md"
                  : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* ── Left Column: Interactive Inputs (7 cols) ── */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Metal & Purity Selector */}
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 block mb-2">
              1. Select Metal &amp; Purity Grade
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { id: "gold-24k", label: "24K Gold", sub: "99.9% Pure", metal: gold24k, color: "#F59E0B" },
                { id: "gold-22k", label: "22K Gold", sub: "91.6% Jewelry", metal: gold22k, color: "#FBBF24" },
                { id: "gold-18k", label: "18K Gold", sub: "75.0% Diamond", metal: gold18k, color: "#D97706" },
                { id: "silver", label: "Silver 999", sub: "99.9% Fine", metal: silver, color: "#94A3B8" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedMetalId(item.id)}
                  className={`rounded-2xl border p-3 text-left transition-all ${
                    selectedMetalId === item.id
                      ? "border-amber-500 bg-amber-500/15 shadow-lg"
                      : "border-slate-800 bg-slate-950 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xs font-black block" style={{ color: item.color }}>{item.label}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{item.sub}</span>
                  <span className="price-num text-xs font-bold text-white block mt-1">
                    {item.metal ? (isINR ? `₹${getGramRate(item.metal).toLocaleString()}/g` : `$${(item.metal.priceUsdGram || 0).toFixed(2)}/g`) : "N/A"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Weight Input & Slider */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                2. Enter Weight in Grams
              </label>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                <span>{(weightGrams / 11.6638).toFixed(2)} Tola</span>
                <span>·</span>
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
                className="price-num w-32 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-lg font-black text-white outline-none focus:border-amber-500"
              />
              <span className="text-sm font-bold text-slate-400">Grams</span>

              <input
                type="range"
                min="1"
                max="100"
                step="0.5"
                value={weightGrams}
                onChange={(e) => setWeightGrams(parseFloat(e.target.value))}
                className="flex-1 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Making Charges (Crafting Fee) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                3. Making Charges (Showroom Crafting Fee)
              </label>

              {/* Mode Toggle */}
              <div className="flex items-center rounded-xl bg-slate-900 p-1 text-xs">
                <button
                  onClick={() => { setMakingChargeType("percent"); setMakingChargeValue(12); }}
                  className={`rounded-lg px-3 py-1 font-bold transition-all ${
                    makingChargeType === "percent" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  % Percentage
                </button>
                <button
                  onClick={() => { setMakingChargeType("per_gram"); setMakingChargeValue(350); }}
                  className={`rounded-lg px-3 py-1 font-bold transition-all ${
                    makingChargeType === "per_gram" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Flat {isINR ? "₹" : "$"}/Gram
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
                className="price-num w-32 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-base font-bold text-white outline-none focus:border-amber-500"
              />
              <span className="text-sm font-bold text-slate-400">
                {makingChargeType === "percent" ? "% of raw gold price" : `${isINR ? "₹" : "$"}/gram`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Typical making charges range from 8% to 18% for jewelry in major retail stores (Tanishq, Malabar, Kalyan, etc.).
            </p>
          </div>

          {/* 4. BIS Hallmarking & GST Options */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="hallmarkToggle"
                checked={includeHallmark}
                onChange={(e) => setIncludeHallmark(e.target.checked)}
                className="h-4 w-4 accent-amber-500 rounded cursor-pointer"
              />
              <label htmlFor="hallmarkToggle" className="cursor-pointer">
                <span className="text-xs font-bold text-white block">Include BIS Hallmark Charge</span>
                <span className="text-[11px] text-slate-400 block">Standard Government Hallmark: ₹45 + 18% GST (₹53.10 / item)</span>
              </label>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-right">
              <span className="text-[10px] font-bold text-emerald-400 uppercase block">Government GST Rate</span>
              <span className="text-xs font-black text-white">{gstRate}% GST Applied</span>
            </div>
          </div>
        </div>

        {/* ── Right Column: Live Invoice & Itemized Receipt (5 cols) ── */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-3xl border border-amber-500/40 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-black text-white">Itemized Showroom Estimate</h3>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                LIVE
              </span>
            </div>

            {/* Receipt Summary Itemized Breakdown */}
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Selected Metal:</span>
                <span className="font-bold text-amber-400">{activeMetal?.name || "Gold"}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Total Weight:</span>
                <span className="font-bold text-white">{weightGrams} Grams</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Spot Rate ({isINR ? "₹" : "$"}/g):</span>
                <span className="price-num font-bold text-white">{isINR ? "₹" : "$"}{baseGramRate.toLocaleString()}</span>
              </div>

              <div className="h-px bg-slate-800 my-2" />

              {/* Cost components */}
              <div className="flex justify-between items-center text-slate-300">
                <span>1. Raw Metal Cost:</span>
                <span className="price-num font-bold text-white">{isINR ? "₹" : "$"}{rawMetalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>2. Making Charges ({makingChargeType === "percent" ? `${makingChargeValue}%` : `${isINR ? "₹" : "$"}${makingChargeValue}/g`}):</span>
                <span className="price-num font-bold text-amber-400">{isINR ? "₹" : "$"}{makingChargeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              {includeHallmark && (
                <div className="flex justify-between items-center text-slate-300">
                  <span>3. BIS Hallmark Fee (incl. 18% GST):</span>
                  <span className="price-num font-bold text-white">{isINR ? "₹" : "$"}{hallmarkFeeApplied.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-300">
                <span>4. Applicable GST ({gstRate}%):</span>
                <span className="price-num font-bold text-amber-400">{isINR ? "₹" : "$"}{gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="h-px bg-slate-800 my-2" />

              {/* Total Payable */}
              <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block">Total Estimated Payable Amount</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="price-num text-3xl font-black text-white">
                    {isINR ? "₹" : "$"}{finalTotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-[10px] text-amber-400/80 mt-1">
                  Exact final billing price in Indian retail jewelry showrooms.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex gap-2">
                <button
                  onClick={handleCopyReceipt}
                  className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-white py-2.5 text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? "Copied Receipt!" : "Copy Receipt"}</span>
                </button>
              </div>

              {/* Smart Buyer Insight */}
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Smart Buyer Tip:</strong> Negotiate making charges with jewelers! Most jewelry stores allow 2%–5% discount on making charges during festive offers.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
