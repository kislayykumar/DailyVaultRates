const fs = require('fs');
const path = require('path');
const https = require('https');

const TROY_OZ_TO_GRAM = 31.1034768;

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      }
    };

    const req = https.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchText(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.setTimeout(12000, () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

function fetchJson(url) {
  return fetchText(url).then(text => JSON.parse(text));
}

async function fetchYahooPrice(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const data = await fetchJson(url);
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    if (price && price > 0) return price;
    throw new Error('Invalid price data from Yahoo');
  } catch (err) {
    try {
      const url2 = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
      const data2 = await fetchJson(url2);
      const price2 = data2?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price2 && price2 > 0) return price2;
    } catch (_) {}
    console.warn(`[Yahoo] Failed fetching ${symbol}: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('=== Fetching Precious & Industrial Metal Rates ===');
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  // Fetch Metal Spot / Futures Prices (USD per oz / ton)
  const rawGoldUsdOz = (await fetchYahooPrice('GC=F')) || 2420.50;
  const rawSilverUsdOz = (await fetchYahooPrice('SI=F')) || 28.40;
  const rawPlatinumUsdOz = (await fetchYahooPrice('PL=F')) || 950.20;
  const rawAluminumUsdTon = (await fetchYahooPrice('ALI=F')) || 2350.00;

  // Approximate USD to INR exchange rate if file doesn't exist yet
  const usdToInr = 83.88;

  // Gold Conversions
  const gold24kUsdOz = rawGoldUsdOz;
  const gold24kUsdGram = gold24kUsdOz / TROY_OZ_TO_GRAM;
  const gold24kInrGram = Math.round(gold24kUsdGram * usdToInr * 1.09); // including 9% duty/taxes

  const gold22kUsdGram = gold24kUsdGram * 0.9167;
  const gold22kInrGram = Math.round(gold24kInrGram * 0.9167);

  const gold18kUsdGram = gold24kUsdGram * 0.75;
  const gold18kInrGram = Math.round(gold24kInrGram * 0.75);

  // Silver Conversions
  const silverUsdOz = rawSilverUsdOz;
  const silverUsdGram = silverUsdOz / TROY_OZ_TO_GRAM;
  const silverInrGram = Math.round(silverUsdGram * usdToInr * 1.145);

  // Platinum Conversions
  const platinumUsdOz = rawPlatinumUsdOz;
  const platinumUsdGram = platinumUsdOz / TROY_OZ_TO_GRAM;
  const platinumInrGram = Number((platinumUsdGram * usdToInr).toFixed(2));

  // Aluminum Conversions
  const aluminumUsdTon = rawAluminumUsdTon;
  const aluminumUsdGram = aluminumUsdTon / 1000000;
  const aluminumUsdOz = aluminumUsdGram * TROY_OZ_TO_GRAM;
  const aluminumInrGram = Number((aluminumUsdGram * usdToInr).toFixed(4));

  const metalsList = [
    {
      id: "gold-24k",
      name: "Gold 24K (99.9% Pure)",
      symbol: "XAU-24K",
      carat: "24K",
      purity: "99.9%",
      priceUsdOunce: Number(gold24kUsdOz.toFixed(2)),
      priceUsdGram: Number(gold24kUsdGram.toFixed(2)),
      priceInrGram: gold24kInrGram,
      priceInr10Gram: gold24kInrGram * 10,
      priceInrKg: gold24kInrGram * 1000,
      unit: "Troy Ounce",
      category: "Precious Metals"
    },
    {
      id: "gold-22k",
      name: "Gold 22K (91.6% Jewelry)",
      symbol: "XAU-22K",
      carat: "22K",
      purity: "91.6%",
      priceUsdOunce: Number((gold24kUsdOz * 0.9167).toFixed(2)),
      priceUsdGram: Number(gold22kUsdGram.toFixed(2)),
      priceInrGram: gold22kInrGram,
      priceInr10Gram: gold22kInrGram * 10,
      priceInrKg: gold22kInrGram * 1000,
      unit: "Troy Ounce",
      category: "Precious Metals"
    },
    {
      id: "gold-18k",
      name: "Gold 18K (75.0% Jewelry)",
      symbol: "XAU-18K",
      carat: "18K",
      purity: "75.0%",
      priceUsdOunce: Number((gold24kUsdOz * 0.75).toFixed(2)),
      priceUsdGram: Number(gold18kUsdGram.toFixed(2)),
      priceInrGram: gold18kInrGram,
      priceInr10Gram: gold18kInrGram * 10,
      priceInrKg: gold18kInrGram * 1000,
      unit: "Troy Ounce",
      category: "Precious Metals"
    },
    {
      id: "silver",
      name: "Silver (99.9% Fine)",
      symbol: "XAG",
      carat: "999",
      purity: "99.9%",
      priceUsdOunce: Number(silverUsdOz.toFixed(2)),
      priceUsdGram: Number(silverUsdGram.toFixed(4)),
      priceInrGram: silverInrGram,
      priceInr10Gram: silverInrGram * 10,
      priceInrKg: silverInrGram * 1000,
      unit: "Troy Ounce",
      category: "Precious Metals"
    },
    {
      id: "platinum",
      name: "Platinum (95.0% Pure)",
      symbol: "XPT",
      carat: "950",
      purity: "95.0%",
      priceUsdOunce: Number(platinumUsdOz.toFixed(2)),
      priceUsdGram: Number(platinumUsdGram.toFixed(2)),
      priceInrGram: platinumInrGram,
      priceInr10Gram: Number((platinumInrGram * 10).toFixed(2)),
      priceInrKg: Number((platinumInrGram * 1000).toFixed(2)),
      unit: "Troy Ounce",
      category: "Precious Metals"
    },
    {
      id: "aluminum",
      name: "Aluminum (99.7% Pure)",
      symbol: "ALU",
      purity: "99.7%",
      priceUsdOunce: Number(aluminumUsdOz.toFixed(5)),
      priceUsdGram: Number(aluminumUsdGram.toFixed(6)),
      priceUsdTon: Number(aluminumUsdTon.toFixed(2)),
      priceInrGram: aluminumInrGram,
      priceInr10Gram: Number((aluminumInrGram * 10).toFixed(2)),
      priceInrKg: Number((aluminumInrGram * 1000).toFixed(2)),
      unit: "Metric Ton",
      category: "Industrial Metals"
    }
  ];

  const targetDir = path.join(process.cwd(), 'data', year, month);
  const filePath = path.join(targetDir, `${day}.json`);

  fs.mkdirSync(targetDir, { recursive: true });

  let existingData = {
    date: dateStr,
    updatedAt: new Date().toISOString(),
    timestamp: Date.now(),
    baseCurrency: 'USD',
    metals: [],
    currencies: [],
    forex: [],
    taxes: {
      gstPercentage: 3,
      customsDutyPercentage: 6,
      hallmarkFeeInr: 45,
      hallmarkGstPercentage: 18,
      lastUpdated: dateStr
    }
  };

  // Safe JSON Merge Pattern
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      existingData = { ...existingData, ...parsed };
      console.log(`[Safe Merge] Loaded existing data for ${dateStr}`);
    } catch (err) {
      console.warn(`[Safe Merge] Failed to parse existing JSON file: ${err.message}`);
    }
  }

  // Update metals, updatedAt and timestamp
  existingData.metals = metalsList;
  existingData.updatedAt = new Date().toISOString();
  existingData.timestamp = Date.now();

  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
  console.log(`✅ Metal rates successfully updated and saved to ${filePath}`);
}

main().catch(err => {
  console.error('❌ Error fetching metal rates:', err);
  process.exit(1);
});
