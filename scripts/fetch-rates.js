const fs = require('fs');
const path = require('path');
const https = require('https');

const TROY_OZ_TO_GRAM = 31.1034768;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─────────────────────────────────────────────────────────────────────────────
// HTTP HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
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
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

function fetchJson(url) {
  return fetchText(url).then(text => JSON.parse(text));
}

// ─────────────────────────────────────────────────────────────────────────────
// YAHOO FINANCE  —  Live spot/futures prices (no API key required)
//
//  GC=F  → Gold futures      (USD / troy oz)
//  SI=F  → Silver futures    (USD / troy oz)
//  PL=F  → Platinum futures  (USD / troy oz)
//  ALI=F → Aluminum futures  (USD / metric ton) on COMEX
// ─────────────────────────────────────────────────────────────────────────────

async function fetchYahooPrice(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const data = await fetchJson(url);
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    if (price && price > 0) {
      console.log(`  [Yahoo] ${symbol.padEnd(6)} → $${price}`);
      return price;
    }
    throw new Error('No valid price in Yahoo response');
  } catch (err) {
    // Try backup Yahoo query endpoint
    try {
      const url2 = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
      const data2 = await fetchJson(url2);
      const price2 = data2?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price2 && price2 > 0) {
        console.log(`  [Yahoo2] ${symbol.padEnd(6)} → $${price2}`);
        return price2;
      }
    } catch (_) {}
    console.warn(`  [Yahoo] ${symbol} failed: ${err.message}`);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GOODRETURNS  —  Indian retail INR prices for Gold & Silver (Bangalore)
// ─────────────────────────────────────────────────────────────────────────────

