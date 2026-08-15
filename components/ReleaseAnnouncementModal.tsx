"use client";

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  Sparkles,
  X,
  Zap,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Vault,
  BarChart3,
  Calculator,
  Coins,
  Globe,
  Layers,
  Lock,
  Mail,
  CheckCircle2,
  Cpu,
  Activity,
} from "lucide-react";

interface VersionRelease {
  version: "v3.0" | "v2.0" | "v1.0";
  title: string;
  subtitle: string;
  tag: string;
  badgeColor: string;
  date: string;
  summary: string;
  stats: { label: string; val: string }[];
  features: {
    icon: any;
    title: string;
    desc: string;
    highlight: string;
    color: string;
    bg: string;
    border: string;
  }[];
}

const RELEASES: VersionRelease[] = [
  {
    version: "v3.0",
    title: "Vault Apex 3.0 — Enterprise Architecture",
    subtitle: "DailyVaultRates V3.0",
    tag: "CURRENT RELEASE",
    badgeColor: "#F59E0B",
    date: "August 2026",
    summary:
      "A ground-up architectural evolution introducing Portal-based Modal Rendering, Live Indian Equity Analytics, Dynamic UPI QR Payments, and Brevo Email Verification.",
    stats: [
      { label: "Architecture", val: "React Portal v3" },
      { label: "Markets", val: "Equities + Metals" },
      { label: "Verification", val: "IBJA & SEBI" },
    ],
    features: [
      {
        icon: Sparkles,
        title: "Apex Void-Black Design System",
        desc: "Cinematic multi-layered atmospheric mesh background, glassmorphism cards (blur 24px), dynamic glowing borders, and gold shimmer accent bars.",
        highlight: "Design System",
        color: "#F59E0B",
        bg: "rgba(245,158,11,0.08)",
        border: "rgba(245,158,11,0.22)",
      },
      {
        icon: TrendingUp,
        title: "Live NSE / BSE Equity Intelligence",
        desc: "Real-time NIFTY 50 and SENSEX benchmark cards alongside 6 blue-chip stock quotes with 12-hour fundamental health ratios (Trailing P/E, Debt-to-Equity, ROE).",
        highlight: "Stock Markets",
        color: "#10B981",
        bg: "rgba(16,185,129,0.08)",
        border: "rgba(16,185,129,0.22)",
      },
      {
        icon: Zap,
        title: "Dynamic UPI Support & Instant QR Engine",
        desc: "Support solo developer with custom tip amounts (₹49, ₹99, ₹199, ₹499 or custom). Instant live QR code generation via QRServer API + mobile app deep links.",
        highlight: "UPI Payments",
        color: "#00D4FF",
        bg: "rgba(0,212,255,0.08)",
        border: "rgba(0,212,255,0.22)",
      },
      {
        icon: Mail,
        title: "Private Brevo Email Verification & Unsubscribe",
        desc: "Subscribe to morning 6:00 AM UTC rate digests with privacy protection. Full self-serve unsubscribe tab verifying Brevo contact database existence.",
        highlight: "Email Privacy",
        color: "#818CF8",
        bg: "rgba(129,140,248,0.08)",
        border: "rgba(129,140,248,0.22)",
      },
    ],
  },
  {
    version: "v2.0",
    title: "Vault 2.0 — Market Ticker & Estimator",
    subtitle: "DailyVaultRates V2.0",
    tag: "MAJOR MILESTONE",
    badgeColor: "#10B981",
    date: "July 2026",
    summary:
      "Introduced real-time Indian stock market feeds, infinite marquee ticker tape, and showroom jewelry cost matrix with BIS hallmarking.",
    stats: [
      { label: "Ticker Feed", val: "Infinite Loop" },
      { label: "Estimator", val: "3% GST Matrix" },
      { label: "Tax System", val: "BIS Hallmark" },
    ],
    features: [
      {
        icon: BarChart3,
        title: "Real-Time Equity Benchmarks",
        desc: "Integrated live NIFTY 50 and SENSEX indices into the primary dashboard with market open/close IST indicator and 15-minute delayed disclosure.",
        highlight: "Benchmarks",
        color: "#10B981",
        bg: "rgba(16,185,129,0.08)",
        border: "rgba(16,185,129,0.22)",
      },
      {
        icon: Calculator,
        title: "Showroom Jewelry & Bullion Estimator",
        desc: "Interactive purchase calculator supporting 24K, 22K, 18K Gold and Silver. Auto-calculates % Making Charges, ₹45 BIS Hallmark Token, and 3% GST.",
        highlight: "Estimator Tool",
        color: "#F59E0B",
        bg: "rgba(245,158,11,0.08)",
        border: "rgba(245,158,11,0.22)",
      },
      {
        icon: Zap,
        title: "Infinite Spot Ticker Tape",
        desc: "Hardware-accelerated CSS marquee banner scrolling live Gold 24K, Silver 999, USD/INR forex, and equity index quotes at top of screen.",
        highlight: "Live Ticker",
        color: "#818CF8",
        bg: "rgba(129,140,248,0.08)",
        border: "rgba(129,140,248,0.22)",
      },
      {
        icon: Cpu,
        title: "Historical Trend Recharts Engine",
        desc: "Interactive AreaChart modal powered by Recharts, enabling 1g, 10g, 1kg, and oz display unit toggles across historical date datasets.",
        highlight: "Analytics Chart",
        color: "#00D4FF",
        bg: "rgba(0,212,255,0.08)",
        border: "rgba(0,212,255,0.22)",
      },
    ],
  },
  {
    version: "v1.0",
    title: "Vault 1.0 — Core Spot Rate Launch",
    subtitle: "DailyVaultRates V1.0",
    tag: "FOUNDATIONAL LAUNCH",
    badgeColor: "#6366F1",
    date: "June 2026",
    summary:
      "The foundational release establishing IBJA-verified spot rate tracking for Gold, Silver, Platinum, Aluminum, and 8 major global fiat currencies.",
    stats: [
      { label: "Core Metals", val: "Gold/Silver/Plat" },
      { label: "Currencies", val: "8 Fiat Currencies" },
      { label: "Data Store", val: "Immutable JSON" },
    ],
    features: [
      {
        icon: Coins,
        title: "Spot Precious Metals Vault",
        desc: "Daily spot rates for Gold 24K (99.9%), Gold 22K (91.6%), Gold 18K (75%), Silver 999, Platinum, and Aluminum with IBJA cross-verification.",
        highlight: "Spot Pricing",
        color: "#F59E0B",
        bg: "rgba(245,158,11,0.08)",
        border: "rgba(245,158,11,0.22)",
      },
      {
        icon: Globe,
        title: "Multi-Currency INR & USD Converter",
        desc: "Seamless toggle between Indian Rupees (₹) and US Dollars ($), dynamically converting spot metal weights (/10g, /kg, /oz) across currencies.",
        highlight: "Forex Engine",
        color: "#00D4FF",
        bg: "rgba(0,212,255,0.08)",
        border: "rgba(0,212,255,0.22)",
      },
      {
        icon: Layers,
        title: "Historical Calendar Date Archive",
        desc: "Dynamic Next.js app directory routing (`/archive/[year]/[month]/[day]`) rendering historical spot rate snapshots from clean JSON data files.",
        highlight: "Archive Routing",
        color: "#10B981",
        bg: "rgba(16,185,129,0.08)",
        border: "rgba(16,185,129,0.22)",
      },
      {
        icon: Lock,
        title: "Immutable Static Data Files",
        desc: "Zero-dependency static file storage architecture storing daily rates in `/data/YYYY/MM/DD.json` to guarantee instant load times and 100% uptime.",
        highlight: "Zero Downtime",
        color: "#818CF8",
        bg: "rgba(129,140,248,0.08)",
        border: "rgba(129,140,248,0.22)",
      },
    ],
  },
];

