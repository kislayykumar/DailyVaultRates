"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import ReactDOM from "react-dom";
import { X, Heart, Copy, Check, Smartphone, Sparkles, Star, QrCode, IndianRupee } from "lucide-react";

const UPI_ID   = "kislay9351-5@okicici";
const UPI_NAME = "Kislay Kumar";

/** Build a UPI deep-link, optionally with an amount */
function buildUpiLink(amount?: number | null) {
  const base = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&cu=INR`;
  return amount && amount > 0 ? `${base}&am=${amount}` : base;
}

/** Build QR URL for qrserver.com — dynamically includes amount in data */
function buildQrUrl(amount?: number | null, size = 180) {
  const data = encodeURIComponent(buildUpiLink(amount));
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${data}&margin=10&color=000000&bgcolor=ffffff&ecc=M`;
}

const PRESETS = [
  { emoji: "☕", label: "Coffee",   value: 49  },
  { emoji: "🍕", label: "Pizza",    value: 99  },
  { emoji: "⭐", label: "Support",  value: 199 },
  { emoji: "🚀", label: "Champion", value: 499 },
];

const UPI_APPS = [
  { name: "GPay",    color: "#34A853", base: `gpay://upi/pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&cu=INR`    },
  { name: "PhonePe", color: "#5F259F", base: `phonepe://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&cu=INR`     },
  { name: "Paytm",   color: "#00B9F1", base: `paytmmp://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&cu=INR`    },
  { name: "BHIM",    color: "#F57C00", base: `bhim://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&cu=INR`       },
];

interface Props { isOpen: boolean; onClose: () => void; }

