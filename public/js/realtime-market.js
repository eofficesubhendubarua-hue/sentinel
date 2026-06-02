// ============================================================
// SENTINEL Intelligence Brief — Client-Side Real-Time Markets
// ============================================================

(function () {
    const SYNC_INTERVAL_MS = 10000; // Refresh indices every 10 seconds during market hours
    const SLOW_SYNC_INTERVAL_MS = 60000; // Refresh off-market hours
    
    let syncTimer = null;
    let countdownSec = 10;
    let liveQuotes = {};
    let activeStockBatchIdx = 0;
    
    // Core Indices & ETFs to refresh on every cycle
    const CORE_SYMBOLS = [
        "^NSEI", "^BSESN", "^NSEBANK", "^CNXIT", "^CNXINFRA", 
        "NIFTY_MIDCAP_100.NS", "^CNXSC", "^INDIAVIX",
        "^GSPC", "^IXIC", "^DJI",
        "MON100.NS", "MAFANG.NS", "MOM50.NS", "GOLDBEES.NS", "SILVERBEES.NS",
        "SPY", "QQQ", "DIA", "GLD", "SLV"
    ];

    // CSS styling injector for pulsing telemetry dot
    function injectPulsingStyle() {
        if (document.getElementById("realtime-pulse-style")) return;
        const style = document.createElement("style");
        style.id = "realtime-pulse-style";
        style.innerHTML = `
            @keyframes pulse-cyan {
                0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 240, 255, 0.7); }
                70% { transform: scale(1.2); box-shadow: 0 0 10px 4px rgba(0, 240, 255, 0); }
                100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 240, 255, 0); }
            }
            .pulse-sync-active {
                animation: pulse-cyan 1.5s infinite;
            }
        `;
        document.head.appendChild(style);
    }

    // ─── Time Zone & Market Hours Helpers ───────────────────
    function getISTTime() {
        const d = new Date();
        const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        return new Date(utc + (3600000 * 5.5)); // IST is UTC + 5:30
    }

    function getESTTime() {
        const d = new Date();
        return new Date(d.toLocaleString("en-US", { timeZone: "America/New_York" }));
    }

    function isIndianMarketHours() {
        const ist = getISTTime();
        const day = ist.getDay();
        if (day === 0 || day === 6) return false; // Weekend
        const minutes = ist.getHours() * 60 + ist.getMinutes();
        return minutes >= (9 * 60 + 15) && minutes <= (15 * 60 + 30); // 9:15 AM - 3:30 PM IST
    }

    function isUSMarketHours() {
        const est = getESTTime();
        const day = est.getDay();
        if (day === 0 || day === 6) return false; // Weekend
        const minutes = est.getHours() * 60 + est.getMinutes();
        return minutes >= (9 * 60 + 30) && minutes <= (16 * 60); // 9:30 AM - 4:00 PM EST
    }

    function isAnyMarketOpen() {
        return isIndianMarketHours() || isUSMarketHours();
    }

    // ─── Yahoo Finance Chart Client-Side Fetch ─────────────
    async function fetchLiveQuote(symbol) {
        // Build direct path mapped via Netlify/Vercel redirects
        const url = `/api/yahoo-chart/${symbol}?interval=1d&range=1d`;
        try {
            const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
            if (!res.ok) return null;
            const data = await res.json();
            const result = data.chart?.result?.[0];
            if (!result) return null;
            
            const price = result.meta.regularMarketPrice;
            const prevClose = result.meta.chartPreviousClose;
            const change = price - prevClose;
            const changePct = (change / prevClose) * 100;
            const shortName = result.meta.shortName || symbol;
            
            const quote = result.indicators?.quote?.[0];
            const open = quote?.open?.[0] || result.meta.regularMarketOpen || price;
            const high = quote?.high?.[0] || result.meta.regularMarketDayHigh || price;
            const low = quote?.low?.[0] || result.meta.regularMarketDayLow || price;
            
            return { symbol, price, prevClose, change, changePct, shortName, open, high, low };
        } catch (err) {
            console.error(`Error fetching quote for ${symbol}:`, err);
            return null;
        }
    }

    // ─── DOM Updates & Calculations ─────────────────────────
    function updateDOM() {
        // 1. Update Volatility Diagnostics Cards
        document.querySelectorAll('.realtime-vix-card').forEach(card => {
            const symbol = card.getAttribute('data-symbol');
            const quote = liveQuotes[symbol];
            if (!quote) return;
            
            let vixStatus = "NORMAL";
            let vixColor = "var(--accent-emerald)";
            let vixAnalysis = "";
            if (quote.price < 12) {
                vixStatus = "COMPLACENCY // MINIMAL RISK";
                vixColor = "var(--accent-emerald)";
                vixAnalysis = "Extreme complacency detected. Risk of correction is low, but watch for sudden spikes.";
            } else if (quote.price < 15) {
                vixStatus = "STABLE // LOW RISK";
                vixColor = "var(--accent-emerald)";
                vixAnalysis = "Healthy volatility index range. Supports steady bullish momentum and range-bound trading.";
            } else if (quote.price < 20) {
                vixStatus = "CAUTION // MODERATE RISK";
                vixColor = "#ffcc00"; // Yellow
                vixAnalysis = "Volatility is moderately elevated. Expect rapid price consolidations and wider intraday swings.";
            } else if (quote.price < 25) {
                vixStatus = "TURBULENCE // RISK-OFF";
                vixColor = "#ff9500"; // Orange
                vixAnalysis = "High volatility environment. Rising market fear triggers defensive portfolio reallocation.";
            } else {
                vixStatus = "PANIC // EXTREME RISK";
                vixColor = "#ff3b30"; // Red
                vixAnalysis = "Market panic levels detected. Heavy option premium values. Liquidations likely under price distress.";
            }
            
            card.style.borderLeftColor = vixColor;
            
            const priceEl = card.querySelector('.realtime-vix-price');
            if (priceEl) {
                priceEl.textContent = quote.price.toFixed(2);
                priceEl.style.color = vixColor;
            }
            
            const pctEl = card.querySelector('.realtime-vix-pct');
            if (pctEl) {
                pctEl.textContent = `${quote.change >= 0 ? "+" : ""}${quote.changePct.toFixed(2)}%`;
                pctEl.style.color = quote.change >= 0 ? "var(--accent-emerald)" : "#ff3b30";
            }
            
            const statusEl = card.querySelector('.realtime-vix-status');
            if (statusEl) {
                statusEl.textContent = vixStatus;
                statusEl.style.color = vixColor;
            }
            
            const descEl = card.querySelector('.realtime-vix-desc');
            if (descEl) {
                descEl.innerHTML = `Status: <strong style="color: ${vixColor};">${vixStatus}</strong>. ${vixAnalysis}`;
            }
        });

        // 2. Update Sentiment Cards
        document.querySelectorAll('.realtime-sentiment-card').forEach(card => {
            const symbol = card.getAttribute('data-symbol');
            const quote = liveQuotes[symbol];
            if (!quote) return;
            
            const isUp = quote.changePct >= 0;
            const trendText = isUp ? "🔴 BULLISH" : "🔵 BEARISH";
            const trendColor = isUp ? "var(--accent-emerald)" : "#ff3b30";
            
            const trendEl = card.querySelector('.realtime-sentiment-trend');
            if (trendEl) {
                trendEl.textContent = trendText;
                trendEl.style.color = trendColor;
            }
            
            const descEl = card.querySelector('.realtime-sentiment-desc');
            if (descEl) {
                const marketName = symbol === "^NSEI" ? "Nifty 50" : (symbol === "^BSESN" ? "BSE Sensex" : "S&P 500");
                const refLtpName = symbol === "^NSEI" ? "Nifty LTP" : (symbol === "^BSESN" ? "SENSEX LTP" : "S&P LTP");
                descEl.innerHTML = `${marketName} trades broadly ${isUp ? "bullish" : "bearish"} today, closing ${Math.abs(quote.changePct).toFixed(2)}% ${isUp ? "higher" : "lower"} with ${refLtpName} at ${quote.price.toFixed(2)}.`;
            }
            
            card.style.borderLeftColor = trendColor;
        });

        // 3. Update Rows (Indices, ETFs, Stocks)
        document.querySelectorAll('.realtime-row').forEach(row => {
            const symbol = row.getAttribute('data-symbol');
            const type = row.getAttribute('data-type');
            const quote = liveQuotes[symbol];
            if (!quote) return;
            
            const isUp = quote.change >= 0;
            const sign = isUp ? "+" : "";
            const color = isUp ? "var(--accent-emerald)" : "#ff3b30";
            
            const ltpEl = row.querySelector('.realtime-ltp');
            if (ltpEl) ltpEl.textContent = quote.price.toFixed(type === "stock" ? 1 : 2);
            
            const openEl = row.querySelector('.realtime-open');
            if (openEl) openEl.textContent = quote.open.toFixed(2);
            
            const prevEl = row.querySelector('.realtime-prevclose');
            if (prevEl) prevEl.textContent = quote.prevClose.toFixed(2);
            
            const rangeEl = row.querySelector('.realtime-range');
            if (rangeEl) {
                if (type === "stock") {
                    rangeEl.textContent = `${quote.low.toFixed(1)}-${quote.high.toFixed(1)}`;
                } else {
                    rangeEl.textContent = `${quote.low.toFixed(2)} - ${quote.high.toFixed(2)}`;
                }
            }
            
            const changeEl = row.querySelector('.realtime-change');
            if (changeEl) {
                changeEl.textContent = `${sign}${quote.change.toFixed(2)}`;
                changeEl.style.color = color;
            }
            
            const pctEl = row.querySelector('.realtime-pct');
            if (pctEl) {
                pctEl.textContent = `${sign}${quote.changePct.toFixed(2)}%`;
                pctEl.style.color = color;
            }
            
            const statusEl = row.querySelector('.realtime-status');
            if (statusEl) {
                statusEl.textContent = isUp ? "🟢 GAINING" : "🔴 CORR_PULLBACK";
                statusEl.style.color = color;
            }
            
            const outlookEl = row.querySelector('.realtime-outlook');
            if (outlookEl) {
                if (symbol === "^INDIAVIX") {
                    outlookEl.textContent = getVixMoveReason(quote.changePct, quote.price);
                } else {
                    outlookEl.textContent = getMoveReason(quote.changePct, type, symbol.endsWith('.NS') || symbol.endsWith('.BO') ? 'IN' : 'US');
                }
            }
        });

        // 4. Update Forecast Matrix Countdowns
        document.querySelectorAll('.realtime-forecast-block').forEach(block => {
            const indexSymbol = block.getAttribute('data-index-symbol');
            const typeT = block.getAttribute('data-forecast-t');
            const quote = liveQuotes[indexSymbol];
            if (!quote) return;
            
            let multiplier = 0;
            if (typeT === "t1") multiplier = 0.4;
            else if (typeT === "t2") multiplier = 0.85;
            else if (typeT === "wk1") multiplier = 1.5;
            
            const forecastChange = quote.changePct * multiplier;
            const forecastPrice = quote.price * (1 + forecastChange / 100);
            
            const valueEl = block.querySelector('.realtime-forecast-value');
            if (valueEl) {
                valueEl.innerHTML = `${forecastPrice.toFixed(2)} <span style="font-size: 12px;">(${forecastChange >= 0 ? "+" : ""}${forecastChange.toFixed(2)}%)</span>`;
                valueEl.style.color = forecastChange >= 0 ? "var(--accent-emerald)" : "#ff3b30";
            }
            
            const statusEl = block.querySelector('.realtime-forecast-status');
            if (statusEl) {
                let statusText = "";
                if (typeT === "t1") statusText = forecastChange >= 0 ? "BULLISH_REBOUND" : "BEARISH_DRIFT";
                else if (typeT === "t2") statusText = forecastChange >= 0 ? "ACCUMULATION_PUMP" : "SUPPORT_CONSOLIDATION";
                else if (typeT === "wk1") statusText = forecastChange >= 0 ? "MACRO_UPTREND_GRID" : "WEEKLY_GRID_RECOVERY";
                statusEl.textContent = `GRID MODE: ${statusText}`;
            }
        });

        // 5. Update Mutual Fund Rows
        document.querySelectorAll('.realtime-row-mf').forEach(row => {
            const indexSymbol = row.getAttribute('data-index-symbol');
            const quote = liveQuotes[indexSymbol];
            if (!quote) return;
            
            const isUp = quote.changePct >= 0;
            const sign = isUp ? "+" : "";
            const color = isUp ? "var(--accent-emerald)" : "#ff3b30";
            
            const pctEl = row.querySelector('.realtime-pct');
            if (pctEl) {
                pctEl.textContent = `${sign}${quote.changePct.toFixed(2)}%`;
                pctEl.style.color = color;
            }
            
            const statusEl = row.querySelector('.realtime-status');
            if (statusEl) {
                statusEl.textContent = isUp ? "SURGING" : "DECLINING";
                statusEl.style.color = color;
            }
            
            const outlookEl = row.querySelector('.realtime-outlook');
            if (outlookEl) {
                outlookEl.textContent = getMoveReason(quote.changePct, "stock", indexSymbol.endsWith('.NS') || indexSymbol.endsWith('.BO') ? 'IN' : 'US');
            }
        });

        // 6. Update Cognitive Conclusion
        document.querySelectorAll('.realtime-conclusion-card').forEach(card => {
            const indexSymbol = card.getAttribute('data-index-symbol');
            const vixSymbol = card.getAttribute('data-vix-symbol');
            const indexQuote = liveQuotes[indexSymbol];
            const vixQuote = liveQuotes[vixSymbol];
            if (!indexQuote) return;
            
            const isUp = indexQuote.changePct >= 0;
            const conclusionEl = card.querySelector('.realtime-conclusion-text');
            if (!conclusionEl) return;
            
            if (indexSymbol === "^NSEI") {
                const vixText = vixQuote ? ` <strong>India VIX stands at ${vixQuote.price.toFixed(2)} (${vixQuote.change >= 0 ? "+" : ""}${vixQuote.changePct.toFixed(2)}%)</strong>, pointing to a <strong>${vixQuote.price > 18 ? "CAUTION" : "STABLE"}</strong> risk environment. Volatility telemetry indicates that hedging activities are ${vixQuote.price > 18 ? "elevated, suggesting defensive position adjustments" : "subdued, reflecting stable market confidence"} across both NSE and BSE.` : "";
                
                conclusionEl.innerHTML = `The Indian markets (Nifty index) are exhibiting a <strong>${isUp ? "constructive consolidation" : "temperate pullback"}</strong> today. Broad index behavior is predominantly influenced by <strong>${isUp ? "resilient domestic mutual fund inflows" : "systemic FII selling and weak regional indices"}</strong>. In the derivatives segment, option open-interest signals standard range support at Nifty ${isUp ? "23,800" : "24,000"}.${vixText}`;
            } else if (indexSymbol === "^BSESN") {
                const vixText = vixQuote ? ` Meanwhile, **India VIX volatility levels are at ${vixQuote.price.toFixed(2)}**, maintaining a **${vixQuote.price > 18 ? "CAUTION" : "STABLE"}** risk profile for BSE Sensex equity nodes.` : "";
                
                conclusionEl.innerHTML = `The SENSEX node registers a <strong>${isUp ? "positive structural hold" : "consolidation pull"}</strong> today. Rebalancing of mega-cap baskets like HDFC Bank and Reliance on the Bombay Stock Exchange keeps daily valuations tightly matched to global standards. Sectoral rotation keeps index margins balanced with normal tracking grids.${vixText}`;
            } else if (indexSymbol === "^GSPC") {
                conclusionEl.innerHTML = `The American stock indices are experiencing a <strong>${isUp ? "healthy bullish momentum" : "minor consolidation pullback"}</strong>. Major price actions in mega-cap technology systems like Apple, Microsoft, and Nvidia are highly correlated to global indexing trends. Bond yield stability and currency metrics keep the overall US financial grid securely synchronized.`;
            }
        });
    }

    // ─── Real-Time Sync Loop Management ────────────────────
    async function executeSyncCycle() {
        // Verify markets dashboard is currently active tab
        const activeBtn = document.querySelector(".cat-btn.active");
        const activeCategory = activeBtn ? activeBtn.getAttribute("data-category") : "all";
        
        // Pause updating if the user is in a non-financial section
        if (activeCategory !== "daily_market_news" && activeCategory !== "all" && activeCategory !== "share_market") {
            updateHUDLabels(false, "PAUSED // TAB_INACTIVE");
            return;
        }

        updateHUDLabels(true, "FETCHING_TELEMETRY...");

        // Collect all target symbols from the DOM
        const rowSymbols = Array.from(document.querySelectorAll('.realtime-row')).map(r => r.getAttribute('data-symbol'));
        const uniqueSymbols = Array.from(new Set([...CORE_SYMBOLS, ...rowSymbols])).filter(Boolean);
        
        // Filter out stocks from indices/ETFs
        const stockSymbols = uniqueSymbols.filter(s => !CORE_SYMBOLS.includes(s));
        
        // Rotating stock batching to limit client requests (fetch 10 stocks on each cycle)
        const batchSize = 10;
        const startIdx = activeStockBatchIdx * batchSize;
        const activeStockBatch = stockSymbols.slice(startIdx, startIdx + batchSize);
        
        // Advance pointer
        activeStockBatchIdx = (startIdx + batchSize >= stockSymbols.length) ? 0 : activeStockBatchIdx + 1;
        
        // Merge core symbols with current stock batch
        const symbolsToFetch = [...CORE_SYMBOLS, ...activeStockBatch];
        
        // Pulse indicator light
        document.querySelectorAll('.realtime-status-dot').forEach(dot => dot.classList.add('pulse-sync-active'));

        // Sequential fetches with minor stagger to prevent rate limit blocks
        for (const symbol of symbolsToFetch) {
            const data = await fetchLiveQuote(symbol);
            if (data) {
                liveQuotes[symbol] = data;
            }
            await new Promise(r => setTimeout(r, 40)); // 40ms stagger delay
        }

        // Apply to DOM
        updateDOM();

        // Update indicator labels
        const openNow = isAnyMarketOpen();
        const reason = openNow ? "LIVE SYNC ACTIVE" : "SYNC ACTIVE // AFTER_HOURS";
        updateHUDLabels(false, reason);
        
        // Stop pulse animation
        document.querySelectorAll('.realtime-status-dot').forEach(dot => dot.classList.remove('pulse-sync-active'));
    }

    function updateHUDLabels(isSyncing, statusText) {
        document.querySelectorAll('.realtime-status-label').forEach(label => {
            label.textContent = `TELEMETRY: ${statusText}`;
        });
        document.querySelectorAll('.realtime-status-dot').forEach(dot => {
            if (isSyncing) {
                dot.style.background = "var(--primary, #00f0ff)";
                dot.style.boxShadow = "0 0 8px var(--primary, #00f0ff)";
            } else {
                const openNow = isAnyMarketOpen();
                dot.style.background = openNow ? "#00ff00" : "var(--text-muted, #5c677d)";
                dot.style.boxShadow = openNow ? "0 0 8px #00ff00" : "none";
            }
        });
    }

    function startTimer() {
        if (syncTimer) clearInterval(syncTimer);
        
        let cycleCountdown = isAnyMarketOpen() ? 10 : 60;
        
        syncTimer = setInterval(async () => {
            cycleCountdown--;
            
            // Render countdown on card header label
            const openNow = isAnyMarketOpen();
            const timerLabel = openNow ? `LIVE SYNC [${cycleCountdown}s]` : `SYNC [${cycleCountdown}s] // CLOSED`;
            document.querySelectorAll('.realtime-status-label').forEach(label => {
                if (!label.textContent.includes("FETCHING") && !label.textContent.includes("PAUSED")) {
                    label.textContent = `TELEMETRY: ${timerLabel}`;
                }
            });
            
            if (cycleCountdown <= 0) {
                clearInterval(syncTimer);
                await executeSyncCycle();
                startTimer();
            }
        }, 1000);
    }

    // Initialize Real-time telemetry on page load
    document.addEventListener("DOMContentLoaded", () => {
        injectPulsingStyle();
        // Trigger first sync cycle after page bootloader fades out
        setTimeout(async () => {
            await executeSyncCycle();
            startTimer();
        }, 3500);
    });

    // ─── Move Reason Helpers (copied from market-report.mjs for client-side evaluation) ───
    function getMoveReason(changePct, type, market = "IN") {
        if (market === "US") {
            if (type === "index") {
                if (changePct > 0.75) return "Sharp rallies in mega-cap tech stocks, optimistic Fed comments, and solid corporate earnings fuel broad gains.";
                if (changePct > 0.1) return "Stable performance supported by positive Treasury yield adjustments and moderate small-cap inflows.";
                if (changePct > -0.1) return "Range-bound session as traders absorb retail sales data and wait for upcoming economic indicators.";
                if (changePct > -0.75) return "Moderate correction triggered by profit booking in tech giants and cautious inflation notes.";
                return "Substantial sell-off sparked by disappointing tech guidance, geopolitical escalations, or hot inflation indices.";
            } else if (type === "etf") {
                if (changePct > 0.5) return "Bullish: Outperforming underlying index baskets with high institutional trading block support.";
                if (changePct > -0.5) return "Flat consolidation matching narrow sector index parameters.";
                return "Bearish: Dragged down by broader US equity liquidation and risk-off asset shifts.";
            } else {
                if (changePct > 0.6) return "Strong Outperformance: Supported by massive passive indexing inflows and sectoral strength.";
                if (changePct > -0.6) return "Moderate consolidation: Standard portfolio rotation keeps major sector NAV swings narrow.";
                return "Decline: Pressured by core large-cap outflows and defensive index hedging.";
            }
        } else {
            if (type === "index") {
                if (changePct > 0.75) return "Strong FII buying, positive global cues, and robust banking sector earnings drive the surge.";
                if (changePct > 0.1) return "Moderate domestic institutional support and steady IT sector performance sustain the positive momentum.";
                if (changePct > -0.1) return "Range-bound trade as market participants await CPI inflation data and global central bank rate cues.";
                if (changePct > -0.75) return "Minor profit booking in high-weightage banking and metal stocks amidst rising geopolitical tensions.";
                return "Heavy FII outflows, weak global market signals, and hawkish interest rate commentary trigger sharp sell-offs.";
            } else if (type === "etf") {
                if (changePct > 0.5) return "Bullish: Driven by sharp surges in underlying indices and heavy intraday liquidity flows.";
                if (changePct > -0.5) return "Stable: Consolidating flatly within normal tight grid tracking boundaries.";
                return "Bearish: Triggered by underlying index correction and global risk-off investor liquidation.";
            } else {
                if (changePct > 0.6) return "Strong Outperformance: Supported by massive mid-cap inflows and sectoral index surges.";
                if (changePct > -0.6) return "Moderate consolidation: Balanced sectoral rotation keeps the net NAV fluctuation minimal.";
                return "Decline: Under pressure from heavy index weightage correction and defensive institutional hedging.";
            }
        }
    }

    function getVixMoveReason(changePct, price) {
        if (changePct > 5) {
            return `Fear spike: Implied volatility surges by ${changePct.toFixed(2)}%, indicating hedging demand and protective put buying.`;
        } else if (changePct > 1) {
            return "Mild uptick in volatility as market participants anticipate short-term pricing adjustments.";
        } else if (changePct > -1) {
            return "Stable fear levels; quiet session with volatility consolidating near current ranges.";
        } else if (changePct > -5) {
            return "Volatility softening, reflecting range consolidation and calmer sentiment.";
        } else {
            return `Fear contraction: Volatility drops by ${Math.abs(changePct).toFixed(2)}%, indicating relief rallies or complacency.`;
        }
    }
})();
