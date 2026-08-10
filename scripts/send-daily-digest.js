const fs = require('fs');
const path = require('path');
const https = require('https');

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

function generateEmailHtml(rateData) {
  const dateStr = rateData?.date || new Date().toISOString().split('T')[0];
  const metals = rateData?.metals || [];
  const currencies = rateData?.currencies || rateData?.forex || [];

  const gold24k = metals.find(m => m.id === 'gold-24k') || metals[0] || {};
  const gold22k = metals.find(m => m.id === 'gold-22k') || metals[1] || {};
  const silver = metals.find(m => m.id === 'silver') || {};
  const inrFx = currencies.find(c => c.code === 'INR') || { usdToRate: 83.88 };

  const appUrl = process.env.APP_URL || 'https://dailyvaultrates.vercel.app';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DailyVaultRates Morning Digest</title>
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
              <p style="color:#94a3b8; margin: 6px 0 0 0; font-size:13px;">Official Daily Metals & Forex Market Vault</p>
              <div style="display:inline-block; margin-top:12px; padding:4px 12px; background-color:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:20px; color:#fbbf24; font-size:12px; font-weight:600;">
                Report Date: ${dateStr}
              </div>
            </td>
          </tr>

          <!-- Key Highlights -->
          <tr>
            <td style="padding: 24px 30px 10px 30px;">
              <h2 style="color:#ffffff; font-size:16px; margin:0 0 16px 0; border-left:4px solid #f59e0b; padding-left:10px;">Today's Spot Rate Highlights</h2>
              
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
                    <div style="color:#64748b; font-size:11px; margin-top:4px;">Official Spot</div>
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
              <a href="${appUrl}" target="_blank" style="display:inline-block; background: linear-gradient(90deg, #f59e0b, #d97706); color:#090d16; font-size:14px; font-weight:800; text-decoration:none; padding: 14px 28px; border-radius:12px; box-shadow:0 4px 14px rgba(245,158,11,0.3);">
                View Interactive Vault Dashboard →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#020617; padding:20px; text-align:center; border-top:1px solid #1e293b;">
              <p style="color:#64748b; font-size:11px; margin:0;">
                Sent automatically by DailyVaultRates Git-as-a-Database Engine.<br>
                Powered by Brevo Email Systems. © ${new Date().getFullYear()} DailyVaultRates.
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
      if (Array.isArray(data.contacts) && data.contacts.length > 0) {
        return data.contacts.map(c => ({
          email: c.email,
          name: c.attributes?.FIRSTNAME || 'Subscriber'
        }));
      }
    }
  } catch (err) {
    console.warn('[Brevo] Could not fetch Brevo List 2 contacts dynamically:', err.message);
  }
  return [];
}

async function main() {
  console.log('=== Preparing Morning Rate Digest Broadcast ===');
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.error('❌ BREVO_API_KEY environment variable is not defined.');
    process.exit(1);
  }

  const rateData = findLatestDataFile();
  if (!rateData) {
    console.error('❌ No rate data found in repository data directory.');
    process.exit(1);
  }

  const htmlContent = generateEmailHtml(rateData);

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

  console.log(`Broadcasting morning digest email from <${senderEmail}> to ${recipients.length} subscriber(s)...`);

  const payload = JSON.stringify({
    sender: { name: senderName, email: senderEmail },
    to: recipients,
    subject: `DailyVaultRates Digest: Spot Metal & FX Rates for ${rateData.date}`,
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
      console.log(`✅ Morning digest email successfully sent to ${recipients.length} subscriber(s)!`);
    } else {
      console.warn('⚠️ Brevo response indicated an issue. Please check sender email verification in Brevo.');
    }
  } catch (err) {
    console.error('❌ Failed sending morning digest email:', err);
    process.exit(1);
  }
}

main();