export default function SupportDeveloperModal({ isOpen, onClose }: Props) {
  const [mounted,        setMounted]        = useState(false);
  const [copied,         setCopied]         = useState(false);
  const [showThanks,     setShowThanks]     = useState(false);

  // Amount state
  const [preset,         setPreset]         = useState<number | null>(null);   // one of PRESETS values
  const [customRaw,      setCustomRaw]      = useState("");                    // raw input string
  const [customFocused,  setCustomFocused]  = useState(false);

  // QR load state
  const [qrKey,          setQrKey]          = useState(0);   // increment to force img re-fetch
  const [qrLoaded,       setQrLoaded]       = useState(false);
  const [qrError,        setQrError]        = useState(false);

  /* ── Derived amount ─────────────────────────────────────────── */
  const customNum = parseInt(customRaw, 10);
  const customValid = !isNaN(customNum) && customNum > 0 && customNum <= 100000;
  // Active amount: custom (if valid & typed) overrides preset
  const activeAmount: number | null = useMemo(() => {
    if (customRaw !== "" && customValid) return customNum;
    if (preset !== null) return preset;
    return null;
  }, [customRaw, customValid, customNum, preset]);

  /* ── Rebuild QR whenever active amount changes ──────────────── */
  useEffect(() => {
    setQrLoaded(false);
    setQrError(false);
    setQrKey(k => k + 1);
  }, [activeAmount]);

  /* ── Mount guard (portal needs client) ─────────────────────── */
  useEffect(() => { setMounted(true); }, []);

  /* ── Reset state on open/close ──────────────────────────────── */
  const handleClose = useCallback(() => {
    setShowThanks(false);
    setPreset(null);
    setCustomRaw("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setQrLoaded(false);
    setQrError(false);
    setQrKey(k => k + 1);
    const h = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen, handleClose]);

  /* ── Body scroll lock ───────────────────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  /* ── Handlers ───────────────────────────────────────────────── */
  const selectPreset = (v: number) => {
    setPreset(prev => prev === v ? null : v);
    setCustomRaw(""); // clear custom when a preset is clicked
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 6); // digits only, max 6 chars
    setCustomRaw(raw);
    setPreset(null); // deselect preset when typing custom
  };

  const copyUPI = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* noop */ }
  };

  const openUPIApp = (scheme: string) => {
    setShowThanks(true);
    const withAmt = activeAmount ? `${scheme}&am=${activeAmount}` : scheme;
    setTimeout(() => { window.location.href = withAmt; }, 300);
  };

  if (!mounted || !isOpen) return null;

  const qrSrc = buildQrUrl(activeAmount, 180);

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(2,4,9,0.90)", backdropFilter: "blur(18px)" }}
      onClick={handleClose}
    >
      {/* ── Modal card ─────────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{
          maxWidth: "700px",
          background: "linear-gradient(145deg, rgba(10,15,30,0.99) 0%, rgba(5,9,20,0.99) 100%)",
          border: "1px solid rgba(245,158,11,0.18)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.85), 0 0 60px rgba(245,158,11,0.06)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Glow orb */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-96 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(245,158,11,0.10) 0%, transparent 70%)" }} />

        {/* Top shimmer */}
        <div className="h-[2px] w-full"
          style={{ background: "linear-gradient(90deg, transparent 0%, #F59E0B 40%, #FCD34D 60%, transparent 100%)" }} />

        {/* Close */}
        <button id="support-modal-close" onClick={handleClose}
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-all hover:text-white hover:bg-white/8"
          style={{ border: "1px solid rgba(255,255,255,0.09)" }}>
          <X className="h-4 w-4" />
        </button>

        <div className="p-5">

          {/* ── Header ── */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative shrink-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(251,191,36,0.08) 100%)",
                  border: "1px solid rgba(245,158,11,0.28)",
                  boxShadow: "0 0 22px rgba(245,158,11,0.14)",
                }}>
                <Heart className="h-5 w-5 text-amber-400" fill="rgba(245,158,11,0.35)" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400">
                <Star className="h-2 w-2 text-[#020409]" fill="currentColor" />
              </div>
            </div>
            <div>
              <h2 className="text-[16px] font-black text-white leading-tight"
                style={{ fontFamily: "'Outfit','Inter',sans-serif", letterSpacing: "-0.02em" }}>
                Support the Developer
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Free &amp; open-source · solo built · kept alive by your tips ☕
              </p>
            </div>
          </div>

          {/* ── Two-column body ── */}
          <div className="flex flex-col md:flex-row gap-5">

            {/* LEFT — Dynamic QR ───────────────────────────────── */}
            <div className="flex flex-col items-center md:items-start shrink-0 gap-1">

              {/* Amount badge above QR */}
              <div className="h-6 flex items-center justify-center w-full">
                {activeAmount ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[11px] font-black text-white transition-all duration-300"
                    style={{
                      background: "linear-gradient(90deg, rgba(245,158,11,0.22), rgba(217,119,6,0.15))",
                      border: "1px solid rgba(245,158,11,0.40)",
                    }}
                  >
                    ₹{activeAmount} encoded in QR
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-600">No amount · scan to pay any amount</span>
                )}
              </div>

              {/* QR frame */}
              <div className="relative rounded-xl p-2.5 transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.97)",
                  border: activeAmount
                    ? "1px solid rgba(245,158,11,0.50)"
                    : "1px solid rgba(245,158,11,0.22)",
                  boxShadow: activeAmount
                    ? "0 6px 24px rgba(0,0,0,0.5), 0 0 0 3px rgba(245,158,11,0.14)"
                    : "0 6px 24px rgba(0,0,0,0.4), 0 0 0 2px rgba(245,158,11,0.06)",
                }}>

                {/* Loading skeleton */}
                {!qrLoaded && !qrError && (
                  <div className="flex flex-col items-center justify-center rounded-lg bg-slate-100 gap-2 animate-pulse"
                    style={{ width: 180, height: 180 }}>
                    <QrCode className="h-10 w-10 text-slate-300" />
                    <span className="text-[9px] text-slate-400">Loading QR…</span>
                  </div>
                )}

                {/* Error fallback */}
                {qrError && (
                  <div className="flex flex-col items-center justify-center rounded-lg bg-slate-100 gap-1"
                    style={{ width: 180, height: 180 }}>
                    <QrCode className="h-8 w-8 text-slate-400" />
                    <p className="text-[10px] text-slate-500 text-center px-3">Use UPI ID below</p>
                  </div>
                )}

                {/* QR image — key forces re-fetch on amount change */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={qrKey}
                  src={qrSrc}
                  alt={`UPI QR${activeAmount ? ` ₹${activeAmount}` : ""} — ${UPI_ID}`}
                  width={180}
                  height={180}
                  className="block rounded-lg transition-opacity duration-300"
                  style={{ display: qrLoaded ? "block" : "none", opacity: qrLoaded ? 1 : 0 }}
                  onLoad={() => setQrLoaded(true)}
                  onError={() => { setQrError(true); setQrLoaded(false); }}
                />

                {/* UPI badge */}
                <div
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold text-white whitespace-nowrap"
                  style={{
                    background: "linear-gradient(90deg, #5F4BEB, #3B82F6)",
                    boxShadow: "0 3px 10px rgba(95,75,235,0.4)",
                  }}>
                  🇮🇳 UPI · BHIM
                </div>
              </div>

              <p className="text-[9px] text-slate-600 mt-3 text-center">
                {activeAmount ? `Scan → auto-fills ₹${activeAmount}` : "Scan with any UPI app"}
              </p>
            </div>

            {/* RIGHT — Controls ────────────────────────────────── */}
            <div className="flex flex-col gap-3 flex-1 min-w-0">

              {/* Preset amount chips */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">
                  Quick Amount
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {PRESETS.map(({ emoji, label, value }) => {
                    const active = preset === value && !customRaw;
                    return (
                      <button key={value} id={`support-amount-${value}`}
                        onClick={() => selectPreset(value)}
                        className="flex flex-col items-center gap-0 rounded-xl py-2 px-1 text-center transition-all duration-150 hover:scale-105 active:scale-95"
                        style={{
                          background: active
                            ? "linear-gradient(135deg, rgba(245,158,11,0.22), rgba(251,191,36,0.10))"
                            : "rgba(255,255,255,0.04)",
                          border: active
                            ? "1px solid rgba(245,158,11,0.55)"
                            : "1px solid rgba(255,255,255,0.07)",
                        }}>
                        <span className="text-[14px]">{emoji}</span>
                        <span className="text-[10px] font-black mt-0.5"
                          style={{ color: active ? "#F59E0B" : "#64748B" }}>
                          ₹{value}
                        </span>
                        <span className="text-[9px]"
                          style={{ color: active ? "#FCD34D" : "#334155" }}>
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom amount input */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">
                  Custom Amount
                </p>
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-150"
                  style={{
                    background: customFocused
                      ? "rgba(245,158,11,0.06)"
                      : "rgba(255,255,255,0.04)",
                    border: customValid && customRaw
                      ? "1px solid rgba(245,158,11,0.50)"
                      : customFocused
                        ? "1px solid rgba(245,158,11,0.28)"
                        : "1px solid rgba(255,255,255,0.09)",
                    boxShadow: customFocused ? "0 0 0 2px rgba(245,158,11,0.08)" : "none",
                  }}>
                  <IndianRupee className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <input
                    id="support-custom-amount"
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter amount…"
                    value={customRaw}
                    onChange={handleCustomChange}
                    onFocus={() => setCustomFocused(true)}
                    onBlur={() => setCustomFocused(false)}
                    className="flex-1 bg-transparent text-[13px] font-semibold text-white placeholder:text-slate-600 outline-none min-w-0"
                  />
                  {customRaw && (
                    <button
                      onClick={() => { setCustomRaw(""); }}
                      className="text-slate-600 hover:text-slate-400 text-[11px] font-bold shrink-0 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {customRaw && !customValid && (
                  <p className="text-[9px] text-red-400 mt-1">Enter a valid amount (₹1 – ₹1,00,000)</p>
                )}
                {customValid && customRaw && (
                  <p className="text-[9px] text-amber-500 mt-1">✓ QR updated with ₹{customNum}</p>
                )}
              </div>

              {/* UPI ID copy */}
              <button id="support-copy-upi" onClick={copyUPI}
                className="group flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 transition-all duration-150"
                style={{
                  background: copied
                    ? "linear-gradient(90deg, rgba(16,185,129,0.10), rgba(16,185,129,0.05))"
                    : "rgba(255,255,255,0.04)",
                  border: copied
                    ? "1px solid rgba(16,185,129,0.35)"
                    : "1px solid rgba(255,255,255,0.09)",
                }}>
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">UPI ID</span>
                  <span className="font-mono text-[12px] font-semibold text-white truncate">{UPI_ID}</span>
                </div>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all"
                  style={{
                    background: copied ? "rgba(16,185,129,0.20)" : "rgba(255,255,255,0.07)",
                    border: copied ? "1px solid rgba(16,185,129,0.40)" : "1px solid rgba(255,255,255,0.10)",
                  }}>
                  {copied
                    ? <Check className="h-3.5 w-3.5 text-emerald-400" />
                    : <Copy className="h-3.5 w-3.5 text-slate-400 group-hover:text-white transition-colors" />}
                </div>
              </button>
              {copied && (
                <p className="text-[10px] font-semibold text-emerald-400 -mt-1.5 text-center">
                  ✓ Copied! Paste in any UPI app
                </p>
              )}

              {/* ── Mobile-only: UPI App shortcuts ── */}
              <div className="md:hidden">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">
                  Open in App
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {UPI_APPS.map(({ name, color, base }) => (
                    <button key={name} id={`support-pay-${name.toLowerCase()}`}
                      onClick={() => openUPIApp(base)}
                      className="flex flex-col items-center gap-1 rounded-xl py-2 px-1 transition-all duration-150 hover:scale-105 active:scale-95"
                      style={{ background: `${color}12`, border: `1px solid ${color}28` }}>
                      <div className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-black"
                        style={{ background: color, color: "#fff" }}>
                        {name[0]}
                      </div>
                      <span className="text-[9px] font-semibold text-slate-400">{name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Mobile-only: Big CTA ── */}
              <button id="support-direct-upi"
                className="md:hidden flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-bold text-[#020409] transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                  boxShadow: "0 4px 16px rgba(245,158,11,0.28)",
                }}
                onClick={() => openUPIApp(buildUpiLink(activeAmount))}>
                <Smartphone className="h-4 w-4" />
                {activeAmount ? `Pay ₹${activeAmount} via UPI` : "Open UPI App"}
              </button>

              {/* Desktop hint */}
              <div className="hidden md:flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  On mobile, open any UPI app → Scan the QR or paste the UPI ID above.
                </p>
              </div>

              {showThanks && (
                <div className="rounded-xl py-2 text-center animate-pulse"
                  style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.18)" }}>
                  <p className="text-[12px] font-bold text-amber-400">🙏 Thank you!</p>
                  <p className="text-[10px] text-slate-500">Opening UPI app…</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-[10px] text-slate-700">
            Made with <Heart className="inline h-2.5 w-2.5 text-red-500" fill="currentColor" /> in India · 100% free forever
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
