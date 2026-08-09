import type { Metadata } from "next";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import "./globals.css";

const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-0000000000000000";

export const metadata: Metadata = {
  title: {
    default: "Daily Spot Rates & Forex Archive | DailyVaultRates",
    template: "%s | DailyVaultRates",
  },
  description:
    "Institutional spot rate archive for precious metals (Gold, Silver, Platinum, Aluminum) and major global currencies. Verified daily records powered by Git-as-a-Database technology.",
  keywords: [
    "daily gold rates inr",
    "gold rate today per 10 gram",
    "silver price per kg",
    "historical silver prices",
    "spot metal archive",
    "daily forex rates inr",
    "platinum spot rate",
    "aluminum spot price",
    "currency converter data",
    "financial rate archive",
  ],
  authors: [{ name: "DailyVaultRates Team" }],
  creator: "DailyVaultRates",
  publisher: "DailyVaultRates",
  metadataBase: new URL("https://dailyvaultrates.com"),
  openGraph: {
    title: "Daily Spot Rates & Forex Archive | DailyVaultRates",
    description: "Daily spot rates for Gold, Silver, Platinum, Aluminum, and global forex currencies in INR and USD.",
    url: "https://dailyvaultrates.com",
    siteName: "DailyVaultRates",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Google Fonts — Inter + JetBrains Mono */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        {/* Google AdSense */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body className="flex min-h-screen flex-col text-slate-100 antialiased selection:bg-amber-500/25 selection:text-amber-200" style={{ background: "#070A12", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