async function scrapeGoodReturnsGold() {
  try {
    const html = await fetchText('https://www.goodreturns.in/gold-rates/bangalore.html');

    // Matches the first "1 gram" data row: <td>1</td><td>₹X</td><td>₹Y</td><td>₹Z</td>
    const regex = /<td>\s*1\s*<\/td>\s*<td>\s*(?:&#x20b9;|₹)?\s*([\d,]+)\s*<\/td>\s*<td>\s*(?:&#x20b9;|₹)?\s*([\d,]+)\s*<\/td>\s*<td>\s*(?:&#x20b9;|₹)?\s*([\d,]+)\s*<\/td>/i;
    const match = html.match(regex);

    if (match) {
      const g24k = parseFloat(match[1].replace(/,/g, ''));
      const g22k = parseFloat(match[2].replace(/,/g, ''));
      const g18k = parseFloat(match[3].replace(/,/g, ''));
      console.log(`  [GoodReturns] Gold 24K=₹${g24k}/g  22K=₹${g22k}/g  18K=₹${g18k}/g`);
      return { g24k, g22k, g18k };
    }
    throw new Error('Regex did not match gold table');
  } catch (err) {
    console.warn(`  [GoodReturns] Gold scrape failed: ${err.message}`);
    return null;
  }
}

async function scrapeGoodReturnsSilver() {
  try {
    const html = await fetchText('https://www.goodreturns.in/silver-rates/bangalore.html');

    // Pattern 1: "₹ 2,45,000/kg" in ticker or summary text
    const regexKg = /Silver[\s\S]*?₹\s*([\d,]+)\s*\/\s*kg/i;
    const matchKg = html.match(regexKg);
    if (matchKg) {
      const kgPrice = parseFloat(matchKg[1].replace(/,/g, ''));
      const gramPrice = Number((kgPrice / 1000).toFixed(2));
      console.log(`  [GoodReturns] Silver ₹${gramPrice}/g (₹${kgPrice}/kg)`);
      return { gramPrice, kgPrice };
    }

    // Pattern 2: table "1 gram" row
    const regexRow = /<td>\s*1\s*g(?:ram)?\s*<\/td>\s*<td>\s*(?:&#x20b9;|₹)?\s*([\d,]+)\s*<\/td>/i;
    const matchRow = html.match(regexRow);
    if (matchRow) {
      const gramPrice = parseFloat(matchRow[1].replace(/,/g, ''));
      console.log(`  [GoodReturns] Silver ₹${gramPrice}/g (table row)`);
      return { gramPrice, kgPrice: gramPrice * 1000 };
    }
    throw new Error('Regex did not match silver table');
  } catch (err) {
    console.warn(`  [GoodReturns] Silver scrape failed: ${err.message}`);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FOREX RATES  —  multi-source with graceful fallback
//
//  Priority:
//    1. open.er-api.com  (free, no key, very reliable, updates every 24h)
//    2. api.frankfurter.app  (ECB-based, free)
//    3. api.exchangerate.host  (free tier)
//    4. hardcoded fallback
// ─────────────────────────────────────────────────────────────────────────────

async function getForexRates() {
  const CURRENCY_META = {
    EUR: { name: 'Euro',             symbol: '€'   },
    GBP: { name: 'British Pound',   symbol: '£'   },
    JPY: { name: 'Japanese Yen',    symbol: '¥'   },
    CAD: { name: 'Canadian Dollar', symbol: 'C$'  },
    AUD: { name: 'Australian Dollar', symbol: 'A$' },
    CHF: { name: 'Swiss Franc',     symbol: 'CHF' },
    INR: { name: 'Indian Rupee',    symbol: '₹'   },
    CNY: { name: 'Chinese Yuan',    symbol: '¥'   }
  };

  // Hardcoded fallback (updated Aug 2026)
  const FALLBACK = {
    EUR: 0.8659, GBP: 0.7422, JPY: 157.93,
    CAD: 1.3956, AUD: 1.4182, CHF: 0.8090,
    INR: 95.25,  CNY: 6.7651
  };

  let rawRates = null;

  // ── Source 1: open.er-api.com ────────────────────────────────────────────
  if (!rawRates) {
    try {
      const data = await fetchJson('https://open.er-api.com/v6/latest/USD');
      if (data?.result === 'success' && data?.rates) {
        rawRates = data.rates;
        console.log('  [Forex] Source: open.er-api.com ✓');
      }
    } catch (err) {
      console.warn('  [Forex] open.er-api.com failed:', err.message);
    }
  }

  // ── Source 2: frankfurter.app ────────────────────────────────────────────
  if (!rawRates) {
    try {
      const data = await fetchJson('https://api.frankfurter.app/latest?from=USD');
      if (data?.rates) {
        rawRates = data.rates;
        console.log('  [Forex] Source: frankfurter.app ✓ (fallback 1)');
      }
    } catch (err) {
      console.warn('  [Forex] frankfurter.app failed:', err.message);
    }
  }

  // ── Source 3: exchangerate.host ──────────────────────────────────────────
  if (!rawRates) {
    try {
      const data = await fetchJson('https://api.exchangerate.host/latest?base=USD');
      if (data?.rates) {
        rawRates = data.rates;
        console.log('  [Forex] Source: exchangerate.host ✓ (fallback 2)');
      }
    } catch (err) {
      console.warn('  [Forex] exchangerate.host failed:', err.message);
    }
  }

  // ── Source 4: hardcoded fallback ─────────────────────────────────────────
  if (!rawRates) {
    rawRates = FALLBACK;
    console.warn('  [Forex] All APIs failed — using hardcoded fallback rates');
  }

  return Object.keys(CURRENCY_META).map(code => {
    const usdToRate = Number(rawRates[code]) || FALLBACK[code];
    return {
      code,
      name: CURRENCY_META[code].name,
      symbol: CURRENCY_META[code].symbol,
      rateToUsd: Number((1 / usdToRate).toFixed(6)),
      usdToRate: Number(usdToRate.toFixed(4))
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const now = new Date();
  const year  = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day   = String(now.getUTCDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  console.log(`\n╔══════════════════════════════════════════════════╗`);
  console.log(`║  DailyVaultRates  —  Fetching Live Rates         ║`);
  console.log(`║  Date: ${dateStr}                              ║`);
  console.log(`╚══════════════════════════════════════════════════╝\n`);

  // Fetch GoodReturns (INR retail) and forex in parallel — no rate limits on these
  console.log('[Step 1/3] Fetching metal spot prices...');
  const [goodReturnsGold, goodReturnsSilver] = await Promise.all([
    scrapeGoodReturnsGold(),
    scrapeGoodReturnsSilver()
  ]);

  // Stagger Yahoo Finance requests to avoid 429 Too Many Requests
  // Yahoo allows ~1 req/sec comfortably from the same IP
  const goldUsdOzRaw     = await fetchYahooPrice('GC=F');   // Gold     USD/troy oz
  await sleep(600);
  const silverUsdOzRaw   = await fetchYahooPrice('SI=F');   // Silver   USD/troy oz
  await sleep(600);
  const platinumUsdOzRaw = await fetchYahooPrice('PL=F');   // Platinum USD/troy oz
  await sleep(600);
  const aluminumUsdMtRaw = await fetchYahooPrice('ALI=F');  // Aluminum USD/metric ton (COMEX)

  console.log('\n[Step 2/3] Fetching forex rates...');
  const currencies = await getForexRates();

  const inrCurr  = currencies.find(c => c.code === 'INR');
  const usdToInr = inrCurr ? inrCurr.usdToRate : 95.25;

  // ── GOLD ──────────────────────────────────────────────────────────────────
  const goldUsdOz   = goldUsdOzRaw || 4399.70;  // fallback to last known
  const goldUsdGram = Number((goldUsdOz / TROY_OZ_TO_GRAM).toFixed(2));

  let g24kInrGram, g22kInrGram, g18kInrGram;
  if (goodReturnsGold) {
    // GoodReturns gives accurate Indian retail prices directly
    g24kInrGram = goodReturnsGold.g24k;
    g22kInrGram = goodReturnsGold.g22k;
    g18kInrGram = goodReturnsGold.g18k;
  } else {
    // Derive from Yahoo spot price + live FX
    g24kInrGram = Number((goldUsdGram * usdToInr).toFixed(2));
    g22kInrGram = Number((g24kInrGram * 0.9167).toFixed(2));
    g18kInrGram = Number((g24kInrGram * 0.7500).toFixed(2));
  }

  const gold22kUsdOz = Number((g22kInrGram / usdToInr * TROY_OZ_TO_GRAM).toFixed(2));
  const gold18kUsdOz = Number((g18kInrGram / usdToInr * TROY_OZ_TO_GRAM).toFixed(2));

  // ── SILVER ────────────────────────────────────────────────────────────────
  const silverUsdOz   = silverUsdOzRaw || 63.50;
  const silverUsdGram = Number((silverUsdOz / TROY_OZ_TO_GRAM).toFixed(4));

  let silverInrGram, silverInrKg;
  if (goodReturnsSilver) {
    silverInrGram = goodReturnsSilver.gramPrice;
    silverInrKg   = goodReturnsSilver.kgPrice;
  } else {
    silverInrGram = Number((silverUsdGram * usdToInr).toFixed(2));
    silverInrKg   = Number((silverInrGram * 1000).toFixed(2));
  }

  // ── PLATINUM ──────────────────────────────────────────────────────────────
  const platinumUsdOz   = platinumUsdOzRaw || 1759.60;
  const platinumUsdGram = Number((platinumUsdOz / TROY_OZ_TO_GRAM).toFixed(2));
  const platinumInrGram = Number((platinumUsdGram * usdToInr).toFixed(2));
  const platinumInrKg   = Number((platinumInrGram * 1000).toFixed(2));

  // ── ALUMINUM ──────────────────────────────────────────────────────────────
  // ALI=F on COMEX is quoted in USD per metric ton (1 MT = 1000 kg = 1,000,000 g)
  const aluminumUsdMt   = aluminumUsdMtRaw || 3409.25;
  const aluminumUsdKg   = Number((aluminumUsdMt / 1000).toFixed(4));
  const aluminumUsdGram = Number((aluminumUsdKg / 1000).toFixed(6));
  const aluminumInrKg   = Number((aluminumUsdKg * usdToInr).toFixed(2));
  const aluminumInrGram = Number((aluminumUsdGram * usdToInr).toFixed(4));

  // ── Summary log ───────────────────────────────────────────────────────────
  console.log('\n[Step 3/3] Building output...');
  console.log(`\n  USD/INR: ${usdToInr}`);
  console.log(`  Gold 24K : ₹${g24kInrGram}/g    | $${goldUsdOz}/oz`);
  console.log(`  Gold 22K : ₹${g22kInrGram}/g    | $${gold22kUsdOz}/oz`);
  console.log(`  Gold 18K : ₹${g18kInrGram}/g    | $${gold18kUsdOz}/oz`);
  console.log(`  Silver   : ₹${silverInrGram}/g  | $${silverUsdOz}/oz`);
  console.log(`  Platinum : ₹${platinumInrGram}/g | $${platinumUsdOz}/oz`);
  console.log(`  Aluminum : ₹${aluminumInrKg}/kg | $${aluminumUsdMt}/mt\n`);

  // ── Build metals array ────────────────────────────────────────────────────
  const metals = [
    {
      id: 'gold-24k',
      name: 'Gold 24K (99.9% Pure)',
      symbol: 'XAU-24K',
      carat: '24K',
      purity: '99.9%',
      priceUsdOunce:  goldUsdOz,
      priceUsdGram:   goldUsdGram,
      priceInrGram:   g24kInrGram,
      priceInr10Gram: Number((g24kInrGram * 10).toFixed(2)),
      priceInrKg:     Number((g24kInrGram * 1000).toFixed(2)),
      unit: 'Troy Ounce',
      category: 'Precious Metals'
    },
    {
      id: 'gold-22k',
      name: 'Gold 22K (91.6% Jewelry)',
      symbol: 'XAU-22K',
      carat: '22K',
      purity: '91.6%',
      priceUsdOunce:  gold22kUsdOz,
      priceUsdGram:   Number((gold22kUsdOz / TROY_OZ_TO_GRAM).toFixed(2)),
      priceInrGram:   g22kInrGram,
      priceInr10Gram: Number((g22kInrGram * 10).toFixed(2)),
      priceInrKg:     Number((g22kInrGram * 1000).toFixed(2)),
      unit: 'Troy Ounce',
      category: 'Precious Metals'
    },
    {
      id: 'gold-18k',
      name: 'Gold 18K (75.0% Jewelry)',
      symbol: 'XAU-18K',
      carat: '18K',
      purity: '75.0%',
      priceUsdOunce:  gold18kUsdOz,
      priceUsdGram:   Number((gold18kUsdOz / TROY_OZ_TO_GRAM).toFixed(2)),
      priceInrGram:   g18kInrGram,
      priceInr10Gram: Number((g18kInrGram * 10).toFixed(2)),
      priceInrKg:     Number((g18kInrGram * 1000).toFixed(2)),
      unit: 'Troy Ounce',
      category: 'Precious Metals'
    },
    {
      id: 'silver',
      name: 'Silver (99.9% Fine)',
      symbol: 'XAG',
      carat: '999',
      purity: '99.9%',
      priceUsdOunce:  silverUsdOz,
      priceUsdGram:   silverUsdGram,
      priceInrGram:   silverInrGram,
      priceInr10Gram: Number((silverInrGram * 10).toFixed(2)),
      priceInrKg:     silverInrKg,
      unit: 'Troy Ounce',
      category: 'Precious Metals'
    },
    {
      id: 'platinum',
      name: 'Platinum (95.0% Pure)',
      symbol: 'XPT',
      carat: '950',
      purity: '95.0%',
      priceUsdOunce:  platinumUsdOz,
      priceUsdGram:   platinumUsdGram,
      priceInrGram:   platinumInrGram,
      priceInr10Gram: Number((platinumInrGram * 10).toFixed(2)),
      priceInrKg:     platinumInrKg,
      unit: 'Troy Ounce',
      category: 'Precious Metals'
    },
    {
      id: 'aluminum',
      name: 'Aluminum (99.7% Pure)',
      symbol: 'ALU',
      purity: '99.7%',
      priceUsdOunce:  Number((aluminumUsdGram * TROY_OZ_TO_GRAM).toFixed(5)),
      priceUsdGram:   aluminumUsdGram,
      priceUsdTon:    aluminumUsdMt,
      priceInrGram:   aluminumInrGram,
      priceInr10Gram: Number((aluminumInrGram * 10).toFixed(3)),
      priceInrKg:     aluminumInrKg,
      unit: 'Metric Ton',
      category: 'Industrial Metals'
    }
  ];

  const outputData = {
    date: dateStr,
    timestamp: now.getTime(),
    baseCurrency: 'USD',
    metals,
    currencies
  };

  // ── Validate before writing — never write corrupt/zero data ───────────────
  const PRICE_SANITY = {
    'gold-24k':  { min: 3000,   max: 15000,    field: 'priceUsdOunce' },
    'gold-22k':  { min: 2500,   max: 14000,    field: 'priceUsdOunce' },
    'gold-18k':  { min: 2000,   max: 12000,    field: 'priceUsdOunce' },
    'silver':    { min: 15,     max: 250,       field: 'priceUsdOunce' },
    'platinum':  { min: 600,    max: 4000,      field: 'priceUsdOunce' },
    'aluminum':  { min: 1000,   max: 8000,      field: 'priceUsdTon'   },
  };

  let validationFailed = false;
  for (const metal of metals) {
    const rule = PRICE_SANITY[metal.id];
    if (!rule) continue;
    const val = metal[rule.field];
    if (!val || isNaN(val) || val <= 0) {
      console.error(`❌ VALIDATION FAILED: ${metal.id}.${rule.field} is missing or zero (got: ${val})`);
      validationFailed = true;
    } else if (val < rule.min || val > rule.max) {
      // Warn but don't fail — prices can move significantly in a year
      console.warn(`⚠️  SANITY CHECK: ${metal.id}.${rule.field} = ${val} is outside expected range [${rule.min}, ${rule.max}]`);
    }
  }

  if (!currencies || currencies.length < 8) {
    console.error(`❌ VALIDATION FAILED: Expected 8 currencies, got ${currencies?.length || 0}`);
    validationFailed = true;
  }

  if (validationFailed) {
    console.error('\n❌ Data validation failed. Aborting write to prevent corrupt data file.');
    console.error('   The GitHub Action will retry automatically.\n');
    process.exit(1);
  }

  console.log('✅ Data validation passed.\n');

  const targetDir = path.join(__dirname, '..', 'data', year, month);
  fs.mkdirSync(targetDir, { recursive: true });

  // Atomic write: write to .tmp first, then rename to final path
  // This prevents a half-written file if the process is interrupted
  const filePath    = path.join(targetDir, `${day}.json`);
  const tmpFilePath = filePath + '.tmp';
  fs.writeFileSync(tmpFilePath, JSON.stringify(outputData, null, 2), 'utf8');
  fs.renameSync(tmpFilePath, filePath);

  console.log(`✅ Saved live rates → ${filePath}\n`);
}

main().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});

