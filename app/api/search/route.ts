import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export const dynamic = "force-dynamic";

// Levenshtein Distance for fuzzy typo tolerance
function getLevenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// Knowledge Base of Indian Blue-Chip Equities & Benchmarks with Aliases
interface StockKBItem {
  symbol: string;
  shortname: string;
  longname: string;
  exchange: string;
  quoteType: string;
  keywords: string[];
}

const INDIAN_STOCKS_KB: StockKBItem[] = [
  {
    symbol: "^NSEI",
    shortname: "NIFTY 50",
    longname: "NSE Nifty 50 Index",
    exchange: "NSE",
    quoteType: "INDEX",
    keywords: ["nifty", "nifty50", "nifty 50", "sencex", "nse", "national stock exchange"],
  },
  {
    symbol: "^BSESN",
    shortname: "SENSEX",
    longname: "BSE Sensex Benchmark Index",
    exchange: "BSE",
    quoteType: "INDEX",
    keywords: ["sensex", "sencex", "sensx", "bse", "bombay stock exchange"],
  },
  {
    symbol: "RELIANCE.NS",
    shortname: "Reliance Industries",
    longname: "Reliance Industries Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["reliance", "relaince", "relance", "ril", "ambani", "jio"],
  },
  {
    symbol: "TCS.NS",
    shortname: "Tata Consultancy Services",
    longname: "Tata Consultancy Services Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["tcs", "tata consultancy", "tata consult", "tata computer"],
  },
  {
    symbol: "HDFCBANK.NS",
    shortname: "HDFC Bank",
    longname: "HDFC Bank Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["hdfc", "hdfcbank", "hdfc bank", "hdfc bnk"],
  },
  {
    symbol: "INFY.NS",
    shortname: "Infosys",
    longname: "Infosys Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["infosys", "infy", "infisys", "infosi", "infosys ltd"],
  },
  {
    symbol: "ICICIBANK.NS",
    shortname: "ICICI Bank",
    longname: "ICICI Bank Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["icici", "icicibank", "icici bank", "icicibnk"],
  },
  {
    symbol: "BHARTIARTL.NS",
    shortname: "Bharti Airtel",
    longname: "Bharti Airtel Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["airtel", "bharti", "bharti airtel", "bhartiairtel"],
  },
  {
    symbol: "TATAMOTORS.NS",
    shortname: "Tata Motors",
    longname: "Tata Motors Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["tata motors", "tata motrs", "tata motor", "tatamotors", "jlr"],
  },
  {
    symbol: "SBIN.NS",
    shortname: "State Bank of India",
    longname: "State Bank of India",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["sbi", "sbin", "state bank", "state bank of india"],
  },
  {
    symbol: "ITC.NS",
    shortname: "ITC Limited",
    longname: "ITC Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["itc", "itc ltd", "tobacco"],
  },
  {
    symbol: "WIPRO.NS",
    shortname: "Wipro",
    longname: "Wipro Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["wipro", "wipros", "wipro ltd"],
  },
  {
    symbol: "LT.NS",
    shortname: "Larsen & Toubro",
    longname: "Larsen & Toubro Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["larsen", "l&t", "larson", "larsen & toubro", "lt"],
  },
  {
    symbol: "MARUTI.NS",
    shortname: "Maruti Suzuki",
    longname: "Maruti Suzuki India Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["maruti", "maruti suzuki", "marutisuzuki"],
  },
  {
    symbol: "TATASTEEL.NS",
    shortname: "Tata Steel",
    longname: "Tata Steel Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["tata steel", "tatasteel", "tata metal"],
  },
  {
    symbol: "AXISBANK.NS",
    shortname: "Axis Bank",
    longname: "Axis Bank Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["axis", "axis bank", "axisbank"],
  },
  {
    symbol: "KOTAKBANK.NS",
    shortname: "Kotak Mahindra Bank",
    longname: "Kotak Mahindra Bank Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["kotak", "kotak bank", "kotak mahindra"],
  },
  {
    symbol: "HINDUNILVR.NS",
    shortname: "Hindustan Unilever",
    longname: "Hindustan Unilever Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["hul", "hindustan unilever", "unilever"],
  },
  {
    symbol: "SUNPHARMA.NS",
    shortname: "Sun Pharma",
    longname: "Sun Pharmaceutical Industries Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["sun pharma", "sunpharma", "sun pharmaceutical"],
  },
  {
    symbol: "TITAN.NS",
    shortname: "Titan Company",
    longname: "Titan Company Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["titan", "tanishq", "titan company"],
  },
  {
    symbol: "BAJFINANCE.NS",
    shortname: "Bajaj Finance",
    longname: "Bajaj Finance Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["bajaj finance", "bajfinance", "bajaj fin"],
  },
  {
    symbol: "M&M.NS",
    shortname: "Mahindra & Mahindra",
    longname: "Mahindra & Mahindra Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["mahindra", "m&m", "mahindra & mahindra"],
  },
  {
    symbol: "ADANIENT.NS",
    shortname: "Adani Enterprises",
    longname: "Adani Enterprises Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["adani", "adani enterprises", "adanient"],
  },
  {
    symbol: "ADANIPORTS.NS",
    shortname: "Adani Ports",
    longname: "Adani Ports and Special Economic Zone Limited",
    exchange: "NSE",
    quoteType: "EQUITY",
    keywords: ["adani ports", "adanports"],
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("q") || "";
    const cleanQuery = rawQuery.trim().toLowerCase();

    if (!cleanQuery || cleanQuery.length < 2) {
      return NextResponse.json({ success: true, data: [], suggestedQuery: null });
    }

    // Step 1: Check Local Knowledge Base for Fuzzy / Typo Matches
    let kbMatches: { item: StockKBItem; score: number }[] = [];
    let bestSuggestedQuery: string | null = null;

    INDIAN_STOCKS_KB.forEach((item) => {
      let bestScore = Infinity;

      item.keywords.forEach((keyword) => {
        const kwLower = keyword.toLowerCase();
        // Exact prefix or substring match -> highest priority (score 0)
        if (kwLower === cleanQuery || item.symbol.toLowerCase() === cleanQuery) {
          bestScore = 0;
          bestSuggestedQuery = item.shortname;
        } else if (kwLower.includes(cleanQuery) || cleanQuery.includes(kwLower)) {
          bestScore = Math.min(bestScore, 1);
        } else {
          // Calculate Levenshtein distance for typos (e.g. "relaince" vs "reliance")
          const dist = getLevenshteinDistance(cleanQuery, kwLower);
          // Allow max 2 typos for short words, 3 for longer words
          const maxDist = kwLower.length <= 5 ? 2 : 3;
          if (dist <= maxDist) {
            bestScore = Math.min(bestScore, dist + 2);
            if (!bestSuggestedQuery) {
              bestSuggestedQuery = item.shortname;
            }
          }
        }
      });

      if (bestScore < Infinity) {
        kbMatches.push({ item, score: bestScore });
      }
    });

    // Sort KB matches by best match score
    kbMatches.sort((a, b) => a.score - b.score);

    // Step 2: Query Yahoo Finance with raw query
    let yahooQuotes: any[] = [];
    try {
      const searchResults = await yahooFinance.search(cleanQuery, {
        quotesCount: 15,
        newsCount: 0,
      });
      yahooQuotes = (searchResults as any)?.quotes || [];
    } catch (e) {
      console.warn("Yahoo Finance live search failed, using fuzzy KB fallback:", e);
    }

    // If Yahoo search returned no Indian results, try searching with corrected term if found
    const filteredYahoo = yahooQuotes.filter((q: any) => {
      if (!q.symbol) return false;
      const sym = q.symbol.toUpperCase();
      return (
        sym.endsWith(".NS") ||
        sym.endsWith(".BO") ||
        sym === "^NSEI" ||
        sym === "^BSESN" ||
        q.exchange === "NSI" ||
        q.exchange === "BOM"
      );
    });

    // Step 3: Combine KB Fuzzy Matches and Yahoo API results (Deduplicated by symbol)
    const resultMap = new Map<string, any>();

    // First add top KB fuzzy matches
    kbMatches.forEach(({ item }) => {
      resultMap.set(item.symbol, {
        symbol: item.symbol,
        shortname: item.shortname,
        longname: item.longname,
        exchange: item.exchange,
        quoteType: item.quoteType,
        isFuzzyMatch: true,
      });
    });

    // Then add Yahoo API results
    filteredYahoo.forEach((q: any) => {
      if (!resultMap.has(q.symbol)) {
        resultMap.set(q.symbol, {
          symbol: q.symbol,
          shortname: q.shortname || q.longname || q.symbol,
          longname: q.longname || q.shortname || q.symbol,
          exchange: q.exchange || (q.symbol.endsWith(".NS") ? "NSE" : "BSE"),
          quoteType: q.quoteType || "EQUITY",
          isFuzzyMatch: false,
        });
      }
    });

    const finalResults = Array.from(resultMap.values()).slice(0, 10);

    return NextResponse.json({
      success: true,
      data: finalResults,
      suggestedQuery: bestSuggestedQuery !== cleanQuery ? bestSuggestedQuery : null,
    });
  } catch (error: any) {
    console.error("Stock Search Route Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to search stocks" },
      { status: 500 }
    );
  }
}
