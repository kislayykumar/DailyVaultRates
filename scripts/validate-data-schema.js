/**
 * DailyVaultRates Data Schema & Integrity Validation Script
 * Runs during PR checks and Nightly Deep Analysis workflows.
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');

let totalFiles = 0;
let totalErrors = 0;
const errorsList = [];

function validateJsonFile(filePath) {
  totalFiles++;
  const filename = path.basename(filePath);

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);

    // 1. Check root required fields
    if (!data.date || typeof data.date !== 'string') {
      errorsList.push(`${filename}: Missing or invalid 'date' field.`);
    }

    if (!data.timestamp || typeof data.timestamp !== 'number') {
      errorsList.push(`${filename}: Missing or invalid 'timestamp' number.`);
    }

    // 2. Check metals array
    if (!Array.isArray(data.metals) || data.metals.length === 0) {
      errorsList.push(`${filename}: 'metals' array is missing or empty.`);
    } else {
      data.metals.forEach((m, idx) => {
        if (!m.id || !m.name) {
          errorsList.push(`${filename}: Metal item #${idx} missing id or name.`);
        }
        if (typeof m.priceUsdGram !== 'number' || m.priceUsdGram <= 0) {
          errorsList.push(`${filename}: Metal ${m.id || idx} invalid priceUsdGram.`);
        }
      });
    }

    // 3. Check currencies array
    if (!Array.isArray(data.currencies) || data.currencies.length === 0) {
      errorsList.push(`${filename}: 'currencies' array is missing or empty.`);
    } else {
      const inr = data.currencies.find((c) => c.code === 'INR');
      if (!inr || typeof inr.usdToRate !== 'number' || inr.usdToRate <= 0) {
        errorsList.push(`${filename}: Missing or invalid INR usdToRate.`);
      }
    }

    // 4. Check taxes object
    if (!data.taxes || typeof data.taxes.gstPercentage !== 'number') {
      errorsList.push(`${filename}: Missing or invalid 'taxes' object.`);
    }

  } catch (err) {
    errorsList.push(`${filename}: JSON syntax parse error - ${err.message}`);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (f.endsWith('.json')) {
      validateJsonFile(fullPath);
    }
  }
}

console.log('🔍 Starting Deep Data Integrity Scan...');
walk(dataDir);

if (errorsList.length > 0) {
  console.error(`❌ Validation failed with ${errorsList.length} error(s) across ${totalFiles} JSON files:`);
  errorsList.forEach((e) => console.error(`   - ${e}`));
  process.exit(1);
} else {
  console.log(`✅ Success! All ${totalFiles} historical market data JSON files passed schema & integrity checks.`);
}
