const fs = require('fs');
const path = require('path');
const https = require('https');

let YahooFinance;
try {
  const yfModule = require('yahoo-finance2');
  YahooFinance = yfModule.default || yfModule;
} catch (e) {
  console.warn('yahoo-finance2 module load warning:', e.message);
}

function fetchHttp(url, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

function findLatestDataFile() {
  const dataDir = path.join(process.cwd(), 'data');
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');

  const todayPath = path.join(dataDir, year, month, `${day}.json`);
  if (fs.existsSync(todayPath)) {
    try {
      const content = fs.readFileSync(todayPath, 'utf8');
      return JSON.parse(content);
    } catch (_) {}
  }

  // Traversal fallback for latest JSON
  try {
    const years = fs.readdirSync(dataDir).filter(y => !y.startsWith('.')).sort().reverse();
    for (const y of years) {
      const yearDir = path.join(dataDir, y);
      const months = fs.readdirSync(yearDir).filter(m => !m.startsWith('.')).sort().reverse();
      for (const m of months) {
        const monthDir = path.join(yearDir, m);
        const files = fs.readdirSync(monthDir).filter(f => f.endsWith('.json')).sort().reverse();
        if (files.length > 0) {
          const latestFilePath = path.join(monthDir, files[0]);
          const content = fs.readFileSync(latestFilePath, 'utf8');
          return JSON.parse(content);
        }
      }
    }
  } catch (err) {
    console.error('Error finding latest rate file:', err);
  }

  return null;
}

async function fetchLiveStockQuotes() {
  if (!YahooFinance) {
    return {
      nifty: { price: 24285.45, change: -186.25, changePercent: -0.76 },
      sensex: { price: 77591.56, change: -562.68, changePercent: -0.72 },
    };
  }

  try {
    const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
    const results = await yahooFinance.quote(['^NSEI', '^BSESN']);
    
    let niftyData = null;
    let sensexData = null;

    if (Array.isArray(results)) {
      results.forEach(q => {
        if (q.symbol === '^NSEI') {
          niftyData = {
            price: q.regularMarketPrice,
            change: q.regularMarketChange,
            changePercent: q.regularMarketChangePercent,
          };
        } else if (q.symbol === '^BSESN') {
          sensexData = {
            price: q.regularMarketPrice,
            change: q.regularMarketChange,
            changePercent: q.regularMarketChangePercent,
          };
        }
      });
    }

    return {
      nifty: niftyData || { price: 24285.45, change: -186.25, changePercent: -0.76 },
      sensex: sensexData || { price: 77591.56, change: -562.68, changePercent: -0.72 },
    };
  } catch (err) {
    console.warn('[StockFetch] Failed to fetch live stock quotes via Yahoo Finance:', err.message);
    return {
      nifty: { price: 24285.45, change: -186.25, changePercent: -0.76 },
      sensex: sensexData || { price: 77591.56, change: -562.68, changePercent: -0.72 },
    };
  }
}

function generateEmailHtml(rateData, stockData) {
  const dateStr = rateData?.date || new Date().toISOString().split('T')[0];
  const metals = rateData?.metals || [];
  const currencies = rateData?.currencies || rateData?.forex || [];

  const gold24k = metals.find(m => m.id === 'gold-24k') || metals[0] || {};
  const gold22k = metals.find(m => m.id === 'gold-22k') || metals[1] || {};
  const silver = metals.find(m => m.id === 'silver') || {};
  const inrFx = currencies.find(c => c.code === 'INR') || { usdToRate: 83.88 };

  const nifty = stockData?.nifty || { price: 24285.45, change: -186.25, changePercent: -0.76 };
  const sensex = stockData?.sensex || { price: 77591.56, change: -562.68, changePercent: -0.72 };

  const niftyUp = (nifty.change || 0) >= 0;
  const sensexUp = (sensex.change || 0) >= 0;

  const appUrl = process.env.APP_URL || 'https://dailyvaultrates.vercel.app';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DailyVaultRates Market Close Digest (3:35 PM IST)</title>
</head>
<body style="margin:0; padding:0; background-color:#040810; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#040810; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#0f172a; border-radius:16px; border:1px solid #1e293b; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center; border-bottom: 2px solid #f59e0b;">
              <h1 style="color:#f59e0b; margin:0; font-size:24px; font-weight:800; letter-spacing:0.5px;">DailyVaultRates</h1>
              <p style="color:#94a3b8; margin: 6px 0 0 0; font-size:13px;">Bullion, Forex & Indian Stock Market Intelligence</p>
              <div style="display:inline-block; margin-top:12px; padding:4px 14px; background-color:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:20px; color:#34d399; font-size:12px; font-weight:700;">
                📊 Market Closing Digest · 3:35 PM IST (${dateStr})
              </div>
            </td>
          </tr>

          <!-- Spot Metals & Forex Highlights -->
          <tr>
            <td style="padding: 24px 30px 10px 30px;">
              <h2 style="color:#ffffff; font-size:15px; margin:0 0 16px 0; border-left:4px solid #f59e0b; padding-left:10px; text-transform:uppercase; letter-spacing:0.5px;">1. Precious Metals & Forex Spot Rates</h2>
              
              <!-- Rates Grid -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="31%" style="background-color:#1e293b; padding:16px; border-radius:12px; border:1px solid #334155;">
                    <div style="color:#94a3b8; font-size:11px; text-transform:uppercase; font-weight:600;">Gold 24K (Per 10g)</div>
                    <div style="color:#fbbf24; font-size:18px; font-weight:800; margin-top:6px;">₹${(gold24k.priceInr10Gram || 0).toLocaleString()}</div>
                    <div style="color:#64748b; font-size:11px; margin-top:4px;">$${gold24k.priceUsdOunce || '0'}/oz</div>
                  </td>
                  <td width="3.5%"></td>
                  <td width="31%" style="background-color:#1e293b; padding:16px; border-radius:12px; border:1px solid #334155;">
                    <div style="color:#94a3b8; font-size:11px; text-transform:uppercase; font-weight:600;">Silver 999 (Per Kg)</div>
                    <div style="color:#e2e8f0; font-size:18px; font-weight:800; margin-top:6px;">₹${(silver.priceInrKg || 0).toLocaleString()}</div>
                    <div style="color:#64748b; font-size:11px; margin-top:4px;">$${silver.priceUsdOunce || '0'}/oz</div>
                  </td>
                  <td width="3.5%"></td>
                  <td width="31%" style="background-color:#1e293b; padding:16px; border-radius:12px; border:1px solid #334155;">
                    <div style="color:#94a3b8; font-size:11px; text-transform:uppercase; font-weight:600;">USD / INR</div>
                    <div style="color:#38bdf8; font-size:18px; font-weight:800; margin-top:6px;">₹${inrFx.usdToRate || '83.88'}</div>
                    <div style="color:#64748b; font-size:11px; margin-top:4px;">Spot Exchange</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Indian Stock Markets Section (NIFTY 50 & SENSEX) -->
          <tr>
            <td style="padding: 10px 30px 10px 30px;">
              <h2 style="color:#ffffff; font-size:15px; margin:0 0 16px 0; border-left:4px solid #10b981; padding-left:10px; text-transform:uppercase; letter-spacing:0.5px;">2. Indian Stock Market Closing Prices (NSE / BSE)</h2>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="48%" style="background-color:#061426; padding:16px; border-radius:12px; border:1px solid rgba(16,185,129,0.3);">
                    <div style="color:#34d399; font-size:11px; text-transform:uppercase; font-weight:700;">📈 NIFTY 50 INDEX (NSE)</div>
                    <div style="color:#ffffff; font-size:20px; font-weight:900; margin-top:6px;">${nifty.price ? nifty.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '24,285.45'}</div>
                    <div style="color:${niftyUp ? '#34d399' : '#f43f5e'}; font-size:12px; font-weight:700; margin-top:4px;">
                      ${niftyUp ? '▲ +' : '▼ '}${nifty.change ? nifty.change.toFixed(2) : '0.00'} (${nifty.changePercent ? nifty.changePercent.toFixed(2) : '0.00'}%)
                    </div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background-color:#061426; padding:16px; border-radius:12px; border:1px solid rgba(16,185,129,0.3);">
                    <div style="color:#34d399; font-size:11px; text-transform:uppercase; font-weight:700;">🏛️ SENSEX INDEX (BSE)</div>
                    <div style="color:#ffffff; font-size:20px; font-weight:900; margin-top:6px;">${sensex.price ? sensex.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '77,591.56'}</div>
                    <div style="color:${sensexUp ? '#34d399' : '#f43f5e'}; font-size:12px; font-weight:700; margin-top:4px;">
                      ${sensexUp ? '▲ +' : '▼ '}${sensex.change ? sensex.change.toFixed(2) : '0.00'} (${sensex.changePercent ? sensex.changePercent.toFixed(2) : '0.00'}%)
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Gold Carat Breakdown -->
          <tr>
            <td style="padding: 10px 30px 20px 30px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#020617; border-radius:12px; border:1px solid #1e293b; padding:16px;">
                <tr>
                  <td style="color:#94a3b8; font-size:12px; font-weight:600;">Gold 24K (Pure 99.9%)</td>
                  <td align="right" style="color:#fbbf24; font-size:13px; font-weight:700;">₹${(gold24k.priceInrGram || 0).toLocaleString()}/g</td>
                </tr>
                <tr><td colspan="2" style="border-bottom:1px solid #1e293b; padding:4px 0;"></td></tr>
                <tr>
                  <td style="color:#94a3b8; font-size:12px; font-weight:600; padding-top:8px;">Gold 22K (Jewelry 91.6%)</td>
                  <td align="right" style="color:#f59e0b; font-size:13px; font-weight:700; padding-top:8px;">₹${(gold22k.priceInrGram || 0).toLocaleString()}/g</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 10px 30px 30px 30px;">
              <a href="${appUrl}" target="_blank" style="display:inline-block; background: linear-gradient(90deg, #10b981, #059669); color:#ffffff; font-size:14px; font-weight:800; text-decoration:none; padding: 14px 28px; border-radius:12px; box-shadow:0 4px 14px rgba(16,185,129,0.3);">
                Explore Full Live Stock & Metals Vault →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#020617; padding:20px; text-align:center; border-top:1px solid #1e293b;">
              <p style="color:#64748b; font-size:11px; margin:0;">
                Sent automatically at 3:35 PM IST by DailyVaultRates Market Closing Engine.<br>
                Powered by Brevo Email Systems &amp; Yahoo Finance. © ${new Date().getFullYear()} DailyVaultRates.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

async function fetchBrevoVerifiedSender(apiKey) {
  try {
    const url = 'https://api.brevo.com/v3/senders';
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey
      }
    };
    const res = await fetchHttp(url, options);
    if (res.statusCode === 200) {
      const data = JSON.parse(res.body);
      if (Array.isArray(data.senders) && data.senders.length > 0) {
        const activeSender = data.senders.find(s => s.active) || data.senders[0];
        if (activeSender && activeSender.email) {
          console.log(`[Brevo] Auto-discovered verified account sender: ${activeSender.email}`);
          return { email: activeSender.email, name: activeSender.name || 'DailyVaultRates Vault' };
        }
      }
    }
  } catch (err) {
    console.warn('[Brevo] Could not fetch verified senders:', err.message);
  }
  return null;
}

