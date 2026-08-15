"use client";

import { useState } from "react";
import {
  Mail, User, CheckCircle2, AlertCircle, Loader2,
  Sparkles, ShieldCheck, Zap, TrendingUp, Clock,
  Bell, UserMinus, ArrowLeft,
} from "lucide-react";

interface SubscribeFormProps {
  className?: string;
  variant?: "card" | "inline";
}

const PERKS = [
  { icon: TrendingUp, text: "Gold, Silver & USD/INR spot rates",   color: "#F59E0B" },
  { icon: Zap,        text: "Delivered 6:00 AM UTC every morning", color: "#10B981" },
  { icon: Clock,      text: "Historical trend snapshot included",   color: "#00D4FF" },
  { icon: ShieldCheck,text: "Zero spam · Unsubscribe anytime",     color: "#818CF8" },
];

type Tab = "subscribe" | "unsubscribe";

export default function SubscribeForm({ className = "", variant = "card" }: SubscribeFormProps) {
  const [tab, setTab] = useState<Tab>("subscribe");

  // ── Subscribe state ─────────────────────────────────────────
  const [name,          setName]          = useState("");
  const [email,         setEmail]         = useState("");
  const [subStatus,     setSubStatus]     = useState<"idle" | "loading" | "success" | "error">("idle");
  const [subMessage,    setSubMessage]    = useState("");
  const [nameFocused,   setNameFocused]   = useState(false);
  const [emailFocused,  setEmailFocused]  = useState(false);

  // ── Unsubscribe state ───────────────────────────────────────
  const [unsubEmail,    setUnsubEmail]    = useState("");
  const [unsubStatus,   setUnsubStatus]   = useState<"idle" | "loading" | "success" | "error" | "notfound">("idle");
  const [unsubMessage,  setUnsubMessage]  = useState("");
  const [unsubFocused,  setUnsubFocused]  = useState(false);

  /* ── Subscribe handler ─────────────────────────────────────── */
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setSubStatus("error");
      setSubMessage("Please enter a valid email address.");
      return;
    }
    setSubStatus("loading");
    setSubMessage("");
    try {
      const res  = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubStatus("success");
        setSubMessage(data.message || "You're subscribed! Daily rates will arrive at 6:00 AM UTC.");
        setName(""); setEmail("");
      } else {
        setSubStatus("error");
        setSubMessage(data.error || "Subscription failed. Please try again.");
      }
    } catch {
      setSubStatus("error");
      setSubMessage("An unexpected error occurred. Please try again later.");
    }
  };

  /* ── Unsubscribe handler ───────────────────────────────────── */
  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unsubEmail || !unsubEmail.includes("@")) {
      setUnsubStatus("error");
      setUnsubMessage("Please enter a valid email address.");
      return;
    }
    setUnsubStatus("loading");
    setUnsubMessage("");
    try {
      const res  = await fetch("/api/unsubscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unsubEmail }),
      });
      const data = await res.json();
      if (res.status === 404 || data.notFound) {
        setUnsubStatus("notfound");
        setUnsubMessage(data.message || "This email was never subscribed.");
      } else if (res.ok && data.success) {
        setUnsubStatus("success");
        setUnsubMessage(data.message || "You've been unsubscribed successfully.");
        setUnsubEmail("");
      } else {
        setUnsubStatus("error");
        setUnsubMessage(data.error || "Failed to unsubscribe. Please try again.");
      }
    } catch {
      setUnsubStatus("error");
      setUnsubMessage("An unexpected error occurred. Please try again later.");
    }
  };

  /* ── Shared card wrapper ─────────────────────────────────────── */
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${variant === "card" ? "w-full" : ""} ${className}`}
      style={{
        background: "rgba(6,11,20,0.92)",
        border: "1px solid rgba(245,158,11,0.16)",
        boxShadow: "0 0 60px rgba(245,158,11,0.06), 0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.70)",
      }}
    >
      {/* Top shimmer accent */}
      <div className="h-[2px] w-full"
        style={{ background: "linear-gradient(90deg, transparent 0%, #F59E0B 35%, #10B981 65%, transparent 100%)" }} />

      {/* Ambient glows */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-25"
        style={{ background: "radial-gradient(ellipse, rgba(245,158,11,0.22) 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full opacity-15"
        style={{ background: "radial-gradient(ellipse, rgba(0,212,255,0.18) 0%, transparent 70%)" }} />

      {/* ── Tab switcher ─────────────────────────────────────────── */}
      <div className="relative flex border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {(["subscribe", "unsubscribe"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold transition-all duration-200"
            style={{
              color: tab === t ? (t === "subscribe" ? "#F59E0B" : "#EF4444") : "#475569",
              borderBottom: `2px solid ${tab === t ? (t === "subscribe" ? "#F59E0B" : "#EF4444") : "transparent"}`,
              background: tab === t ? (t === "subscribe" ? "rgba(245,158,11,0.04)" : "rgba(239,68,68,0.04)") : "transparent",
            }}
          >
            {t === "subscribe"
              ? <><Bell className="h-3 w-3" /> Subscribe</>
              : <><UserMinus className="h-3 w-3" /> Unsubscribe</>
            }
          </button>
        ))}
      </div>

      <div className="relative p-5">

        {/* ══════════════ SUBSCRIBE TAB ══════════════ */}
        {tab === "subscribe" && (
          <>
            {subStatus === "success" ? (
              /* Success state */
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.28)", boxShadow: "0 0 24px rgba(16,185,129,0.18)" }}>
                  <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white" style={{ fontFamily: "'Outfit','Inter',sans-serif" }}>
                    You&apos;re in the Vault! 🎉
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400 max-w-xs">{subMessage}</p>
                </div>
                <button onClick={() => setSubStatus("idle")}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors">
                  Subscribe another email →
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 mb-2 text-[10px] font-black uppercase tracking-widest"
                      style={{ background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.24)", color: "#F59E0B" }}>
                      <Bell className="h-2.5 w-2.5" />
                      Daily Intelligence Digest
                    </div>
                    <h3 className="text-[18px] font-black leading-tight text-white"
                      style={{ fontFamily: "'Outfit','Inter',sans-serif", letterSpacing: "-0.02em" }}>
                      Get Free Daily<br />
                      <span style={{ background: "linear-gradient(90deg, #F59E0B, #FCD34D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Metal &amp; FX Rates
                      </span>
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                      Morning vault report — Gold, Silver &amp; Forex — before markets open.
                    </p>
                  </div>
                  <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(217,119,6,0.08))", border: "1px solid rgba(245,158,11,0.25)", boxShadow: "0 0 22px rgba(245,158,11,0.14)" }}>
                    <Sparkles className="h-5 w-5 text-amber-400" />
                  </div>
                </div>

                {/* Perks */}
                <div className="grid grid-cols-2 gap-1.5 mb-4">
                  {PERKS.map(({ icon: Icon, text, color }) => (
                    <div key={text} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <Icon className="h-3 w-3 shrink-0" style={{ color }} />
                      <span className="text-[10px] font-medium text-slate-500 leading-snug">{text}</span>
                    </div>
                  ))}
                </div>

                {/* Error */}
                {subStatus === "error" && (
                  <div className="mb-3 flex items-center gap-2 rounded-xl p-3 text-xs"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", color: "#EF4444" }}>
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {subMessage}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                      style={{ color: nameFocused ? "#F59E0B" : "#475569" }}>
                      <User className="h-3.5 w-3.5 transition-colors duration-200" />
                    </div>
                    <input
                      type="text"
                      placeholder="Your Name (optional)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(false)}
                      disabled={subStatus === "loading"}
                      className="w-full rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-slate-600 outline-none transition-all duration-200 disabled:opacity-50"
                      style={{
                        background: nameFocused ? "rgba(245,158,11,0.05)" : "rgba(255,255,255,0.03)",
                        border: nameFocused ? "1px solid rgba(245,158,11,0.40)" : "1px solid rgba(255,255,255,0.07)",
                        boxShadow: nameFocused ? "0 0 0 2px rgba(245,158,11,0.08)" : "none",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                      style={{ color: emailFocused ? "#F59E0B" : "#475569" }}>
                      <Mail className="h-3.5 w-3.5 transition-colors duration-200" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      disabled={subStatus === "loading"}
                      className="w-full rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-slate-600 outline-none transition-all duration-200 disabled:opacity-50"
                      style={{
                        background: emailFocused ? "rgba(245,158,11,0.05)" : "rgba(255,255,255,0.03)",
                        border: emailFocused ? "1px solid rgba(245,158,11,0.40)" : "1px solid rgba(255,255,255,0.07)",
                        boxShadow: emailFocused ? "0 0 0 2px rgba(245,158,11,0.08)" : "none",
                      }}
                    />
                  </div>

                  <button type="submit" disabled={subStatus === "loading"}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-black text-[#020409] transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)",
                      boxShadow: "0 4px 20px rgba(245,158,11,0.28), inset 0 1px 0 rgba(255,255,255,0.18)",
                    }}>
                    {subStatus === "loading" ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Subscribing…</>
                    ) : (
                      <><Mail className="h-4 w-4" /> Subscribe to Morning Digest <span className="ml-1 text-[10px] opacity-70 font-bold">FREE</span></>
                    )}
                  </button>
                </form>

                <p className="mt-3 text-center text-[10px] text-slate-700">
                  <ShieldCheck className="inline h-2.5 w-2.5 mr-0.5 text-emerald-700" />
                  No spam · No ads · Each email is sent privately, only you see your inbox
                </p>
              </>
            )}
          </>
        )}

        {/* ══════════════ UNSUBSCRIBE TAB ══════════════ */}
        {tab === "unsubscribe" && (
          <>
            {/* Success */}
            {unsubStatus === "success" && (
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.25)" }}>
                  <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">Unsubscribed ✓</h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400 max-w-xs">{unsubMessage}</p>
                </div>
                <button onClick={() => { setUnsubStatus("idle"); setUnsubEmail(""); setUnsubMessage(""); }}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="h-3 w-3" /> Back
                </button>
              </div>
            )}

            {/* Not found */}
            {unsubStatus === "notfound" && (
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.25)" }}>
                  <AlertCircle className="h-7 w-7 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">Never Subscribed</h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400 max-w-xs">
                    <span className="font-mono text-amber-400">{unsubEmail}</span> was never subscribed to DailyVaultRates digest.
                  </p>
                </div>
                <button onClick={() => { setUnsubStatus("idle"); setUnsubEmail(""); setUnsubMessage(""); }}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="h-3 w-3" /> Try another email
                </button>
              </div>
            )}

            {/* Idle / error / loading */}
            {(unsubStatus === "idle" || unsubStatus === "loading" || unsubStatus === "error") && (
              <>
                <div className="mb-4">
                  <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 mb-2 text-[10px] font-black uppercase tracking-widest"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", color: "#EF4444" }}>
                    <UserMinus className="h-2.5 w-2.5" />
                    Unsubscribe
                  </div>
                  <h3 className="text-[18px] font-black leading-tight text-white"
                    style={{ fontFamily: "'Outfit','Inter',sans-serif", letterSpacing: "-0.02em" }}>
                    Stop Receiving<br />
                    <span style={{ color: "#EF4444" }}>Digest Emails</span>
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                    Enter your email below. We&apos;ll check if it&apos;s subscribed and remove it instantly.
                  </p>
                </div>

                {/* Error */}
                {unsubStatus === "error" && (
                  <div className="mb-3 flex items-center gap-2 rounded-xl p-3 text-xs"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", color: "#EF4444" }}>
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {unsubMessage}
                  </div>
                )}

                <form onSubmit={handleUnsubscribe} className="flex flex-col gap-2.5">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                      style={{ color: unsubFocused ? "#EF4444" : "#475569" }}>
                      <Mail className="h-3.5 w-3.5 transition-colors duration-200" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Enter the subscribed email"
                      value={unsubEmail}
                      onChange={(e) => setUnsubEmail(e.target.value)}
                      onFocus={() => setUnsubFocused(true)}
                      onBlur={() => setUnsubFocused(false)}
                      disabled={unsubStatus === "loading"}
                      className="w-full rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-slate-600 outline-none transition-all duration-200 disabled:opacity-50"
                      style={{
                        background: unsubFocused ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.03)",
                        border: unsubFocused ? "1px solid rgba(239,68,68,0.40)" : "1px solid rgba(255,255,255,0.07)",
                        boxShadow: unsubFocused ? "0 0 0 2px rgba(239,68,68,0.08)" : "none",
                      }}
                    />
                  </div>

                  <button type="submit" disabled={unsubStatus === "loading"}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-black text-white transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, rgba(239,68,68,0.80) 0%, rgba(220,38,38,0.90) 100%)",
                      border: "1px solid rgba(239,68,68,0.40)",
                      boxShadow: "0 4px 16px rgba(239,68,68,0.18)",
                    }}>
                    {unsubStatus === "loading" ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Checking…</>
                    ) : (
                      <><UserMinus className="h-4 w-4" /> Unsubscribe Me</>
                    )}
                  </button>
                </form>

                <p className="mt-3 text-center text-[10px] text-slate-700">
                  Your email will be removed from all future digest sends immediately.
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
