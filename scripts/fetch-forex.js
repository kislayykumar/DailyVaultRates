const fs = require('fs');
const path = require('path');
const https = require('https');

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
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

const CURRENCY_METADATA = {
  EUR: { name: 'Euro', symbol: '€' },
  GBP: { name: 'British Pound', symbol: '£' },
  JPY: { name: 'Japanese Yen', symbol: '¥' },
  CAD: { name: 'Canadian Dollar', symbol: 'C$' },
  AUD: { name: 'Australian Dollar', symbol: 'A$' },
  CHF: { name: 'Swiss Franc', symbol: 'CHF' },
  INR: { name: 'Indian Rupee', symbol: '₹' },
  CNY: { name: 'Chinese Yuan', symbol: '¥' }
};

const DEFAULT_RATES = {
  EUR: 0.8655,
  GBP: 0.7415,
  JPY: 157.881,
  CAD: 1.3954,
  AUD: 1.4164,
  CHF: 0.8085,
  INR: 83.88,
  CNY: 7.2345
};

async function main() {
  console.log('=== Fetching Foreign Exchange (Forex) Rates ===');
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  let usdRates = { ...DEFAULT_RATES };

  try {
    const data = await fetchJson('https://open.er-api.com/v6/latest/USD');
    if (data && data.rates) {
      console.log('  [ER-API] Successfully fetched latest exchange rates.');
      for (const code of Object.keys(CURRENCY_METADATA)) {
        if (data.rates[code]) {
          usdRates[code] = data.rates[code];
        }
      }
    }
  } catch (err) {
    console.warn(`  [ER-API] Failed: ${err.message}. Using backup rate estimations.`);
  }

  const currenciesList = Object.entries(CURRENCY_METADATA).map(([code, meta]) => {
    const usdToRate = Number((usdRates[code] || DEFAULT_RATES[code]).toFixed(6));
    const rateToUsd = Number((1 / usdToRate).toFixed(6));
    return {
      code,
      name: meta.name,
      symbol: meta.symbol,
      rateToUsd,
      usdToRate
    };
  });

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

  // Update currencies and forex fields, updatedAt and timestamp
  existingData.currencies = currenciesList;
  existingData.forex = currenciesList;
  existingData.updatedAt = new Date().toISOString();
  existingData.timestamp = Date.now();

  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
  console.log(`✅ Forex rates successfully updated and saved to ${filePath}`);
}

main().catch(err => {
  console.error('❌ Error fetching forex rates:', err);
  process.exit(1);
});
