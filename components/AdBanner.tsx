"use client";

import { useEffect, useRef, useState } from "react";

interface AdBannerProps {
  slot?: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal";
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export default function AdBanner({
  slot = "1234567890",
  format = "auto",
  responsive = true,
  className = "",
}: AdBannerProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adBlocked, setAdBlocked] = useState(false);
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-0000000000000000";
  const isPlaceholderClient = clientId.includes("0000000000000000");

  useEffect(() => {
    // If it's a placeholder ID or already pushed for this instance, skip pushing
    if (isPlaceholderClient || pushedRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      try {
        if (typeof window !== "undefined" && adRef.current) {
          // Check if ins element is already populated by AdSense
          const isFilled =
            adRef.current.getAttribute("data-ad-status") === "filled" ||
            adRef.current.getAttribute("data-adsbygoogle-status") === "filled" ||
            adRef.current.children.length > 0;

          if (!isFilled) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            pushedRef.current = true;
            setAdLoaded(true);
          }
        }
      } catch (err) {
        console.warn("AdSense push safely caught & ignored:", err);
        setAdBlocked(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [clientId, isPlaceholderClient]);

  return (
    <div
      className={`relative my-6 overflow-hidden rounded-xl border border-vault-border/50 bg-vault-card/40 p-4 text-center backdrop-blur-md transition-all ${className}`}
    >
      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold uppercase tracking-wider text-slate-500">Sponsored</span>
        <span className="text-[10px] text-slate-500">Advertisement</span>
      </div>

      <div className="flex min-h-[90px] w-full items-center justify-center">
        {!isPlaceholderClient && (
          <ins
            ref={adRef}
            className="adsbygoogle block w-full"
            style={{ display: "block" }}
            data-ad-client={clientId}
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive ? "true" : "false"}
          />
        )}

        {/* Fallback placeholder display when using test/placeholder client ID or blocked */}
        {(isPlaceholderClient || !adLoaded || adBlocked || process.env.NODE_ENV === "development") && (
          <div className="flex h-20 w-full flex-col items-center justify-center rounded-lg border border-dashed border-vault-border/80 bg-vault-dark/50 px-4 py-2 text-slate-400">
            <span className="text-xs font-medium text-slate-300">
              AdSense Slot ({format.toUpperCase()})
            </span>
            <span className="mt-0.5 font-mono text-[11px] text-slate-500">
              ID: {clientId} | Slot: {slot}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
