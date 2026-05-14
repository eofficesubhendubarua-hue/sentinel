# ◈ SENTINEL Intelligence Brief

**Automated daily intelligence news aggregator** — publishes at **8 AM & 10 PM IST** to a free website and your Gmail inbox.

![Status](https://img.shields.io/badge/status-active-00c853?style=flat-square)
![Cost](https://img.shields.io/badge/cost-FREE_forever-00e5ff?style=flat-square)
![Feeds](https://img.shields.io/badge/sources-40%2B_feeds-7c4dff?style=flat-square)

## 📡 What It Does

- Aggregates **40+ RSS feeds** across **12 intelligence categories**
- Publishes a stunning dark-themed website on **GitHub Pages** (free forever)
- Sends a formatted **email briefing** to your Gmail twice daily
- Archives every briefing permanently in the repository

## 📂 Categories

| # | Category | Sources |
|---|----------|---------|
| 1 | 🔴 Breaking News | BBC, Reuters, NDTV, Al Jazeera |
| 2 | 🌍 World News | BBC World, Reuters, Guardian, AP |
| 3 | 🇮🇳 India & What's Next | The Hindu, India Today, The Wire, ThePrint |
| 4 | 🏛️ Politics | The Hindu, NDTV, Foreign Policy, The Diplomat |
| 5 | 💼 Business | Economic Times, Moneycontrol, LiveMint |
| 6 | 📈 Share Market | ET Markets, Moneycontrol, NSE |
| 7 | ⚡ Technology | TechCrunch, The Verge, Wired, Ars Technica |
| 8 | 🤖 AI & Future | MIT Tech Review, VentureBeat, The Decoder |
| 9 | 🛡️ Cybersecurity | The Hacker News, BleepingComputer, Krebs |
| 10 | 🕵️ Intelligence/OSINT | Bellingcat, The War Zone, Defense One |
| 11 | 📚 Education | NDTV Education, India Today Education |
| 12 | ☠️ Cyber Threat Intel | CISA, Google Mandiant, SANS ISC |

## 🚀 Setup (One-Time, 5 Minutes)

### Step 1: Create GitHub Repository
```bash
cd sentinel
git init
git add .
git commit -m "🚀 Initial SENTINEL setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sentinel.git
git push -u origin main
```

### Step 2: Enable GitHub Pages
1. Go to your repo **Settings → Pages**
2. Under "Build and deployment", select **GitHub Actions** as source

### Step 3: Setup Gmail Email (Optional)
1. Enable **2FA** on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Create a new app password (name it "SENTINEL")
4. In your GitHub repo, go to **Settings → Secrets → Actions**
5. Add these secrets:
   - `GMAIL_USER` = your-email@gmail.com
   - `GMAIL_APP_PASSWORD` = the 16-character app password
   - `GMAIL_RECIPIENT` = email to receive briefings (defaults to GMAIL_USER)
   - `SITE_URL` = https://YOUR_USERNAME.github.io/sentinel

### Step 4: Test It
- Go to **Actions** tab → **SENTINEL Intelligence Brief** → **Run workflow**
- Your website will be live at `https://YOUR_USERNAME.github.io/sentinel`

## 🔧 Local Development

```bash
npm install
npm run build    # Aggregate + Generate HTML
npm run dev      # Serve locally on port 3000
```

## 💰 Cost

| Component | Service | Cost |
|-----------|---------|------|
| Hosting | GitHub Pages | **FREE** |
| Automation | GitHub Actions | **FREE** (2000 min/month) |
| News Data | RSS Feeds | **FREE** |
| Email | Gmail SMTP | **FREE** |

**Total: $0/month, forever.**

## 📜 License

MIT — Free to use, modify, and distribute.
