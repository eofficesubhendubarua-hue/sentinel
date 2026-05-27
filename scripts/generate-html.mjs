// ============================================================
// SENTINEL Intelligence Brief — Static HTML Page Generator
// Generates a stunning dark-themed intelligence dashboard
// ============================================================

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "data");
const PUBLIC_DIR = join(ROOT, "public");

// ─── Load briefing data ───────────────────────────────────

function loadBriefing() {
  const dataPath = join(DATA_DIR, "latest.json");
  if (!existsSync(dataPath)) {
    console.error("❌ No data/latest.json found. Run aggregate first.");
    process.exit(1);
  }
  return JSON.parse(readFileSync(dataPath, "utf-8"));
}

// ─── Time formatting ──────────────────────────────────────

function formatPubDate(isoStr) {
  try {
    const d = new Date(isoStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─── Generate HTML ────────────────────────────────────────

function generateHTML(briefing) {
  const { meta, categories } = briefing;
  const categoryEntries = Object.entries(categories).sort(
    (a, b) => a[1].priority - b[1].priority
  );

  // Build category navigation
  const categoryNav = categoryEntries
    .map(
      ([id, cat]) =>
        `<button class="cat-btn" data-category="${id}" onclick="filterCategory('${id}')">${cat.icon} ${cat.shortName}</button>`
    )
    .join("\n            ");

  // Build category sections
  const categorySections = categoryEntries
    .map(([id, cat]) => {
      let injectedReport = "";
      if (id === "daily_market_news") {
        const niftyPath = join(DATA_DIR, "market_report.html");
        const sensexPath = join(DATA_DIR, "market_report_sensex.html");
        const usPath = join(DATA_DIR, "market_report_us.html");
        
        if (existsSync(niftyPath)) {
          console.log("🟢 Injected Indian Market Daily 9:20 Report into Daily Markets category grid.");
          injectedReport += readFileSync(niftyPath, "utf-8");
        }
        if (existsSync(sensexPath)) {
          console.log("🟢 Injected BSE Sensex Report into Daily Markets category grid.");
          injectedReport += readFileSync(sensexPath, "utf-8");
        }
        if (existsSync(usPath)) {
          console.log("🟢 Injected American Market Report into Daily Markets category grid.");
          injectedReport += readFileSync(usPath, "utf-8");
        }
      }

      const articlesHTML = injectedReport + cat.articles
        .map(
          (article) => `
                <article class="news-card" data-category="${id}">
                    <div class="card-image-wrapper">
                        <div class="card-hud-crosshair"></div>
                        <img class="card-image" src="${escapeHtml(article.image || '')}" alt="${escapeHtml(article.title)}" loading="lazy">
                    </div>
                    <div class="card-body">
                        <div class="card-source">
                            <span class="source-badge">${escapeHtml(article.source)}</span>
                            <span class="card-time">${formatPubDate(article.pubDate)}</span>
                        </div>
                        <h3 class="card-title">
                            <a href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(article.title)}</a>
                        </h3>
                        <p class="card-desc">${escapeHtml(article.description)}</p>
                        <div class="card-footer">
                            <a href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer" class="read-more">
                                Read Full →
                            </a>
                        </div>
                    </div>
                </article>`
        )
        .join("\n");

      return `
            <section class="category-section" id="section-${id}" data-category="${id}">
                <div class="section-header">
                    <h2>${cat.icon} ${escapeHtml(cat.name)}</h2>
                    <span class="article-count">${cat.articleCount} articles</span>
                </div>
                <p class="section-desc">${escapeHtml(cat.description)}</p>
                <div class="news-grid">
                    ${articlesHTML}
                </div>
            </section>`;
    })
    .join("\n");

  // ─── Market Intelligence Hub ─────────────────────────────
  const marketWidget = `
            <section class="category-section market-widget-section" id="section-market-tools">
                <div class="section-header">
                    <h2>📊 Market Intelligence Hub — Stocks, MF, ETF & Screener</h2>
                </div>
                <p class="section-desc">Free, comprehensive market tools — Indian & international markets, stocks, mutual funds, ETFs, insider data. No login required.</p>

                <div class="cyber-ticker-container">
                    <div class="ticker-header">LIVE_MARKET_TELEMETRY</div>
                    <div class="cyber-ticker-wrap">
                        <div class="cyber-ticker-track" id="cyber-ticker-track-el">
                            <!-- Populated & updated continuously by app.js -->
                        </div>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">🔴 Live Indices — India & US</h3>
                    <div class="market-links">
                        <a href="https://www.google.com/finance/quote/NIFTY_50:INDEXNSE" target="_blank" rel="noopener noreferrer" class="market-link-card india-card"><span class="market-icon">🇮🇳</span><span class="market-name">Nifty 50</span><span class="market-desc">NSE benchmark</span></a>
                        <a href="https://www.google.com/finance/quote/SENSEX:INDEXBOM" target="_blank" rel="noopener noreferrer" class="market-link-card india-card"><span class="market-icon">🇮🇳</span><span class="market-name">Sensex</span><span class="market-desc">BSE 30</span></a>
                        <a href="https://www.google.com/finance/quote/BANK_NIFTY:INDEXNSE" target="_blank" rel="noopener noreferrer" class="market-link-card india-card"><span class="market-icon">🏦</span><span class="market-name">Bank Nifty</span><span class="market-desc">Banking index</span></a>
                        <a href="https://www.google.com/finance/quote/.DJI:INDEXDJX" target="_blank" rel="noopener noreferrer" class="market-link-card us-card"><span class="market-icon">🇺🇸</span><span class="market-name">Dow Jones</span><span class="market-desc">US 30 blue chips</span></a>
                        <a href="https://www.google.com/finance/quote/.INX:INDEXSP" target="_blank" rel="noopener noreferrer" class="market-link-card us-card"><span class="market-icon">🇺🇸</span><span class="market-name">S&P 500</span><span class="market-desc">US large-cap</span></a>
                        <a href="https://www.google.com/finance/quote/.IXIC:INDEXNASDAQ" target="_blank" rel="noopener noreferrer" class="market-link-card us-card"><span class="market-icon">🇺🇸</span><span class="market-name">NASDAQ</span><span class="market-desc">US tech index</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">🔍 Stock Screeners — Deep Analysis (FREE)</h3>
                    <div class="market-links">
                        <a href="https://www.screener.in/" target="_blank" rel="noopener noreferrer" class="market-link-card screener-card"><span class="market-icon">🔬</span><span class="market-name">Screener.in</span><span class="market-desc">Indian fundamentals — PE, ROCE, profit</span></a>
                        <a href="https://www.screener.in/screens/71/rising-stars/" target="_blank" rel="noopener noreferrer" class="market-link-card screener-card"><span class="market-icon">⭐</span><span class="market-name">Rising Stars</span><span class="market-desc">High growth, low debt stocks</span></a>
                        <a href="https://finviz.com/screener.ashx" target="_blank" rel="noopener noreferrer" class="market-link-card screener-card"><span class="market-icon">🇺🇸</span><span class="market-name">Finviz Screener</span><span class="market-desc">US stocks — PE, EPS, insider trades</span></a>
                        <a href="https://finviz.com/map.ashx" target="_blank" rel="noopener noreferrer" class="market-link-card screener-card"><span class="market-icon">🗺️</span><span class="market-name">S&P 500 Heatmap</span><span class="market-desc">Visual market overview at a glance</span></a>
                        <a href="https://finance.yahoo.com/screener/" target="_blank" rel="noopener noreferrer" class="market-link-card screener-card"><span class="market-icon">📊</span><span class="market-name">Yahoo Screener</span><span class="market-desc">Global stocks, 100+ filters</span></a>
                        <a href="https://www.tradingview.com/screener/" target="_blank" rel="noopener noreferrer" class="market-link-card screener-card"><span class="market-icon">📉</span><span class="market-name">TradingView Screener</span><span class="market-desc">Technical + fundamental, real-time</span></a>
                        <a href="https://stockanalysis.com/stocks/" target="_blank" rel="noopener noreferrer" class="market-link-card screener-card"><span class="market-icon">📈</span><span class="market-name">Stock Analysis</span><span class="market-desc">Free 10yr financials, DCF, peers</span></a>
                        <a href="https://www.tickertape.in/screener" target="_blank" rel="noopener noreferrer" class="market-link-card screener-card"><span class="market-icon">🎯</span><span class="market-name">Tickertape</span><span class="market-desc">200+ filters, forecasts, peers</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">🏛️ Mutual Fund Analysis — India (FREE)</h3>
                    <div class="market-links">
                        <a href="https://www.valueresearchonline.com/funds/" target="_blank" rel="noopener noreferrer" class="market-link-card mf-card"><span class="market-icon">⭐</span><span class="market-name">Value Research</span><span class="market-desc">Ratings, portfolio X-ray, SIP calc</span></a>
                        <a href="https://www.morningstar.in/mutualfunds/default.aspx" target="_blank" rel="noopener noreferrer" class="market-link-card mf-card"><span class="market-icon">🌟</span><span class="market-name">Morningstar India</span><span class="market-desc">Star ratings, risk analysis</span></a>
                        <a href="https://www.amfiindia.com/net-asset-value/nav-history" target="_blank" rel="noopener noreferrer" class="market-link-card mf-card"><span class="market-icon">📋</span><span class="market-name">AMFI NAV Data</span><span class="market-desc">Official NAV for ALL Indian MFs</span></a>
                        <a href="https://www.moneycontrol.com/mutual-funds/" target="_blank" rel="noopener noreferrer" class="market-link-card mf-card"><span class="market-icon">💰</span><span class="market-name">MC Mutual Funds</span><span class="market-desc">Compare, SIP returns, top funds</span></a>
                        <a href="https://www.tickertape.in/mutual-funds/screener" target="_blank" rel="noopener noreferrer" class="market-link-card mf-card"><span class="market-icon">🎯</span><span class="market-name">MF Screener</span><span class="market-desc">Expense ratio, AUM, returns</span></a>
                        <a href="https://www.etmoney.com/mutual-funds" target="_blank" rel="noopener noreferrer" class="market-link-card mf-card"><span class="market-icon">📱</span><span class="market-name">ET Money</span><span class="market-desc">Zero-commission MF, tax analysis</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">📦 ETF Analysis & Tracking</h3>
                    <div class="market-links">
                        <a href="https://www.etfdb.com/screener/" target="_blank" rel="noopener noreferrer" class="market-link-card etf-card"><span class="market-icon">🇺🇸</span><span class="market-name">ETF Database</span><span class="market-desc">US ETFs — expense, holdings, returns</span></a>
                        <a href="https://finance.yahoo.com/etfs/" target="_blank" rel="noopener noreferrer" class="market-link-card etf-card"><span class="market-icon">📊</span><span class="market-name">Yahoo ETFs</span><span class="market-desc">Global ETF data, top performers</span></a>
                        <a href="https://www.etf.com/etfanalytics/etf-finder" target="_blank" rel="noopener noreferrer" class="market-link-card etf-card"><span class="market-icon">🔎</span><span class="market-name">ETF Finder</span><span class="market-desc">Compare, holdings overlap</span></a>
                        <a href="https://www.etmoney.com/mutual-funds/etf" target="_blank" rel="noopener noreferrer" class="market-link-card etf-card"><span class="market-icon">🇮🇳</span><span class="market-name">India ETFs</span><span class="market-desc">Nifty, Gold, international ETFs</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">🌎 International & Commodity Markets</h3>
                    <div class="market-links">
                        <a href="https://www.tradingview.com/markets/stocks-usa/market-movers-all-stocks/" target="_blank" rel="noopener noreferrer" class="market-link-card us-card"><span class="market-icon">🚀</span><span class="market-name">US Movers</span><span class="market-desc">Top gainers, losers, most active</span></a>
                        <a href="https://stockanalysis.com/markets/" target="_blank" rel="noopener noreferrer" class="market-link-card us-card"><span class="market-icon">📈</span><span class="market-name">US Overview</span><span class="market-desc">Sectors, IPOs, earnings</span></a>
                        <a href="https://finance.yahoo.com/world-indices/" target="_blank" rel="noopener noreferrer" class="market-link-card us-card"><span class="market-icon">🌐</span><span class="market-name">World Indices</span><span class="market-desc">Asia, Europe, Americas</span></a>
                        <a href="https://www.investing.com/commodities/" target="_blank" rel="noopener noreferrer" class="market-link-card us-card"><span class="market-icon">🥇</span><span class="market-name">Commodities</span><span class="market-desc">Gold, Silver, Oil, Gas</span></a>
                        <a href="https://www.investing.com/crypto/" target="_blank" rel="noopener noreferrer" class="market-link-card us-card"><span class="market-icon">₿</span><span class="market-name">Crypto</span><span class="market-desc">BTC, ETH, altcoins live</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">🕵️ Insider Intelligence & Big Money</h3>
                    <div class="market-links">
                        <a href="https://www.trendlyne.com/fundamentals/stock-screener/" target="_blank" rel="noopener noreferrer" class="market-link-card intel-card"><span class="market-icon">🎯</span><span class="market-name">Trendlyne</span><span class="market-desc">DVM scores, momentum, insider</span></a>
                        <a href="https://www.trendlyne.com/equity/fiidii-activity/" target="_blank" rel="noopener noreferrer" class="market-link-card intel-card"><span class="market-icon">🏢</span><span class="market-name">FII/DII Activity</span><span class="market-desc">Institutional buy/sell data</span></a>
                        <a href="https://openinsider.com/" target="_blank" rel="noopener noreferrer" class="market-link-card intel-card"><span class="market-icon">👔</span><span class="market-name">Open Insider (US)</span><span class="market-desc">SEC insider trades — CEO buys</span></a>
                        <a href="https://finviz.com/insidertrading.ashx" target="_blank" rel="noopener noreferrer" class="market-link-card intel-card"><span class="market-icon">🕶️</span><span class="market-name">Finviz Insiders</span><span class="market-desc">US insider transactions</span></a>
                        <a href="https://www.nseindia.com/market-data/pre-open-market-cm-and-emerge-market" target="_blank" rel="noopener noreferrer" class="market-link-card intel-card"><span class="market-icon">🌅</span><span class="market-name">NSE Pre-Open</span><span class="market-desc">Pre-market data before 9:15</span></a>
                        <a href="https://www.moneycontrol.com/stocks/marketstats/blockdeals/" target="_blank" rel="noopener noreferrer" class="market-link-card intel-card"><span class="market-icon">📦</span><span class="market-name">Block Deals</span><span class="market-desc">Big institutional trades</span></a>
                        <a href="https://www.tradingview.com/chart/?symbol=NSE%3ANIFTY" target="_blank" rel="noopener noreferrer" class="market-link-card intel-card"><span class="market-icon">📉</span><span class="market-name">TradingView</span><span class="market-desc">Pro charts, 100+ indicators</span></a>
                        <a href="https://www.moneycontrol.com/stocksmarketsindia/" target="_blank" rel="noopener noreferrer" class="market-link-card intel-card"><span class="market-icon">💹</span><span class="market-name">MC Dashboard</span><span class="market-desc">Full market dashboard</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">🐂 Top Bullish Stocks — Gainers by Market Cap</h3>
                    <div class="market-links">
                        <a href="https://www.moneycontrol.com/stocks/marketstats/nsegainer/index.php" target="_blank" rel="noopener noreferrer" class="market-link-card bull-card"><span class="market-icon">🟢</span><span class="market-name">NSE Top Gainers</span><span class="market-desc">Today's top gaining stocks</span></a>
                        <a href="https://www.moneycontrol.com/stocks/marketstats/nsegainer/index.php?index=nifty-50" target="_blank" rel="noopener noreferrer" class="market-link-card bull-card"><span class="market-icon">🐂</span><span class="market-name">Nifty 50 Gainers</span><span class="market-desc">Large cap bulls today</span></a>
                        <a href="https://www.moneycontrol.com/stocks/marketstats/nsegainer/index.php?index=nifty-midcap-100" target="_blank" rel="noopener noreferrer" class="market-link-card bull-card"><span class="market-icon">📈</span><span class="market-name">Midcap Gainers</span><span class="market-desc">Nifty Midcap 100 bulls</span></a>
                        <a href="https://www.moneycontrol.com/stocks/marketstats/nsegainer/index.php?index=nifty-smallcap-100" target="_blank" rel="noopener noreferrer" class="market-link-card bull-card"><span class="market-icon">🚀</span><span class="market-name">Smallcap Gainers</span><span class="market-desc">Nifty Smallcap 100 bulls</span></a>
                        <a href="https://www.tradingview.com/markets/stocks-india/market-movers-gainers/" target="_blank" rel="noopener noreferrer" class="market-link-card bull-card"><span class="market-icon">📊</span><span class="market-name">TV India Gainers</span><span class="market-desc">TradingView live gainers</span></a>
                        <a href="https://trendlyne.com/equity/topgainers/" target="_blank" rel="noopener noreferrer" class="market-link-card bull-card"><span class="market-icon">⬆️</span><span class="market-name">Trendlyne Gainers</span><span class="market-desc">Top gainers with momentum</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">🐻 Top Bearish Stocks — Losers by Market Cap</h3>
                    <div class="market-links">
                        <a href="https://www.moneycontrol.com/stocks/marketstats/nseloser/index.php" target="_blank" rel="noopener noreferrer" class="market-link-card bear-card"><span class="market-icon">🔴</span><span class="market-name">NSE Top Losers</span><span class="market-desc">Today's top falling stocks</span></a>
                        <a href="https://www.moneycontrol.com/stocks/marketstats/nseloser/index.php?index=nifty-50" target="_blank" rel="noopener noreferrer" class="market-link-card bear-card"><span class="market-icon">🐻</span><span class="market-name">Nifty 50 Losers</span><span class="market-desc">Large cap bears today</span></a>
                        <a href="https://www.moneycontrol.com/stocks/marketstats/nseloser/index.php?index=nifty-midcap-100" target="_blank" rel="noopener noreferrer" class="market-link-card bear-card"><span class="market-icon">📉</span><span class="market-name">Midcap Losers</span><span class="market-desc">Nifty Midcap 100 bears</span></a>
                        <a href="https://www.moneycontrol.com/stocks/marketstats/nseloser/index.php?index=nifty-smallcap-100" target="_blank" rel="noopener noreferrer" class="market-link-card bear-card"><span class="market-icon">⬇️</span><span class="market-name">Smallcap Losers</span><span class="market-desc">Nifty Smallcap 100 bears</span></a>
                        <a href="https://www.tradingview.com/markets/stocks-india/market-movers-losers/" target="_blank" rel="noopener noreferrer" class="market-link-card bear-card"><span class="market-icon">📊</span><span class="market-name">TV India Losers</span><span class="market-desc">TradingView live losers</span></a>
                        <a href="https://trendlyne.com/equity/toplosers/" target="_blank" rel="noopener noreferrer" class="market-link-card bear-card"><span class="market-icon">🔻</span><span class="market-name">Trendlyne Losers</span><span class="market-desc">Top losers with analysis</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">🏭 Sectoral Indices — Daily Changes & Analysis</h3>
                    <div class="market-links">
                        <a href="https://www.google.com/finance/quote/NIFTY_METAL:INDEXNSE" target="_blank" rel="noopener noreferrer" class="market-link-card sector-card"><span class="market-icon">🥇</span><span class="market-name">Gold & Metals</span><span class="market-desc">Nifty Metal index</span></a>
                        <a href="https://www.moneycontrol.com/commodity/gold-price.html" target="_blank" rel="noopener noreferrer" class="market-link-card sector-card"><span class="market-icon">✨</span><span class="market-name">Gold Price</span><span class="market-desc">MCX Gold live rate</span></a>
                        <a href="https://www.moneycontrol.com/commodity/silver-price.html" target="_blank" rel="noopener noreferrer" class="market-link-card sector-card"><span class="market-icon">🪙</span><span class="market-name">Silver Price</span><span class="market-desc">MCX Silver live rate</span></a>
                        <a href="https://www.investing.com/commodities/zinc" target="_blank" rel="noopener noreferrer" class="market-link-card sector-card"><span class="market-icon">⚙️</span><span class="market-name">Zinc</span><span class="market-desc">LME Zinc live price</span></a>
                        <a href="https://www.investing.com/commodities/copper" target="_blank" rel="noopener noreferrer" class="market-link-card sector-card"><span class="market-icon">🔶</span><span class="market-name">Copper</span><span class="market-desc">LME Copper live price</span></a>
                        <a href="https://www.google.com/finance/quote/NIFTY_ENERGY:INDEXNSE" target="_blank" rel="noopener noreferrer" class="market-link-card sector-card"><span class="market-icon">⚡</span><span class="market-name">Energy</span><span class="market-desc">Nifty Energy index</span></a>
                        <a href="https://www.moneycontrol.com/commodity/crude-oil-price.html" target="_blank" rel="noopener noreferrer" class="market-link-card sector-card"><span class="market-icon">🛢️</span><span class="market-name">Crude Oil</span><span class="market-desc">MCX Crude live rate</span></a>
                        <a href="https://www.google.com/finance/quote/NIFTY_FMCG:INDEXNSE" target="_blank" rel="noopener noreferrer" class="market-link-card sector-card"><span class="market-icon">🛒</span><span class="market-name">FMCG</span><span class="market-desc">Nifty FMCG index</span></a>
                        <a href="https://www.google.com/finance/quote/NIFTY_IT:INDEXNSE" target="_blank" rel="noopener noreferrer" class="market-link-card sector-card"><span class="market-icon">💻</span><span class="market-name">IT & Microchip</span><span class="market-desc">Nifty IT index</span></a>
                        <a href="https://www.tradingview.com/symbols/AMEX-SOXX/" target="_blank" rel="noopener noreferrer" class="market-link-card sector-card"><span class="market-icon">🔌</span><span class="market-name">US Semiconductor</span><span class="market-desc">SOXX chip index</span></a>
                        <a href="https://www.google.com/finance/quote/NIFTY_PHARMA:INDEXNSE" target="_blank" rel="noopener noreferrer" class="market-link-card sector-card"><span class="market-icon">💊</span><span class="market-name">Pharma</span><span class="market-desc">Nifty Pharma index</span></a>
                        <a href="https://www.google.com/finance/quote/NIFTY_BANK:INDEXNSE" target="_blank" rel="noopener noreferrer" class="market-link-card sector-card"><span class="market-icon">🏦</span><span class="market-name">Banking</span><span class="market-desc">Nifty Bank index</span></a>
                        <a href="https://www.google.com/finance/quote/NIFTY_AUTO:INDEXNSE" target="_blank" rel="noopener noreferrer" class="market-link-card sector-card"><span class="market-icon">🚗</span><span class="market-name">Auto</span><span class="market-desc">Nifty Auto index</span></a>
                        <a href="https://www.google.com/finance/quote/NIFTY_REALTY:INDEXNSE" target="_blank" rel="noopener noreferrer" class="market-link-card sector-card"><span class="market-icon">🏠</span><span class="market-name">Realty</span><span class="market-desc">Nifty Realty index</span></a>
                        <a href="https://www.nseindia.com/market-data/live-equity-market?symbol=NIFTY%20INDIA%20DEFENCE" target="_blank" rel="noopener noreferrer" class="market-link-card sector-card"><span class="market-icon">🛡️</span><span class="market-name">Defence</span><span class="market-desc">Nifty India Defence</span></a>
                        <a href="https://www.nseindia.com/market-data/live-equity-market?symbol=NIFTY%20PSE" target="_blank" rel="noopener noreferrer" class="market-link-card sector-card"><span class="market-icon">🏛️</span><span class="market-name">PSE / Govt Stocks</span><span class="market-desc">Nifty PSE index</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">📦 ETF Performance — Top & Bottom Performers</h3>
                    <div class="market-links">
                        <a href="https://www.moneycontrol.com/mutual-funds/performance-tracker/returns/exchange-traded-fund.html" target="_blank" rel="noopener noreferrer" class="market-link-card etf-card"><span class="market-icon">📈</span><span class="market-name">India ETF Returns</span><span class="market-desc">All India ETFs ranked by returns</span></a>
                        <a href="https://www.etfdb.com/compare/market-cap/" target="_blank" rel="noopener noreferrer" class="market-link-card etf-card"><span class="market-icon">🇺🇸</span><span class="market-name">US ETF Rankings</span><span class="market-desc">Top US ETFs by AUM & returns</span></a>
                        <a href="https://etfdb.com/compare/highest-52-week-returns/" target="_blank" rel="noopener noreferrer" class="market-link-card etf-card"><span class="market-icon">🏆</span><span class="market-name">Best 52-Week ETFs</span><span class="market-desc">Highest returns this year</span></a>
                        <a href="https://etfdb.com/compare/lowest-52-week-returns/" target="_blank" rel="noopener noreferrer" class="market-link-card etf-card"><span class="market-icon">📉</span><span class="market-name">Worst 52-Week ETFs</span><span class="market-desc">Biggest losers this year</span></a>
                        <a href="https://www.etfdb.com/etfs/sector/" target="_blank" rel="noopener noreferrer" class="market-link-card etf-card"><span class="market-icon">🏭</span><span class="market-name">Sector ETFs</span><span class="market-desc">Energy, tech, defence, health</span></a>
                        <a href="https://www.etfdb.com/etfs/commodity/" target="_blank" rel="noopener noreferrer" class="market-link-card etf-card"><span class="market-icon">🥇</span><span class="market-name">Commodity ETFs</span><span class="market-desc">Gold, silver, oil ETFs ranked</span></a>
                        <a href="https://www.valueresearchonline.com/funds/selector/category/130/exchange-traded-funds/?end-type=1&tab=snapshot" target="_blank" rel="noopener noreferrer" class="market-link-card etf-card"><span class="market-icon">🇮🇳</span><span class="market-name">India ETF Screener</span><span class="market-desc">Value Research ETF rankings</span></a>
                        <a href="https://www.tickertape.in/etfs" target="_blank" rel="noopener noreferrer" class="market-link-card etf-card"><span class="market-icon">🎯</span><span class="market-name">Tickertape ETFs</span><span class="market-desc">Indian ETFs with live tracking</span></a>
                    </div>
                </div>
            </section>`;

  // ─── AI Stock Analysis Simulator ────────────────────────────
  const aiSimulatorWidget = `
            <section class="category-section sim-widget-section hidden" id="section-ai-analyzer" data-category="ai-analyzer">
                <div class="section-header">
                    <h2>🤖 AI Analysis Engine — Institutional Intelligence</h2>
                    <span class="article-count">SENTINEL Quant v3.0</span>
                </div>
                <p class="section-desc">Enter any Stock, ETF, Mutual Fund, or Index (NSE, BSE, Sensex, Nasdaq, NYSE, Global) for a comprehensive institutional-grade analysis: Technical + Fundamental + Predictive Forecast.</p>

                <div class="sim-container">
                    <!-- Search Bar -->
                    <div class="sim-search-wrapper">
                        <div class="sim-search-inner">
                            <span class="sim-search-icon">🔍</span>
                            <input type="text" id="sim-search-input"
                                placeholder="Enter: Reliance, NIFTY 50, HDFC Bank, AAPL, Tesla, SBI Blue Chip Fund, Gold ETF, Sensex..."
                                autocomplete="off" spellcheck="false" />
                            <button id="sim-analyze-btn" class="sim-analyze-btn">
                                <span class="sim-btn-icon">⚡</span>
                                <span class="sim-btn-text">ANALYZE</span>
                            </button>
                        </div>
                        <div id="sim-suggest-box" class="sim-suggest-box hidden"></div>
                    </div>

                    <!-- Proxy Config Settings -->
                    <div class="sim-proxy-settings">
                        <span class="proxy-settings-toggle" onclick="window.toggleProxySettings()">⚙️ Proxy Configuration</span>
                        <div id="sim-proxy-panel" class="sim-proxy-panel hidden">
                            <label for="proxy-url-input">Custom API Proxy URL (Netlify or Vercel):</label>
                            <div class="proxy-input-group">
                                <input type="text" id="proxy-url-input" placeholder="e.g. https://your-app.vercel.app" />
                                <button onclick="window.saveProxySettings()" class="proxy-save-btn">Save</button>
                            </div>
                            <span class="proxy-help-text">Leave blank to use the default Netlify proxy fallback. If the default is suspended (503 usage exceeded), deploy the proxy to Vercel and paste your Vercel deployment URL here.</span>
                        </div>
                    </div>

                    <!-- Quick Access Chips -->
                    <div class="sim-quick-chips">
                        <span class="sim-chip-label">⚡ Quick:</span>
                        <button class="quick-chip" data-query="RELIANCE">Reliance</button>
                        <button class="quick-chip" data-query="TCS">TCS</button>
                        <button class="quick-chip" data-query="NIFTY">NIFTY 50</button>
                        <button class="quick-chip" data-query="SENSEX">Sensex</button>
                        <button class="quick-chip" data-query="HDFC Bank">HDFC Bank</button>
                        <button class="quick-chip" data-query="INFY">Infosys</button>
                        <button class="quick-chip" data-query="SBI">SBI</button>
                        <button class="quick-chip" data-query="AAPL">Apple</button>
                        <button class="quick-chip" data-query="NVDA">NVIDIA</button>
                        <button class="quick-chip" data-query="GOLD">Gold</button>
                        <button class="quick-chip" data-query="Bitcoin">Bitcoin</button>
                        <button class="quick-chip" data-query="SBI Blue Chip Fund">SBI Blue Chip MF</button>
                    </div>

                    <!-- Loading State -->
                    <div id="sim-loading" class="sim-loading hidden">
                        <div class="sim-loading-spinner"></div>
                        <div class="sim-loading-text">SENTINEL AI Engine — Analyzing Market Intelligence...</div>
                        <div class="sim-loading-steps" id="sim-loading-steps"></div>
                    </div>

                    <!-- Error State -->
                    <div id="sim-error" class="sim-error hidden">
                        <div class="sim-error-icon">⚠️</div>
                        <div class="sim-error-msg" id="sim-error-msg">Analysis failed.</div>
                        <div class="sim-error-hint">Try exact tickers: RELIANCE.NS, TATAMOTORS.NS, AAPL, ^NSEI, ^BSESN</div>
                    </div>

                    <!-- Report Output -->
                    <div id="sim-report" class="sim-report hidden"></div>
                </div>
            </section>`;

  // ─── UPSC Study Hub ──────────────────────────────────────
  const upscWidget = `
            <section class="category-section market-widget-section upsc-hub-section" id="section-upsc-tools">
                <div class="section-header">
                    <h2>🎓 UPSC Exam Cracker — Daily Current Affairs & Study Hub</h2>
                </div>
                <p class="section-desc">Complete UPSC CSE preparation toolkit — daily current affairs, editorials analysis, government schemes, PYQ papers, and free study resources. Updated daily.</p>

                <div class="market-subsection">
                    <h3 class="market-sub-title">📰 Daily Current Affairs — Must Read</h3>
                    <div class="market-links">
                        <a href="https://www.insightsonindia.com/insights-daily-current-affairs-pib-summary/" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">📋</span><span class="market-name">InsightsIAS Daily CA</span><span class="market-desc">PIB + The Hindu + IE analysis</span></a>
                        <a href="https://www.drishtiias.com/current-affairs-news-analysis-editorials" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">📝</span><span class="market-name">Drishti IAS Daily CA</span><span class="market-desc">Hindi + English current affairs</span></a>
                        <a href="https://www.clearias.com/daily-current-affairs/" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">✅</span><span class="market-name">ClearIAS Daily CA</span><span class="market-desc">MCQ-style daily quiz + notes</span></a>
                        <a href="https://www.civilsdaily.com/" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">📅</span><span class="market-name">Civilsdaily</span><span class="market-desc">Daily news simplified for UPSC</span></a>
                        <a href="https://www.gktoday.in/current-affairs/" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">📰</span><span class="market-name">GK Today</span><span class="market-desc">Current affairs + quiz</span></a>
                        <a href="https://blog.forumias.com/upsc-current-affairs/" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">🏛️</span><span class="market-name">ForumIAS CA</span><span class="market-desc">Daily current affairs compilation</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">📖 Editorial & Opinion Analysis</h3>
                    <div class="market-links">
                        <a href="https://www.thehindu.com/opinion/editorial/" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">📰</span><span class="market-name">The Hindu Editorial</span><span class="market-desc">Must-read daily editorials</span></a>
                        <a href="https://indianexpress.com/section/explained/" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">💡</span><span class="market-name">IE Explained</span><span class="market-desc">Complex topics simplified</span></a>
                        <a href="https://www.insightsonindia.com/insights-editorial-analysis/" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">✍️</span><span class="market-name">Editorial Analysis</span><span class="market-desc">InsightsIAS editorial breakdowns</span></a>
                        <a href="https://www.drishtiias.com/daily-news-editorials" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">📝</span><span class="market-name">Drishti Editorials</span><span class="market-desc">Editorial analysis for Mains</span></a>
                        <a href="https://pib.gov.in/indexd.aspx" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">🏛️</span><span class="market-name">PIB India</span><span class="market-desc">Official govt press releases</span></a>
                        <a href="https://prsindia.org/" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">⚖️</span><span class="market-name">PRS Legislative</span><span class="market-desc">Bills, acts, parliament analysis</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">🗂️ Government Schemes & Policy</h3>
                    <div class="market-links">
                        <a href="https://www.india.gov.in/my-government/schemes" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">🇮🇳</span><span class="market-name">Govt Schemes Portal</span><span class="market-desc">All central govt schemes</span></a>
                        <a href="https://www.drishtiias.com/important-institutions/drishti-specials-important-institutions-national-institutions" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">🏢</span><span class="market-name">Important Institutions</span><span class="market-desc">Drishti IAS institution notes</span></a>
                        <a href="https://www.niti.gov.in/" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">📊</span><span class="market-name">NITI Aayog</span><span class="market-desc">Policy reports, SDG India Index</span></a>
                        <a href="https://economicsurvey.indiabudget.gov.in/" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">📕</span><span class="market-name">Economic Survey</span><span class="market-desc">Annual economic review</span></a>
                        <a href="https://sansad.in/" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">🏛️</span><span class="market-name">Sansad TV</span><span class="market-desc">Parliament debates & discussions</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">📚 UPSC Strategy & Study Material</h3>
                    <div class="market-links">
                        <a href="https://upsc.gov.in/examinations/syllabus" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">📖</span><span class="market-name">UPSC Syllabus</span><span class="market-desc">Official Prelims + Mains syllabus</span></a>
                        <a href="https://upsc.gov.in/examinations/previous-question-papers" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">📝</span><span class="market-name">Previous Year Papers</span><span class="market-desc">Official UPSC PYQ papers</span></a>
                        <a href="https://www.clearias.com/upsc-study-materials/" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">📚</span><span class="market-name">ClearIAS Study Material</span><span class="market-desc">Free notes for all subjects</span></a>
                        <a href="https://www.drishtiias.com/mains-practice-question/" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">✍️</span><span class="market-name">Mains Practice Q</span><span class="market-desc">Daily Mains answer writing</span></a>
                        <a href="https://www.insightsonindia.com/upsc-ias-prelims-test-series/" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">🎯</span><span class="market-name">Prelims Test Series</span><span class="market-desc">InsightsIAS mock tests</span></a>
                        <a href="https://www.clearias.com/upsc-prelims-online-mock-test/" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">📋</span><span class="market-name">ClearIAS Mock Tests</span><span class="market-desc">Free online prelims tests</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">🌐 Free Learning Platforms</h3>
                    <div class="market-links">
                        <a href="https://www.youtube.com/@StudyIQIASHindi" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">▶️</span><span class="market-name">StudyIQ (Hindi)</span><span class="market-desc">Daily CA + GS on YouTube</span></a>
                        <a href="https://www.youtube.com/@UNACADEMYIASbyRomanSaini" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">▶️</span><span class="market-name">Unacademy IAS</span><span class="market-desc">Roman Saini free lectures</span></a>
                        <a href="https://www.youtube.com/@DrishtiIASEnglish" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">▶️</span><span class="market-name">Drishti IAS YouTube</span><span class="market-desc">Video lectures & CA</span></a>
                        <a href="https://epathshala.nic.in/" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">📱</span><span class="market-name">ePathshala</span><span class="market-desc">NCERT free digital textbooks</span></a>
                        <a href="https://ncert.nic.in/textbook.php" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">📕</span><span class="market-name">NCERT Books</span><span class="market-desc">Free NCERT PDFs — essential</span></a>
                        <a href="https://www.visionias.in/resources.html" target="_blank" rel="noopener noreferrer" class="market-link-card upsc-card"><span class="market-icon">👁️</span><span class="market-name">VisionIAS Resources</span><span class="market-desc">Free monthly magazine & notes</span></a>
                    </div>
                </div>
            </section>`;

  // Stats bar
  const statsHTML = `
        <div class="stats-bar">
            <div class="stat">
                <span class="stat-num">${meta.totalArticles}</span>
                <span class="stat-label">Articles</span>
            </div>
            <div class="stat">
                <span class="stat-num">${meta.totalCategories}</span>
                <span class="stat-label">Categories</span>
            </div>
            <div class="stat">
                <span class="stat-num">${meta.totalFeeds}</span>
                <span class="stat-label">Sources</span>
            </div>
            <div class="stat">
                <span class="stat-num">${meta.time.split(' ')[0]}</span>
                <span class="stat-label">Live Update</span>
            </div>
        </div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <script>
        /* Clickjacking Frame-Busting Defense (OWASP A05:2021) */
        if (self !== top) {
            top.location = self.location;
        }
    </script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SENTINEL Intelligence Brief — ${meta.date}</title>
    <meta name="description" content="Automated intelligence briefing covering world news, cybersecurity, AI, markets, OSINT, and more. Updated daily at 8 AM and 10 PM IST.">
    <meta name="robots" content="index, follow">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://apis.google.com https://s3.tradingview.com; connect-src 'self' https://generativelanguage.googleapis.com https://api.groq.com https://openrouter.ai https://text.pollinations.ai https://*.googleapis.com https://*.firebaseio.com https://query1.finance.yahoo.com https://query2.finance.yahoo.com https://api.mfapi.in https://*.netlify.app https://*.vercel.app; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src * data:; frame-src 'self' https://*.firebaseapp.com; base-uri 'self'; form-action 'self';">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=Share+Tech+Mono&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css?v=2.3">
    <link rel="stylesheet" href="css/dashboard.css">
    <link rel="stylesheet" href="css/simulator.css?v=1.0">
    
    <!-- Firebase SDK (Compat) -->
    <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js"></script>
</head>
<body>
    <!-- Maincore System Decryption Bootloader Overlay -->
    <div id="sys-bootloader-overlay">
        <div class="boot-terminal-box">
            <span class="boot-corner-bracket bracket-tl"></span>
            <span class="boot-corner-bracket bracket-tr"></span>
            <span class="boot-corner-bracket bracket-bl"></span>
            <span class="boot-corner-bracket bracket-br"></span>
            <div class="boot-monitor" id="boot-monitor"></div>
            <div class="boot-progress-container">
                <span class="boot-progress-label">CORE_SYNC</span>
                <div class="boot-progress-bar-wrap">
                    <div class="boot-progress-bar-fill" id="boot-progress-fill"></div>
                </div>
                <span class="boot-decrypt-anim" id="boot-decrypt">SEC_DECRYPT // [INITIALIZING]</span>
            </div>
        </div>
    </div>

    <!-- Interactive Background and Overlay -->
    <canvas id="neural-canvas"></canvas>
    <div class="bg-grid"></div>
    <div class="nebula-orb orb-1"></div>
    <div class="nebula-orb orb-2"></div>
    <div class="nebula-orb orb-3"></div>
    <div class="scanline"></div>

    <!-- Header -->
    <header class="main-header">
        <div class="header-content">
            <div class="logo-area">
                <div class="logo-icon">
                    <span class="logo-pulse"></span>
                    <span class="logo-text">S</span>
                </div>
                <div class="logo-info">
                    <h1>SENTINEL</h1>
                    <p class="tagline">Intelligence Brief</p>
                </div>
            </div>
            <div class="header-meta">
                <div class="meta-item">
                    <span class="meta-label">DATE</span>
                    <span class="meta-value">${meta.date}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">IST TIME</span>
                    <span class="meta-value" id="live-clock">--:--:--</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">LAST REFRESH</span>
                    <span class="meta-value">⏱️ ${meta.time}</span>
                </div>
                <div class="meta-item audio-toggle-container">
                    <span class="meta-label">AUDIO CHANNELS</span>
                    <button id="sys-audio-toggle" class="hud-audio-btn" onclick="toggleSysAudio()">
                        <span class="audio-wave-bars">
                            <span class="bar"></span>
                            <span class="bar"></span>
                            <span class="bar"></span>
                        </span>
                        <span id="audio-toggle-label">SYS_AUDIO [OFF]</span>
                    </button>
                </div>
                <div class="meta-item status-live">
                    <span class="live-dot"></span>
                    <span class="meta-value">ACTIVE</span>
                </div>
            </div>
        </div>
    </header>

    <!-- Stats -->
    ${statsHTML}

    <!-- Search Bar -->
    <div class="search-container">
        <div class="search-box">
            <span class="search-icon">⌕</span>
            <input type="text" id="searchInput" placeholder="Search across all intelligence feeds..." oninput="searchArticles(this.value)">
            <kbd class="search-kbd">Ctrl+K</kbd>
        </div>
    </div>

    <!-- Category Filter -->
    <nav class="category-nav">
        <div class="cat-scroll">
            <button class="cat-btn active" data-category="all" onclick="filterCategory('all')">🌐 All</button>
            ${categoryNav}
            <button class="cat-btn" data-category="ai-analyzer" onclick="filterCategory('ai-analyzer')" style="background:linear-gradient(135deg,#0d2a1a,#0a1a2e);border-color:#00ff8855;color:#00ff88">🤖 AI Analyzer</button>
            <button class="cat-btn telemetry-toggle-btn" id="telemetryToggleBtn" onclick="toggleTelemetryHUD()">
                <span>⚙️ TELEMETRY SYSTEM</span> <span id="telemetry-arrow">▼</span>
            </button>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
        <!-- CYBER HUD DASHBOARD GRID -->
        <div class="cyber-hud-dashboard collapsed">
            <!-- Hardware Diagnostics Telemetry -->
            <div class="hud-panel sensor-telemetry-hud">
                <div class="hud-panel-header">
                    <span class="hud-panel-title">◈ SYS_DIAGNOSTICS // MAINFRAME_SENSORS</span>
                    <span class="hud-pulse-dot"></span>
                </div>
                <div class="hud-panel-body grid-2x2">
                    <div class="diag-item">
                        <div class="diag-label">⚡ POWER CORE STATUS</div>
                        <div class="diag-value" id="diag-battery-pct">DETECTING...</div>
                        <div class="hud-progress-container">
                            <div class="hud-progress-bar" id="diag-battery-bar" style="width: 0%"></div>
                        </div>
                        <div class="diag-sub" id="diag-battery-status">Querying power bus...</div>
                    </div>
                    <div class="diag-item">
                        <div class="diag-label">🛰️ NETWORK DATALINK</div>
                        <div class="diag-value" id="diag-net-speed">CONNECTING...</div>
                        <div class="hud-progress-container">
                            <div class="hud-progress-bar" id="diag-net-bar" style="width: 0%"></div>
                        </div>
                        <div class="diag-sub" id="diag-net-status">Measuring bandwidth...</div>
                    </div>
                    <div class="diag-item">
                        <div class="diag-label">🖥️ DISPLAY MATRIX CONFIG</div>
                        <div class="diag-value" id="diag-screen-res">0 x 0</div>
                        <div class="diag-sub" id="diag-screen-details">DPR: 1.0 // Depth: 24b</div>
                    </div>
                    <div class="diag-item">
                        <div class="diag-label">⏱️ LOCAL TEMPORAL GRID</div>
                        <div class="diag-value" id="diag-timezone">GMT+00:00</div>
                        <div class="diag-sub" id="diag-local-time">Querying atomic clock...</div>
                    </div>
                </div>
            </div>

            <!-- Voice HUD Command Console -->
            <div class="hud-panel voice-control-hud">
                <div class="hud-panel-header">
                    <span class="hud-panel-title">◈ VOICE_HUD // COGNITIVE_INTERFACE</span>
                    <span class="hud-pulse-dot voice-pulse" id="voice-hud-indicator"></span>
                </div>
                <div class="hud-panel-body flex-row">
                    <div class="voice-trigger-area">
                        <button id="voice-hud-btn" class="hud-mic-btn" onclick="toggleVoiceHUD()" title="Activate Speech Recognition">
                            <span class="mic-icon">🎙️</span>
                            <span class="pulse-ring"></span>
                        </button>
                        <div class="voice-status-label" id="voice-hud-status">SYS_VOICE [STANDBY]</div>
                        <div class="voice-hud-spectrum-wrapper">
                            <canvas id="voice-spectrum-canvas"></canvas>
                        </div>
                    </div>
                    <div class="voice-log-area">
                        <div class="voice-log-title">COMMANDS HINT // SPEAK "COMPUTER, ..."</div>
                        <div class="voice-log-console" id="voice-console-logs">
                            <div class="console-line hint">Say: "Computer, display Tech"</div>
                            <div class="console-line hint">Say: "Computer, system status"</div>
                            <div class="console-line hint">Say: "Computer, search cybersecurity"</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Temporal Divergence HUD (Y2K38 Safe-Node) -->
            <div class="hud-panel temporal-divergence-hud">
                <div class="hud-panel-header">
                    <span class="hud-panel-title">◈ TEMPORAL_DIVERGENCE // SECURE_Y2K38_SAFE_NODE</span>
                    <span class="hud-pulse-dot" style="background: var(--secondary); box-shadow: 0 0 8px var(--secondary);"></span>
                </div>
                <div class="hud-panel-body">
                    <div class="epoch-timeline-container">
                        <div class="epoch-ticker-grid">
                            <div class="epoch-item">
                                <div class="epoch-label">⏱️ Y2K38 EPOCH DIVERGENCE METRICS</div>
                                <div class="epoch-value" id="epoch-value-sec">DETECTING...</div>
                                <div class="epoch-value nano" id="epoch-value-nano">.000000000 ns</div>
                            </div>
                            <div class="epoch-item">
                                <div class="epoch-label">💾 2026 DELEGATE SAFE-GRID</div>
                                <div class="epoch-value" style="font-size: 13px; color: var(--accent-emerald);">MAINFRAME_SYNCHRONIZED</div>
                                <div class="entropy-subtext" id="entropy-value">SYSTEM_ENTROPY: 0.0000% // CORE_TEMP: 36.5°C</div>
                            </div>
                        </div>
                        <div class="epoch-progress-hud">
                            <div class="epoch-progress-fill" id="epoch-progressbar"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Visitor Node Diagnostics & Live Telemetry -->
            <div class="hud-panel visitor-telemetry-hud">
                <div class="hud-panel-header">
                    <span class="hud-panel-title">◈ VISITOR_TELEMETRY // USER_NODE_METRICS</span>
                    <span class="hud-pulse-dot" style="background: var(--accent-emerald); box-shadow: 0 0 8px var(--accent-emerald);"></span>
                </div>
                <div class="hud-panel-body grid-2x2">
                    <div class="diag-item">
                        <div class="diag-label">👤 VISITOR IDENTITY NODE</div>
                        <div class="diag-value" id="diag-node-id" style="color: var(--accent-emerald);">DETECTING...</div>
                        <div class="diag-sub" id="diag-node-views">Initializing node grid...</div>
                    </div>
                    <div class="diag-item">
                        <div class="diag-label">💻 CLIENT ENGINE & SYSTEM</div>
                        <div class="diag-value" id="diag-visitor-os">DETECTING...</div>
                        <div class="diag-sub" id="diag-visitor-gpu">Mapping display pipeline...</div>
                    </div>
                    <div class="diag-item">
                        <div class="diag-label">⚙️ PROCESSOR GRID</div>
                        <div class="diag-value" id="diag-visitor-cpu">DETECTING...</div>
                        <div class="diag-sub" id="diag-visitor-ram">Checking allocation...</div>
                    </div>
                    <div class="diag-item">
                        <div class="diag-label">📊 MAINFRAME TRAFFIC FEED</div>
                        <div class="diag-value" style="color: var(--primary);" id="diag-user-views">0 sessions</div>
                        <div class="diag-sub" id="diag-global-views">Total views: unmetered</div>
                    </div>
                </div>
            </div>
        </div>

        ${categorySections}
        ${aiSimulatorWidget}
        ${marketWidget}
        ${upscWidget}
    </main>

    <!-- Footer -->
    <footer class="main-footer">
        <div class="footer-content">
            <div class="footer-brand">
                <span class="footer-logo">◈ SENTINEL</span>
                <p class="footer-attribution" style="color: var(--primary); font-family: var(--font-cyber); font-size: 11px; font-weight: 700; letter-spacing: 0.5px; margin: 6px 0 10px 0; text-shadow: 0 0 8px rgba(0, 240, 255, 0.6); text-transform: uppercase;">made by <span style="color: var(--secondary); text-shadow: 0 0 10px rgba(157, 78, 221, 0.85);">SUBHENDU BARUA X</span> for your convenience</p>
                <p>Automated Intelligence Briefing System</p>
                <p class="footer-update">Last updated: ${meta.date} ${meta.time}</p>
            </div>
            <div class="footer-info">
                <p>Aggregated from ${meta.totalFeeds} OSINT sources</p>
                <p>News auto-refreshes every hour</p>
                <p>Emails dispatched daily at 0800H & 2200H IST</p>
                <p class="footer-disclaimer">All content sourced from publicly available RSS feeds.</p>
            </div>
        </div>
    </footer>

    <!-- AI Agent Widget -->
    <div id="ai-fab" onclick="toggleAIChat()" title="Sentinel AI Assistant">✨</div>

    <div id="ai-chat-panel" style="position: relative;">
        <!-- Login Overlay (Only inside chat) -->
        <div id="login-overlay">
            <div class="login-box" style="padding: 20px; max-width: 90%;">
                <h2 style="font-size: 18px;">AI Secure Login</h2>
                <p style="font-size: 12px; margin-bottom: 20px;">Please authenticate to access the Intelligence AI.</p>
                <div id="auth-error" class="auth-error"></div>
                <button class="login-btn google-btn" onclick="signInWithGoogle()">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google"> Sign in with Google
                </button>
                <button class="login-btn github-btn" onclick="signInWithGitHub()">
                    <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub"> Sign in with GitHub
                </button>
            </div>
        </div>
        <div class="chat-header">
            <h3>✨ Sentinel</h3>
            <select id="chat-model-select" onchange="handleModelChange()" style="flex: 1; margin: 0 10px; padding: 5px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); color: var(--text); border-radius: 4px; font-size: 12px;">
                <!-- Populated by JS -->
            </select>
            <div class="chat-header-actions">
                <button onclick="openAISettings()" title="API Keys">🔑</button>
                <button onclick="toggleAIChat()" title="Close">✕</button>
            </div>
        </div>
        
        <div class="chat-messages" id="chat-messages">
            <div class="message ai">Hello, I am the Sentinel AI Assistant. I have analyzed all the intelligence feeds currently on your dashboard. How can I help you?</div>
        </div>

        <div class="chat-input-area">
            <div class="image-preview-area" id="image-preview-area"></div>
            <div class="chat-input-wrapper">
                <input type="file" id="ai-file-input" accept="image/*" style="display: none;" onchange="handleImageUpload(event)">
                <button class="attach-btn" id="ai-attach-btn" onclick="document.getElementById('ai-file-input').click()" title="Attach Image">📎</button>
                <textarea id="ai-input" placeholder="Ask about the news, or analyze an image..." rows="1" onkeydown="handleEnter(event)"></textarea>
                <button class="send-btn" onclick="sendAIMessage()">➤</button>
            </div>
        </div>
    </div>

    <!-- AI Settings Modal -->
    <div id="ai-settings-modal">
        <div class="modal-content">
            <h3>🔑 API Keys</h3>
            <p style="margin-bottom: 15px; font-size: 13px; color: var(--text-muted);">To keep the dashboard 100% free, enter your keys below. The system automatically routes to the right key based on the model you select.</p>
            
            <label style="font-size: 12px; font-weight: bold; color: var(--primary);">Google Gemini (aistudio.google.com)</label>
            <input type="password" id="key-gemini" placeholder="AIzaSy..." style="margin-bottom: 10px;">
            
            <label style="font-size: 12px; font-weight: bold; color: var(--primary);">Groq (console.groq.com/keys)</label>
            <input type="password" id="key-groq" placeholder="gsk_..." style="margin-bottom: 10px;">
            
            <label style="font-size: 12px; font-weight: bold; color: var(--primary);">OpenRouter (openrouter.ai/keys)</label>
            <input type="password" id="key-openrouter" placeholder="sk-or-v1-..." style="margin-bottom: 15px;">

            <div class="modal-actions">
                <button class="btn-cancel" onclick="closeAISettings()">Cancel</button>
                <button class="btn-save" onclick="saveAPIKeys()">Save Keys</button>
            </div>
        </div>
    </div>

    <script>
        // Inject current dashboard context directly into the window for the AI to read
        window.briefingData = ${JSON.stringify(briefing).replace(/</g, '\\u003c')};
    </script>
    <!-- Interactive TradingView Chart Modal -->
    <div id="chart-modal" style="position: fixed; inset: 0; background: rgba(3, 7, 12, 0.95); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 100000; display: none; align-items: center; justify-content: center; padding: 20px;">
        <div style="position: relative; width: 90vw; height: 85vh; background: #050f1e; border: 1px solid var(--primary); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; box-shadow: var(--neon-glow-strong); clip-path: polygon(0 0, 97% 0, 100% 3%, 100% 100%, 3% 100%, 0 97%);">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: rgba(8, 17, 32, 0.9); border-bottom: 1px solid rgba(0, 240, 255, 0.15);">
                <h3 id="chart-modal-title" style="margin: 0; font-family: var(--font-cyber); font-size: 13px; color: var(--primary); letter-spacing: 1.5px; font-weight: 800;">◈ REAL-TIME TELEMETRY GRAPH</h3>
                <button onclick="closeChartModal()" style="background: transparent; border: none; color: var(--text-muted); font-size: 24px; cursor: pointer; transition: color 0.2s; font-family: var(--font-cyber);" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-muted)'">✕</button>
            </div>
            <div id="chart-modal-container" style="flex-grow: 1; width: 100%; height: calc(100% - 50px); background: #000;">
                <!-- TradingView Widget Injected Here -->
            </div>
        </div>
    </div>

    <script>
        function getTradingViewSymbol(symbol) {
            if (symbol === "^NSEI") return "NSE:NIFTY";
            if (symbol === "^BSESN") return "BSE:SENSEX";
            if (symbol === "^NSEBANK") return "NSE:BANKNIFTY";
            if (symbol === "^CNXIT") return "NSE:NIFTYIT";
            if (symbol === "^CNXINFRA") return "NSE:NIFTYINFRA";
            if (symbol === "^CNXMC") return "NSE:NIFTYMIDCAP100";
            if (symbol === "^CNXSC") return "NSE:NIFTYSMALLCAP100";
            if (symbol === "^GSPC") return "SP:SPX";
            if (symbol === "^IXIC") return "NASDAQ:NDX";
            if (symbol === "^DJI") return "DJ:DJI";
            if (symbol === "BRK-B") return "NYSE:BRK.B";
            
            if (symbol.endsWith(".NS")) return "NSE:" + symbol.replace(".NS", "");
            if (symbol.endsWith(".BO")) return "BSE:" + symbol.replace(".BO", "");
            
            return symbol;
        }

        function openChartModal(symbol, name) {
            const modal = document.getElementById("chart-modal");
            const title = document.getElementById("chart-modal-title");
            const container = document.getElementById("chart-modal-container");
            
            const tvSymbol = getTradingViewSymbol(symbol);
            title.innerHTML = "◈ REAL-TIME TELEMETRY GRAPH // " + name.toUpperCase() + " (" + tvSymbol + ")";
            container.innerHTML = ""; // Clear
            
            modal.style.display = "flex";
            
            // Create TradingView widget loader
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/tv.js";
            script.onload = () => {
                new TradingView.widget({
                    "width": "100%",
                    "height": "100%",
                    "symbol": tvSymbol,
                    "interval": "D",
                    "timezone": "Asia/Kolkata",
                    "theme": "dark",
                    "style": "1",
                    "locale": "en",
                    "toolbar_bg": "#050f1e",
                    "enable_publishing": false,
                    "hide_side_toolbar": false,
                    "allow_symbol_change": true,
                    "container_id": "chart-modal-container",
                    "studies": [
                        "RSI@tv-basicstudies",
                        "MASimple@tv-basicstudies"
                    ]
                });
            };
            document.head.appendChild(script);
        }

        function closeChartModal() {
            const modal = document.getElementById("chart-modal");
            modal.style.display = "none";
            document.getElementById("chart-modal-container").innerHTML = "";
        }
    </script>

    <script src="js/auth.js?v=${Date.now()}"></script>
    <script src="js/app.js"></script>
    <script src="js/agent.js?v=${Date.now()}"></script>
    <script src="js/simulator.js?v=${Date.now()}"></script>
</body>
</html>`;

  return html;
}

// ─── Main ─────────────────────────────────────────────────

function main() {
  console.log("🏗️  Generating SENTINEL website...\n");

  const briefing = loadBriefing();

  // Ensure public directories exist
  mkdirSync(join(PUBLIC_DIR, "css"), { recursive: true });
  mkdirSync(join(PUBLIC_DIR, "js"), { recursive: true });

  // Generate HTML
  const html = generateHTML(briefing);
  writeFileSync(join(PUBLIC_DIR, "index.html"), html);
  console.log("✅ Generated: public/index.html");

  // CSS and JS are already in public/ (created separately)
  console.log("✅ Website generation complete!");
  console.log(`📊 ${briefing.meta.totalArticles} articles across ${briefing.meta.totalCategories} categories`);
}

main();
