"use client";

import { useState } from "react";
import { Mail, User, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck } from "lucide-react";

interface SubscribeFormProps {
  className?: string;
  variant?: "card" | "inline";
}

export default function SubscribeForm({ className = "", variant = "card" }: SubscribeFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage(data.message || "You're subscribed! Daily rates will arrive at 6:00 AM UTC.");
        setName("");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Subscription failed. Please try again.");
      }
    } catch (err) {
      console.error("Subscription error:", err);
      setStatus("error");
      setMessage("An unexpected error occurred. Please try again later.");
    }
  };

  if (status === "success") {
    return (
      <div className={`relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 backdrop-blur-md transition-all ${className}`}>
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-emerald-300">Subscription Confirmed!</h4>
            <p className="mt-1 text-xs leading-relaxed text-emerald-200/80">{message}</p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-3 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
            >
              Subscribe another email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-amber-500/20 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl shadow-slate-950/50 transition-all ${
        variant === "card" ? "w-full" : ""
      } ${className}`}
    >
      {/* Decorative ambient gradient backdrop */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-400">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Daily Intelligence Digest
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-slate-400 border border-slate-700/50">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          <span>Zero Spam</span>
        </div>
      </div>

      <h3 className="text-lg font-extrabold text-white">Get Free Daily Metal & FX Spot Rates</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-400">
        Receive the 6:00 AM UTC morning vault report featuring Gold, Silver & USD/INR spot pricing directly in your inbox.
      </p>

      {status === "error" && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/30 p-2.5 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <User className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Your Name (Optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={status === "loading"}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/70 py-2.5 pl-9 pr-4 text-xs text-white placeholder-slate-500 transition-all focus:border-amber-500/60 focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-amber-500/60 disabled:opacity-50"
          />
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Mail className="h-4 w-4" />
          </div>
          <input
            type="email"
            required
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/70 py-2.5 pl-9 pr-4 text-xs text-white placeholder-slate-500 transition-all focus:border-amber-500/60 focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-amber-500/60 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] hover:shadow-amber-500/30 active:scale-[0.99] disabled:opacity-60"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
              <span>Subscribing...</span>
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              <span>Subscribe to Morning Digest</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
