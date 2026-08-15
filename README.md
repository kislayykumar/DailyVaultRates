# 🏛️ DailyVaultRates (Live Indian Stock Tracker & Deep Financial Analysis Suite)

[![Live Platform](https://img.shields.io/badge/Live_App-dailyvaultrates.vercel.app-00D4FF?style=for-the-badge&logo=vercel)](https://dailyvaultrates.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Next.js 14](https://img.shields.io/badge/Framework-Next.js_14_App_Router-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_3-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Code Owner](https://img.shields.io/badge/Code_Owner-@kislayykumar-10B981?style=for-the-badge&logo=github)](https://github.com/kislayykumar)

**DailyVaultRates** is a high-density, institutional-grade financial intelligence suite designed for tracking **Precious Metals** (Gold 24K/22K/18K, Silver, Platinum), **Indian Equity Markets** (NIFTY 50, SENSEX, NSE/BSE Blue-Chip Watchlist), and **Global Forex Exchange Rates**.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **`yahoo-finance2`**.

---

## 📸 Platform Highlights & Features

### 1. 🪙 Precious Metals Vault Terminal
- **Live Spot Rates:** 10-second polling for Gold 24K (Pure 99.9%), Gold 22K (Jewelry 91.6%), Gold 18K (75.0%), Silver 999 (Per Kg / Troy Oz), Platinum, and Aluminum.
- **Institutional Alignment:** Aligned with IBJA (India Bullion and Jewellers Association) and GoodReturns retail benchmarks.
- **Carat Switcher Tabs:** Instant calculation per gram, 10 grams, or per troy ounce.

### 2. 📈 Live Indian Stock Tracker & Benchmarks
- **Real-Time Quotes:** 10-second edge-cached quotes for NIFTY 50 (`^NSEI`), SENSEX (`^BSESN`), and top blue-chip equities (`RELIANCE.NS`, `TCS.NS`, `HDFCBANK.NS`, `INFY.NS`, `ICICIBANK.NS`, `BHARTIARTL.NS`, `TATAMOTORS.NS`, `SBIN.NS`).
- **IST Market Status Badge:** Dynamic IST market status indicator (9:15 AM - 3:30 PM IST open/closed state check) with last fetched IST timestamps (`15 Aug 2026, 03:31:36 PM IST`).

### 3. 🔍 Human-Like Fuzzy Typo Search Bar
- **Command-K (`⌘K` / `Ctrl+K`) Modal:** Instant modal search with debounced query execution and arrow-key keyboard navigation.
- **Levenshtein Distance Typo Tolerance:** Automatically handles misspellings and aliases (e.g. typing `relaince` $\rightarrow$ returns `Reliance Industries`, `tata motrs` $\rightarrow$ `Tata Motors`, `infisys` $\rightarrow$ `Infosys`, `sencex` $\rightarrow$ `SENSEX`).
- **Suggested Query Pill:** Displays feedback pills like `✨ Showing results for "Reliance Industries"`.

### 4. 📊 Deep Financial Health Analysis Drawer Modal
- **Overview Tab:** Real-time delayed SEBI feed, 52-Week Range position slider, market cap tier classification (Large Cap, Mid Cap, Small Cap).
- **Key Ratios Tab:** Color-coded financial health badges for P/E Ratio, P/B Ratio, Debt-to-Equity (D/E), Return on Equity (ROE), and Dividend Yield.
- **Analyst Ratings & Sentiment Tab:** Recommendation consensus progress bar (Strong Buy, Buy, Hold, Underperform, Sell) and analyst target price ranges.

### 5. 🌐 Global Forex Exchange Matrix
- Real-time exchange rates for 8 major currencies (`USD`, `EUR`, `GBP`, `AED`, `SAR`, `SGD`, `CAD`, `JPY`) relative to `INR` and `USD`.
- Active metallic currency toggle (`₹ INR` / `$ USD`) with instant global unit conversions.

### 6. 🧮 Jewelry Showroom Cost Estimator
- **Preset Weight Shortcuts:** Instant selection for Ring (4g), 10g Coin, Gold Chain (16g), Bangle Pair (24g), and Bridal Set (48g).
- **Itemized Invoice Matrix:** Transparent cost calculation detailing Base Gold Price + Crafting/Making Charges (% or ₹/g) + BIS Hallmarking Fee + 3% GST Tax.
- **Copy Receipt Button:** One-click copying of formatted purchase estimates for customer receipts.

### 7. 📄 Executive PDF Export Engine
- **Master Spot Market PDF:** One-click PDF download of current spot rates (`DailyVaultRates-Report-YYYY-MM-DD.pdf`).
- **Stock Analysis PDF:** Dedicated **"Export Stock PDF"** button in the analysis modal for downloading executive stock reports (e.g., `RELIANCE-Financial-Analysis-Report.pdf`).

### 8. ✉️ 3:35 PM IST Daily Market Closing Email Digest
- Automated daily email broadcast sent to subscribers at **3:35 PM IST** (5 minutes after Indian equity markets close).
- Includes closing prices for **NIFTY 50**, **SENSEX**, **Gold 24K**, **Silver 999**, and **USD/INR** powered by Brevo SMTP API and GitHub Actions.

---

## 🏗️ Repository Architecture & Directory Structure

```
DailyVaultRates/
├── .github/
│   ├── CODEOWNERS                       # Assigns @kislayykumar as required code owner
│   ├── PULL_REQUEST_TEMPLATE.md         # Pre-filled PR submission checklist
│   ├── ISSUE_TEMPLATE/                  # Bug report & feature request forms
│   └── workflows/
│       ├── daily-rates.yml              # Daily spot rates fetcher (9:30 AM, 3:30 PM, 5:30 PM IST)
│       ├── morning-digest.yml           # Market closing email digest (3:35 PM IST)
│       └── pr-checks.yml                # CI linting, security audit, build checks on all branches ('**')
├── app/
│   ├── api/
│   │   ├── analysis/route.ts            # 12-hour revalidated fundamental analysis endpoint
│   │   ├── search/route.ts              # Fuzzy typo-tolerant stock search endpoint
│   │   ├── stock/route.ts               # 10-second edge-cached real-time quotes API
│   │   └── subscribe/route.ts           # Brevo newsletter subscriber signup endpoint
│   ├── archive/[year]/[month]/[day]/    # Historical rate archive pages
│   ├── global-error.tsx                 # App Router global error boundary
│   ├── globals.css                      # Deep space lighting mesh, glassmorphism tokens, tabular fonts
│   ├── layout.tsx                       # Root layout with Space Grotesk, Inter, & JetBrains Mono fonts
│   └── page.tsx                         # Main homepage component
├── components/
│   ├── MarketTickerTape.tsx             # Top live cross-market marquee ticker tape (wrapped on mobile)
│   ├── Navbar.tsx                       # High-tech header with ⌘K search trigger & currency switcher
│   ├── DashboardView.tsx                # Single-workspace tabbed hub (Metals, Stocks, Forex, Calc)
│   ├── JewelryCalculator.tsx            # Weight sliders, presets, & itemized invoice matrix
│   ├── PdfDownloadButton.tsx            # Executive PDF report download engine
│   └── stocks/
│       ├── StockDashboardSection.tsx    # IST market status badge, benchmarks, & watchlist grid
│       ├── StockSearchBar.tsx           # Command-K search modal with debounced search
│       ├── StockDetailModal.tsx         # 3-tabbed deep analysis modal drawer
│       └── StockEducationSection.tsx    # SEO accordions (P/E ratio, SEBI tiers, interest rates)
├── data/                                # Git-as-a-Database historical JSON files (YYYY/MM/DD.json)
├── lib/                                 # Type definitions & data fetching helpers
├── scripts/
│   ├── fetch-rates.js                   # Unified metals + forex rate fetcher (yahoo-finance2)
│   └── send-daily-digest.js             # Market closing email digest broadcaster
├── CONTRIBUTING.md                      # Open-source contribution guidelines
├── SECURITY.md                          # Security vulnerability disclosure policy
└── LICENSE                              # MIT License
```

---

## ⚡ API Endpoints Reference

| Route | Method | Description | Cache / Behavior |
| :--- | :--- | :--- | :--- |
| `/api/stock?symbol=RELIANCE.NS` | `GET` | Fetches real-time stock quote and market stats | 10-second edge revalidation |
| `/api/search?q=relaince` | `GET` | Fuzzy search autocomplete with typo tolerance | Levenshtein distance alias lookup |
| `/api/analysis?symbol=RELIANCE.NS` | `GET` | Deep fundamental analysis (Ratios, Target Prices, 52w Range) | 12-hour revalidation |
| `/api/subscribe` | `POST` | Adds email subscriber to Brevo contact list | Brevo Contacts API |

---

## 🔑 Environment Variables (`.env.local`)

Create a `.env.local` file in the root directory for local testing:

```env
# Brevo SMTP & Newsletter API Key (Optional for email digest)
BREVO_API_KEY=your_brevo_api_key_here

# Sender Details (Optional - auto-discovers verified Brevo sender if omitted)
BREVO_SENDER_EMAIL=digest@dailyvaultrates.com
BREVO_SENDER_NAME="DailyVaultRates Vault"

# Base Application URL
APP_URL=http://localhost:3000
```

---

## 🤖 Automated GitHub Actions Workflows

1. **Daily Spot Rates Fetcher (`daily-rates.yml`):**
   - Schedules: `0 4 * * *` (9:30 AM IST), `0 10 * * *` (3:30 PM IST), `0 12 * * *` (5:30 PM IST).
   - Fetches live metals & forex rates via `scripts/fetch-rates.js`, validates JSON schemas, and commits to `data/YYYY/MM/DD.json`.

2. **Market Closing Email Digest (`morning-digest.yml`):**
   - Triggers via `workflow_run` immediately after `daily-rates.yml` completes, or on schedule at **3:35 PM IST** (`5 10 * * *`).
   - Fetches NIFTY 50 & SENSEX closing prices and broadcasts the HTML digest via Brevo API.

3. **PR Integration & Security Checks (`pr-checks.yml`):**
   - Triggers on every Pull Request targeting **any branch** (`'**'`).
   - Runs `npm ci`, `npm run lint`, `npm audit`, `npm run build`, and validates JSON data directory syntax.

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

### 2. Clone & Install
```bash
git clone https://github.com/kislayykumar/DailyVaultRates.git
cd DailyVaultRates
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build Production Bundle
```bash
npm run build
```

---

## 🤝 Open-Source Contributing

We welcome open-source contributions! Please review our [CONTRIBUTING.md](CONTRIBUTING.md) guide before submitting Pull Requests.

> [!IMPORTANT]
> - All Pull Requests automatically run automated CI checks (`.github/workflows/pr-checks.yml`).
> - Per [.github/CODEOWNERS](.github/CODEOWNERS), all PRs require explicit review and approval from **`@kislayykumar`** before merging into `main`.

---

## 🔒 Security

For security vulnerabilities, please refer to our [SECURITY.md](SECURITY.md) policy. Do not open public issues for sensitive security bugs.

---

## 📄 License

This repository is open-source software licensed under the [MIT License](LICENSE).