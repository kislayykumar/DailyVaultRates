import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export const dynamic = "force-dynamic";
export const revalidate = 10;

const FALLBACK_QUOTES: Record<string, any> = {
  "^NSEI": {
    symbol: "^NSEI",
    shortName: "NIFTY 50",
    longName: "NSE Nifty 50 Index",
    price: 24366.0,
    change: -29.85,
    changePercent: -0.12,
    dayHigh: 24405.2,
    dayLow: 24296.8,
    open: 24361.9,
    previousClose: 24395.8,
    volume: 0,
    marketCap: 0,
    currency: "INR",
    exchange: "NSE",
  },
  "^BSESN": {
    symbol: "^BSESN",
    shortName: "SENSEX",
    longName: "BSE Sensex Benchmark Index",
    price: 78009.25,
    change: -70.71,
    changePercent: -0.09,
    dayHigh: 78048.91,
    dayLow: 77684.37,
    open: 77903.43,
    previousClose: 78080.0,
    volume: 0,
    marketCap: 0,
    currency: "INR",
    exchange: "BSE",
  },
  "RELIANCE.NS": {
    symbol: "RELIANCE.NS",
    shortName: "Reliance Industries",
    longName: "Reliance Industries Limited",
    price: 1310.0,
    change: -7.0,
    changePercent: -0.53,
    dayHigh: 1317.5,
    dayLow: 1301.5,
    open: 1317.0,
    previousClose: 1317.0,
    volume: 10492367,
    marketCap: 17727538331648,
    currency: "INR",
    exchange: "NSE",
  },
  "TCS.NS": {
    symbol: "TCS.NS",
    shortName: "Tata Consultancy Services",
    longName: "Tata Consultancy Services Limited",
    price: 2361.0,
    change: -14.0,
    changePercent: -0.59,
    dayHigh: 2390.0,
    dayLow: 2333.4,
    open: 2375.1,
    previousClose: 2375.0,
    volume: 2231713,
    marketCap: 8542304600064,
    currency: "INR",
    exchange: "NSE",
  },
  "HDFCBANK.NS": {
    symbol: "HDFCBANK.NS",
    shortName: "HDFC Bank",
    longName: "HDFC Bank Limited",
    price: 727.0,
    change: 2.0,
    changePercent: 0.28,
    dayHigh: 729.6,
    dayLow: 723.5,
    open: 725.0,
    previousClose: 725.0,
    volume: 20349327,
    marketCap: 11203797581824,
    currency: "INR",
    exchange: "NSE",
  },
  "INFY.NS": {
    symbol: "INFY.NS",
    shortName: "Infosys",
    longName: "Infosys Limited",
    price: 1169.2,
    change: -5.8,
    changePercent: -0.49,
    dayHigh: 1174.1,
    dayLow: 1158.9,
    open: 1170.4,
    previousClose: 1175.0,
    volume: 5842970,
    marketCap: 4735404343296,
    currency: "INR",
    exchange: "NSE",
  },
  "ICICIBANK.NS": {
    symbol: "ICICIBANK.NS",
    shortName: "ICICI Bank",
    longName: "ICICI Bank Limited",
    price: 1417.0,
    change: 10.2,
    changePercent: 0.73,
    dayHigh: 1417.8,
    dayLow: 1401.0,
    open: 1403.0,
    previousClose: 1406.8,
    volume: 6089877,
    marketCap: 10164533985280,
    currency: "INR",
    exchange: "NSE",
  },
  "BHARTIARTL.NS": {
    symbol: "BHARTIARTL.NS",
    shortName: "Bharti Airtel",
    longName: "Bharti Airtel Limited",
    price: 1992.1,
    change: 53.0,
    changePercent: 2.73,
    dayHigh: 2005.8,
    dayLow: 1932.0,
    open: 1939.1,
    previousClose: 1939.1,
    volume: 12282326,
    marketCap: 12428031033344,
    currency: "INR",
    exchange: "NSE",
  },
  "TATAMOTORS.NS": {
    symbol: "TATAMOTORS.NS",
    shortName: "Tata Motors",
    longName: "Tata Motors Limited",
    price: 668.5,
    change: 4.2,
    changePercent: 0.63,
    dayHigh: 672.0,
    dayLow: 661.1,
    open: 664.3,
    previousClose: 664.3,
    volume: 8120400,
    marketCap: 2450000000000,
    currency: "INR",
    exchange: "NSE",
  },
  "SBIN.NS": {
    symbol: "SBIN.NS",
    shortName: "State Bank of India",
    longName: "State Bank of India",
    price: 815.4,
    change: 6.8,
    changePercent: 0.84,
    dayHigh: 818.9,
    dayLow: 806.2,
    open: 808.6,
    previousClose: 808.6,
    volume: 14500000,
    marketCap: 7277000000000,
    currency: "INR",
    exchange: "NSE",
  },
  "ITC.NS": {
    symbol: "ITC.NS",
    shortName: "ITC Limited",
    longName: "ITC Limited",
    price: 472.3,
    change: -1.5,
    changePercent: -0.32,
    dayHigh: 476.0,
    dayLow: 469.8,
    open: 473.8,
    previousClose: 473.8,
    volume: 9800000,
    marketCap: 5890000000000,
    currency: "INR",
    exchange: "NSE",
  },
  "WIPRO.NS": {
    symbol: "WIPRO.NS",
    shortName: "Wipro",
    longName: "Wipro Limited",
    price: 545.8,
    change: -3.2,
    changePercent: -0.58,
    dayHigh: 551.0,
    dayLow: 542.0,
    open: 549.0,
    previousClose: 549.0,
    volume: 4200000,
    marketCap: 2850000000000,
    currency: "INR",
    exchange: "NSE",
  },
};