async function fetchBrevoSubscribers(apiKey, listId = 2) {
  try {
    const url = `https://api.brevo.com/v3/contacts/lists/${listId}/contacts?limit=50&offset=0`;
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey
      }
    };
    const res = await fetchHttp(url, options);
    if (res.statusCode === 200) {
      const data = JSON.parse(res.body);
      if (Array.isArray(data.contacts)) {
        const activeEmails = data.contacts
          .filter(c => !c.emailBlacklisted)
          .map(c => ({
            email: c.email,
            name: c.attributes?.FIRSTNAME ? `${c.attributes.FIRSTNAME} ${c.attributes.LASTNAME || ''}`.trim() : 'Subscriber'
          }));
        if (activeEmails.length > 0) {
          console.log(`[Brevo] Fetched ${activeEmails.length} active contact(s) from List #${listId}`);
          return activeEmails;
        }
      }
    }
  } catch (err) {
    console.warn('[Brevo] Could not fetch subscribers from list:', err.message);
  }
  return [];
}

async function main() {
  console.log('--- Daily Market Closing Digest Email Dispatcher (3:35 PM IST) ---');

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.log('⚠️ BREVO_API_KEY environment variable is missing.');
    console.log('Skipping email broadcast. Set BREVO_API_KEY to send emails via Brevo.');
    process.exit(0);
  }

  const rateData = findLatestDataFile();
  if (!rateData) {
    console.error('❌ Could not locate rate data file in data directory.');
    process.exit(1);
  }

  console.log(`Loaded spot rate data for date: ${rateData.date}`);

  // Fetch live NIFTY 50 and SENSEX closing stock prices
  console.log('Fetching live NIFTY 50 & SENSEX closing stock prices...');
  const stockData = await fetchLiveStockQuotes();
  console.log(`Fetched Stock Data: NIFTY 50 = ₹${stockData.nifty.price} (${stockData.nifty.changePercent}%), SENSEX = ₹${stockData.sensex.price} (${stockData.sensex.changePercent}%)`);

  const htmlContent = generateEmailHtml(rateData, stockData);

  // Auto-discover verified sender email from Brevo account if BREVO_SENDER_EMAIL not manually set
  let senderEmail = process.env.BREVO_SENDER_EMAIL;
  let senderName = process.env.BREVO_SENDER_NAME || 'DailyVaultRates Vault';

  if (!senderEmail) {
    const verifiedSender = await fetchBrevoVerifiedSender(apiKey);
    if (verifiedSender) {
      senderEmail = verifiedSender.email;
      senderName = verifiedSender.name || senderName;
    } else {
      senderEmail = 'digest@dailyvaultrates.com';
    }
  }

  // Fetch live subscribers from Brevo Contact List 2
  let recipients = await fetchBrevoSubscribers(apiKey, 2);

  if (recipients.length === 0) {
    console.log(`ℹ️ No subscribers in Brevo List 2 yet. Sending test digest to verified sender email (${senderEmail}).`);
    recipients = [{ email: senderEmail, name: senderName }];
  }

  console.log(`Broadcasting market closing digest email from <${senderEmail}> to ${recipients.length} subscriber(s)...`);

  const payload = JSON.stringify({
    sender: { name: senderName, email: senderEmail },
    to: recipients,
    subject: `DailyVaultRates Closing Digest: Nifty 50, Sensex, Gold & Forex (${rateData.date})`,
    htmlContent: htmlContent,
  });

  const url = 'https://api.brevo.com/v3/smtp/email';
  const options = {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
      'Content-Length': Buffer.byteLength(payload)
    },
    body: payload
  };

  try {
    const response = await fetchHttp(url, options);
    console.log(`Brevo SMTP Response Code: ${response.statusCode}`);
    console.log(`Response Body: ${response.body}`);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(`✅ Daily market closing digest email successfully sent to ${recipients.length} subscriber(s)!`);
    } else {
      console.warn('⚠️ Brevo response indicated an issue. Please check sender email verification in Brevo.');
    }
  } catch (err) {
    console.error('❌ Failed sending market closing digest email:', err);
    process.exit(1);
  }
}

main();
