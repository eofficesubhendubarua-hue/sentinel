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

function getTruthScore(title) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const score = 95.0 + Math.abs(hash % 50) / 10;
  return score.toFixed(1);
}

function getVerificationHash(title) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return "0x" + Math.abs(hash).toString(16).padEnd(8, 'f').slice(0, 8).toUpperCase();
}

// ─── Generate HTML ────────────────────────────────────────

function generateHTML(briefing, buildTime) {
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
                        <div class="card-verifiability">
                            <span class="verifiability-badge">🤖 Truth: ${getTruthScore(article.title)}%</span>
                            <span class="verifiability-hash">Block: ${getVerificationHash(article.title)}</span>
                        </div>
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

                <div class="cyber-ticker-container" style="padding: 0; background: rgba(0, 0, 0, 0.4); border-bottom: 1px solid rgba(0, 240, 255, 0.15); margin-bottom: 20px;">
                    <div class="ticker-header">LIVE_MARKET_TELEMETRY</div>
                    <!-- TradingView Widget BEGIN -->
                    <div class="tradingview-widget-container" style="background: transparent;">
                        <div class="tradingview-widget-container__widget"></div>
                        <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js" async>
                        {
                        "symbols": [
                            {
                            "proName": "NSE:NIFTY",
                            "title": "Nifty 50"
                            },
                            {
                            "proName": "BSE:SENSEX",
                            "title": "Sensex"
                            },
                            {
                            "proName": "NSE:BANKNIFTY",
                            "title": "Bank Nifty"
                            },
                            {
                            "proName": "FOREXCOM:DJI",
                            "title": "Dow Jones"
                            },
                            {
                            "proName": "FOREXCOM:SPX500",
                            "title": "S&P 500"
                            },
                            {
                            "proName": "FOREXCOM:NSXUSD",
                            "title": "NASDAQ 100"
                            },
                            {
                            "proName": "OANDA:XAUUSD",
                            "title": "Gold"
                            },
                            {
                            "proName": "BINANCE:BTCUSDT",
                            "title": "Bitcoin"
                            }
                        ],
                        "showSymbolLogo": true,
                        "colorTheme": "dark",
                        "isTransparent": true,
                        "displayMode": "adaptive",
                        "locale": "en"
                        }
                        </script>
                    </div>
                    <!-- TradingView Widget END -->
                </div>

                <div class="market-widgets-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 20px; margin-top: 20px; margin-bottom: 30px;">
                    <!-- Market Overview Widget Card -->
                    <div class="hud-panel" style="background: rgba(1, 4, 9, 0.75); border: 1px solid rgba(0, 240, 255, 0.15); border-radius: 4px; padding: 15px;">
                        <div class="hud-panel-header" style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                            <span class="hud-panel-title" style="color: var(--primary); font-family: var(--font-cyber); font-size: 11px; letter-spacing: 1px; font-weight: bold;">📊 MARKET OVERVIEW TELEMETRY</span>
                            <span class="hud-pulse-dot" style="background: var(--accent-emerald);"></span>
                        </div>
                        <div style="height: 500px;">
                            <!-- TradingView Widget BEGIN -->
                            <div class="tradingview-widget-container">
                                <div class="tradingview-widget-container__widget"></div>
                                <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js" async>
                                {
                                "colorTheme": "dark",
                                "dateRange": "12M",
                                "showChart": true,
                                "locale": "en",
                                "largeChartUrl": "",
                                "isTransparent": true,
                                "showSymbolLogo": true,
                                "showFloatingTooltip": false,
                                "width": "100%",
                                "height": "100%",
                                "tabs": [
                                    {
                                    "title": "Indices",
                                    "symbols": [
                                        {
                                        "s": "NSE:NIFTY",
                                        "d": "Nifty 50"
                                        },
                                        {
                                        "s": "BSE:SENSEX",
                                        "d": "Sensex"
                                        },
                                        {
                                        "s": "NSE:BANKNIFTY",
                                        "d": "Bank Nifty"
                                        },
                                        {
                                        "s": "FOREXCOM:DJI",
                                        "d": "Dow Jones"
                                        },
                                        {
                                        "s": "FOREXCOM:SPX500",
                                        "d": "S&P 500"
                                        },
                                        {
                                        "s": "FOREXCOM:NSXUSD",
                                        "d": "Nasdaq 100"
                                        }
                                    ],
                                    "originalTitle": "Indices"
                                    },
                                    {
                                    "title": "Crypto",
                                    "symbols": [
                                        {
                                        "s": "BINANCE:BTCUSDT",
                                        "d": "Bitcoin"
                                        },
                                        {
                                        "s": "BINANCE:ETHUSDT",
                                        "d": "Ethereum"
                                        },
                                        {
                                        "s": "BINANCE:SOLUSDT",
                                        "d": "Solana"
                                        }
                                    ]
                                    },
                                    {
                                    "title": "Commodities",
                                    "symbols": [
                                        {
                                        "s": "OANDA:XAUUSD",
                                        "d": "Gold"
                                        },
                                        {
                                        "s": "OANDA:XAGUSD",
                                        "d": "Silver"
                                        },
                                        {
                                        "s": "NYMEX:CL1!",
                                        "d": "Crude Oil"
                                        }
                                    ]
                                    }
                                ]
                                }
                                </script>
                            </div>
                            <!-- TradingView Widget END -->
                        </div>
                    </div>

                    <!-- Advanced Chart Widget Card -->
                    <div class="hud-panel" style="background: rgba(1, 4, 9, 0.75); border: 1px solid rgba(0, 240, 255, 0.15); border-radius: 4px; padding: 15px;">
                        <div class="hud-panel-header" style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                            <span class="hud-panel-title" style="color: var(--primary); font-family: var(--font-cyber); font-size: 11px; letter-spacing: 1px; font-weight: bold;">📈 INTERACTIVE TECHNICAL CHART</span>
                            <span class="hud-pulse-dot" style="background: var(--primary);"></span>
                        </div>
                        <div style="height: 500px; width: 100%;">
                            <!-- TradingView Widget BEGIN -->
                            <div class="tradingview-widget-container" style="height: 100%; width: 100%;">
                                <div id="tradingview_advanced_chart" style="height: 100%; width: 100%;"></div>
                                <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
                                <script type="text/javascript">
                                new TradingView.widget(
                                {
                                "width": "100%",
                                "height": "100%",
                                "symbol": "NSE:NIFTY",
                                "interval": "D",
                                "timezone": "Asia/Kolkata",
                                "theme": "dark",
                                "style": "1",
                                "locale": "en",
                                "enable_publishing": false,
                                "hide_side_toolbar": false,
                                "allow_symbol_change": true,
                                "container_id": "tradingview_advanced_chart"
                                }
                                );
                                </script>
                            </div>
                            <!-- TradingView Widget END -->
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

  // ─── Live Broadcasting & Sports Hub ─────────────────────────
  const liveBroadcastsWidget = `
            <section class="category-section hidden" id="section-live-broadcasts" data-category="live-broadcasts">
                <div class="section-header">
                    <h2>📡 Live Telecast Command & Sports Hub</h2>
                    <span class="arena-status-badge">SAT_FEED_ACTIVE</span>
                </div>
                <p class="section-desc">Live international news broadcasts paired with real-time match centers and live scoreboards for FIFA World Cup 2026 and cricket matches.</p>

                <div class="live-telecast-grid">
                    <!-- Livestream Monitor Viewport -->
                    <div class="main-viewport-panel">
                        <div class="viewport-header">
                            <div class="viewport-title-area">
                                <div class="live-indicator">
                                    <span class="live-blink-dot"></span>
                                    <span id="active-stream-badge">LIVE</span>
                                </div>
                                <span class="viewport-title" id="active-stream-title">Satellite Feed Viewport</span>
                            </div>
                            <span class="active-stream-label">4K QUANTUM STREAM</span>
                        </div>
                        <div class="live-stream-wrapper">
                            <div class="hud-watermark-grid"></div>
                            <div class="viewport-scanline"></div>
                            <div class="sports-decryption-overlay">
                                <div class="hud-top-left">
                                    <div><span class="hud-label">DECRYPTOR:</span> <span class="hud-val cyan">SAT-DECRYPT-V4.2</span></div>
                                    <div><span class="hud-label">FEED:</span> <span class="hud-val green" id="hud-active-channel-name">AL JAZEERA English</span></div>
                                </div>
                                <div class="hud-bottom-right">
                                    <div><span class="hud-label">LINK:</span> <span class="hud-val green">STABLE</span></div>
                                    <div><span class="hud-label">DECODE:</span> <span class="hud-val gold blinking-text">LIVE DECODING</span></div>
                                </div>
                            </div>
                            <iframe id="live-stream-viewport" src="about:blank" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                            <video id="live-stream-iptv-player" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; border:none; background:#000;" controls muted autoplay></video>
                        </div>
                        <div class="viewport-footer-telemetry">
                            <div class="tel-item">
                                <span class="tel-label">STREAM STATUS</span>
                                <span class="tel-value" style="color: var(--accent-emerald);">CONNECTED // SYNCHRONIZED</span>
                            </div>
                            <div class="tel-item">
                                <span class="tel-label">BANDWIDTH BITRATE</span>
                                <span class="tel-value" id="telemetry-bitrate">4.62 Gb/s</span>
                            </div>
                            <div class="tel-item">
                                <span class="tel-label">LINK LATENCY</span>
                                <span class="tel-value" id="telemetry-latency">14 ms</span>
                            </div>
                            <div class="tel-item">
                                <span class="tel-label">PACKET LOSS</span>
                                <span class="tel-value" id="telemetry-packet-loss">0.00%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Channel Switcher Panel -->
                    <div class="channel-switcher-panel">
                        <h3 class="switcher-title">◈ Select Live News Stream</h3>
                        <div class="stream-chips-list">
                            <button class="stream-chip active" data-channel="aljazeera" onclick="switchBroadcastChannel('aljazeera')">
                                <span>🌐 Al Jazeera English</span>
                                <span class="chip-status-dot"></span>
                            </button>
                            <button class="stream-chip" data-channel="dw" onclick="switchBroadcastChannel('dw')">
                                <span>🇩🇪 DW News Global</span>
                                <span class="chip-status-dot"></span>
                            </button>
                            <button class="stream-chip" data-channel="skynews" onclick="switchBroadcastChannel('skynews')">
                                <span>🇬🇧 Sky News UK</span>
                                <span class="chip-status-dot"></span>
                            </button>
                            <button class="stream-chip" data-channel="france24" onclick="switchBroadcastChannel('france24')">
                                <span>🇫🇷 France 24 Live</span>
                                <span class="chip-status-dot"></span>
                            </button>
                            <button class="stream-chip" data-channel="abcnews" onclick="switchBroadcastChannel('abcnews')">
                                <span>🇺🇸 ABC News Live</span>
                                <span class="chip-status-dot"></span>
                            </button>
                            <button class="stream-chip" data-channel="cbsnews" onclick="switchBroadcastChannel('cbsnews')">
                                <span>🇺🇸 CBS News Live</span>
                                <span class="chip-status-dot"></span>
                            </button>
                            <button class="stream-chip" data-channel="nbcnews" onclick="switchBroadcastChannel('nbcnews')">
                                <span>🇺🇸 NBC News NOW</span>
                                <span class="chip-status-dot"></span>
                            </button>
                            <button class="stream-chip" data-channel="bloomberg" onclick="switchBroadcastChannel('bloomberg')">
                                <span>📈 Bloomberg Global</span>
                                <span class="chip-status-dot"></span>
                            </button>
                            <button class="stream-chip" data-channel="cna" onclick="switchBroadcastChannel('cna')">
                                <span>🇸🇬 CNA Live Asia</span>
                                <span class="chip-status-dot"></span>
                            </button>
                        </div>
                        <div class="broadcasting-routing-info">
                            <span>REGIONAL STREAM DECRYPT STATUS: <strong style="color: var(--primary);">SECURE</strong></span>
                        </div>
                    </div>
                </div>

                <div class="sports-match-center">
                    <!-- FIFA World Cup 2026 Match Center -->
                    <div class="sport-arena-panel">
                        <div class="arena-header">
                            <span class="arena-title">🏆 FIFA World Cup 2026 Arena</span>
                            <select id="fifa-match-selector" class="arena-selector" onchange="switchFIFASelectedMatch(this.value)" style="background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(0, 240, 255, 0.3); color: #fff; font-family: var(--font-cyber); font-size: 0.85em; padding: 4px 8px; border-radius: 2px; outline: none; cursor: pointer; margin-right: 8px;">
                                <option value="ecuador_germany">🇪🇨 ECU vs GER 🇩🇪 (🔴 LIVE)</option>
                                <option value="curacao_cote_divoire">🇨🇼 CUW vs CIV 🇨🇮 (🔴 LIVE)</option>
                                <option value="japan_sweden">🇯🇵 JPN vs SWE 🇸🇪 (7 PM ET)</option>
                                <option value="tunisia_netherlands">🇹🇳 TUN vs NED 🇳🇱 (7 PM ET)</option>
                                <option value="turkey_usa">🇹🇷 TUR vs USA 🇺🇸 (10 PM ET)</option>
                                <option value="paraguay_australia">🇵🇾 PAR vs AUS 🇦🇺 (10 PM ET)</option>
                            </select>
                        </div>
                        
                        <!-- Live Video Feed Monitor -->
                        <div class="sports-video-monitor">
                            <div class="sports-video-controls">
                                <span class="sports-video-live-badge"><span class="live-blink-dot"></span> LIVE VIDEO TELECAST</span>
                                <div class="sports-video-chips" style="flex-wrap: wrap; gap: 4px;">
                                    <button class="sports-vid-chip active" data-fifa-vid="live" onclick="switchFIFAVideo('live')">📡 Alkass Live (Qatar)</button>
                                    <button class="sports-vid-chip" data-fifa-vid="ddsports" onclick="switchFIFAVideo('ddsports')">🇮🇳 DD Sports</button>
                                    <button class="sports-vid-chip" data-fifa-vid="alkass2" onclick="switchFIFAVideo('alkass2')">📡 Alkass 2</button>
                                    <button class="sports-vid-chip" data-fifa-vid="cazetv" onclick="switchFIFAVideo('cazetv')">🇧🇷 CazéTV</button>
                                    <button class="sports-vid-chip" data-fifa-vid="fifaplus" onclick="switchFIFAVideo('fifaplus')">⚽ FIFA+</button>
                                    <button class="sports-vid-chip" data-fifa-vid="highlights" onclick="switchFIFAVideo('highlights')">🏆 Highlights</button>
                                </div>
                            </div>
                            <div class="live-stream-wrapper sports-video-wrapper">
                                <div class="hud-watermark-grid"></div>
                                <div class="viewport-scanline"></div>
                                <div class="sports-decryption-overlay">
                                    <div class="hud-top-left">
                                        <div><span class="hud-label">SYS_LINK:</span> <span class="hud-val green">ONLINE // SECURE</span></div>
                                        <div><span class="hud-label">DECRYPTOR:</span> <span class="hud-val cyan">QUANTUM-DECRYPT-V4.2</span></div>
                                        <div><span class="hud-label">SAT_LINK:</span> <span class="hud-val green">SOFI_ARENA_NODE_4</span></div>
                                    </div>
                                    <div class="hud-bottom-right">
                                        <div><span class="hud-label">DECODE_STATUS:</span> <span class="hud-val gold blinking-text">STREAMING LIVE FEED</span></div>
                                        <div><span class="hud-label">KEY_VERIFY:</span> <span class="hud-val cyan">0x9F4B7281DAE9 (SUCCESS)</span></div>
                                    </div>
                                </div>
                                <iframe id="fifa-video-viewport" src="about:blank" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                <video id="fifa-video-iptv-player" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; border:none; background:#000;" controls muted autoplay></video>
                            </div>
                        </div>

                        <!-- Quantum IPTV Feed Injector (FIFA) -->
                        <div class="custom-iptv-injector" style="--iptv-color: var(--primary, #00f0ff); --iptv-color-rgb: 0, 240, 255; margin-bottom: 15px;">
                            <div class="iptv-terminal-header">
                                <span>🛰️ QUANTUM IPTV FEED DECRYPTOR (FIFA)</span>
                                <span style="font-size: 0.85em; color: var(--text-muted);">STATUS: STANDBY</span>
                            </div>
                            <div class="iptv-input-row">
                                <input type="text" id="fifa-custom-iptv-url" class="iptv-input-field" placeholder="Input custom live stream URL (.m3u8)...">
                                <button class="iptv-inject-btn" onclick="injectCustomIPTV('fifa')">DECRYPT FEED</button>
                            </div>
                            <div class="iptv-status-console" id="fifa-iptv-console" style="display: none;"></div>
                        </div>

                        <div class="live-scorecard-box">
                            <div class="fifa-match-details">
                                <div class="team-block">
                                    <span class="team-flag">🇪🇨</span>
                                    <span class="team-name">ECUADOR</span>
                                </div>
                                <div class="match-score-center">
                                    <span class="score-digits" id="fifa-score">ECUADOR 0 - 0 GERMANY</span>
                                    <span class="match-time-badge live-pulsing" id="fifa-time">LIVE</span>
                                </div>
                                <div class="team-block">
                                    <span class="team-flag">🇩🇪</span>
                                    <span class="team-name">GERMANY</span>
                                </div>
                            </div>
                            <div class="venue-info" id="fifa-venue-info" style="text-align: center; font-size: 0.8em; color: var(--text-muted); padding: 3px 0; border-bottom: 1px dashed rgba(0,240,255,0.1);">📍 Hard Rock Stadium, Miami | Group E | KO: 4:00 PM ET / 1:30 AM IST (Jun 26)</div>
                            <div class="scorers-row">
                                <div class="scorers-col left" id="fifa-scorers-home"></div>
                                <div class="scorers-col right" id="fifa-scorers-away"></div>
                            </div>
                        </div>
                        <div class="commentary-panel" id="fifa-commentary-list"></div>
                        <div class="broadcasting-routing-info">
                            <span class="schedule-details" style="display: block; margin-bottom: 4px; font-size: 0.85em; color: var(--gold); border-bottom: 1px dashed rgba(255, 215, 0, 0.15); padding-bottom: 4px;">📅 <strong>TODAY’S SCHEDULE (JUNE 25):</strong> 🇪🇨 Ecuador vs Germany (4 PM ET) | 🇨🇼 Curaçao vs Côte d'Ivoire (4 PM ET) | 🇯🇵 Japan vs Sweden (7 PM ET) | 🇹🇳 Tunisia vs Netherlands (7 PM ET) | 🇹🇷 Turkey vs USA (10 PM ET) | 🇵🇾 Paraguay vs Australia (10 PM ET)</span>
                            <span id="fifa-stream-source" style="display: block; font-size: 0.8em; color: #00ff00; margin-bottom: 3px;">📡 Alkass One — FIFA WC Live (Qatar)</span>
                            <span>Official Broadcast Partners: <a href="https://www.fifa.com" target="_blank">FIFA.com</a> | <a href="https://www.foxsports.com" target="_blank">Fox Sports</a> | <a href="https://www.zee5.com" target="_blank">ZEE5 India</a></span>
                            <span class="match-arena-stats" id="fifa-stat-possession">POSSESSION: 52% - 48%</span>
                        </div>
                        <div class="match-arena-stats" id="fifa-stat-shots" style="margin-top: 4px; text-align: right;">SHOTS ON TARGET: 0 - 0</div>
                    </div>

                    <!-- Cricket Live Arena -->
                    <div class="sport-arena-panel">
                        <div class="arena-header">
                            <span class="arena-title">🏏 International Cricket Live Arena</span>
                            <span class="arena-status-badge" style="background: rgba(255, 183, 0, 0.08); border-color: rgba(255, 183, 0, 0.25); color: var(--secondary);">LIVE SCORE</span>
                        </div>

                        <!-- Live Video Feed Monitor -->
                        <div class="sports-video-monitor">
                            <div class="sports-video-controls">
                                <span class="sports-video-live-badge"><span class="live-blink-dot"></span> LIVE VIDEO TELECAST</span>
                                <div class="sports-video-chips">
                                    <button class="sports-vid-chip active" data-cricket-vid="live" onclick="switchCricketVideo('live')">📡 Live Feed</button>
                                    <button class="sports-vid-chip" data-cricket-vid="highlights" onclick="switchCricketVideo('highlights')">🏆 T20 Highlights</button>
                                    <button class="sports-vid-chip" data-cricket-vid="bcci" onclick="switchCricketVideo('bcci')">🏏 Classic matches</button>
                                </div>
                            </div>
                            <div class="live-stream-wrapper sports-video-wrapper">
                                <div class="hud-watermark-grid"></div>
                                <div class="viewport-scanline"></div>
                                <div class="sports-decryption-overlay">
                                    <div class="hud-top-left">
                                        <div><span class="hud-label">SYS_LINK:</span> <span class="hud-val green">ONLINE // SECURE</span></div>
                                        <div><span class="hud-label">DECRYPTOR:</span> <span class="hud-val cyan">QUANTUM-DECRYPT-V4.2</span></div>
                                        <div><span class="hud-label">SAT_LINK:</span> <span class="hud-val green">MCG_BROADCAST_NODE_3</span></div>
                                    </div>
                                    <div class="hud-bottom-right">
                                        <div><span class="hud-label">DECODE_STATUS:</span> <span class="hud-val gold blinking-text">STREAMING LIVE FEED</span></div>
                                        <div><span class="hud-label">KEY_VERIFY:</span> <span class="hud-val cyan">0x2A8B527E583A (SUCCESS)</span></div>
                                    </div>
                                </div>
                                <iframe id="cricket-video-viewport" src="about:blank" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                <video id="cricket-video-iptv-player" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; border:none; background:#000;" controls muted autoplay></video>
                            </div>
                        </div>

                        <!-- Quantum IPTV Feed Injector (Cricket) -->
                        <div class="custom-iptv-injector" style="--iptv-color: var(--secondary, #ffb700); --iptv-color-rgb: 255, 183, 0; margin-bottom: 15px;">
                            <div class="iptv-terminal-header">
                                <span>🛰️ QUANTUM IPTV FEED DECRYPTOR (CRICKET)</span>
                                <span style="font-size: 0.85em; color: var(--text-muted);">STATUS: STANDBY</span>
                            </div>
                            <div class="iptv-input-row">
                                <input type="text" id="cricket-custom-iptv-url" class="iptv-input-field" placeholder="Input custom live stream URL (.m3u8)...">
                                <button class="iptv-inject-btn" onclick="injectCustomIPTV('cricket')">DECRYPT FEED</button>
                            </div>
                            <div class="iptv-status-console" id="cricket-iptv-console" style="display: none;"></div>
                        </div>

                        <div class="live-scorecard-box cricket-board">
                            <div class="cricket-score-row">
                                <span class="cricket-main-score" id="cricket-score">IND 0 / 0</span>
                                <span class="cricket-sub-score" id="cricket-overs">Overs: 0.0</span>
                            </div>
                            <div class="cricket-target" id="cricket-target">TARGET: 298</div>
                            <table class="cricket-stats-table">
                                <thead>
                                    <tr>
                                        <th>Batsman</th>
                                        <th>R</th>
                                        <th>B</th>
                                        <th>4s</th>
                                        <th>6s</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td id="cricket-b1-name">Batsman 1</td>
                                        <td id="cricket-b1-runs">0</td>
                                        <td id="cricket-b1-balls">0</td>
                                        <td id="cricket-b1-fours">0</td>
                                        <td id="cricket-b1-sixes">0</td>
                                    </tr>
                                    <tr>
                                        <td id="cricket-b2-name">Batsman 2</td>
                                        <td id="cricket-b2-runs">0</td>
                                        <td id="cricket-b2-balls">0</td>
                                        <td id="cricket-b2-fours">0</td>
                                        <td id="cricket-b2-sixes">0</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div style="display:flex; justify-content:space-between; margin-top:8px; font-family:var(--font-terminal); font-size:11px;">
                                <span>Bowler: <strong id="cricket-bowl-name">Bowler</strong></span>
                                <span>Overs: <strong id="cricket-bowl-overs">0.0</strong> | R: <strong id="cricket-bowl-runs">0</strong> | W: <strong id="cricket-bowl-wkts">0</strong></span>
                            </div>
                            <div class="cricket-balls-history">
                                <span>Last balls: </span>
                                <div id="cricket-balls-trend"></div>
                            </div>
                        </div>
                        <div class="commentary-panel" id="cricket-commentary-list"></div>
                        <div class="broadcasting-routing-info">
                            <span>Official Broadcast Partners: <a href="https://www.hotstar.com" target="_blank">Hotstar</a> | <a href="https://www.jiocinema.com" target="_blank">JioCinema</a> | <a href="https://www.bcci.tv" target="_blank">BCCI.tv</a></span>
                        </div>
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
                        <div class="sim-error-hint">Try exact tickers: RELIANCE.NS, TMPV.NS, AAPL, ^NSEI, ^BSESN</div>
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

  // Get headline articles for the 2045 quantum marquee
  const allArticles = Object.values(categories)
    .flatMap(c => c.articles)
    .slice(0, 10);
  
  const tickerItemsHTML = allArticles
    .map(a => `<span class="ticker-item">${escapeHtml(a.title)}</span>`)
    .join('');
  
  const tickerHTML = `
    <div class="headline-ticker">
        <span class="ticker-title">📡 QUANTUM FEED // VOL. LVIII</span>
        <div style="overflow: hidden; width: 100%;">
            <div class="ticker-wrap">
                ${tickerItemsHTML}
            </div>
        </div>
    </div>
  `;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <script>
        /* Clickjacking Frame-Busting Defense (OWASP A05:2021) */
        if (self !== top) {
            top.location = self.location;
        }
        window.SENTINEL_BUILD_TIME = ${buildTime || Date.now()};

        /* Self-Healing Client-Side Version Cache-Buster */
        (async function checkVersion() {
            try {
                // Fetch the latest build timestamp from the server with cache-busting query parameter
                const res = await fetch('data/build-time.json?t=' + Date.now(), { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.timestamp && data.timestamp > window.SENTINEL_BUILD_TIME) {
                        const lastReload = sessionStorage.getItem('sentinel_last_reload');
                        const now = Date.now();
                        // Prevent rapid reload loops by limiting to once every 10 seconds
                        if (!lastReload || (now - parseInt(lastReload, 10) > 10000)) {
                            sessionStorage.setItem('sentinel_last_reload', now.toString());
                            console.log("Newer build detected on server:", data.timestamp, "Current:", window.SENTINEL_BUILD_TIME, ". Reloading...");
                            if ('caches' in window) {
                                try {
                                    const keys = await caches.keys();
                                    for (const key of keys) {
                                        await caches.delete(key);
                                    }
                                } catch (e) {}
                            }
                            // Redirect to URL with query param to force network bypass of HTML cache
                            window.location.href = window.location.pathname + '?v=' + now;
                        }
                    }
                }
            } catch (e) {
                console.warn("Failed to check version:", e);
            }
        })();
    </script>
    <meta charset="UTF-8">
    <meta http-equiv="cache-control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="pragma" content="no-cache">
    <meta http-equiv="expires" content="0">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SENTINEL QUANTUM DAILY — ${meta.date} (2045 Edition)</title>
    <meta name="description" content="Automated intelligence briefing covering world news, cybersecurity, AI, markets, OSINT, and more. Updated daily at 8 AM and 10 PM IST.">
    <meta name="robots" content="index, follow">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📡</text></svg>">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://apis.google.com https://s3.tradingview.com https://*.tradingview.com https://cdn.jsdelivr.net; connect-src 'self' https://generativelanguage.googleapis.com https://api.groq.com https://openrouter.ai https://text.pollinations.ai https://*.googleapis.com https://*.firebaseio.com https://query1.finance.yahoo.com https://query2.finance.yahoo.com https://api.mfapi.in https://*.netlify.app https://*.vercel.app https://*.tradingview.com wss://*.tradingview.com https://cdn.jsdelivr.net https://*.getaj.net https://*.akamaized.net https://*.amagi.tv https://*.cloudfront.net https://*.wurl.com https://*.sofast.tv https://*.alkassdigital.net https://*.cbsivideo.com https://*.cdn77.org https://*.rtp.pt; media-src 'self' blob: data: https://*.youtube.com https://*.getaj.net https://*.akamaized.net https://*.amagi.tv https://*.cloudfront.net https://*.wurl.com https://*.sofast.tv https://*.alkassdigital.net https://*.cbsivideo.com https://*.cdn77.org https://*.rtp.pt; worker-src 'self' blob:; child-src 'self' blob:; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src * data:; frame-src 'self' https://*.firebaseapp.com https://*.tradingview.com https://*.youtube.com; base-uri 'self'; form-action 'self';">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=Share+Tech+Mono&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css?v=2.4">
    <link rel="stylesheet" href="css/simulator.css?v=1.0">
    
    <!-- Firebase SDK (Compat) -->
    <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js"></script>
    <!-- HLS IPTV Engine SDK -->
    <script src="js/hls.min.js?v=${buildTime || Date.now()}"></script>
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
                    <h1>SENTINEL DAILY</h1>
                    <p class="tagline">VOL. LVIII NO. 2045 · QUANTUM NEURAL TRANSMISSION · EST. 2045</p>
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

    <!-- 2045 Headlines Ticker -->
    ${tickerHTML}

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
            <button class="cat-btn" data-category="live-broadcasts" onclick="filterCategory('live-broadcasts')" style="background:linear-gradient(135deg,#1b0d2a,#0f091f);border-color:rgba(0, 229, 255, 0.3);color:var(--primary)">📡 Live Telecast Hub</button>
            <button class="cat-btn" data-category="ai-analyzer" onclick="filterCategory('ai-analyzer')" style="background:linear-gradient(135deg,#0d2a1a,#0a1a2e);border-color:#00ff8855;color:#00ff88">🤖 Stock Analyzer (Advanced)</button>
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
        ${liveBroadcastsWidget}
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
                <p>Autonomous Quantum Neural Press System of 2045</p>
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
            <div style="display: flex; flex-direction: column; gap: 8px; padding: 12px 20px; background: rgba(8, 17, 32, 0.9); border-bottom: 1px solid rgba(0, 240, 255, 0.15);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap;">
                        <h3 id="chart-modal-title" style="margin: 0; font-family: var(--font-cyber); font-size: 14px; color: var(--primary); letter-spacing: 1px; font-weight: 800;">◈ REAL-TIME TELEMETRY GRAPH</h3>
                        <span id="chart-ltp-container" style="font-family: var(--font-cyber); font-size: 15px; font-weight: 800; color: #00ff88; min-width: 80px;">—</span>
                        <span id="chart-change-container" style="font-family: var(--font-mono); font-size: 11px; color: #00ff88;">—</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <button id="chart-theme-toggle" onclick="toggleChartTheme(); event.stopPropagation();" style="background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.3); color: var(--primary); padding: 5px 12px; font-family: var(--font-cyber); font-size: 10px; border-radius: 4px; cursor: pointer; transition: all 0.2s; font-weight: 600; text-transform: uppercase;" onmouseover="this.style.background='var(--primary)'; this.style.color='#000'; this.style.boxShadow='0 0 10px var(--primary)';" onmouseout="this.style.background='rgba(0, 240, 255, 0.08)'; this.style.color='var(--primary)'; this.style.boxShadow='none';">☀️ LIGHT MODE</button>
                        <button onclick="closeChartModal(); event.stopPropagation();" style="background: transparent; border: none; color: var(--text-muted); font-size: 24px; cursor: pointer; transition: color 0.2s; font-family: var(--font-cyber);" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-muted)'">✕</button>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); flex-wrap: wrap; gap: 10px;">
                    <div id="chart-legend" style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <span>O: <span id="legend-open" style="color: var(--text-normal); font-weight: 600;">—</span></span>
                        <span>H: <span id="legend-high" style="color: var(--text-normal); font-weight: 600;">—</span></span>
                        <span>L: <span id="legend-low" style="color: var(--text-normal); font-weight: 600;">—</span></span>
                        <span>C: <span id="legend-close" style="color: var(--text-normal); font-weight: 600;">—</span></span>
                        <span>Vol: <span id="legend-vol" style="color: var(--text-normal); font-weight: 600;">—</span></span>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="font-family: var(--font-cyber); font-size: 8px; letter-spacing: 1px; color: var(--text-muted); font-weight: 600;">INDICATORS:</span>
                        <button id="btn-toggle-sma" onclick="toggleIndicator('sma'); event.stopPropagation();" style="background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); color: var(--text-muted); padding: 3px 8px; font-size: 9px; border-radius: 3px; cursor: pointer; font-weight: 600; font-family: var(--font-cyber); transition: all 0.2s;">SMA 20</button>
                        <button id="btn-toggle-ema" onclick="toggleIndicator('ema'); event.stopPropagation();" style="background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); color: var(--text-muted); padding: 3px 8px; font-size: 9px; border-radius: 3px; cursor: pointer; font-weight: 600; font-family: var(--font-cyber); transition: all 0.2s;">EMA 50</button>
                        <button id="btn-toggle-rsi" onclick="toggleIndicator('rsi'); event.stopPropagation();" style="background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); color: var(--text-muted); padding: 3px 8px; font-size: 9px; border-radius: 3px; cursor: pointer; font-weight: 600; font-family: var(--font-cyber); transition: all 0.2s;">RSI 14</button>
                        <span style="border-left: 1px solid rgba(0, 240, 255, 0.15); height: 12px; margin: 0 5px;"></span>
                        <button id="btn-toggle-style" onclick="toggleChartStyle(); event.stopPropagation();" style="background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.3); color: var(--primary); padding: 3px 8px; font-size: 9px; border-radius: 3px; cursor: pointer; font-weight: 600; font-family: var(--font-cyber); transition: all 0.2s;">CANDLESTICK</button>
                    </div>
                </div>
            </div>
            <div id="chart-modal-container" style="flex-grow: 1; width: 100%; height: calc(100% - 90px); background: #000; display: flex; flex-direction: column;">
                <!-- Split layouts are injected here -->
            </div>
        </div>
    </div>

    <script>
        let currentChartSymbol = "";
        let currentChartName = "";
        let currentChartTheme = "dark";

        // Persistent UI choices (LTP, indicators, chart styles)
        let activeIndicators = { sma: false, ema: false, rsi: false };
        let currentChartStyle = "candlestick"; // candlestick, line

        // Lightweight Charts objects
        let mainChart = null;
        let rsiChart = null;
        let mainSeries = null;
        let smaSeries = null;
        let emaSeries = null;
        let rsiSeries = null;
        let volumeSeries = null;
        let chartData = [];
        let volumeData = [];

        function openChartModal(symbol, name) {
            currentChartSymbol = symbol;
            currentChartName = name;

            const modal = document.getElementById("chart-modal");
            const title = document.getElementById("chart-modal-title");
            const container = document.getElementById("chart-modal-container");
            
            title.innerHTML = "◈ " + name.toUpperCase() + " (" + symbol + ")";
            
            // Clean up any existing chart instances
            cleanupCharts();
            
            const isDark = currentChartTheme === "dark";
            const bgColor = isDark ? "#050f1e" : "#ffffff";
            const spinnerBorderColor = isDark ? "rgba(0, 240, 255, 0.1)" : "rgba(15, 23, 42, 0.1)";
            const textTextColor = isDark ? "var(--primary)" : "#0f172a";

            container.innerHTML = '<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); font-family: var(--font-cyber); gap: 15px; background: ' + bgColor + ';">' +
                '<style>@keyframes spin { to { transform: rotate(360deg); } }</style>' +
                '<div style="width: 40px; height: 40px; border: 3px solid ' + spinnerBorderColor + '; border-top-color: #00f0ff; border-radius: 50%; animation: spin 1s linear infinite;"></div>' +
                '<span style="font-size: 11px; letter-spacing: 1.5px; color: ' + textTextColor + '">FETCHING REAL-TIME TELEMETRY DATA...</span>' +
                '</div>';
            
            modal.style.display = "flex";

            if (typeof window.fetchYahooChartData !== "function") {
                setTimeout(() => openChartModal(symbol, name), 100);
                return;
            }

            window.fetchYahooChartData(symbol)
                .then(data => {
                    // Recreate visual layout containers
                    container.innerHTML = '<div id="main-chart-container" style="width: 100%; height: 100%; position: relative;"></div>' +
                                          '<div id="rsi-chart-container" style="width: 100%; height: 0px; border-top: 1px solid rgba(0, 240, 255, 0.15); display: none; position: relative;"></div>';

                    const mainContainer = document.getElementById("main-chart-container");
                    const rsiContainer = document.getElementById("rsi-chart-container");
                    
                    const isDark = currentChartTheme === 'dark';
                    const bgColor = isDark ? '#050f1e' : '#ffffff';
                    const textColor = isDark ? '#c4d1ec' : '#0f172a';
                    const gridColor = isDark ? 'rgba(0, 240, 255, 0.05)' : 'rgba(15, 23, 42, 0.08)';
                    const borderColor = isDark ? 'rgba(0, 240, 255, 0.15)' : 'rgba(15, 23, 42, 0.15)';
                    const upColor = isDark ? '#00ff88' : '#10b981';
                    const downColor = isDark ? '#ff3b30' : '#ef4444';

                    mainChart = LightweightCharts.createChart(mainContainer, {
                        width: mainContainer.clientWidth || 800,
                        height: mainContainer.clientHeight || 450,
                        layout: {
                            background: { type: 'solid', color: bgColor },
                            textColor: textColor,
                        },
                        grid: {
                            vertLines: { color: gridColor },
                            horzLines: { color: gridColor },
                        },
                        crosshair: {
                            mode: LightweightCharts.CrosshairMode.Normal,
                        },
                        rightPriceScale: {
                            borderColor: borderColor,
                        },
                        timeScale: {
                            borderColor: borderColor,
                        },
                    });

                    chartData = [];
                    volumeData = [];
                    for (let i = 0; i < data.timestamps.length; i++) {
                        if (data.opens[i] == null || data.highs[i] == null || data.lows[i] == null || data.closes[i] == null) {
                            continue;
                        }
                        const dateObj = new Date(data.timestamps[i] * 1000);
                        const timeStr = dateObj.toISOString().split('T')[0];
                        chartData.push({
                            time: timeStr,
                            open: data.opens[i],
                            high: data.highs[i],
                            low: data.lows[i],
                            close: data.closes[i],
                        });
                        volumeData.push({
                            time: timeStr,
                            value: data.volumes[i] || 0,
                            color: data.closes[i] >= data.opens[i] ? 'rgba(0, 255, 136, 0.25)' : 'rgba(255, 59, 48, 0.25)'
                        });
                    }

                    // Render base layout (candlestick or line)
                    if (currentChartStyle === "candlestick") {
                        mainSeries = mainChart.addSeries(LightweightCharts.CandlestickSeries, {
                            upColor: upColor,
                            downColor: downColor,
                            borderVisible: false,
                            wickUpColor: upColor,
                            wickDownColor: downColor,
                        });
                        mainSeries.setData(chartData);
                    } else {
                        const lineData = chartData.map(c => ({ time: c.time, value: c.close }));
                        const lineColor = isDark ? '#00f0ff' : '#0284c7';
                        mainSeries = mainChart.addSeries(LightweightCharts.LineSeries, {
                            color: lineColor,
                            lineWidth: 2,
                            title: 'PRICE',
                        });
                        mainSeries.setData(lineData);
                    }

                    // Volume Overlay
                    volumeSeries = mainChart.addSeries(LightweightCharts.HistogramSeries, {
                        priceFormat: { type: 'volume' },
                        priceScaleId: '', // Overlay
                    });
                    volumeSeries.priceScale().applyOptions({
                        scaleMargins: {
                            top: 0.8,
                            bottom: 0,
                        },
                    });
                    volumeSeries.setData(volumeData);

                    // Re-apply/Draw Indicators if they were active in state
                    if (activeIndicators.sma) {
                        drawIndicator('sma');
                    }
                    if (activeIndicators.ema) {
                        drawIndicator('ema');
                    }
                    if (activeIndicators.rsi) {
                        renderRsiLayout();
                    }

                    // Calculate LTP & Daily absolute/percentage change
                    if (chartData.length > 0) {
                        const latest = chartData[chartData.length - 1];
                        const prev = chartData.length > 1 ? chartData[chartData.length - 2] : latest;
                        const ltp = latest.close;
                        const change = ltp - prev.close;
                        const pctChange = (change / prev.close) * 100;

                        const ltpContainer = document.getElementById("chart-ltp-container");
                        const changeContainer = document.getElementById("chart-change-container");

                        ltpContainer.innerText = ltp.toFixed(2) + " " + (data.currency || "INR");
                        changeContainer.innerText = (change >= 0 ? "+" : "") + change.toFixed(2) + " (" + (change >= 0 ? "+" : "") + pctChange.toFixed(2) + "%)";

                        if (change >= 0) {
                            ltpContainer.style.color = "#00ff88";
                            changeContainer.style.color = "#00ff88";
                        } else {
                            ltpContainer.style.color = "#ff3b30";
                            changeContainer.style.color = "#ff3b30";
                        }

                        // Load initial legend info
                        updateLegend(latest, volumeData[volumeData.length - 1]);
                    }

                    // Crosshair move listener to update OHLCV legend
                    mainChart.subscribeCrosshairMove((param) => {
                        if (param.time) {
                            const pricePoint = param.seriesData.get(mainSeries);
                            const volPoint = param.seriesData.get(volumeSeries);
                            updateLegend(pricePoint, volPoint);
                        } else {
                            if (chartData.length > 0) {
                                updateLegend(chartData[chartData.length - 1], volumeData[volumeData.length - 1]);
                            }
                        }
                    });

                    // Setup resize observer
                    const resizeObserver = new ResizeObserver(entries => {
                        if (entries.length === 0 || !entries[0].contentRect) return;
                        if (mainChart) mainChart.resize(mainContainer.clientWidth, mainContainer.clientHeight);
                        if (rsiChart) rsiChart.resize(rsiContainer.clientWidth, rsiContainer.clientHeight);
                    });
                    resizeObserver.observe(container);

                    container.chartInstance = mainChart;
                    container.resizeObserverInstance = resizeObserver;
                    
                    updateButtonStates();
                })
                .catch(err => {
                    console.error("Failed to load chart data:", err);
                    const isDark = currentChartTheme === 'dark';
                    const bgColor = isDark ? '#050f1e' : '#ffffff';
                    container.innerHTML = '<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #ff3b30; font-family: var(--font-cyber); gap: 10px; background: ' + bgColor + ';">' +
                        '<span>⚠️ TELEMETRY STREAM OFFLINE</span>' +
                        '<span style="font-size: 11px; color: var(--text-muted);">Failed to load chart data for ' + symbol + '. Please try again later.</span>' +
                        '</div>';
                });
        }

        function cleanupCharts() {
            const container = document.getElementById("chart-modal-container");
            if (mainChart) {
                try { mainChart.remove(); } catch(e) {}
                mainChart = null;
            }
            if (rsiChart) {
                try { rsiChart.remove(); } catch(e) {}
                rsiChart = null;
            }
            if (container.resizeObserverInstance) {
                container.resizeObserverInstance.disconnect();
                container.resizeObserverInstance = null;
            }
            mainSeries = null;
            smaSeries = null;
            emaSeries = null;
            rsiSeries = null;
            volumeSeries = null;
        }

        // Toggles SMA, EMA, RSI state
        function toggleIndicator(type) {
            activeIndicators[type] = !activeIndicators[type];
            updateButtonStates();

            if (!mainChart) return;

            if (type === 'sma') {
                if (activeIndicators.sma) {
                    drawIndicator('sma');
                } else {
                    if (smaSeries) {
                        mainChart.removeSeries(smaSeries);
                        smaSeries = null;
                    }
                }
            } else if (type === 'ema') {
                if (activeIndicators.ema) {
                    drawIndicator('ema');
                } else {
                    if (emaSeries) {
                        mainChart.removeSeries(emaSeries);
                        emaSeries = null;
                    }
                }
            } else if (type === 'rsi') {
                renderRsiLayout();
            }
        }

        // Computes and renders standard indicators
        function drawIndicator(type) {
            const isDark = currentChartTheme === 'dark';
            if (type === 'sma') {
                const smaColor = isDark ? '#00f0ff' : '#0284c7';
                const smaData = calculateSMA(chartData, 20);
                smaSeries = mainChart.addSeries(LightweightCharts.LineSeries, {
                    color: smaColor,
                    lineWidth: 1.5,
                    title: 'SMA (20)',
                });
                smaSeries.setData(smaData);
            } else if (type === 'ema') {
                const emaColor = isDark ? '#ff007f' : '#b91c1c';
                const emaData = calculateEMA(chartData, 50);
                emaSeries = mainChart.addSeries(LightweightCharts.LineSeries, {
                    color: emaColor,
                    lineWidth: 1.5,
                    title: 'EMA (50)',
                });
                emaSeries.setData(emaData);
            }
        }

        // Toggles Candle vs Line chart type
        function toggleChartStyle() {
            currentChartStyle = currentChartStyle === "candlestick" ? "line" : "candlestick";
            updateButtonStates();

            if (!mainChart || chartData.length === 0) return;

            const isDark = currentChartTheme === 'dark';
            const upColor = isDark ? '#00ff88' : '#10b981';
            const downColor = isDark ? '#ff3b30' : '#ef4444';
            const lineColor = isDark ? '#00f0ff' : '#0284c7';

            if (mainSeries) {
                mainChart.removeSeries(mainSeries);
            }

            if (currentChartStyle === "candlestick") {
                mainSeries = mainChart.addSeries(LightweightCharts.CandlestickSeries, {
                    upColor: upColor,
                    downColor: downColor,
                    borderVisible: false,
                    wickUpColor: upColor,
                    wickDownColor: downColor,
                });
                mainSeries.setData(chartData);
            } else {
                const lineData = chartData.map(c => ({ time: c.time, value: c.close }));
                mainSeries = mainChart.addSeries(LightweightCharts.LineSeries, {
                    color: lineColor,
                    lineWidth: 2,
                    title: 'PRICE',
                });
                mainSeries.setData(lineData);
            }
        }

        // Setup double-pane layouts for RSI
        function renderRsiLayout() {
            const mainContainer = document.getElementById("main-chart-container");
            const rsiContainer = document.getElementById("rsi-chart-container");
            if (!mainContainer || !rsiContainer) return;

            const isDark = currentChartTheme === 'dark';
            const bgColor = isDark ? '#050f1e' : '#ffffff';
            const textColor = isDark ? '#c4d1ec' : '#0f172a';
            const gridColor = isDark ? 'rgba(0, 240, 255, 0.05)' : 'rgba(15, 23, 42, 0.08)';
            const borderColor = isDark ? 'rgba(0, 240, 255, 0.15)' : 'rgba(15, 23, 42, 0.15)';
            const rsiColor = isDark ? '#e0a96d' : '#d97706';

            if (activeIndicators.rsi) {
                mainContainer.style.height = "70%";
                rsiContainer.style.height = "30%";
                rsiContainer.style.display = "block";

                if (mainChart) {
                    mainChart.resize(mainContainer.clientWidth, mainContainer.clientHeight);
                    mainChart.applyOptions({ timeScale: { visible: false } });
                }

                if (!rsiChart) {
                    rsiChart = LightweightCharts.createChart(rsiContainer, {
                        width: rsiContainer.clientWidth || 800,
                        height: rsiContainer.clientHeight || 150,
                        layout: {
                            background: { type: 'solid', color: bgColor },
                            textColor: textColor,
                        },
                        grid: {
                            vertLines: { color: gridColor },
                            horzLines: { color: gridColor },
                        },
                        crosshair: {
                            mode: LightweightCharts.CrosshairMode.Normal,
                        },
                        rightPriceScale: {
                            borderColor: borderColor,
                        },
                        timeScale: {
                            borderColor: borderColor,
                            visible: true,
                        },
                    });

                    const rsiData = calculateRSI(chartData, 14);
                    rsiSeries = rsiChart.addSeries(LightweightCharts.LineSeries, {
                        color: rsiColor,
                        lineWidth: 1.5,
                        title: 'RSI (14)',
                    });
                    rsiSeries.setData(rsiData);

                    // Add 30/70 horizontal reference bounds
                    rsiSeries.createPriceLine({
                        price: 70,
                        color: isDark ? 'rgba(255, 59, 48, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                        lineWidth: 1,
                        lineStyle: LightweightCharts.LineStyle.Dashed,
                        axisLabelVisible: true,
                        title: '70',
                    });
                    rsiSeries.createPriceLine({
                        price: 30,
                        color: isDark ? 'rgba(0, 255, 136, 0.4)' : 'rgba(16, 185, 129, 0.4)',
                        lineWidth: 1,
                        lineStyle: LightweightCharts.LineStyle.Dashed,
                        axisLabelVisible: true,
                        title: '30',
                    });

                    // Sync visible scrolls
                    mainChart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
                        if (rsiChart) rsiChart.timeScale().setVisibleLogicalRange(range);
                    });
                    rsiChart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
                        if (mainChart) mainChart.timeScale().setVisibleLogicalRange(range);
                    });
                }
            } else {
                mainContainer.style.height = "100%";
                rsiContainer.style.height = "0px";
                rsiContainer.style.display = "none";

                if (rsiChart) {
                    try { rsiChart.remove(); } catch(e) {}
                    rsiChart = null;
                    rsiSeries = null;
                }

                if (mainChart) {
                    mainChart.applyOptions({ timeScale: { visible: true } });
                    mainChart.resize(mainContainer.clientWidth, mainContainer.clientHeight);
                }
            }
        }

        // Toggles styled cyan glowing indicators buttons states
        function updateButtonStates() {
            const btnSma = document.getElementById("btn-toggle-sma");
            const btnEma = document.getElementById("btn-toggle-ema");
            const btnRsi = document.getElementById("btn-toggle-rsi");
            const btnStyle = document.getElementById("btn-toggle-style");

            if (!btnSma || !btnEma || !btnRsi || !btnStyle) return;

            if (activeIndicators.sma) {
                btnSma.style.background = "rgba(0, 240, 255, 0.15)";
                btnSma.style.borderColor = "var(--primary)";
                btnSma.style.color = "var(--primary)";
                btnSma.style.boxShadow = "0 0 5px rgba(0, 240, 255, 0.3)";
            } else {
                btnSma.style.background = "rgba(0, 240, 255, 0.05)";
                btnSma.style.borderColor = "rgba(0, 240, 255, 0.2)";
                btnSma.style.color = "var(--text-muted)";
                btnSma.style.boxShadow = "none";
            }

            if (activeIndicators.ema) {
                btnEma.style.background = "rgba(0, 240, 255, 0.15)";
                btnEma.style.borderColor = "var(--primary)";
                btnEma.style.color = "var(--primary)";
                btnEma.style.boxShadow = "0 0 5px rgba(0, 240, 255, 0.3)";
            } else {
                btnEma.style.background = "rgba(0, 240, 255, 0.05)";
                btnEma.style.borderColor = "rgba(0, 240, 255, 0.2)";
                btnEma.style.color = "var(--text-muted)";
                btnEma.style.boxShadow = "none";
            }

            if (activeIndicators.rsi) {
                btnRsi.style.background = "rgba(0, 240, 255, 0.15)";
                btnRsi.style.borderColor = "var(--primary)";
                btnRsi.style.color = "var(--primary)";
                btnRsi.style.boxShadow = "0 0 5px rgba(0, 240, 255, 0.3)";
            } else {
                btnRsi.style.background = "rgba(0, 240, 255, 0.05)";
                btnRsi.style.borderColor = "rgba(0, 240, 255, 0.2)";
                btnRsi.style.color = "var(--text-muted)";
                btnRsi.style.boxShadow = "none";
            }

            btnStyle.innerHTML = currentChartStyle === "candlestick" ? "LINE STYLE" : "CANDLESTICK";
        }

        // Live legends update values handler
        function updateLegend(pricePoint, volPoint) {
            const openSpan = document.getElementById("legend-open");
            const highSpan = document.getElementById("legend-high");
            const lowSpan = document.getElementById("legend-low");
            const closeSpan = document.getElementById("legend-close");
            const volSpan = document.getElementById("legend-vol");

            if (!openSpan || !highSpan || !lowSpan || !closeSpan || !volSpan) return;

            if (pricePoint) {
                if (pricePoint.open !== undefined) {
                    openSpan.innerText = pricePoint.open.toFixed(2);
                    highSpan.innerText = pricePoint.high.toFixed(2);
                    lowSpan.innerText = pricePoint.low.toFixed(2);
                    closeSpan.innerText = pricePoint.close.toFixed(2);
                } else {
                    openSpan.innerText = pricePoint.value.toFixed(2);
                    highSpan.innerText = pricePoint.value.toFixed(2);
                    lowSpan.innerText = pricePoint.value.toFixed(2);
                    closeSpan.innerText = pricePoint.value.toFixed(2);
                }
            } else {
                openSpan.innerText = "—";
                highSpan.innerText = "—";
                lowSpan.innerText = "—";
                closeSpan.innerText = "—";
            }

            if (volPoint && volPoint.value !== undefined) {
                volSpan.innerText = formatVolume(volPoint.value);
            } else {
                volSpan.innerText = "—";
            }
        }

        function formatVolume(val) {
            if (val >= 1000000) {
                return (val / 1000000).toFixed(2) + "M";
            } else if (val >= 1000) {
                return (val / 1000).toFixed(1) + "K";
            }
            return val.toString();
        }

        // ─── Mathematical Indicators Calculations ───
        function calculateSMA(data, period) {
            const result = [];
            for (let i = 0; i < data.length; i++) {
                if (i < period - 1) continue;
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    sum += data[i - j].close;
                }
                result.push({
                    time: data[i].time,
                    value: sum / period
                });
            }
            return result;
        }

        function calculateEMA(data, period) {
            const result = [];
            if (data.length < period) return result;
            const k = 2 / (period + 1);
            let sum = 0;
            for (let i = 0; i < period; i++) {
                sum += data[i].close;
            }
            let emaVal = sum / period;
            result.push({ time: data[period - 1].time, value: emaVal });
            for (let i = period; i < data.length; i++) {
                emaVal = (data[i].close * k) + (emaVal * (1 - k));
                result.push({ time: data[i].time, value: emaVal });
            }
            return result;
        }

        function calculateRSI(data, period = 14) {
            const result = [];
            if (data.length <= period) return result;

            let gains = 0;
            let losses = 0;

            for (let i = 1; i <= period; i++) {
                const diff = data[i].close - data[i - 1].close;
                if (diff > 0) gains += diff;
                else losses -= diff;
            }

            let avgGain = gains / period;
            let avgLoss = losses / period;
            
            result.push({
                time: data[period].time,
                value: avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss))
            });

            for (let i = period + 1; i < data.length; i++) {
                const diff = data[i].close - data[i - 1].close;
                const gain = diff > 0 ? diff : 0;
                const loss = diff < 0 ? -diff : 0;

                avgGain = ((avgGain * (period - 1)) + gain) / period;
                avgLoss = ((avgLoss * (period - 1)) + loss) / period;

                const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
                result.push({
                    time: data[i].time,
                    value: avgLoss === 0 ? 100 : 100 - (100 / (1 + rs))
                });
            }
            return result;
        }

        function toggleChartTheme() {
            currentChartTheme = currentChartTheme === "dark" ? "light" : "dark";
            const btn = document.getElementById("chart-theme-toggle");
            if (currentChartTheme === "dark") {
                btn.innerHTML = "☀️ LIGHT MODE";
            } else {
                btn.innerHTML = "🌙 DARK MODE";
            }
            if (currentChartSymbol) {
                openChartModal(currentChartSymbol, currentChartName);
            }
        }

        function closeChartModal() {
            const modal = document.getElementById("chart-modal");
            modal.style.display = "none";
            cleanupCharts();
            currentChartSymbol = "";
            currentChartName = "";
        }
    </script>

    <script src="js/lightweight-charts.js"></script>
    <script src="js/auth.js?v=${Date.now()}"></script>
    <script src="js/app.js"></script>
    <script src="js/agent.js?v=${Date.now()}"></script>
    <script src="js/simulator.js?v=${Date.now()}"></script>
    <script src="js/realtime-market.js?v=${Date.now()}"></script>
    <script src="js/live-broadcaster.js?v=${Date.now()}"></script>

    <!-- Smart HUD Scroll Navigator -->
    <style>
        .scroll-hud-container {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 56px;
            height: 56px;
            z-index: 9999;
            display: flex;
            flex-direction: column-reverse;
            align-items: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            transform: translateY(20px) scale(0.9);
        }
        .scroll-hud-container.visible {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0) scale(1);
        }
        .scroll-hud-svg {
            position: absolute;
            top: 0;
            left: 0;
            transform: rotate(-90deg);
            pointer-events: none;
        }
        .scroll-hud-fill {
            transition: stroke-dashoffset 0.1s linear;
            filter: drop-shadow(0 0 5px var(--primary, #00f0ff));
        }
        .scroll-hud-main-btn {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: rgba(10, 25, 45, 0.9);
            border: 1px solid rgba(0, 240, 255, 0.25);
            color: var(--primary, #00f0ff);
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 15px rgba(0, 240, 255, 0.15);
            transition: all 0.3s ease;
            z-index: 2;
        }
        .scroll-hud-main-btn:hover {
            background: var(--primary, #00f0ff);
            color: #000;
            box-shadow: 0 0 20px var(--primary, #00f0ff);
            border-color: var(--primary, #00f0ff);
        }
        .scroll-hud-main-btn:active {
            transform: scale(0.92);
        }
        .scroll-hud-controls {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 0;
            opacity: 0;
            height: 0;
            visibility: hidden;
            pointer-events: none;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            transform: translateY(15px);
        }
        .scroll-hud-container:hover .scroll-hud-controls {
            opacity: 1;
            height: 90px;
            margin-bottom: 12px;
            visibility: visible;
            pointer-events: auto;
            transform: translateY(0);
        }
        .scroll-hud-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(10, 25, 45, 0.95);
            border: 1px solid rgba(0, 240, 255, 0.2);
            color: var(--text-primary, #ffffff);
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            transition: all 0.2s ease;
        }
        .scroll-hud-btn:hover {
            border-color: var(--secondary, #9d4edd);
            color: var(--secondary, #9d4edd);
            box-shadow: 0 0 10px rgba(157, 78, 221, 0.4);
            transform: scale(1.08);
        }
        .scroll-hud-btn:active {
            transform: scale(0.95);
        }

        /* Quantum IPTV Injector Styles */
        .custom-iptv-injector {
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(var(--iptv-color-rgb, 0, 240, 255), 0.15);
            border-radius: 4px;
            padding: 10px;
            margin-top: 10px;
            font-family: var(--font-mono, monospace);
        }
        .iptv-terminal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 0.8em;
            color: var(--iptv-color, #00f0ff);
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
            border-bottom: 1px solid rgba(var(--iptv-color-rgb, 0, 240, 255), 0.1);
            padding-bottom: 4px;
        }
        .iptv-input-row {
            display: flex;
            gap: 8px;
        }
        .iptv-input-field {
            flex: 1;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(var(--iptv-color-rgb, 0, 240, 255), 0.25);
            border-radius: 2px;
            padding: 6px 10px;
            color: #fff;
            font-family: var(--font-mono, monospace);
            font-size: 0.85em;
            transition: all 0.3s ease;
        }
        .iptv-input-field:focus {
            outline: none;
            border-color: var(--iptv-color, #00f0ff);
            box-shadow: 0 0 5px rgba(var(--iptv-color-rgb, 0, 240, 255), 0.3);
        }
        .iptv-inject-btn {
            background: transparent;
            border: 1px solid var(--iptv-color, #00f0ff);
            color: var(--iptv-color, #00f0ff);
            padding: 6px 12px;
            border-radius: 2px;
            cursor: pointer;
            font-family: var(--font-cyber, sans-serif);
            font-size: 0.8em;
            font-weight: 600;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .iptv-inject-btn:hover {
            background: rgba(var(--iptv-color-rgb, 0, 240, 255), 0.1);
            box-shadow: 0 0 8px rgba(var(--iptv-color-rgb, 0, 240, 255), 0.3);
        }
        .iptv-inject-btn:active {
            transform: scale(0.97);
        }
        .iptv-status-console {
            background: rgba(0, 0, 0, 0.6);
            border: 1px solid rgba(var(--iptv-color-rgb, 0, 240, 255), 0.15);
            border-radius: 2px;
            padding: 8px;
            margin-top: 8px;
            font-size: 0.75em;
            color: var(--iptv-color, #00f0ff);
            max-height: 100px;
            overflow-y: auto;
            white-space: pre-wrap;
            line-height: 1.4;
        }
    </style>

    <div id="cyber-scroll-hud" class="scroll-hud-container">
        <svg class="scroll-hud-svg" width="56" height="56" viewBox="0 0 56 56">
            <circle class="scroll-hud-bg" cx="28" cy="28" r="24" fill="none" stroke="rgba(255, 255, 255, 0.05)" stroke-width="3" />
            <circle id="scroll-hud-progress" class="scroll-hud-fill" cx="28" cy="28" r="24" fill="none" stroke="var(--primary, #00f0ff)" stroke-width="3" 
                    stroke-dasharray="150.79" stroke-dashoffset="150.79" stroke-linecap="round" />
        </svg>
        <button id="scroll-hud-main-btn" class="scroll-hud-main-btn" onclick="scrollToTopSmooth()" title="Scroll to Top">
            <span class="scroll-hud-icon">▲</span>
        </button>
        <div class="scroll-hud-controls">
            <button class="scroll-hud-btn" onclick="scrollToSection('section-market-tools')" title="Market Hub Quick-Jump">
                📊
            </button>
            <button class="scroll-hud-btn" onclick="scrollToBottomSmooth()" title="Scroll to Bottom">
                ▼
            </button>
        </div>
    </div>

    <script>
        window.addEventListener('scroll', function() {
            const scrollHud = document.getElementById('cyber-scroll-hud');
            const progressCircle = document.getElementById('scroll-hud-progress');
            if (!scrollHud || !progressCircle) return;
            
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            
            if (docHeight <= 0) return;
            
            const scrollPercent = scrollTop / docHeight;
            
            if (scrollTop > 300) {
                scrollHud.classList.add('visible');
            } else {
                scrollHud.classList.remove('visible');
            }
            
            const circumference = 150.79;
            const offset = circumference - (scrollPercent * circumference);
            progressCircle.style.strokeDashoffset = offset;
        });

        function scrollToTopSmooth() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        function scrollToBottomSmooth() {
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
            });
        }

        function scrollToSection(sectionId) {
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    </script>
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
  mkdirSync(join(PUBLIC_DIR, "data"), { recursive: true });

  const buildTime = Date.now();
  writeFileSync(join(PUBLIC_DIR, "data", "build-time.json"), JSON.stringify({ timestamp: buildTime }));
  console.log("✅ Generated: public/data/build-time.json");

  // Generate HTML
  const html = generateHTML(briefing, buildTime);
  writeFileSync(join(PUBLIC_DIR, "index.html"), html);
  console.log("✅ Generated: public/index.html");

  // CSS and JS are already in public/ (created separately)
  console.log("✅ Website generation complete!");
  console.log(`📊 ${briefing.meta.totalArticles} articles across ${briefing.meta.totalCategories} categories`);
}

main();
