import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export const dynamic = "force-dynamic";
export const revalidate = 10;

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
          const res = await yahooFinance.quote(sym);
          const q = res as any;
          return {
            symbol: q.symbol,
            shortName: q.shortName || q.longName || q.symbol,
            longName: q.longName || q.shortName || q.symbol,
            price: q.regularMarketPrice ?? 0,
            change: q.regularMarketChange ?? 0,
            changePercent: q.regularMarketChangePercent ?? 0,
            dayHigh: q.regularMarketDayHigh ?? q.regularMarketPrice ?? 0,
            dayLow: q.regularMarketDayLow ?? q.regularMarketPrice ?? 0,
            open: q.regularMarketOpen ?? q.regularMarketPrice ?? 0,
            previousClose: q.regularMarketPreviousClose ?? q.regularMarketPrice ?? 0,
            volume: q.regularMarketVolume ?? 0,
            marketCap: q.marketCap ?? 0,
            currency: q.currency || "INR",
            exchange: q.exchange || "NSE",
            timestamp: new Date().toISOString(),
          };
        } catch (err) {
          console.error(`Error fetching quote for ${sym}:`, err);
          return null;
        }
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
    return NextResponse.json(
      { error: error?.message || "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}
