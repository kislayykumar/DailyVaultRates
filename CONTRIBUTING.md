# 🤝 Contributing to DailyVaultRates

Welcome to **DailyVaultRates**! We are thrilled that you want to contribute to this open-source financial intelligence platform.

Whether you are fixing a bug, improving UI/UX design, adding new stock/metal tracking features, or optimizing performance, your contributions are warmly appreciated.

---

## 🎯 What Can You Contribute?

Here are some great ways to get involved:

- 🎨 **UI/UX Enhancements:** Design polished glassmorphic components, animations (Framer Motion), or mobile responsiveness tweaks.
- 📈 **Financial Markets & Equities:** Support new NSE/BSE stocks, global indices, or commodity futures.
- 🧮 **Financial Calculators:** Extend the Jewelry Estimator, add tax calculators (GST, Capital Gains), or SIP/Gold investment planners.
- ⚡ **Performance & API Optimization:** Enhance API route caching, reduce bundle size, or optimize SWR polling strategy.
- 🐛 **Bug Fixes & Refactoring:** Resolve open issues or improve TypeScript type definitions.
- 📝 **Documentation:** Improve guides, API documentation, or code comments.

---

## 🚀 Step-by-Step Contribution Guide

### Step 1: Find or Create an Issue
Before writing code, search our [GitHub Issues](https://github.com/kislayykumar/DailyVaultRates/issues).
- If an issue already exists for your bug or feature, comment to assign yourself.
- If no issue exists, [create a new issue](https://github.com/kislayykumar/DailyVaultRates/issues/new/choose) using our Bug Report or Feature Request templates.

---

### Step 2: Fork & Clone the Repository
1. Click the **Fork** button at the top-right of [DailyVaultRates Repository](https://github.com/kislayykumar/DailyVaultRates).
2. Clone your forked repository to your local machine:
   ```bash
   git clone https://github.com/YOUR_USERNAME/DailyVaultRates.git
   cd DailyVaultRates
   ```
3. Add the original repository as `upstream`:
   ```bash
   git remote add upstream https://github.com/kislayykumar/DailyVaultRates.git
   ```

---

### Step 3: Create a Feature Branch
Always create a new descriptive branch for your work:
```bash
# Sync with upstream main first
git fetch upstream
git checkout main
git merge upstream/main

# Create your feature branch
git checkout -b feature/your-feature-name
# Examples:
# git checkout -b feature/add-silver-chart
# git checkout -b fix/search-debounce-bug
# git checkout -b docs/update-contributing
```

---

### Step 4: Local Setup & Development
1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Start the Development Server:**
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser. Live changes will reload automatically.

---

### Step 5: Code & Design Conventions

To maintain code quality and UI elegance, please follow these guidelines:

1. **TypeScript:** Always write strictly typed code. Avoid using `any` — create proper interfaces under `lib/types.ts` or inside component files.
2. **Component Architecture:**
   - Keep UI components inside `components/`.
   - Place stock-related components inside `components/stocks/`.
   - Use Next.js 14 App Router standards.
3. **Typography & Styling:**
   - Use **Tailwind CSS**.
   - Use `font-mono tabular-nums` for all price readouts, percentage changes, and numbers to prevent visual layout shifts.
   - Use existing liquid glass surface classes (`.glass-card-pro`, `.glass-card-gold`, `.glass-card-emerald`).
4. **Icons:** Use icons from `lucide-react`.

---

### Step 6: Pre-Flight Verification Checklist (Run Before Pushing)

Before committing your code, test and verify locally:

```bash
# 1. Check for linter errors
npm run lint

# 2. Verify production build compilation
npm run build
```

Make sure `npm run build` finishes with **`✓ Compiled successfully`** and **zero errors**.

---

### Step 7: Commit & Push Your Changes

Write clear, semantic commit messages:
```bash
git add .
git commit -m "feat(stocks): add 52-week high low indicator bar to detail modal"
```

Push the branch to your GitHub fork:
```bash
git push origin feature/your-feature-name
```

---

### Step 8: Submit Your Pull Request (PR)

1. Go to your fork on GitHub and click **Compare & pull request**.
2. Title your PR clearly (e.g. `feat(stocks): add 52-week indicator bar`).
3. Fill out the pre-populated [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).
4. Link the issue it fixes (e.g. `Closes #12`).
5. Submit the PR!

---

## 🚦 Automated PR Checks & Approval Process

Once your Pull Request is opened:

1. **Automated CI Checks (`.github/workflows/pr-checks.yml`):**
   - Automatically runs on your PR.
   - Runs `npm ci`, `npm run lint`, `npm audit`, `npm run build`, and validates JSON data syntax.
2. **Code Owner Approval Gate:**
   - Per [.github/CODEOWNERS](.github/CODEOWNERS), all PRs require explicit review and approval from **`@kislayykumar`** before merging into `main`.
3. **Merging:** Once CI passes and `@kislayykumar` approves, your PR will be merged! 🎉

---

## ❓ Need Help?

If you get stuck or have questions:
- Open a discussion in [GitHub Discussions](https://github.com/kislayykumar/DailyVaultRates/discussions).
- Ask directly in your Pull Request comments.

Thank you for contributing and helping build the premier open-source market intelligence terminal! 🚀
