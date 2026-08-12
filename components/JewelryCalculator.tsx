"use client";

import React, { useState } from "react";
import {
  Calculator,
  Copy,
  Check,
  ShieldCheck,
  Info,
  Sparkles,
  Layers,
  Receipt,
  Scale,
} from "lucide-react";
import { DailyRateData, MetalRate } from "@/lib/types";

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
    { label: "10g Coin", weight: 10 },
    { label: "Gold Chain", weight: 16 },
    { label: "Bangle Pair", weight: 24 },
    { label: "Bridal Set", weight: 48 },
  ];

  const handleCopyReceipt = () => {
    const sym = isINR ? "₹" : "$";
    const text = `DailyVaultRates — Purchase Estimate
Date: ${currentData?.date || ""}
Metal: ${activeMetal?.name || "Gold"} · Weight: ${weightGrams}g · Rate: ${sym}${baseGramRate}/g
Raw Metal Cost: ${sym}${rawMetalCost.toLocaleString()}
Making Charges: ${sym}${makingChargeAmount.toLocaleString()}
BIS Hallmark Fee: ${sym}${hallmarkFeeApplied.toLocaleString()} · GST (${gstRate}%): ${sym}${gstAmount.toLocaleString()}
TOTAL SHOWROOM ESTIMATE: ${sym}${finalTotalAmount.toLocaleString()}
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
    <div className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-amber-950/20 space-y-6">
      {/* Top Accent Gradient Line */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <Calculator className="h-3 w-3" /> Showroom Estimator
            </span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-extrabold text-emerald-400">
              GST {gstRate}% Included
            </span>
          </div>
          <h2 className="mt-2.5 text-xl font-black text-white sm:text-2xl">
            Jewelry &amp; Bullion Cost Calculator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Calculate accurate Indian jewelry invoice totals including Making Charges, BIS Hallmarking &amp; 3% GST.
          </p>
        </div>

        {/* Preset Weight Shortcuts */}
        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setWeightGrams(p.weight)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                weightGrams === p.weight
                  ? "border-amber-500/50 bg-amber-500/15 text-amber-400 shadow-md shadow-amber-950/40"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Metal & Purity Selector */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-amber-400" />
              1 · Select Metal &amp; Purity Grade
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {metalOptions.map((item) => {
                const isSelected = selectedMetalId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedMetalId(item.id)}
                    className={`rounded-2xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-950/30"
                        : "border-slate-800/80 bg-slate-950/60 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-xs font-black block" style={{ color: item.color }}>
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{item.sub}</span>
                    <span className="font-mono text-xs font-bold text-white block mt-2">
                      {item.metal
                        ? isINR
                          ? `₹${getGramRate(item.metal).toLocaleString()}/g`
                          : `$${(item.metal.priceUsdGram || 0).toFixed(2)}/g`
                        : "N/A"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Weight Slider & Input */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-amber-400" />
                2 · Weight in Grams
              </label>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <span>{(weightGrams / 11.6638).toFixed(2)} Tola</span>
                <span className="text-slate-600">·</span>
                <span>{(weightGrams / 8).toFixed(2)} Sovereign</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={weightGrams}
                  onChange={(e) => setWeightGrams(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="font-mono w-28 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-lg font-black text-white outline-none focus:border-amber-400 transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">g</span>
              </div>

              <input
                type="range"
                min="1"
                max="100"
                step="0.5"
                value={weightGrams}
                onChange={(e) => setWeightGrams(parseFloat(e.target.value))}
                className="flex-1 accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          {/* 3. Making Charges */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-amber-400" />
                3 · Making &amp; Crafting Charges
              </label>
              <div className="flex items-center rounded-xl bg-slate-900 p-1 text-[11px] border border-slate-800">
                <button
                  onClick={() => { setMakingChargeType("percent"); setMakingChargeValue(12); }}
                  className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                    makingChargeType === "percent" ? "bg-amber-400 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  % Rate
                </button>
                <button
                  onClick={() => { setMakingChargeType("per_gram"); setMakingChargeValue(350); }}
                  className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                    makingChargeType === "per_gram" ? "bg-amber-400 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  ₹ / Gram
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                step="0.5"
                value={makingChargeValue}
                onChange={(e) => setMakingChargeValue(Math.max(0, parseFloat(e.target.value) || 0))}
                className="font-mono w-28 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-base font-bold text-white outline-none focus:border-amber-400 transition-colors"
              />
              <span className="text-xs font-bold text-slate-400">
                {makingChargeType === "percent" ? "% of raw metal value" : `${isINR ? "₹" : "$"}/g crafting fee`}
              </span>
            </div>
          </div>

          {/* 4. BIS Hallmark Checkbox */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">Include BIS Hallmark Fee</span>
                <span className="text-[10px] text-slate-400">Mandatory Government Hallmark Token</span>
              </div>
            </div>

            <input
              type="checkbox"
              checked={includeHallmark}
              onChange={(e) => setIncludeHallmark(e.target.checked)}
              className="h-5 w-5 rounded border-slate-700 bg-slate-900 accent-amber-400 cursor-pointer"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Invoice Receipt Breakdown */}
        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-slate-950/80 p-5 backdrop-blur-xl space-y-4 shadow-xl shadow-amber-950/40">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Cost Breakdown Matrix
              </span>
              <button
                onClick={handleCopyReceipt}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-amber-400" />}
                <span>{copied ? "Copied!" : "Copy Invoice"}</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Selected Metal</span>
                <span className="font-bold text-white">{activeMetal?.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Weight</span>
                <span className="font-mono font-bold text-white">{weightGrams} Grams</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gram Rate</span>
                <span className="font-mono font-bold text-white">{isINR ? "₹" : "$"}{baseGramRate}/g</span>
              </div>

              <div className="border-t border-slate-800/80 pt-2 flex justify-between">
                <span className="text-slate-300">Raw Metal Value</span>
                <span className="font-mono font-bold text-white">{isINR ? "₹" : "$"}{rawMetalCost.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Making Charges ({makingChargeType === "percent" ? `${makingChargeValue}%` : `${isINR ? "₹" : "$"}${makingChargeValue}/g`})</span>
                <span className="font-mono font-bold text-amber-400">+{isINR ? "₹" : "$"}{makingChargeAmount.toLocaleString()}</span>
              </div>

              {includeHallmark && (
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>BIS Hallmark Fee</span>
                  <span className="font-mono font-bold text-slate-300">+{isINR ? "₹" : "$"}{hallmarkFeeApplied.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-300">
                <span>GST Tax ({gstRate}%)</span>
                <span className="font-mono font-bold text-emerald-400">+{isINR ? "₹" : "$"}{gstAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Total Amount Display */}
            <div className="border-t-2 border-dashed border-slate-800 pt-4 mt-2 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                Estimated Showroom Invoice Total
              </span>
              <p className="font-mono text-3xl font-black text-white">
                {isINR ? "₹" : "$"}{finalTotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                *Inclusive of all taxes &amp; crafting charges
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