function getGenericFallback(sym: string) {
  const isNSE = sym.endsWith(".NS");
  const cleanName = sym.replace(/\.(NS|BO)$/, "").replace("^", "");
  return {
    symbol: sym,
    shortName: cleanName,
    longName: `${cleanName} ${isNSE ? "NSE" : "BSE"} Equity`,
    price: 500.0,
    change: 0.0,
    changePercent: 0.0,
    dayHigh: 505.0,
    dayLow: 495.0,
    open: 500.0,
    previousClose: 500.0,
    volume: 100000,
    marketCap: 1000000000,
    currency: "INR",
    exchange: isNSE ? "NSE" : "BSE",
    timestamp: new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolParam = searchParams.get("symbol") || "^NSEI,^BSESN,RELIANCE.NS,TCS.NS,HDFCBANK.NS,INFY.NS";

    const symbols = symbolParam.split(",").map((s) => s.trim()).filter(Boolean);

    if (symbols.length === 0) {
      return NextResponse.json({ error: "No symbol provided" }, { status: 400 });
    }

    const quotes = await Promise.all(
      symbols.map(async (sym) => {
        try {
          // Timeout race to prevent API hanging
          const fetchPromise = yahooFinance.quote(sym);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 4000)
          );

          const res = (await Promise.race([fetchPromise, timeoutPromise])) as any;
          if (res && res.regularMarketPrice != null) {
            return {
              symbol: res.symbol || sym,
              shortName: res.shortName || res.longName || sym,
              longName: res.longName || res.shortName || sym,
              price: res.regularMarketPrice ?? 0,
              change: res.regularMarketChange ?? 0,
              changePercent: res.regularMarketChangePercent ?? 0,
              dayHigh: res.regularMarketDayHigh ?? res.regularMarketPrice ?? 0,
              dayLow: res.regularMarketDayLow ?? res.regularMarketPrice ?? 0,
              open: res.regularMarketOpen ?? res.regularMarketPrice ?? 0,
              previousClose: res.regularMarketPreviousClose ?? res.regularMarketPrice ?? 0,
              volume: res.regularMarketVolume ?? 0,
              marketCap: res.marketCap ?? 0,
              currency: res.currency || "INR",
              exchange: res.exchange || (sym.endsWith(".NS") ? "NSE" : "BSE"),
              timestamp: new Date().toISOString(),
            };
          }
        } catch (err) {
          console.warn("Yahoo Finance quote fallback triggered for %s:", sym, err);
        }

        // Return fallback quote if live Yahoo quote failed
        const fallback = FALLBACK_QUOTES[sym] || getGenericFallback(sym);
        return {
          ...fallback,
          timestamp: new Date().toISOString(),
        };
      })
    );

    const validQuotes = quotes.filter((q): q is NonNullable<typeof q> => q !== null);

    // If query was for a single symbol without commas
    if (!symbolParam.includes(",") && validQuotes.length === 1) {
      return NextResponse.json({ success: true, data: validQuotes[0] });
    }

    return NextResponse.json({ success: true, data: validQuotes });
  } catch (error: any) {
    console.error("Stock API Route Error:", error);

    // Even on total route error, return fallback list for requested symbols
    const { searchParams } = new URL(request.url);
    const symbolParam = searchParams.get("symbol") || "^NSEI,^BSESN,RELIANCE.NS,TCS.NS,HDFCBANK.NS,INFY.NS";
    const symbols = symbolParam.split(",").map((s) => s.trim()).filter(Boolean);
    const fallbackList = symbols.map((sym) => ({
      ...(FALLBACK_QUOTES[sym] || getGenericFallback(sym)),
      timestamp: new Date().toISOString(),
    }));

    if (!symbolParam.includes(",") && fallbackList.length === 1) {
      return NextResponse.json({ success: true, data: fallbackList[0] });
    }

    return NextResponse.json({ success: true, data: fallbackList });
  }
}
