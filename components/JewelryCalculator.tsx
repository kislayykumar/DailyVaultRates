"use client";

import React, { useState } from "react";
import {
  Calculator,
  Copy,
  Check,
  ShieldCheck,
  Layers,
  Receipt,
  Scale,
  Sparkles,
  ChevronDown,
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
  const silver  = metals.find((m) => m.id === "silver")   || metals[3] || gold24k;

  const getGramRate = (metal?: MetalRate): number => {
    if (!metal) return 0;
    if (metal.priceInrGram) return metal.priceInrGram;
    const dutyMultiplier = metal.id.startsWith("gold") ? 1.09 : 1.145;
    return Number(((metal.priceUsdGram || 0) * usdToInr * dutyMultiplier).toFixed(2));
  };

  const [selectedMetalId,    setSelectedMetalId]    = useState<string>("gold-22k");
  const [weightGrams,         setWeightGrams]         = useState<number>(10);
  const [makingChargeType,    setMakingChargeType]    = useState<"percent" | "per_gram">("percent");
  const [makingChargeValue,   setMakingChargeValue]   = useState<number>(12);
  const [includeHallmark,     setIncludeHallmark]     = useState<boolean>(true);
  const [copied,              setCopied]              = useState<boolean>(false);

  const activeMetal   = metals.find((m) => m.id === selectedMetalId) || gold22k || gold24k;
  const baseGramRate  = activeMetal ? (isINR ? getGramRate(activeMetal) : activeMetal.priceUsdGram || 0) : 0;

  const gstRate        = currentData?.taxes?.gstPercentage        || 3.0;
  const hallmarkBase   = currentData?.taxes?.hallmarkFeeInr        || 45.0;
  const hallmarkGst    = currentData?.taxes?.hallmarkGstPercentage || 18.0;
  const hallmarkTotal  = Number((hallmarkBase * (1 + hallmarkGst / 100)).toFixed(2));

  const rawMetalCost = Number((baseGramRate * weightGrams).toFixed(2));
  const makingChargeAmount =
    makingChargeType === "percent"
      ? Number(((rawMetalCost * makingChargeValue) / 100).toFixed(2))
      : Number((makingChargeValue * weightGrams).toFixed(2));

  const hallmarkFeeApplied = includeHallmark
    ? isINR ? hallmarkTotal : Number((hallmarkTotal / usdToInr).toFixed(2))
    : 0;
  const subtotalBeforeGst = rawMetalCost + makingChargeAmount;
  const gstAmount         = Number(((subtotalBeforeGst * gstRate) / 100).toFixed(2));
  const finalTotalAmount  = Number((subtotalBeforeGst + gstAmount + hallmarkFeeApplied).toFixed(2));

  const sym = isINR ? "₹" : "$";

  const presets = [
    { label: "Ring",    weight: 4  },
    { label: "10g Coin", weight: 10 },
    { label: "Chain",   weight: 16 },
    { label: "Bangle",  weight: 24 },
    { label: "Bridal",  weight: 48 },
  ];

  const metalOptions = [
    { id: "gold-24k", label: "24K",    sub: "99.9%",   metal: gold24k, color: "#F0B429" },
    { id: "gold-22k", label: "22K",    sub: "91.6%",   metal: gold22k, color: "#FBBF24" },
    { id: "gold-18k", label: "18K",    sub: "75.0%",   metal: gold18k, color: "#D97706" },
    { id: "silver",   label: "Silver", sub: "99.9%",   metal: silver,  color: "#CBD5E1" },
  ];

  const handleCopyReceipt = () => {
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

  return (
    <div className="w-full space-y-0">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="pb-4 mb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
            style={{ background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.28)", color: "#FBBF24" }}>
            <Calculator className="h-3 w-3" /> Showroom Estimator
          </span>
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold"
            style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.28)", color: "#34D399" }}>
            GST {gstRate}% Included
          </span>
        </div>
        <h2 className="text-[17px] font-black text-white leading-snug"
          style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
          Jewelry &amp; Bullion<br />Cost Calculator
        </h2>
        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
          Calculate accurate Indian jewelry invoice totals including Making Charges, BIS Hallmarking &amp; 3% GST.
        </p>
      </div>

      {/* ── PRESET WEIGHT BUTTONS ──────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => setWeightGrams(p.weight)}
            className="rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all duration-200"
            style={
              weightGrams === p.weight
                ? { background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.40)", color: "#FBBF24" }
                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748B" }
            }
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── STEP 1: METAL SELECTOR ─────────────────────────────────── */}
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
          <Layers className="h-3 w-3 text-amber-400" /> 1 · Select Metal &amp; Purity Grade
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {metalOptions.map((item) => {
            const isSelected = selectedMetalId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedMetalId(item.id)}
                className="rounded-xl p-2.5 text-center transition-all duration-200"
                style={{
                  background: isSelected ? `${item.color}14` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isSelected ? item.color + "40" : "rgba(255,255,255,0.07)"}`,
                }}
              >
                <span className="text-[11px] font-black block" style={{ color: item.color }}>{item.label}</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">{item.sub}</span>
                <span className="price-num text-[10px] font-bold text-white block mt-1.5">
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

      {/* ── STEP 2: WEIGHT ─────────────────────────────────────────── */}
      <div className="mb-4 rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <Scale className="h-3 w-3 text-amber-400" /> 2 · Weight in Grams
          </label>
          <span className="text-[10px] font-mono text-slate-500">
            {(weightGrams / 8).toFixed(2)} Sovereign
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={weightGrams}
              onChange={(e) => setWeightGrams(Math.max(0.1, parseFloat(e.target.value) || 0))}
              className="price-num w-20 rounded-lg px-3 py-2 text-base font-black text-white outline-none transition-colors"
              style={{ background: "rgba(2,4,9,0.80)", border: "1px solid rgba(255,255,255,0.10)" }}
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">g</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            step="0.5"
            value={weightGrams}
            onChange={(e) => setWeightGrams(parseFloat(e.target.value))}
            className="flex-1 accent-amber-400 cursor-pointer h-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
        </div>
      </div>

      {/* ── STEP 3: MAKING CHARGES ─────────────────────────────────── */}
      <div className="mb-4 rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <Receipt className="h-3 w-3 text-amber-400" /> 3 · Making &amp; Crafting Charges
          </label>
          {/* Toggle */}
          <div className="flex items-center rounded-lg p-0.5 text-[10px]"
            style={{ background: "rgba(2,4,9,0.80)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <button
              onClick={() => { setMakingChargeType("percent"); setMakingChargeValue(12); }}
              className="rounded-md px-2.5 py-1 font-bold transition-all"
              style={makingChargeType === "percent"
                ? { background: "#F59E0B", color: "#020409" }
                : { color: "#64748B" }}
            >% Rate</button>
            <button
              onClick={() => { setMakingChargeType("per_gram"); setMakingChargeValue(350); }}
              className="rounded-md px-2.5 py-1 font-bold transition-all"
              style={makingChargeType === "per_gram"
                ? { background: "#F59E0B", color: "#020409" }
                : { color: "#64748B" }}
            >₹/Gram</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="0.5"
            value={makingChargeValue}
            onChange={(e) => setMakingChargeValue(Math.max(0, parseFloat(e.target.value) || 0))}
            className="price-num w-20 rounded-lg px-3 py-2 text-base font-bold text-white outline-none transition-colors"
            style={{ background: "rgba(2,4,9,0.80)", border: "1px solid rgba(255,255,255,0.10)" }}
          />
          <span className="text-[11px] text-slate-500">
            {makingChargeType === "percent" ? "% of raw metal value" : `${sym}/g crafting fee`}
          </span>
        </div>
      </div>

      {/* ── STEP 4: BIS HALLMARK ───────────────────────────────────── */}
      <div className="mb-5 rounded-xl px-3.5 py-3 flex items-center justify-between"
        style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.18)" }}>
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-[11px] font-bold text-white block">Include BIS Hallmark Fee</span>
            <span className="text-[10px] text-slate-500">Mandatory Government Hallmark Token</span>
          </div>
        </div>
        <input
          type="checkbox"
          checked={includeHallmark}
          onChange={(e) => setIncludeHallmark(e.target.checked)}
          className="h-4 w-4 rounded cursor-pointer accent-amber-400"
        />
      </div>

      {/* ── COST BREAKDOWN RECEIPT ─────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(2,4,9,0.90)", border: "1px solid rgba(245,158,11,0.22)", boxShadow: "0 0 40px rgba(245,158,11,0.08)" }}>

        {/* Receipt Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(245,158,11,0.05)" }}>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Cost Breakdown Matrix
          </span>
          <button
            onClick={handleCopyReceipt}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all hover:scale-[1.03]"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#94A3B8" }}
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-amber-400" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Line items */}
        <div className="px-4 py-3 space-y-2 text-[12px]">
          <div className="flex justify-between text-slate-500">
            <span>Selected Metal</span>
            <span className="font-bold text-white">{activeMetal?.name}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Weight</span>
            <span className="price-num font-bold text-white">{weightGrams} Grams</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Gram Rate</span>
            <span className="price-num font-bold text-white">{sym}{baseGramRate.toLocaleString()}/g</span>
          </div>

          <div className="border-t pt-2.5 mt-1" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="flex justify-between text-slate-300">
              <span>Raw Metal Value</span>
              <span className="price-num font-bold text-white">{sym}{rawMetalCost.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Making Charges ({makingChargeType === "percent" ? `${makingChargeValue}%` : `${sym}${makingChargeValue}/g`})</span>
            <span className="price-num font-bold text-amber-400">+{sym}{makingChargeAmount.toLocaleString()}</span>
          </div>

          {includeHallmark && (
            <div className="flex justify-between text-slate-400">
              <span>BIS Hallmark Fee</span>
              <span className="price-num font-bold text-slate-300">+{sym}{hallmarkFeeApplied.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-300">
            <span>GST Tax ({gstRate}%)</span>
            <span className="price-num font-bold text-emerald-400">+{sym}{gstAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Total */}
        <div className="mx-4 mb-4 rounded-xl px-4 py-4 text-center"
          style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.06))", border: "1px solid rgba(245,158,11,0.28)" }}>
          <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 block mb-1">
            Estimated Showroom Invoice Total
          </span>
          <p className="price-num text-3xl font-black text-white leading-none">
            {sym}{finalTotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500 mt-1.5">
            *Inclusive of all taxes &amp; crafting charges
          </p>
        </div>
      </div>
    </div>
  );
}
