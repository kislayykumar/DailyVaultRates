# 🏛️ DailyVaultRates (Live Indian Stock Tracker & Deep Financial Analysis Suite)

[![Live Platform](https://img.shields.io/badge/Live_App-dailyvaultrates.vercel.app-00D4FF?style=for-the-badge&logo=vercel)](https://dailyvaultrates.vercel.app)
[![GitHub Stars](https://img.shields.io/github/stars/kislayykumar/DailyVaultRates?style=for-the-badge&color=gold&logo=github)](https://github.com/kislayykumar/DailyVaultRates/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Next.js 14](https://img.shields.io/badge/Framework-Next.js_14_App_Router-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Code Owner](https://img.shields.io/badge/Code_Owner-@kislayykumar-10B981?style=for-the-badge&logo=github)](https://github.com/kislayykumar)

**DailyVaultRates** is a high-density, institutional-grade financial intelligence suite designed for tracking **Precious Metals** (Gold 24K/22K/18K, Silver, Platinum), **Indian Equity Markets** (NIFTY 50, SENSEX, NSE/BSE Blue-Chip Watchlist), and **Global Forex Exchange Rates**.

> ⭐ **If you find this project useful, please consider giving it a Star on GitHub!** It helps the project grow and reach more open-source contributors.

---

## ✨ Features

- 🪙 **Precious Metals Vault:** Real-time spot rates for Gold 24K, 22K, 18K, Silver 999, Platinum, and Aluminum with IBJA alignment.
- 📈 **Live Indian Stock Tracker:** 10-second polling for NSE/BSE equities with Command-K (`⌘K`) fuzzy typo search.
- 📊 **Deep Financial Health Analysis:** 3-tabbed drawer (Overview with 52-week position slider, Key Ratios, Analyst Ratings & Consensus Targets).
- 🌐 **Global Forex Exchange:** Real-time currency matrix vs INR / USD.
- 🧮 **Jewelry Showroom Estimator:** Interactive weight sliders, preset shortcuts, and itemized invoice breakdown (Base Gold + Making Charges + Hallmark + 3% GST).
- 📄 **Executive PDF Export:** One-click PDF report generation for spot markets & individual stock analysis.
- ✉️ **3:35 PM IST Closing Digest:** Automated daily market closing email broadcast powered by Brevo & GitHub Actions.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router, Server Actions, Edge API Routes)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Lucide Icons, Framer Motion
- **Data Engine:** `yahoo-finance2`, `swr`
- **Email Dispatcher:** Brevo SMTP API, Node.js
- **CI/CD:** GitHub Actions

---

## 🚀 Quickstart Guide

### 1. Clone the repository
```bash
git clone https://github.com/kislayykumar/DailyVaultRates.git
cd DailyVaultRates
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🤝 Open-Source Contributing & Good First Issues

We warmly welcome open-source contributors! 

- Read our [CONTRIBUTING.md](CONTRIBUTING.md) guide.
- Check out beginner-friendly tasks under [Good First Issues](https://github.com/kislayykumar/DailyVaultRates/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

> [!IMPORTANT]
> - All Pull Requests automatically run automated CI checks (`.github/workflows/pr-checks.yml`).
> - Per [.github/CODEOWNERS](.github/CODEOWNERS), all PRs require explicit review and approval from **`@kislayykumar`** before merging into `main`.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).