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
  Vault,
  Heart,
} from "lucide-react";

export default function ReleaseAnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has already dismissed the V2.0 announcement
    try {
      const seen = localStorage.getItem("dvr_v2_announcement_dismissed");
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
      localStorage.setItem("dvr_v2_announcement_dismissed", "true");
    } catch {
      /* Storage unavailable fallback */
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

  const features = [
    {
      icon: Sparkles,
      title: "Apex V3.0 Design System",
      desc: "Cinematic void-black aesthetic with atmospheric glows, metallic gold gradients, and glassmorphism.",
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.22)",
    },
    {
      icon: TrendingUp,
      title: "NSE / BSE Live Indian Equities",
      desc: "Live NIFTY 50 & SENSEX benchmark indices, top blue-chip stock quotes, and deep financial health analytics.",
      color: "#10B981",
      bg: "rgba(16,185,129,0.08)",
      border: "rgba(16,185,129,0.22)",
    },
    {
      icon: Zap,
      title: "Dynamic UPI Support & Instant QR",
      desc: "Support solo developer with dynamic QR codes generated instantly for your custom amounts.",
      color: "#00D4FF",
      bg: "rgba(0,212,255,0.08)",
      border: "rgba(0,212,255,0.22)",
    },
  ];

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(2,4,9,0.88)", backdropFilter: "blur(20px)" }}
      onClick={handleClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl"
        style={{
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
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-80 rounded-full"
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

        <div className="p-6 sm:p-7">
          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative shrink-0">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(245,158,11,0.20) 0%, rgba(217,119,6,0.10) 100%)",
                  border: "1px solid rgba(245,158,11,0.30)",
                  boxShadow: "0 0 24px rgba(245,158,11,0.18)",
                }}
              >
                <Vault className="h-6 w-6 text-amber-400" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 font-mono text-[9px] font-black text-[#020409]">
                v3
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest"
                  style={{
                    background: "rgba(245,158,11,0.12)",
                    border: "1px solid rgba(245,158,11,0.30)",
                    color: "#F59E0B",
                  }}
                >
                  NEW RELEASE
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  DailyVaultRates V3.0
                </span>
              </div>
              <h2
                className="mt-1 text-xl font-black text-white"
                style={{
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                  letterSpacing: "-0.02em",
                }}
              >
                Welcome to Vault Apex 3.0
              </h2>
            </div>
          </div>

          {/* Features Grid */}
          <div className="space-y-3 mb-6">
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
                      background: "rgba(6,11,20,0.80)",
                      border: `1px solid ${feat.border}`,
                    }}
                  >
                    <Icon className="h-4.5 w-4.5" style={{ color: feat.color }} />
                  </div>
                  <div>
                    <h3
                      className="text-xs font-black text-white"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
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

          {/* Action Bar */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>IBJA &amp; SEBI Verified Feeds</span>
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
              <span>Explore Vault 3.0</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
