import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export const dynamic = "force-dynamic";
export const revalidate = 43200;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json({ error: "Stock symbol is required" }, { status: 400 });
    }

    const summary = await yahooFinance.quoteSummary(symbol, {
      modules: ["assetProfile", "defaultKeyStatistics", "financialData", "recommendationTrend"],
    });

    if (!summary) {
      return NextResponse.json({ error: `Analysis data not found for ${symbol}` }, { status: 404 });
    }

    const { assetProfile, defaultKeyStatistics, financialData, recommendationTrend } = (summary || {}) as any;

    // Latest analyst recommendation trend
    const latestRec = recommendationTrend?.trend?.[0] || {
      strongBuy: 0,
      buy: 0,
      hold: 0,
      sell: 0,
      strongSell: 0,
    };

    const totalAnalystRatings =
      (latestRec.strongBuy || 0) +
      (latestRec.buy || 0) +
      (latestRec.hold || 0) +
      (latestRec.sell || 0) +
      (latestRec.strongSell || 0);

    const formattedData = {
      symbol,
      profile: {
        sector: assetProfile?.sector || "N/A",
        industry: assetProfile?.industry || "N/A",
        summary: assetProfile?.longBusinessSummary || "Company overview not available.",
        fullTimeEmployees: assetProfile?.fullTimeEmployees || null,
        website: assetProfile?.website || null,
      },
      metrics: {
        trailingPE: financialData?.trailingPE ?? defaultKeyStatistics?.trailingPE ?? null,
        forwardPE: financialData?.forwardPE ?? defaultKeyStatistics?.forwardPE ?? null,
        priceToBook: defaultKeyStatistics?.priceToBook ?? null,
        debtToEquity: financialData?.debtToEquity ?? null,
        profitMargins: financialData?.profitMargins ?? defaultKeyStatistics?.profitMargins ?? null,
        returnOnEquity: financialData?.returnOnEquity ?? null,
        totalRevenue: financialData?.totalRevenue ?? null,
        grossProfits: financialData?.grossProfits ?? null,
      },
      targets: {
        targetLowPrice: financialData?.targetLowPrice ?? null,
        targetHighPrice: financialData?.targetHighPrice ?? null,
        targetMeanPrice: financialData?.targetMeanPrice ?? null,
        currentPrice: financialData?.currentPrice ?? null,
        recommendationKey: financialData?.recommendationKey || "none",
      },
      recommendations: {
        strongBuy: latestRec.strongBuy || 0,
        buy: latestRec.buy || 0,
        hold: latestRec.hold || 0,
        sell: latestRec.sell || 0,
        strongSell: latestRec.strongSell || 0,
        total: totalAnalystRatings,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: formattedData });
  } catch (error: any) {
    console.error("Analysis API Route Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch financial analysis" },
      { status: 500 }
    );
  }
}
