"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  Zap,
  TrendingUp,
  Calculator,
  Search,
  ShieldCheck,
  ChevronRight,
  Vault,
} from "lucide-react";

export default function ReleaseAnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the V2.0 announcement
    const seen = localStorage.getItem("dvr_v2_announcement_dismissed");
    if (!seen) {
      // Entry delay for smooth animation after initial load
      const timer = setTimeout(() => setIsOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      localStorage.setItem("dvr_v2_announcement_dismissed", "true");
    } catch (e) {
      // Storage unavailable fallback
    }
  };

  if (!isOpen) return null;

  const features = [
    {
      icon: Sparkles,
      title: "Apex V2.0 UI Revamp",
      desc: "Cinematic void-black aesthetic with atmospheric glows, metallic gold gradients, and glassmorphism.",
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.10)",
      border: "rgba(245,158,11,0.25)",
    },
    {
      icon: TrendingUp,
      title: "NSE / BSE Indian Equities",
      desc: "Live NIFTY 50 & SENSEX benchmark indices, top blue-chip stock quotes, and 12-hr fundamental analytics.",
      color: "#10B981",
      bg: "rgba(16,185,129,0.10)",
      border: "rgba(16,185,129,0.25)",
    },
    {
      icon: Zap,
      title: "Infinite Spot Ticker Tape",
      desc: "Real-time scrolling ticker showcasing Gold 24K, Silver 999, USD/INR forex, and benchmark market quotes.",
      color: "#00D4FF",
      bg: "rgba(0,212,255,0.10)",
      border: "rgba(0,212,255,0.25)",
    },
    {
      icon: Calculator,
      title: "Showroom Jewelry Calculator",
      desc: "Instant showroom invoice breakdown with making charges, BIS Hallmark fee, and 3% GST calculation.",
      color: "#FBBF24",
      bg: "rgba(251,191,36,0.10)",
      border: "rgba(251,191,36,0.25)",
    },
    {
      icon: Search,
      title: "Cmd+K Market Search",
      desc: "Fuzzy typo-tolerant search engine to find Indian stocks, spot metals, and exchange rates in milliseconds.",
      color: "#818CF8",
      bg: "rgba(129,140,248,0.10)",
      border: "rgba(129,140,248,0.25)",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020409]/85 backdrop-blur-md transition-opacity duration-300"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl p-6 sm:p-8 text-left shadow-2xl transition-all duration-300 animate-fade-up"
        style={{
          background: "rgba(6, 11, 20, 0.96)",
          border: "1px solid rgba(245, 158, 11, 0.28)",
          boxShadow: "0 0 80px rgba(245, 158, 11, 0.15), 0 20px 60px rgba(0, 0, 0, 0.95)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Shimmer Accent Line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FBBF24] to-transparent" />

        {/* Ambient Radial Glow Orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-24 right-0 h-64 w-64 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-24 -left-12 h-64 w-64 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)" }}
          />
        </div>

        <div className="relative">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FBBF24] via-[#F59E0B] to-[#D97706] shadow-[0_0_24px_rgba(245,158,11,0.40)]">
              <Vault className="h-6 w-6 text-[#020409]" strokeWidth={2.5} />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-400">
                <Sparkles className="h-3 w-3" /> Version 2.0 Apex Release
              </span>
              <h2
                className="mt-1 text-2xl sm:text-3xl font-black text-white leading-tight"
                style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
              >
                Welcome to Daily<span className="text-gold-gradient-v3">Vault</span>Rates 2.0
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            We are thrilled to unveil our biggest platform revamp yet! Engineered as an institutional-grade financial terminal with live Indian equity markets, precision spot metals, and intelligent calculators.
          </p>

          {/* 5 Key Feature Cards */}
          <div className="space-y-2.5 mb-6 max-h-[50vh] overflow-y-auto pr-1">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="flex items-start gap-3.5 rounded-2xl p-3.5 transition-all hover:translate-x-1"
                  style={{
                    background: feat.bg,
                    border: `1px solid ${feat.border}`,
                  }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: "rgba(2,4,9,0.70)",
                      border: `1px solid ${feat.border}`,
                    }}
                  >
                    <Icon className="h-4.5 w-4.5" style={{ color: feat.color }} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {feat.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>IBJA &amp; SEBI Verified Market Feeds</span>
            </div>

            <button
              onClick={handleClose}
              className="btn-gold w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-xs font-black transition-all hover:scale-[1.02]"
            >
              <span>Explore Vault 2.0</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
