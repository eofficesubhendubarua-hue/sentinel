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
      const articlesHTML = cat.articles
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
                            <a href="${escapeHtml(article.link)}" target="_blank" rel="noopener">${escapeHtml(article.title)}</a>
                        </h3>
                        <p class="card-desc">${escapeHtml(article.description)}</p>
                        <div class="card-footer">
                            <a href="${escapeHtml(article.link)}" target="_blank" rel="noopener" class="read-more">
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

                <div class="tv-widget-container">
                    <iframe src="https://s.tradingview.com/embed-widget/ticker-tape/?locale=en#%7B%22symbols%22%3A%5B%7B%22proName%22%3A%22BSE%3ASENSEX%22%2C%22title%22%3A%22SENSEX%22%7D%2C%7B%22proName%22%3A%22NSE%3ANIFTY%22%2C%22title%22%3A%22NIFTY%2050%22%7D%2C%7B%22proName%22%3A%22NSE%3ABANKNIFTY%22%2C%22title%22%3A%22BANK%20NIFTY%22%7D%2C%7B%22proName%22%3A%22FOREXCOM%3ASPXUSD%22%2C%22title%22%3A%22S%26P%20500%22%7D%2C%7B%22proName%22%3A%22FOREXCOM%3ANSXUSD%22%2C%22title%22%3A%22NASDAQ%22%7D%2C%7B%22proName%22%3A%22FX_IDC%3AUSDINR%22%2C%22title%22%3A%22USD%2FINR%22%7D%5D%2C%22showSymbolLogo%22%3Atrue%2C%22isTransparent%22%3Atrue%2C%22displayMode%22%3A%22adaptive%22%2C%22colorTheme%22%3A%22dark%22%7D" style="width:100%;height:76px;border:none;" allowtransparency="true" frameborder="0"></iframe>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">🔴 Live Indices — India & US</h3>
                    <div class="market-links">
                        <a href="https://www.google.com/finance/quote/NIFTY_50:INDEXNSE" target="_blank" class="market-link-card india-card"><span class="market-icon">🇮🇳</span><span class="market-name">Nifty 50</span><span class="market-desc">NSE benchmark</span></a>
                        <a href="https://www.google.com/finance/quote/SENSEX:INDEXBOM" target="_blank" class="market-link-card india-card"><span class="market-icon">🇮🇳</span><span class="market-name">Sensex</span><span class="market-desc">BSE 30</span></a>
                        <a href="https://www.google.com/finance/quote/BANK_NIFTY:INDEXNSE" target="_blank" class="market-link-card india-card"><span class="market-icon">🏦</span><span class="market-name">Bank Nifty</span><span class="market-desc">Banking index</span></a>
                        <a href="https://www.google.com/finance/quote/.DJI:INDEXDJX" target="_blank" class="market-link-card us-card"><span class="market-icon">🇺🇸</span><span class="market-name">Dow Jones</span><span class="market-desc">US 30 blue chips</span></a>
                        <a href="https://www.google.com/finance/quote/.INX:INDEXSP" target="_blank" class="market-link-card us-card"><span class="market-icon">🇺🇸</span><span class="market-name">S&P 500</span><span class="market-desc">US large-cap</span></a>
                        <a href="https://www.google.com/finance/quote/.IXIC:INDEXNASDAQ" target="_blank" class="market-link-card us-card"><span class="market-icon">🇺🇸</span><span class="market-name">NASDAQ</span><span class="market-desc">US tech index</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">🔍 Stock Screeners — Deep Analysis (FREE)</h3>
                    <div class="market-links">
                        <a href="https://www.screener.in/" target="_blank" class="market-link-card screener-card"><span class="market-icon">🔬</span><span class="market-name">Screener.in</span><span class="market-desc">Indian fundamentals — PE, ROCE, profit</span></a>
                        <a href="https://www.screener.in/screens/71/rising-stars/" target="_blank" class="market-link-card screener-card"><span class="market-icon">⭐</span><span class="market-name">Rising Stars</span><span class="market-desc">High growth, low debt stocks</span></a>
                        <a href="https://finviz.com/screener.ashx" target="_blank" class="market-link-card screener-card"><span class="market-icon">🇺🇸</span><span class="market-name">Finviz Screener</span><span class="market-desc">US stocks — PE, EPS, insider trades</span></a>
                        <a href="https://finviz.com/map.ashx" target="_blank" class="market-link-card screener-card"><span class="market-icon">🗺️</span><span class="market-name">S&P 500 Heatmap</span><span class="market-desc">Visual market overview at a glance</span></a>
                        <a href="https://finance.yahoo.com/screener/" target="_blank" class="market-link-card screener-card"><span class="market-icon">📊</span><span class="market-name">Yahoo Screener</span><span class="market-desc">Global stocks, 100+ filters</span></a>
                        <a href="https://www.tradingview.com/screener/" target="_blank" class="market-link-card screener-card"><span class="market-icon">📉</span><span class="market-name">TradingView Screener</span><span class="market-desc">Technical + fundamental, real-time</span></a>
                        <a href="https://stockanalysis.com/stocks/" target="_blank" class="market-link-card screener-card"><span class="market-icon">📈</span><span class="market-name">Stock Analysis</span><span class="market-desc">Free 10yr financials, DCF, peers</span></a>
                        <a href="https://www.tickertape.in/screener" target="_blank" class="market-link-card screener-card"><span class="market-icon">🎯</span><span class="market-name">Tickertape</span><span class="market-desc">200+ filters, forecasts, peers</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">🏛️ Mutual Fund Analysis — India (FREE)</h3>
                    <div class="market-links">
                        <a href="https://www.valueresearchonline.com/funds/" target="_blank" class="market-link-card mf-card"><span class="market-icon">⭐</span><span class="market-name">Value Research</span><span class="market-desc">Ratings, portfolio X-ray, SIP calc</span></a>
                        <a href="https://www.morningstar.in/mutualfunds/default.aspx" target="_blank" class="market-link-card mf-card"><span class="market-icon">🌟</span><span class="market-name">Morningstar India</span><span class="market-desc">Star ratings, risk analysis</span></a>
                        <a href="https://www.amfiindia.com/net-asset-value/nav-history" target="_blank" class="market-link-card mf-card"><span class="market-icon">📋</span><span class="market-name">AMFI NAV Data</span><span class="market-desc">Official NAV for ALL Indian MFs</span></a>
                        <a href="https://www.moneycontrol.com/mutual-funds/" target="_blank" class="market-link-card mf-card"><span class="market-icon">💰</span><span class="market-name">MC Mutual Funds</span><span class="market-desc">Compare, SIP returns, top funds</span></a>
                        <a href="https://www.tickertape.in/mutual-funds/screener" target="_blank" class="market-link-card mf-card"><span class="market-icon">🎯</span><span class="market-name">MF Screener</span><span class="market-desc">Expense ratio, AUM, returns</span></a>
                        <a href="https://www.etmoney.com/mutual-funds" target="_blank" class="market-link-card mf-card"><span class="market-icon">📱</span><span class="market-name">ET Money</span><span class="market-desc">Zero-commission MF, tax analysis</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">📦 ETF Analysis & Tracking</h3>
                    <div class="market-links">
                        <a href="https://www.etfdb.com/screener/" target="_blank" class="market-link-card etf-card"><span class="market-icon">🇺🇸</span><span class="market-name">ETF Database</span><span class="market-desc">US ETFs — expense, holdings, returns</span></a>
                        <a href="https://finance.yahoo.com/etfs/" target="_blank" class="market-link-card etf-card"><span class="market-icon">📊</span><span class="market-name">Yahoo ETFs</span><span class="market-desc">Global ETF data, top performers</span></a>
                        <a href="https://www.etf.com/etfanalytics/etf-finder" target="_blank" class="market-link-card etf-card"><span class="market-icon">🔎</span><span class="market-name">ETF Finder</span><span class="market-desc">Compare, holdings overlap</span></a>
                        <a href="https://www.etmoney.com/mutual-funds/etf" target="_blank" class="market-link-card etf-card"><span class="market-icon">🇮🇳</span><span class="market-name">India ETFs</span><span class="market-desc">Nifty, Gold, international ETFs</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">🌎 International & Commodity Markets</h3>
                    <div class="market-links">
                        <a href="https://www.tradingview.com/markets/stocks-usa/market-movers-all-stocks/" target="_blank" class="market-link-card us-card"><span class="market-icon">🚀</span><span class="market-name">US Movers</span><span class="market-desc">Top gainers, losers, most active</span></a>
                        <a href="https://stockanalysis.com/markets/" target="_blank" class="market-link-card us-card"><span class="market-icon">📈</span><span class="market-name">US Overview</span><span class="market-desc">Sectors, IPOs, earnings</span></a>
                        <a href="https://finance.yahoo.com/world-indices/" target="_blank" class="market-link-card us-card"><span class="market-icon">🌐</span><span class="market-name">World Indices</span><span class="market-desc">Asia, Europe, Americas</span></a>
                        <a href="https://www.investing.com/commodities/" target="_blank" class="market-link-card us-card"><span class="market-icon">🥇</span><span class="market-name">Commodities</span><span class="market-desc">Gold, Silver, Oil, Gas</span></a>
                        <a href="https://www.investing.com/crypto/" target="_blank" class="market-link-card us-card"><span class="market-icon">₿</span><span class="market-name">Crypto</span><span class="market-desc">BTC, ETH, altcoins live</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">🕵️ Insider Intelligence & Big Money</h3>
                    <div class="market-links">
                        <a href="https://www.trendlyne.com/fundamentals/stock-screener/" target="_blank" class="market-link-card intel-card"><span class="market-icon">🎯</span><span class="market-name">Trendlyne</span><span class="market-desc">DVM scores, momentum, insider</span></a>
                        <a href="https://www.trendlyne.com/equity/fiidii-activity/" target="_blank" class="market-link-card intel-card"><span class="market-icon">🏢</span><span class="market-name">FII/DII Activity</span><span class="market-desc">Institutional buy/sell data</span></a>
                        <a href="https://openinsider.com/" target="_blank" class="market-link-card intel-card"><span class="market-icon">👔</span><span class="market-name">Open Insider (US)</span><span class="market-desc">SEC insider trades — CEO buys</span></a>
                        <a href="https://finviz.com/insidertrading.ashx" target="_blank" class="market-link-card intel-card"><span class="market-icon">🕶️</span><span class="market-name">Finviz Insiders</span><span class="market-desc">US insider transactions</span></a>
                        <a href="https://www.nseindia.com/market-data/pre-open-market-cm-and-emerge-market" target="_blank" class="market-link-card intel-card"><span class="market-icon">🌅</span><span class="market-name">NSE Pre-Open</span><span class="market-desc">Pre-market data before 9:15</span></a>
                        <a href="https://www.moneycontrol.com/stocks/marketstats/blockdeals/" target="_blank" class="market-link-card intel-card"><span class="market-icon">📦</span><span class="market-name">Block Deals</span><span class="market-desc">Big institutional trades</span></a>
                        <a href="https://www.tradingview.com/chart/?symbol=NSE%3ANIFTY" target="_blank" class="market-link-card intel-card"><span class="market-icon">📉</span><span class="market-name">TradingView</span><span class="market-desc">Pro charts, 100+ indicators</span></a>
                        <a href="https://www.moneycontrol.com/stocksmarketsindia/" target="_blank" class="market-link-card intel-card"><span class="market-icon">💹</span><span class="market-name">MC Dashboard</span><span class="market-desc">Full market dashboard</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">🐂 Top Bullish Stocks — Gainers by Market Cap</h3>
                    <div class="market-links">
                        <a href="https://www.moneycontrol.com/stocks/marketstats/nsegainer/index.php" target="_blank" class="market-link-card bull-card"><span class="market-icon">🟢</span><span class="market-name">NSE Top Gainers</span><span class="market-desc">Today's top gaining stocks</span></a>
                        <a href="https://www.moneycontrol.com/stocks/marketstats/nsegainer/index.php?index=nifty-50" target="_blank" class="market-link-card bull-card"><span class="market-icon">🐂</span><span class="market-name">Nifty 50 Gainers</span><span class="market-desc">Large cap bulls today</span></a>
                        <a href="https://www.moneycontrol.com/stocks/marketstats/nsegainer/index.php?index=nifty-midcap-100" target="_blank" class="market-link-card bull-card"><span class="market-icon">📈</span><span class="market-name">Midcap Gainers</span><span class="market-desc">Nifty Midcap 100 bulls</span></a>
                        <a href="https://www.moneycontrol.com/stocks/marketstats/nsegainer/index.php?index=nifty-smallcap-100" target="_blank" class="market-link-card bull-card"><span class="market-icon">🚀</span><span class="market-name">Smallcap Gainers</span><span class="market-desc">Nifty Smallcap 100 bulls</span></a>
                        <a href="https://www.tradingview.com/markets/stocks-india/market-movers-gainers/" target="_blank" class="market-link-card bull-card"><span class="market-icon">📊</span><span class="market-name">TV India Gainers</span><span class="market-desc">TradingView live gainers</span></a>
                        <a href="https://trendlyne.com/equity/topgainers/" target="_blank" class="market-link-card bull-card"><span class="market-icon">⬆️</span><span class="market-name">Trendlyne Gainers</span><span class="market-desc">Top gainers with momentum</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">🐻 Top Bearish Stocks — Losers by Market Cap</h3>
                    <div class="market-links">
                        <a href="https://www.moneycontrol.com/stocks/marketstats/nseloser/index.php" target="_blank" class="market-link-card bear-card"><span class="market-icon">🔴</span><span class="market-name">NSE Top Losers</span><span class="market-desc">Today's top falling stocks</span></a>
                        <a href="https://www.moneycontrol.com/stocks/marketstats/nseloser/index.php?index=nifty-50" target="_blank" class="market-link-card bear-card"><span class="market-icon">🐻</span><span class="market-name">Nifty 50 Losers</span><span class="market-desc">Large cap bears today</span></a>
                        <a href="https://www.moneycontrol.com/stocks/marketstats/nseloser/index.php?index=nifty-midcap-100" target="_blank" class="market-link-card bear-card"><span class="market-icon">📉</span><span class="market-name">Midcap Losers</span><span class="market-desc">Nifty Midcap 100 bears</span></a>
                        <a href="https://www.moneycontrol.com/stocks/marketstats/nseloser/index.php?index=nifty-smallcap-100" target="_blank" class="market-link-card bear-card"><span class="market-icon">⬇️</span><span class="market-name">Smallcap Losers</span><span class="market-desc">Nifty Smallcap 100 bears</span></a>
                        <a href="https://www.tradingview.com/markets/stocks-india/market-movers-losers/" target="_blank" class="market-link-card bear-card"><span class="market-icon">📊</span><span class="market-name">TV India Losers</span><span class="market-desc">TradingView live losers</span></a>
                        <a href="https://trendlyne.com/equity/toplosers/" target="_blank" class="market-link-card bear-card"><span class="market-icon">🔻</span><span class="market-name">Trendlyne Losers</span><span class="market-desc">Top losers with analysis</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">🏭 Sectoral Indices — Daily Changes & Analysis</h3>
                    <div class="market-links">
                        <a href="https://www.google.com/finance/quote/NIFTY_METAL:INDEXNSE" target="_blank" class="market-link-card sector-card"><span class="market-icon">🥇</span><span class="market-name">Gold & Metals</span><span class="market-desc">Nifty Metal index</span></a>
                        <a href="https://www.moneycontrol.com/commodity/gold-price.html" target="_blank" class="market-link-card sector-card"><span class="market-icon">✨</span><span class="market-name">Gold Price</span><span class="market-desc">MCX Gold live rate</span></a>
                        <a href="https://www.moneycontrol.com/commodity/silver-price.html" target="_blank" class="market-link-card sector-card"><span class="market-icon">🪙</span><span class="market-name">Silver Price</span><span class="market-desc">MCX Silver live rate</span></a>
                        <a href="https://www.investing.com/commodities/zinc" target="_blank" class="market-link-card sector-card"><span class="market-icon">⚙️</span><span class="market-name">Zinc</span><span class="market-desc">LME Zinc live price</span></a>
                        <a href="https://www.investing.com/commodities/copper" target="_blank" class="market-link-card sector-card"><span class="market-icon">🔶</span><span class="market-name">Copper</span><span class="market-desc">LME Copper live price</span></a>
                        <a href="https://www.google.com/finance/quote/NIFTY_ENERGY:INDEXNSE" target="_blank" class="market-link-card sector-card"><span class="market-icon">⚡</span><span class="market-name">Energy</span><span class="market-desc">Nifty Energy index</span></a>
                        <a href="https://www.moneycontrol.com/commodity/crude-oil-price.html" target="_blank" class="market-link-card sector-card"><span class="market-icon">🛢️</span><span class="market-name">Crude Oil</span><span class="market-desc">MCX Crude live rate</span></a>
                        <a href="https://www.google.com/finance/quote/NIFTY_FMCG:INDEXNSE" target="_blank" class="market-link-card sector-card"><span class="market-icon">🛒</span><span class="market-name">FMCG</span><span class="market-desc">Nifty FMCG index</span></a>
                        <a href="https://www.google.com/finance/quote/NIFTY_IT:INDEXNSE" target="_blank" class="market-link-card sector-card"><span class="market-icon">💻</span><span class="market-name">IT & Microchip</span><span class="market-desc">Nifty IT index</span></a>
                        <a href="https://www.tradingview.com/symbols/AMEX-SOXX/" target="_blank" class="market-link-card sector-card"><span class="market-icon">🔌</span><span class="market-name">US Semiconductor</span><span class="market-desc">SOXX chip index</span></a>
                        <a href="https://www.google.com/finance/quote/NIFTY_PHARMA:INDEXNSE" target="_blank" class="market-link-card sector-card"><span class="market-icon">💊</span><span class="market-name">Pharma</span><span class="market-desc">Nifty Pharma index</span></a>
                        <a href="https://www.google.com/finance/quote/NIFTY_BANK:INDEXNSE" target="_blank" class="market-link-card sector-card"><span class="market-icon">🏦</span><span class="market-name">Banking</span><span class="market-desc">Nifty Bank index</span></a>
                        <a href="https://www.google.com/finance/quote/NIFTY_AUTO:INDEXNSE" target="_blank" class="market-link-card sector-card"><span class="market-icon">🚗</span><span class="market-name">Auto</span><span class="market-desc">Nifty Auto index</span></a>
                        <a href="https://www.google.com/finance/quote/NIFTY_REALTY:INDEXNSE" target="_blank" class="market-link-card sector-card"><span class="market-icon">🏠</span><span class="market-name">Realty</span><span class="market-desc">Nifty Realty index</span></a>
                        <a href="https://www.nseindia.com/market-data/live-equity-market?symbol=NIFTY%20INDIA%20DEFENCE" target="_blank" class="market-link-card sector-card"><span class="market-icon">🛡️</span><span class="market-name">Defence</span><span class="market-desc">Nifty India Defence</span></a>
                        <a href="https://www.nseindia.com/market-data/live-equity-market?symbol=NIFTY%20PSE" target="_blank" class="market-link-card sector-card"><span class="market-icon">🏛️</span><span class="market-name">PSE / Govt Stocks</span><span class="market-desc">Nifty PSE index</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">📦 ETF Performance — Top & Bottom Performers</h3>
                    <div class="market-links">
                        <a href="https://www.moneycontrol.com/mutual-funds/performance-tracker/returns/exchange-traded-fund.html" target="_blank" class="market-link-card etf-card"><span class="market-icon">📈</span><span class="market-name">India ETF Returns</span><span class="market-desc">All India ETFs ranked by returns</span></a>
                        <a href="https://www.etfdb.com/compare/market-cap/" target="_blank" class="market-link-card etf-card"><span class="market-icon">🇺🇸</span><span class="market-name">US ETF Rankings</span><span class="market-desc">Top US ETFs by AUM & returns</span></a>
                        <a href="https://etfdb.com/compare/highest-52-week-returns/" target="_blank" class="market-link-card etf-card"><span class="market-icon">🏆</span><span class="market-name">Best 52-Week ETFs</span><span class="market-desc">Highest returns this year</span></a>
                        <a href="https://etfdb.com/compare/lowest-52-week-returns/" target="_blank" class="market-link-card etf-card"><span class="market-icon">📉</span><span class="market-name">Worst 52-Week ETFs</span><span class="market-desc">Biggest losers this year</span></a>
                        <a href="https://www.etfdb.com/etfs/sector/" target="_blank" class="market-link-card etf-card"><span class="market-icon">🏭</span><span class="market-name">Sector ETFs</span><span class="market-desc">Energy, tech, defence, health</span></a>
                        <a href="https://www.etfdb.com/etfs/commodity/" target="_blank" class="market-link-card etf-card"><span class="market-icon">🥇</span><span class="market-name">Commodity ETFs</span><span class="market-desc">Gold, silver, oil ETFs ranked</span></a>
                        <a href="https://www.valueresearchonline.com/funds/selector/category/130/exchange-traded-funds/?end-type=1&tab=snapshot" target="_blank" class="market-link-card etf-card"><span class="market-icon">🇮🇳</span><span class="market-name">India ETF Screener</span><span class="market-desc">Value Research ETF rankings</span></a>
                        <a href="https://www.tickertape.in/etfs" target="_blank" class="market-link-card etf-card"><span class="market-icon">🎯</span><span class="market-name">Tickertape ETFs</span><span class="market-desc">Indian ETFs with live tracking</span></a>
                    </div>
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
                        <a href="https://www.insightsonindia.com/insights-daily-current-affairs-pib-summary/" target="_blank" class="market-link-card upsc-card"><span class="market-icon">📋</span><span class="market-name">InsightsIAS Daily CA</span><span class="market-desc">PIB + The Hindu + IE analysis</span></a>
                        <a href="https://www.drishtiias.com/current-affairs-news-analysis-editorials" target="_blank" class="market-link-card upsc-card"><span class="market-icon">📝</span><span class="market-name">Drishti IAS Daily CA</span><span class="market-desc">Hindi + English current affairs</span></a>
                        <a href="https://www.clearias.com/daily-current-affairs/" target="_blank" class="market-link-card upsc-card"><span class="market-icon">✅</span><span class="market-name">ClearIAS Daily CA</span><span class="market-desc">MCQ-style daily quiz + notes</span></a>
                        <a href="https://www.civilsdaily.com/" target="_blank" class="market-link-card upsc-card"><span class="market-icon">📅</span><span class="market-name">Civilsdaily</span><span class="market-desc">Daily news simplified for UPSC</span></a>
                        <a href="https://www.gktoday.in/current-affairs/" target="_blank" class="market-link-card upsc-card"><span class="market-icon">📰</span><span class="market-name">GK Today</span><span class="market-desc">Current affairs + quiz</span></a>
                        <a href="https://blog.forumias.com/upsc-current-affairs/" target="_blank" class="market-link-card upsc-card"><span class="market-icon">🏛️</span><span class="market-name">ForumIAS CA</span><span class="market-desc">Daily current affairs compilation</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">📖 Editorial & Opinion Analysis</h3>
                    <div class="market-links">
                        <a href="https://www.thehindu.com/opinion/editorial/" target="_blank" class="market-link-card upsc-card"><span class="market-icon">📰</span><span class="market-name">The Hindu Editorial</span><span class="market-desc">Must-read daily editorials</span></a>
                        <a href="https://indianexpress.com/section/explained/" target="_blank" class="market-link-card upsc-card"><span class="market-icon">💡</span><span class="market-name">IE Explained</span><span class="market-desc">Complex topics simplified</span></a>
                        <a href="https://www.insightsonindia.com/insights-editorial-analysis/" target="_blank" class="market-link-card upsc-card"><span class="market-icon">✍️</span><span class="market-name">Editorial Analysis</span><span class="market-desc">InsightsIAS editorial breakdowns</span></a>
                        <a href="https://www.drishtiias.com/daily-news-editorials" target="_blank" class="market-link-card upsc-card"><span class="market-icon">📝</span><span class="market-name">Drishti Editorials</span><span class="market-desc">Editorial analysis for Mains</span></a>
                        <a href="https://pib.gov.in/indexd.aspx" target="_blank" class="market-link-card upsc-card"><span class="market-icon">🏛️</span><span class="market-name">PIB India</span><span class="market-desc">Official govt press releases</span></a>
                        <a href="https://prsindia.org/" target="_blank" class="market-link-card upsc-card"><span class="market-icon">⚖️</span><span class="market-name">PRS Legislative</span><span class="market-desc">Bills, acts, parliament analysis</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">🗂️ Government Schemes & Policy</h3>
                    <div class="market-links">
                        <a href="https://www.india.gov.in/my-government/schemes" target="_blank" class="market-link-card upsc-card"><span class="market-icon">🇮🇳</span><span class="market-name">Govt Schemes Portal</span><span class="market-desc">All central govt schemes</span></a>
                        <a href="https://www.drishtiias.com/important-institutions/drishti-specials-important-institutions-national-institutions" target="_blank" class="market-link-card upsc-card"><span class="market-icon">🏢</span><span class="market-name">Important Institutions</span><span class="market-desc">Drishti IAS institution notes</span></a>
                        <a href="https://www.niti.gov.in/" target="_blank" class="market-link-card upsc-card"><span class="market-icon">📊</span><span class="market-name">NITI Aayog</span><span class="market-desc">Policy reports, SDG India Index</span></a>
                        <a href="https://economicsurvey.indiabudget.gov.in/" target="_blank" class="market-link-card upsc-card"><span class="market-icon">📕</span><span class="market-name">Economic Survey</span><span class="market-desc">Annual economic review</span></a>
                        <a href="https://sansad.in/" target="_blank" class="market-link-card upsc-card"><span class="market-icon">🏛️</span><span class="market-name">Sansad TV</span><span class="market-desc">Parliament debates & discussions</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">📚 UPSC Strategy & Study Material</h3>
                    <div class="market-links">
                        <a href="https://upsc.gov.in/examinations/syllabus" target="_blank" class="market-link-card upsc-card"><span class="market-icon">📖</span><span class="market-name">UPSC Syllabus</span><span class="market-desc">Official Prelims + Mains syllabus</span></a>
                        <a href="https://upsc.gov.in/examinations/previous-question-papers" target="_blank" class="market-link-card upsc-card"><span class="market-icon">📝</span><span class="market-name">Previous Year Papers</span><span class="market-desc">Official UPSC PYQ papers</span></a>
                        <a href="https://www.clearias.com/upsc-study-materials/" target="_blank" class="market-link-card upsc-card"><span class="market-icon">📚</span><span class="market-name">ClearIAS Study Material</span><span class="market-desc">Free notes for all subjects</span></a>
                        <a href="https://www.drishtiias.com/mains-practice-question/" target="_blank" class="market-link-card upsc-card"><span class="market-icon">✍️</span><span class="market-name">Mains Practice Q</span><span class="market-desc">Daily Mains answer writing</span></a>
                        <a href="https://www.insightsonindia.com/upsc-ias-prelims-test-series/" target="_blank" class="market-link-card upsc-card"><span class="market-icon">🎯</span><span class="market-name">Prelims Test Series</span><span class="market-desc">InsightsIAS mock tests</span></a>
                        <a href="https://www.clearias.com/upsc-prelims-online-mock-test/" target="_blank" class="market-link-card upsc-card"><span class="market-icon">📋</span><span class="market-name">ClearIAS Mock Tests</span><span class="market-desc">Free online prelims tests</span></a>
                    </div>
                </div>

                <div class="market-subsection">
                    <h3 class="market-sub-title">🌐 Free Learning Platforms</h3>
                    <div class="market-links">
                        <a href="https://www.youtube.com/@StudyIQIASHindi" target="_blank" class="market-link-card upsc-card"><span class="market-icon">▶️</span><span class="market-name">StudyIQ (Hindi)</span><span class="market-desc">Daily CA + GS on YouTube</span></a>
                        <a href="https://www.youtube.com/@UNACADEMYIASbyRomanSaini" target="_blank" class="market-link-card upsc-card"><span class="market-icon">▶️</span><span class="market-name">Unacademy IAS</span><span class="market-desc">Roman Saini free lectures</span></a>
                        <a href="https://www.youtube.com/@DrishtiIASEnglish" target="_blank" class="market-link-card upsc-card"><span class="market-icon">▶️</span><span class="market-name">Drishti IAS YouTube</span><span class="market-desc">Video lectures & CA</span></a>
                        <a href="https://epathshala.nic.in/" target="_blank" class="market-link-card upsc-card"><span class="market-icon">📱</span><span class="market-name">ePathshala</span><span class="market-desc">NCERT free digital textbooks</span></a>
                        <a href="https://ncert.nic.in/textbook.php" target="_blank" class="market-link-card upsc-card"><span class="market-icon">📕</span><span class="market-name">NCERT Books</span><span class="market-desc">Free NCERT PDFs — essential</span></a>
                        <a href="https://www.visionias.in/resources.html" target="_blank" class="market-link-card upsc-card"><span class="market-icon">👁️</span><span class="market-name">VisionIAS Resources</span><span class="market-desc">Free monthly magazine & notes</span></a>
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
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SENTINEL Intelligence Brief — ${meta.date}</title>
    <meta name="description" content="Automated intelligence briefing covering world news, cybersecurity, AI, markets, OSINT, and more. Updated daily at 8 AM and 10 PM IST.">
    <meta name="robots" content="index, follow">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=Share+Tech+Mono&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/dashboard.css">
    
    <!-- Firebase SDK (Compat) -->
    <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js"></script>
</head>
<body>
    <!-- Interactive Background and Overlay -->
    <canvas id="neural-canvas"></canvas>
    <div class="bg-grid"></div>
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
        </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
        ${categorySections}
        ${marketWidget}
        ${upscWidget}
    </main>

    <!-- Footer -->
    <footer class="main-footer">
        <div class="footer-content">
            <div class="footer-brand">
                <span class="footer-logo">◈ SENTINEL</span>
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
    <script src="js/auth.js?v=${Date.now()}"></script>
    <script src="js/app.js"></script>
    <script src="js/agent.js?v=${Date.now()}"></script>
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