export default function ReleaseAnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeVersionIndex, setActiveVersionIndex] = useState(0); // 0 = v3.0 (latest)

  useEffect(() => {
    setMounted(true);
    try {
      const seen = localStorage.getItem("dvr_v3_announcement_dismissed");
      if (!seen) {
        const timer = setTimeout(() => setIsOpen(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      /* fallback */
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      localStorage.setItem("dvr_v3_announcement_dismissed", "true");
    } catch {
      /* fallback */
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const currentRelease = RELEASES[activeVersionIndex];

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(2,4,9,0.90)", backdropFilter: "blur(20px)" }}
      onClick={handleClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl"
        style={{
          maxHeight: "92vh",
          background: "linear-gradient(145deg, rgba(12,17,32,0.99) 0%, rgba(6,10,22,0.99) 100%)",
          border: "1px solid rgba(245,158,11,0.20)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.85), 0 0 60px rgba(245,158,11,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Shimmer Accent Line */}
        <div
          className="h-[2px] w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #F59E0B 40%, #10B981 60%, transparent 100%)",
          }}
        />

        {/* Ambient Top Glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(245,158,11,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-all hover:text-white hover:bg-white/8"
          style={{ border: "1px solid rgba(255,255,255,0.09)" }}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-7 overflow-y-auto max-h-[88vh]">
          {/* Version Selector Tabs (v3.0, v2.0, v1.0) */}
          <div className="flex items-center justify-between gap-2 mb-5 pb-3 border-b border-white/6">
            <div className="flex items-center gap-1.5">
              {RELEASES.map((rel, idx) => {
                const isActive = activeVersionIndex === idx;
                return (
                  <button
                    key={rel.version}
                    onClick={() => setActiveVersionIndex(idx)}
                    className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition-all duration-200"
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, rgba(245,158,11,0.20), rgba(217,119,6,0.10))"
                        : "rgba(255,255,255,0.04)",
                      border: isActive
                        ? "1px solid rgba(245,158,11,0.50)"
                        : "1px solid rgba(255,255,255,0.08)",
                      color: isActive ? "#F59E0B" : "#64748B",
                    }}
                  >
                    <span>{rel.version}</span>
                    {idx === 0 && (
                      <span className="text-[9px] text-amber-400 font-bold">★ CURRENT</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-1">
              <button
                disabled={activeVersionIndex === RELEASES.length - 1}
                onClick={() => setActiveVersionIndex((prev) => Math.min(RELEASES.length - 1, prev + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 disabled:opacity-25 disabled:cursor-not-allowed hover:text-white hover:bg-white/5 transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                title="Older release"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={activeVersionIndex === 0}
                onClick={() => setActiveVersionIndex((prev) => Math.max(0, prev - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 disabled:opacity-25 disabled:cursor-not-allowed hover:text-white hover:bg-white/5 transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                title="Newer release"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Release Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative shrink-0">
              <div
                className="flex h-13 w-13 items-center justify-center rounded-2xl p-3"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(245,158,11,0.20) 0%, rgba(217,119,6,0.10) 100%)",
                  border: "1px solid rgba(245,158,11,0.30)",
                  boxShadow: "0 0 24px rgba(245,158,11,0.18)",
                }}
              >
                <Vault className="h-7 w-7 text-amber-400" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 font-mono text-[9px] font-black text-[#020409]">
                {currentRelease.version}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest"
                  style={{
                    background: `${currentRelease.badgeColor}18`,
                    border: `1px solid ${currentRelease.badgeColor}40`,
                    color: currentRelease.badgeColor,
                  }}
                >
                  {currentRelease.tag}
                </span>
                <span className="text-[11px] text-slate-500 font-mono font-medium">
                  {currentRelease.date}
                </span>
              </div>
              <h2
                className="text-xl font-black text-white"
                style={{
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                  letterSpacing: "-0.02em",
                }}
              >
                {currentRelease.title}
              </h2>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                {currentRelease.summary}
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {currentRelease.stats.map((st) => (
              <div
                key={st.label}
                className="rounded-xl p-2.5 text-center"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-0.5">
                  {st.label}
                </span>
                <span className="font-mono text-xs font-black text-white">
                  {st.val}
                </span>
              </div>
            ))}
          </div>

          {/* Detailed Features List */}
          <div className="space-y-3 mb-6">
            {currentRelease.features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="flex items-start gap-3.5 rounded-2xl p-4 transition-all hover:translate-x-1"
                  style={{
                    background: feat.bg,
                    border: `1px solid ${feat.border}`,
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: "rgba(6,11,20,0.80)",
                      border: `1px solid ${feat.border}`,
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: feat.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3
                        className="text-xs font-black text-white"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        {feat.title}
                      </h3>
                      <span
                        className="rounded px-2 py-0.5 text-[9px] font-extrabold shrink-0"
                        style={{
                          background: `${feat.color}15`,
                          border: `1px solid ${feat.color}30`,
                          color: feat.color,
                        }}
                      >
                        {feat.highlight}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>IBJA &amp; SEBI Verified Market Feeds</span>
            </div>

            <button
              onClick={handleClose}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-xs font-black text-[#020409] transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                boxShadow: "0 4px 20px rgba(245,158,11,0.28)",
              }}
            >
              <span>Explore {currentRelease.version} Vault</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
