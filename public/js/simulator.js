// ============================================================
// SENTINEL AI Analysis Engine — Institutional Intelligence
// Multi-asset: Stocks, ETFs, Indices, Mutual Funds
// Version 3.0 — Professional Grade
// ============================================================

(function () {
  'use strict';

  // ─── CORS Proxies ──────────────────────────────────────────
  const CORS_PROXIES = [
    { url: 'https://api.allorigins.win/get?url=', unwrap: d => JSON.parse(d.contents) },
    { url: 'https://corsproxy.io/?', unwrap: d => d },
  ];

  const YAHOO_CHART  = 'https://query1.finance.yahoo.com/v8/finance/chart/';
  const YAHOO_QUOTE  = 'https://query2.finance.yahoo.com/v10/finance/quoteSummary/';
  const MF_SEARCH    = 'https://api.mfapi.in/mf/search?q=';
  const MF_NAV       = 'https://api.mfapi.in/mf/';

  // ─── Symbol Map ─────────────────────────────────────────────
  const SYMBOL_MAP = {
    // Indian Indices
    'nifty': '^NSEI', 'nifty 50': '^NSEI', 'nifty50': '^NSEI', 'nse': '^NSEI',
    'sensex': '^BSESN', 'bse sensex': '^BSESN', 'bse': '^BSESN',
    'bank nifty': '^NSEBANK', 'banknifty': '^NSEBANK', 'nifty bank': '^NSEBANK',
    'india vix': '^INDIAVIX', 'vix india': '^INDIAVIX',
    'nifty midcap 100': 'NIFTY_MID_SELECT.NS', 'midcap': 'NIFTY_MID_SELECT.NS',
    'nifty smallcap': 'NIFTY_SMALLCAP_100.NS',
    'nifty next 50': '^NSMIDCP',
    // US Indices
    'dow': '^DJI', 'dow jones': '^DJI', 'djia': '^DJI',
    's&p': '^GSPC', 'sp500': '^GSPC', 's&p 500': '^GSPC', 'spx': '^GSPC', 's&p500': '^GSPC',
    'nasdaq': '^IXIC', 'nasdaq composite': '^IXIC',
    'nasdaq 100': '^NDX', 'ndx': '^NDX', 'qqq': 'QQQ',
    'russell': '^RUT', 'russell 2000': '^RUT',
    'vix': '^VIX', 'fear index': '^VIX',
    // Global
    'nikkei': '^N225', 'hang seng': '^HSI', 'ftse': '^FTSE',
    'dax': '^GDAXI', 'cac 40': '^FCHI', 'euro stoxx': '^STOXX50E',
    // Commodities
    'gold': 'GC=F', 'gold futures': 'GC=F',
    'silver': 'SI=F', 'crude': 'CL=F', 'crude oil': 'CL=F', 'oil': 'CL=F',
    'brent': 'BZ=F', 'natural gas': 'NG=F', 'copper': 'HG=F',
    // Crypto
    'bitcoin': 'BTC-USD', 'btc': 'BTC-USD',
    'ethereum': 'ETH-USD', 'eth': 'ETH-USD',
    'binance': 'BNB-USD', 'bnb': 'BNB-USD',
    'ripple': 'XRP-USD', 'xrp': 'XRP-USD',
    // Indian Blue Chips
    'reliance': 'RELIANCE.NS', 'ril': 'RELIANCE.NS',
    'tcs': 'TCS.NS', 'tata consultancy': 'TCS.NS',
    'infosys': 'INFY.NS', 'infy': 'INFY.NS',
    'hdfc bank': 'HDFCBANK.NS', 'hdfcbank': 'HDFCBANK.NS',
    'icici bank': 'ICICIBANK.NS', 'icici': 'ICICIBANK.NS',
    'wipro': 'WIPRO.NS',
    'hcl': 'HCLTECH.NS', 'hcl tech': 'HCLTECH.NS', 'hcltech': 'HCLTECH.NS',
    'itc': 'ITC.NS',
    'kotak': 'KOTAKBANK.NS', 'kotak bank': 'KOTAKBANK.NS', 'kotakbank': 'KOTAKBANK.NS',
    'sbi': 'SBIN.NS', 'state bank': 'SBIN.NS',
    'axis bank': 'AXISBANK.NS', 'axisbank': 'AXISBANK.NS',
    'bajaj finance': 'BAJFINANCE.NS', 'bajfinance': 'BAJFINANCE.NS',
    'maruti': 'MARUTI.NS', 'maruti suzuki': 'MARUTI.NS',
    'asian paints': 'ASIANPAINT.NS', 'asianpaint': 'ASIANPAINT.NS',
    'sun pharma': 'SUNPHARMA.NS', 'sunpharma': 'SUNPHARMA.NS',
    'divis': 'DIVISLAB.NS', 'divislab': 'DIVISLAB.NS',
    'adani': 'ADANIENT.NS', 'adani enterprises': 'ADANIENT.NS',
    'adani ports': 'ADANIPORTS.NS', 'adaniports': 'ADANIPORTS.NS',
    'adani power': 'ADANIPOWER.NS',
    'titan': 'TITAN.NS',
    'l&t': 'LT.NS', 'larsen': 'LT.NS', 'larsen toubro': 'LT.NS',
    'nestle': 'NESTLEIND.NS', 'nestleind': 'NESTLEIND.NS',
    'hul': 'HINDUNILVR.NS', 'hindustan unilever': 'HINDUNILVR.NS', 'hindunilvr': 'HINDUNILVR.NS',
    'ongc': 'ONGC.NS',
    'ntpc': 'NTPC.NS',
    'power grid': 'POWERGRID.NS', 'powergrid': 'POWERGRID.NS',
    'tech mahindra': 'TECHM.NS', 'techm': 'TECHM.NS',
    'bajaj auto': 'BAJAJ-AUTO.NS',
    'hero motocorp': 'HEROMOTOCO.NS', 'hero': 'HEROMOTOCO.NS',
    'ultratech': 'ULTRACEMCO.NS', 'ultracemco': 'ULTRACEMCO.NS',
    'dmart': 'DMART.NS', 'avenue supermarts': 'DMART.NS',
    'indusind': 'INDUSINDBK.NS', 'indusindbk': 'INDUSINDBK.NS',
    'cipla': 'CIPLA.NS',
    'dr reddy': 'DRREDDY.NS', 'drreddy': 'DRREDDY.NS',
    'airtel': 'BHARTIARTL.NS', 'bharti airtel': 'BHARTIARTL.NS', 'bhartiartl': 'BHARTIARTL.NS',
    'vedanta': 'VEDL.NS', 'tata steel': 'TATASTEEL.NS', 'tatasteel': 'TATASTEEL.NS',
    'tata motors': 'TATAMOTORS.NS', 'tatamotors': 'TATAMOTORS.NS',
    'jio financial': 'JIOFIN.NS', 'jiofin': 'JIOFIN.NS',
    'zomato': 'ZOMATO.NS', 'paytm': 'PAYTM.NS',
    'nykaa': 'NYKAA.NS', 'policy bazaar': 'POLICYBZR.NS',
    'hdfc life': 'HDFCLIFE.NS', 'sbi life': 'SBILIFE.NS',
    'irctc': 'IRCTC.NS', 'irfc': 'IRFC.NS', 'rvnl': 'RVNL.NS',
    // US Big Tech
    'apple': 'AAPL', 'aapl': 'AAPL',
    'microsoft': 'MSFT', 'msft': 'MSFT',
    'google': 'GOOGL', 'alphabet': 'GOOGL', 'googl': 'GOOGL', 'goog': 'GOOG',
    'amazon': 'AMZN', 'amzn': 'AMZN',
    'tesla': 'TSLA', 'tsla': 'TSLA',
    'meta': 'META', 'facebook': 'META',
    'nvidia': 'NVDA', 'nvda': 'NVDA',
    'netflix': 'NFLX', 'nflx': 'NFLX',
    'berkshire': 'BRK-B', 'brk': 'BRK-B',
    'jpmorgan': 'JPM', 'jp morgan': 'JPM',
    'visa': 'V', 'mastercard': 'MA',
    'walmart': 'WMT', 'johnson': 'JNJ',
    'eli lilly': 'LLY', 'lilly': 'LLY',
    'broadcom': 'AVGO', 'amd': 'AMD', 'intel': 'INTC',
    'salesforce': 'CRM', 'oracle': 'ORCL',
    'uber': 'UBER', 'airbnb': 'ABNB',
    // ETFs
    'nifty bees': 'NIFTYBEES.NS', 'niftybees': 'NIFTYBEES.NS',
    'gold bees': 'GOLDBEES.NS', 'goldbees': 'GOLDBEES.NS',
    'junior bees': 'JUNIORBEES.NS', 'bankbees': 'BANKBEES.NS',
    'spy': 'SPY', 'ivv': 'IVV', 'voo': 'VOO',
    'gld': 'GLD', 'slv': 'SLV', 'uso': 'USO',
    'arkk': 'ARKK', 'ibit': 'IBIT',
  };

  // ─── Sector PE Benchmarks ─────────────────────────────────
  const SECTOR_PE = {
    'Technology': { avgPE: 28, avgROE: 22, avgMargin: 18 },
    'Financial Services': { avgPE: 16, avgROE: 14, avgMargin: 25 },
    'Consumer Cyclical': { avgPE: 22, avgROE: 16, avgMargin: 8 },
    'Healthcare': { avgPE: 24, avgROE: 18, avgMargin: 15 },
    'Communication Services': { avgPE: 20, avgROE: 15, avgMargin: 14 },
    'Consumer Defensive': { avgPE: 21, avgROE: 20, avgMargin: 10 },
    'Energy': { avgPE: 12, avgROE: 12, avgMargin: 10 },
    'Industrials': { avgPE: 20, avgROE: 14, avgMargin: 9 },
    'Basic Materials': { avgPE: 14, avgROE: 12, avgMargin: 10 },
    'Real Estate': { avgPE: 30, avgROE: 8, avgMargin: 30 },
    'Utilities': { avgPE: 18, avgROE: 10, avgMargin: 15 },
    'default': { avgPE: 20, avgROE: 15, avgMargin: 12 }
  };

  const NETLIFY_HOST = 'https://leafy-granita-bc2649.netlify.app';
  const isNetlify = window.location.hostname.includes('netlify.app');
  const PROXY_BASE = isNetlify ? '' : NETLIFY_HOST;

  // ─── Utility: CORS-safe fetch ─────────────────────────────
  async function safeFetch(url) {
    // 1. Try our own secure Netlify proxy first (to avoid antivirus warnings)
    let proxyUrl = null;
    if (url.startsWith('https://query1.finance.yahoo.com/v8/finance/chart/')) {
      const rest = url.replace('https://query1.finance.yahoo.com/v8/finance/chart/', '');
      proxyUrl = PROXY_BASE + '/api/yahoo-chart/' + rest;
    } else if (url.startsWith('https://query2.finance.yahoo.com/v10/finance/quoteSummary/')) {
      const rest = url.replace('https://query2.finance.yahoo.com/v10/finance/quoteSummary/', '');
      proxyUrl = PROXY_BASE + '/api/yahoo-quote/' + rest;
    }

    if (proxyUrl) {
      try {
        const r = await fetch(proxyUrl, { headers: { 'Accept': 'application/json' } });
        if (r.ok) return await r.json();
      } catch (_) {}
    }

    // 2. Direct fetch as fallback
    try {
      const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (r.ok) return await r.json();
    } catch (_) {}

    // 3. CORS proxy fallbacks
    for (const proxy of CORS_PROXIES) {
      try {
        const r = await fetch(proxy.url + encodeURIComponent(url));
        if (r.ok) return proxy.unwrap(await r.json());
      } catch (_) {}
    }
    throw new Error('Network unreachable for: ' + url);
  }

  // ─── Symbol Resolution ──────────────────────────────────────
  function resolveSymbol(query) {
    const q = query.trim().toLowerCase().replace(/\s+/g, ' ');
    if (SYMBOL_MAP[q]) return [{ symbol: SYMBOL_MAP[q], isMF: false }];

    // Direct ticker pattern (uppercase, no spaces, may have . or -)
    if (/^[A-Z^][A-Z0-9.\-^=]{0,9}$/i.test(query.trim())) {
      const sym = query.trim().toUpperCase();
      return [
        { symbol: sym, isMF: false },
        { symbol: sym + '.NS', isMF: false },
        { symbol: sym + '.BO', isMF: false },
      ];
    }

    // Try as NSE / BSE ticker
    const upper = query.trim().toUpperCase().replace(/\s+/g, '');
    return [
      { symbol: upper + '.NS', isMF: false },
      { symbol: upper + '.BO', isMF: false },
      { symbol: upper, isMF: false },
    ];
  }

  // ═══════════════════════════════════════════════════════════
  // TECHNICAL ANALYSIS ENGINE
  // ═══════════════════════════════════════════════════════════

  function sma(arr, n) {
    return arr.map((_, i) => i < n - 1 ? null : arr.slice(i - n + 1, i + 1).reduce((a, b) => a + b, 0) / n);
  }

  function ema(arr, n) {
    const k = 2 / (n + 1), res = [arr[0]];
    for (let i = 1; i < arr.length; i++) res.push(arr[i] * k + res[i - 1] * (1 - k));
    return res;
  }

  function rsi(prices, n = 14) {
    if (prices.length < n + 2) return null;
    const d = prices.slice(1).map((p, i) => p - prices[i]);
    let ag = d.slice(0, n).filter(x => x > 0).reduce((a, b) => a + b, 0) / n;
    let al = d.slice(0, n).filter(x => x < 0).map(Math.abs).reduce((a, b) => a + b, 0) / n;
    const vals = [];
    for (let i = n; i < d.length; i++) {
      ag = (ag * (n - 1) + Math.max(d[i], 0)) / n;
      al = (al * (n - 1) + Math.abs(Math.min(d[i], 0))) / n;
      vals.push(al === 0 ? 100 : 100 - 100 / (1 + ag / al));
    }
    return vals[vals.length - 1];
  }

  function macd(prices) {
    if (prices.length < 35) return null;
    const e12 = ema(prices, 12), e26 = ema(prices, 26);
    const ml = e12.map((v, i) => v - e26[i]);
    const sig = ema(ml.slice(25), 9);
    const last = ml[ml.length - 1], lsig = sig[sig.length - 1];
    // Trend: was MACD below signal and now above? = bullish cross
    const prev = ml[ml.length - 2], psig = sig[sig.length - 2];
    return {
      macd: last, signal: lsig, histogram: last - lsig,
      bullishCross: prev < psig && last >= lsig,
      bearishCross: prev > psig && last <= lsig,
    };
  }

  function bollinger(prices, n = 20, mult = 2) {
    const s = sma(prices, n);
    const lastS = s[s.length - 1];
    const slc = prices.slice(-n);
    const std = Math.sqrt(slc.reduce((a, p) => a + Math.pow(p - lastS, 2), 0) / n);
    const upper = lastS + mult * std, lower = lastS - mult * std;
    const price = prices[prices.length - 1];
    const pct = (price - lower) / (upper - lower) * 100;
    return { upper, middle: lastS, lower, std, bandwidth: (4 * std) / lastS * 100, pctB: pct };
  }

  function stochastic(hi, lo, cl, k = 14, d = 3) {
    const kv = [];
    for (let i = k - 1; i < cl.length; i++) {
      const hh = Math.max(...hi.slice(i - k + 1, i + 1));
      const ll = Math.min(...lo.slice(i - k + 1, i + 1));
      kv.push(hh === ll ? 50 : (cl[i] - ll) / (hh - ll) * 100);
    }
    const kSmooth = sma(kv, d).filter(x => x !== null);
    const dSmooth = sma(kSmooth, d).filter(x => x !== null);
    return { k: kSmooth[kSmooth.length - 1], d: dSmooth[dSmooth.length - 1] };
  }

  function williamsR(hi, lo, cl, n = 14) {
    const hh = Math.max(...hi.slice(-n)), ll = Math.min(...lo.slice(-n));
    return hh === ll ? -50 : ((hh - cl[cl.length - 1]) / (hh - ll)) * -100;
  }

  function atr(hi, lo, cl, n = 14) {
    const trs = cl.slice(1).map((c, i) => Math.max(hi[i + 1] - lo[i + 1], Math.abs(hi[i + 1] - cl[i]), Math.abs(lo[i + 1] - cl[i])));
    return trs.slice(-n).reduce((a, b) => a + b, 0) / n;
  }

  function obv(prices, volumes) {
    let o = 0;
    const vals = [0];
    for (let i = 1; i < prices.length; i++) {
      o += prices[i] > prices[i - 1] ? volumes[i] : prices[i] < prices[i - 1] ? -volumes[i] : 0;
      vals.push(o);
    }
    const trend = vals[vals.length - 1] > vals[vals.length - 20] ? 'Rising' : 'Falling';
    return { value: o, trend };
  }

  function fibonacci(high, low) {
    const diff = high - low;
    return {
      r236: high - 0.236 * diff,
      r382: high - 0.382 * diff,
      r500: high - 0.500 * diff,
      r618: high - 0.618 * diff,
      r786: high - 0.786 * diff,
    };
  }

  function linearRegression(prices) {
    const n = prices.length, x = Array.from({ length: n }, (_, i) => i);
    const sx = x.reduce((a, b) => a + b, 0), sy = prices.reduce((a, b) => a + b, 0);
    const sxy = x.reduce((a, xi, i) => a + xi * prices[i], 0);
    const sx2 = x.reduce((a, xi) => a + xi * xi, 0);
    const slope = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
    const intercept = (sy - slope * sx) / n;
    const yMean = sy / n;
    const ssTot = prices.reduce((a, p) => a + Math.pow(p - yMean, 2), 0);
    const ssRes = prices.reduce((a, p, i) => a + Math.pow(p - (slope * i + intercept), 2), 0);
    const r2 = Math.max(0, 1 - ssRes / ssTot);
    return { slope, intercept, r2 };
  }

  function annualizedVol(prices) {
    const rets = prices.slice(1).map((p, i) => Math.log(p / prices[i]));
    const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
    const v = rets.reduce((a, r) => a + Math.pow(r - mean, 2), 0) / rets.length;
    return Math.sqrt(v * 252) * 100;
  }

  function sharpeRatio(prices, riskFreeRate = 6.5) {
    const rets = prices.slice(1).map((p, i) => (p / prices[i] - 1) * 252 * 100);
    const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
    const vol = annualizedVol(prices);
    return vol === 0 ? 0 : ((mean - riskFreeRate) / vol).toFixed(2);
  }

  function maxDrawdown(prices) {
    let peak = prices[0], maxDD = 0;
    for (const p of prices) {
      if (p > peak) peak = p;
      const dd = (peak - p) / peak * 100;
      if (dd > maxDD) maxDD = dd;
    }
    return maxDD;
  }

  function supportResistance(highs, lows, closes) {
    const recentHi = Math.max(...highs.slice(-20));
    const recentLo = Math.min(...lows.slice(-20));
    const yearHi = Math.max(...highs);
    const yearLo = Math.min(...lows);
    const price = closes[closes.length - 1];
    // Pivot
    const pivot = (highs[highs.length - 2] + lows[lows.length - 2] + closes[closes.length - 2]) / 3;
    const r1 = 2 * pivot - lows[lows.length - 2];
    const s1 = 2 * pivot - highs[highs.length - 2];
    return { pivot, r1, s1, recentHi, recentLo, yearHi, yearLo };
  }

  function computeForecast(prices, vol) {
    const reg = linearRegression(prices);
    const price = prices[prices.length - 1];
    const dailyDrift = reg.slope / price;
    const dailyVol = vol / 100 / Math.sqrt(252);

    function project(days) {
      const mu = dailyDrift * days;
      const sigma = dailyVol * Math.sqrt(days);
      return {
        base: price * Math.exp(mu),
        bull: price * Math.exp(mu + 1.65 * sigma),
        bear: price * Math.exp(mu - 1.65 * sigma),
        changePct: (Math.exp(mu) - 1) * 100,
      };
    }

    const annualReturn = dailyDrift * 252 * 100;
    const sharpe = parseFloat(sharpeRatio(prices));
    // Probability of profit: normal distribution approximation
    const z = (annualReturn - 0) / vol;
    const probProfit = Math.min(95, Math.max(5, 50 + z * 20));

    return { reg, annualReturn, vol, m3: project(63), m6: project(126), m12: project(252), probProfit, sharpe };
  }

  // ═══════════════════════════════════════════════════════════
  // SCORING & VERDICT ENGINE
  // ═══════════════════════════════════════════════════════════

  function scoreTechnical(indicators) {
    const { rsiVal, macdData, sma20, sma50, sma200, price, stoch, willR, obvData, bolBands } = indicators;
    let score = 50, signals = [], risks = [];

    // RSI (0-20pts)
    if (rsiVal !== null) {
      if (rsiVal < 25) { score += 12; signals.push('RSI deeply oversold — contrarian buy signal'); }
      else if (rsiVal < 40) { score += 7; signals.push('RSI oversold — accumulation zone'); }
      else if (rsiVal > 75) { score -= 12; risks.push('RSI severely overbought — correction risk'); }
      else if (rsiVal > 60) { score -= 6; risks.push('RSI overbought — momentum stretched'); }
      else { signals.push('RSI neutral — no extreme reading'); }
    }

    // MACD (0-18pts)
    if (macdData) {
      if (macdData.bullishCross) { score += 15; signals.push('MACD golden cross — strong bullish momentum shift'); }
      else if (macdData.bearishCross) { score -= 15; risks.push('MACD death cross — bearish momentum signal'); }
      else if (macdData.histogram > 0) { score += 8; signals.push('MACD positive — upward momentum confirmed'); }
      else if (macdData.histogram < 0) { score -= 8; risks.push('MACD negative — downward momentum persists'); }
    }

    // MA alignment (0-20pts)
    if (sma20 && price > sma20) { score += 5; signals.push('Price above 20-DMA — short-term bullish'); }
    else if (sma20) { score -= 5; risks.push('Price below 20-DMA — short-term bearish'); }
    if (sma50 && price > sma50) { score += 7; signals.push('Price above 50-DMA — medium-term trend intact'); }
    else if (sma50) { score -= 7; risks.push('Price below 50-DMA — medium-term trend broken'); }
    if (sma200 && price > sma200) { score += 8; signals.push('Price above 200-DMA — secular bull market'); }
    else if (sma200) { score -= 8; risks.push('Price below 200-DMA — long-term downtrend'); }

    // Stochastic (±8pts)
    if (stoch && stoch.k !== null) {
      if (stoch.k < 20 && stoch.d < 20) { score += 8; signals.push('Stochastic oversold — potential reversal'); }
      else if (stoch.k > 80 && stoch.d > 80) { score -= 8; risks.push('Stochastic overbought — momentum exhaustion'); }
    }

    // Bollinger (±5pts)
    if (bolBands) {
      if (bolBands.pctB < 5) { score += 5; signals.push('Price at lower Bollinger Band — mean-reversion opportunity'); }
      else if (bolBands.pctB > 95) { score -= 5; risks.push('Price at upper Bollinger Band — extended breakout'); }
    }

    // OBV (±5pts)
    if (obvData && obvData.trend === 'Rising') { score += 5; signals.push('OBV rising — institutional accumulation detected'); }
    else if (obvData && obvData.trend === 'Falling') { score -= 5; risks.push('OBV falling — distribution / selling pressure'); }

    return { score: Math.min(100, Math.max(0, Math.round(score))), signals, risks };
  }

  function scoreFundamental(data, sector) {
    const bench = SECTOR_PE[sector] || SECTOR_PE['default'];
    let score = 50, signals = [], risks = [];

    const pe = data.trailingPE;
    const forwardPE = data.forwardPE;
    const roe = (data.returnOnEquity || 0) * 100;
    const margin = (data.profitMargins || 0) * 100;
    const de = data.debtToEquity;
    const revenue_growth = (data.revenueGrowth || 0) * 100;
    const earnings_growth = (data.earningsGrowth || 0) * 100;
    const currentRatio = data.currentRatio;
    const peg = data.pegRatio;

    // PE Ratio (±15pts)
    if (pe && pe > 0) {
      if (pe < bench.avgPE * 0.7) { score += 12; signals.push(`P/E ${pe.toFixed(1)}x — significantly undervalued vs sector avg ${bench.avgPE}x`); }
      else if (pe < bench.avgPE * 0.9) { score += 6; signals.push(`P/E ${pe.toFixed(1)}x — slightly undervalued vs sector`); }
      else if (pe > bench.avgPE * 1.5) { score -= 10; risks.push(`P/E ${pe.toFixed(1)}x — expensive vs sector avg ${bench.avgPE}x`); }
      else if (pe > bench.avgPE * 1.2) { score -= 5; risks.push(`P/E ${pe.toFixed(1)}x — moderately premium valuation`); }
    }

    // ROE (±12pts)
    if (roe > 0) {
      if (roe > bench.avgROE * 1.3) { score += 12; signals.push(`ROE ${roe.toFixed(1)}% — exceptional return on equity`); }
      else if (roe > bench.avgROE) { score += 6; signals.push(`ROE ${roe.toFixed(1)}% — above sector average`); }
      else if (roe < bench.avgROE * 0.5) { score -= 8; risks.push(`ROE ${roe.toFixed(1)}% — below-par capital efficiency`); }
    }

    // Profit Margin (±10pts)
    if (margin !== 0) {
      if (margin > bench.avgMargin * 1.3) { score += 10; signals.push(`Net margin ${margin.toFixed(1)}% — superior profitability`); }
      else if (margin > bench.avgMargin) { score += 5; signals.push(`Net margin ${margin.toFixed(1)}% — healthy profitability`); }
      else if (margin < 0) { score -= 10; risks.push('Negative profit margins — loss-making operations'); }
    }

    // Revenue & Earnings Growth (±10pts)
    if (revenue_growth > 20) { score += 8; signals.push(`Revenue growth ${revenue_growth.toFixed(1)}% YoY — high-growth trajectory`); }
    else if (revenue_growth > 10) { score += 4; signals.push(`Revenue growth ${revenue_growth.toFixed(1)}% YoY — healthy growth`); }
    else if (revenue_growth < -5) { score -= 8; risks.push(`Revenue declining ${revenue_growth.toFixed(1)}% YoY — growth headwinds`); }

    if (earnings_growth > 25) { score += 5; signals.push(`Earnings growth ${earnings_growth.toFixed(1)}% — strong EPS expansion`); }
    else if (earnings_growth < -10) { score -= 5; risks.push(`Earnings declining ${earnings_growth.toFixed(1)}%`); }

    // Debt-to-Equity (±8pts)
    if (de !== null && de !== undefined) {
      if (de < 0.3) { score += 8; signals.push(`D/E ratio ${de.toFixed(2)} — fortress balance sheet`); }
      else if (de < 0.7) { score += 4; signals.push(`D/E ratio ${de.toFixed(2)} — conservative leverage`); }
      else if (de > 2.0) { score -= 8; risks.push(`D/E ratio ${de.toFixed(2)} — high leverage risk`); }
      else if (de > 1.2) { score -= 4; risks.push(`D/E ratio ${de.toFixed(2)} — elevated debt load`); }
    }

    // PEG Ratio (±5pts) — Growth at reasonable price
    if (peg && peg > 0) {
      if (peg < 1.0) { score += 5; signals.push(`PEG ${peg.toFixed(2)} — growth available at attractive price`); }
      else if (peg > 2.5) { score -= 5; risks.push(`PEG ${peg.toFixed(2)} — growth priced in amply`); }
    }

    return { score: Math.min(100, Math.max(0, Math.round(score))), signals, risks };
  }

  function overallVerdict(techScore, fundScore, forecastReturn, vol, sharpe) {
    const combined = techScore * 0.45 + fundScore * 0.35 + Math.min(100, Math.max(0, 50 + forecastReturn)) * 0.20;
    let rating, color, icon, confidence, riskLevel;

    if (combined >= 78) { rating = 'STRONG BUY'; color = '#00ff88'; icon = '🚀'; confidence = 'HIGH'; }
    else if (combined >= 65) { rating = 'BUY'; color = '#44ff66'; icon = '📈'; confidence = 'MODERATE-HIGH'; }
    else if (combined >= 52) { rating = 'ACCUMULATE'; color = '#aaff44'; icon = '⬆️'; confidence = 'MODERATE'; }
    else if (combined >= 45) { rating = 'HOLD'; color = '#ffcc00'; icon = '⚖️'; confidence = 'NEUTRAL'; }
    else if (combined >= 35) { rating = 'REDUCE'; color = '#ff8844'; icon = '⬇️'; confidence = 'MODERATE'; }
    else if (combined >= 22) { rating = 'SELL'; color = '#ff5533'; icon = '📉'; confidence = 'MODERATE-HIGH'; }
    else { rating = 'STRONG SELL'; color = '#ff2222'; icon = '⚠️'; confidence = 'HIGH'; }

    if (vol < 15) riskLevel = 'LOW';
    else if (vol < 25) riskLevel = 'MODERATE';
    else if (vol < 40) riskLevel = 'HIGH';
    else riskLevel = 'VERY HIGH';

    // Sharpe-adjusted risk
    if (parseFloat(sharpe) > 1.5) riskLevel = riskLevel === 'VERY HIGH' ? 'HIGH' : riskLevel;

    return { rating, color, icon, confidence, riskLevel, combined: Math.round(combined), techScore, fundScore };
  }

  // ═══════════════════════════════════════════════════════════
  // DATA FETCHING
  // ═══════════════════════════════════════════════════════════

  async function fetchYahooChart(symbol) {
    const url = `${YAHOO_CHART}${symbol}?interval=1d&range=1y&events=div,split`;
    const data = await safeFetch(url);
    const res = data.chart?.result?.[0];
    if (!res) throw new Error(`No price data for ${symbol}`);
    const ts = res.timestamp;
    const q = res.indicators.quote[0];
    return {
      symbol, timestamps: ts,
      opens: q.open, highs: q.high, lows: q.low,
      closes: q.close, volumes: q.volume,
      currency: res.meta.currency,
      exchangeName: res.meta.exchangeName,
      fullName: res.meta.longName || res.meta.shortName || symbol,
    };
  }

  async function fetchYahooFundamentals(symbol) {
    const mods = 'price,summaryProfile,financialData,defaultKeyStatistics,summaryDetail,calendarEvents';
    const url = `${YAHOO_QUOTE}${symbol}?modules=${mods}`;
    const data = await safeFetch(url);
    const res = data.quoteSummary?.result?.[0];
    if (!res) return null;
    const price   = res.price   || {};
    const profile = res.summaryProfile || {};
    const finData = res.financialData || {};
    const keyStats= res.defaultKeyStatistics || {};
    const sumDet  = res.summaryDetail || {};

    return {
      longName: price.longName || price.shortName || symbol,
      sector: profile.industry && SECTOR_PE[profile.sector] ? profile.sector : 'default',
      industry: profile.industry || '—',
      country: profile.country || '—',
      exchange: price.exchangeName || '—',
      description: profile.longBusinessSummary || null,
      employees: profile.fullTimeEmployees,
      website: profile.website || null,
      // Price data
      currentPrice: price.regularMarketPrice?.raw,
      prevClose: price.regularMarketPreviousClose?.raw,
      open: price.regularMarketOpen?.raw,
      dayHigh: price.regularMarketDayHigh?.raw,
      dayLow: price.regularMarketDayLow?.raw,
      weekHigh52: sumDet.fiftyTwoWeekHigh?.raw,
      weekLow52: sumDet.fiftyTwoWeekLow?.raw,
      volume: price.regularMarketVolume?.raw,
      avgVolume: price.averageDailyVolume10Day?.raw,
      marketCap: price.marketCap?.raw,
      marketCapFmt: price.marketCap?.fmt,
      beta: sumDet.beta?.raw,
      dividendYield: sumDet.dividendYield?.raw,
      dividendRate: sumDet.dividendRate?.raw,
      exDividendDate: sumDet.exDividendDate?.fmt,
      // Fundamentals
      trailingPE: sumDet.trailingPE?.raw || keyStats.trailingPE?.raw,
      forwardPE: sumDet.forwardPE?.raw,
      pegRatio: keyStats.pegRatio?.raw,
      priceToBook: keyStats.priceToBook?.raw,
      priceToSales: sumDet.priceToSalesTrailing12Months?.raw,
      evToEbitda: keyStats.enterpriseToEbitda?.raw,
      eps: keyStats.trailingEps?.raw,
      forwardEps: keyStats.forwardEps?.raw,
      bookValue: keyStats.bookValue?.raw,
      returnOnEquity: finData.returnOnEquity?.raw,
      returnOnAssets: finData.returnOnAssets?.raw,
      profitMargins: finData.profitMargins?.raw,
      operatingMargins: finData.operatingMargins?.raw,
      grossMargins: finData.grossMargins?.raw,
      revenueGrowth: finData.revenueGrowth?.raw,
      earningsGrowth: finData.earningsGrowth?.raw,
      totalRevenue: finData.totalRevenue?.raw,
      totalRevenueFmt: finData.totalRevenue?.fmt,
      ebitda: finData.ebitda?.raw,
      ebitdaFmt: finData.ebitda?.fmt,
      debtToEquity: finData.debtToEquity?.raw ? finData.debtToEquity.raw / 100 : null,
      currentRatio: finData.currentRatio?.raw,
      freeCashflow: finData.freeCashflow?.raw,
      freeCashflowFmt: finData.freeCashflow?.fmt,
      totalCash: finData.totalCash?.raw,
      totalDebt: finData.totalDebt?.raw,
      sharesOutstanding: keyStats.sharesOutstanding?.raw,
      shortRatio: keyStats.shortRatio?.raw,
      institutionHoldPct: keyStats.heldPercentInstitutions?.raw,
      insiderHoldPct: keyStats.heldPercentInsiders?.raw,
    };
  }

  async function fetchMF(query) {
    const url = MF_SEARCH + encodeURIComponent(query);
    const results = await safeFetch(url);
    if (!results || results.length === 0) return null;
    const top = results[0];
    const navUrl = MF_NAV + top.schemeCode;
    const navData = await safeFetch(navUrl);
    if (!navData || !navData.data) return null;
    const history = navData.data.slice(0, 365).reverse();
    const navPrices = history.map(d => parseFloat(d.nav));
    return {
      isMF: true,
      name: top.schemeName,
      schemeCode: top.schemeCode,
      category: navData.meta?.scheme_category || '—',
      type: navData.meta?.scheme_type || '—',
      amc: navData.meta?.fund_house || '—',
      prices: navPrices,
      currentNAV: navPrices[navPrices.length - 1],
      history,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // REPORT HTML GENERATOR
  // ═══════════════════════════════════════════════════════════

  function fmt(num, dec = 2) {
    if (num === null || num === undefined || isNaN(num)) return '—';
    return num.toLocaleString('en-IN', { maximumFractionDigits: dec, minimumFractionDigits: dec });
  }

  function fmtCr(num) {
    if (!num) return '—';
    if (Math.abs(num) >= 1e12) return '₹' + (num / 1e12).toFixed(2) + 'T';
    if (Math.abs(num) >= 1e9)  return '₹' + (num / 1e9).toFixed(2) + 'B';
    if (Math.abs(num) >= 1e7)  return '₹' + (num / 1e7).toFixed(2) + 'Cr';
    if (Math.abs(num) >= 1e5)  return '₹' + (num / 1e5).toFixed(2) + 'L';
    return '₹' + num.toLocaleString('en-IN');
  }

  function fmtUSD(num) {
    if (!num) return '—';
    if (Math.abs(num) >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
    if (Math.abs(num) >= 1e9)  return '$' + (num / 1e9).toFixed(2) + 'B';
    if (Math.abs(num) >= 1e6)  return '$' + (num / 1e6).toFixed(2) + 'M';
    return '$' + num.toLocaleString('en-US');
  }

  function colorVal(val, good = true) {
    if (val === null || val === undefined || isNaN(val)) return '#aaa';
    return (good ? val >= 0 : val <= 0) ? '#00ff88' : '#ff4466';
  }

  function badge(text, color) {
    return `<span class="sim-badge" style="background:${color}22;color:${color};border:1px solid ${color}55">${text}</span>`;
  }

  function scoreBar(score, label, color) {
    const col = score >= 60 ? '#00ff88' : score >= 45 ? '#ffcc00' : '#ff4466';
    return `
      <div class="sim-score-item">
        <div class="sim-score-label">${label}</div>
        <div class="sim-score-bar-wrap">
          <div class="sim-score-bar-fill" style="width:${score}%;background:${col}"></div>
        </div>
        <div class="sim-score-num" style="color:${col}">${score}/100</div>
      </div>`;
  }

  function rsiGauge(val) {
    if (val === null) return '<span class="sim-na">Insufficient data</span>';
    const pct = val; // 0-100 maps directly
    const col = val < 30 ? '#00ff88' : val > 70 ? '#ff4466' : '#ffcc00';
    const label = val < 25 ? 'DEEPLY OVERSOLD' : val < 35 ? 'OVERSOLD' : val > 75 ? 'SEVERELY OVERBOUGHT' : val > 65 ? 'OVERBOUGHT' : 'NEUTRAL';
    return `
      <div class="sim-gauge-wrap">
        <div class="sim-gauge-arc">
          <svg viewBox="0 0 120 70" class="sim-gauge-svg">
            <path d="M 10 65 A 55 55 0 0 1 110 65" fill="none" stroke="#1a2a3a" stroke-width="10"/>
            <path d="M 10 65 A 55 55 0 0 1 110 65" fill="none" stroke="${col}" stroke-width="10"
              stroke-dasharray="${pct * 1.73} 173" stroke-linecap="round"/>
            <text x="60" y="58" text-anchor="middle" fill="${col}" font-size="18" font-weight="700">${val.toFixed(1)}</text>
          </svg>
        </div>
        <div class="sim-gauge-label" style="color:${col}">${label}</div>
      </div>`;
  }

  function forecastCard(label, data, currency) {
    const sym = currency === 'INR' ? '₹' : '$';
    const baseCol = colorVal(data.changePct);
    return `
      <div class="sim-forecast-card">
        <div class="sim-fc-period">${label}</div>
        <div class="sim-fc-base" style="color:${baseCol}">${sym}${fmt(data.base)} <span style="font-size:0.8em">(${data.changePct >= 0 ? '+' : ''}${data.changePct.toFixed(1)}%)</span></div>
        <div class="sim-fc-row">
          <div class="sim-fc-bull">🟢 Bull: ${sym}${fmt(data.bull)}</div>
          <div class="sim-fc-bear">🔴 Bear: ${sym}${fmt(data.bear)}</div>
        </div>
      </div>`;
  }

  function signalList(items, type) {
    if (!items || items.length === 0) return '';
    const icon = type === 'bull' ? '✅' : '⚠️';
    const col = type === 'bull' ? '#00ff88' : '#ff8844';
    return items.slice(0, 5).map(s => `<div class="sim-signal-item" style="border-left:2px solid ${col}">${icon} ${s}</div>`).join('');
  }

  function buildReport(chartData, fundamentals, techResult, fundResult, forecast, verdict) {
    const fund = fundamentals || {};
    const isIndian = (fund.exchange || '').includes('NSE') || (fund.exchange || '').includes('BSE') ||
      chartData.currency === 'INR';
    const curr = chartData.currency || (isIndian ? 'INR' : 'USD');
    const sym = curr === 'INR' ? '₹' : '$';
    const fmtCap = isIndian ? fmtCr : fmtUSD;
    const price = fund.currentPrice || chartData.closes?.[chartData.closes.length - 1] || 0;
    const prevClose = fund.prevClose || chartData.closes?.[chartData.closes.length - 2] || price;
    const dayChange = price - prevClose;
    const dayChangePct = (dayChange / prevClose) * 100;
    const dayCol = colorVal(dayChange);
    const high52w = fund.weekHigh52 || Math.max(...chartData.highs);
    const low52w = fund.weekLow52 || Math.min(...chartData.lows);
    const nearHigh = ((high52w - price) / high52w * 100).toFixed(1);
    const nearLow = ((price - low52w) / low52w * 100).toFixed(1);
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' });
    const closes = chartData.closes.filter(c => c != null);
    const highs  = chartData.highs.filter(h => h != null);
    const lows   = chartData.lows.filter(l => l != null);
    const vols   = chartData.volumes.filter(v => v != null);
    // Indicators
    const closes20 = closes.slice(-20);
    const sma20v = closes20.reduce((a, b) => a + b, 0) / closes20.length;
    const closes50 = closes.slice(-50);
    const sma50v  = closes50.length >= 50 ? closes50.reduce((a, b) => a + b, 0) / 50 : null;
    const closes200 = closes.slice(-200);
    const sma200v = closes200.length >= 200 ? closes200.reduce((a, b) => a + b, 0) / 200 : null;
    const atrVal  = atr(highs, lows, closes).toFixed(2);
    const mdd     = maxDrawdown(closes).toFixed(1);
    const sr      = supportResistance(highs, lows, closes);
    const fib     = fibonacci(high52w, low52w);
    const avgVol  = vols.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const lastVol = vols[vols.length - 1];
    const volRatio = (lastVol / avgVol * 100).toFixed(0);

    return `
<div class="sim-report-wrap">

  <!-- HEADER -->
  <div class="sim-rpt-header">
    <div class="sim-rpt-title-area">
      <div class="sim-rpt-symbol">${chartData.symbol}</div>
      <div class="sim-rpt-name">${fund.longName || chartData.fullName}</div>
      <div class="sim-rpt-meta-row">
        ${fund.sector ? badge(fund.sector, '#4488ff') : ''}
        ${fund.industry ? badge(fund.industry, '#9966ff') : ''}
        ${badge(fund.exchange || chartData.exchangeName || '—', '#00ccff')}
        ${badge(curr, '#ff9900')}
      </div>
    </div>
    <div class="sim-rpt-price-area">
      <div class="sim-rpt-price">${sym}${fmt(price)}</div>
      <div class="sim-rpt-change" style="color:${dayCol}">${dayChange >= 0 ? '▲' : '▼'} ${sym}${Math.abs(dayChange).toFixed(2)} (${dayChange >= 0 ? '+' : ''}${dayChangePct.toFixed(2)}%)</div>
      <div class="sim-rpt-update">Updated: ${now} IST</div>
      <div class="sim-rpt-verdict-badge" style="background:${verdict.color}22;color:${verdict.color};border:2px solid ${verdict.color}88">
        ${verdict.icon} ${verdict.rating}
      </div>
    </div>
  </div>

  <!-- SCORES OVERVIEW -->
  <div class="sim-section">
    <div class="sim-section-title">📊 INTELLIGENCE SCORE DASHBOARD</div>
    <div class="sim-scores-grid">
      ${scoreBar(techResult.score, '⚡ Technical Score', '')}
      ${scoreBar(fundResult.score, '📈 Fundamental Score', '')}
      ${scoreBar(verdict.combined, '🎯 Overall Conviction', '')}
      <div class="sim-score-item">
        <div class="sim-score-label">🌊 Volatility (Ann.)</div>
        <div class="sim-score-num" style="color:${forecast.vol > 35 ? '#ff4466' : forecast.vol > 20 ? '#ffcc00' : '#00ff88'}">${forecast.vol.toFixed(1)}%</div>
      </div>
      <div class="sim-score-item">
        <div class="sim-score-label">📐 Sharpe Ratio</div>
        <div class="sim-score-num" style="color:${parseFloat(forecast.sharpe) > 1 ? '#00ff88' : parseFloat(forecast.sharpe) > 0 ? '#ffcc00' : '#ff4466'}">${forecast.sharpe}</div>
      </div>
      <div class="sim-score-item">
        <div class="sim-score-label">🎲 Prob. of Profit (12M)</div>
        <div class="sim-score-num" style="color:${forecast.probProfit > 60 ? '#00ff88' : forecast.probProfit > 40 ? '#ffcc00' : '#ff4466'}">${forecast.probProfit.toFixed(0)}%</div>
      </div>
    </div>
    <div class="sim-verdict-bar">
      <div class="sim-verdict-rating" style="color:${verdict.color}">${verdict.icon} Verdict: <b>${verdict.rating}</b></div>
      <div class="sim-verdict-risk">Risk: <b style="color:${verdict.riskLevel==='LOW'?'#00ff88':verdict.riskLevel==='MODERATE'?'#ffcc00':verdict.riskLevel==='HIGH'?'#ff8844':'#ff2222'}">${verdict.riskLevel}</b></div>
      <div class="sim-verdict-conf">Confidence: <b>${verdict.confidence}</b></div>
    </div>
  </div>

  <!-- SECTION 1: COMPANY OVERVIEW -->
  ${fund.description ? `
  <div class="sim-section">
    <div class="sim-section-title">🏢 COMPANY INTELLIGENCE OVERVIEW</div>
    <div class="sim-overview-grid">
      <div class="sim-kv"><span class="sim-kv-k">Exchange</span><span class="sim-kv-v">${fund.exchange || '—'}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Sector</span><span class="sim-kv-v">${fund.sector || '—'}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Industry</span><span class="sim-kv-v">${fund.industry || '—'}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Country</span><span class="sim-kv-v">${fund.country || '—'}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Employees</span><span class="sim-kv-v">${fund.employees ? fund.employees.toLocaleString('en-IN') : '—'}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Mkt Cap</span><span class="sim-kv-v">${fmtCap(fund.marketCap)}</span></div>
    </div>
    <div class="sim-description">${fund.description.substring(0, 420)}${fund.description.length > 420 ? '...' : ''}</div>
  </div>` : ''}

  <!-- SECTION 2: PRICE & MARKET DATA -->
  <div class="sim-section">
    <div class="sim-section-title">💰 PRICE & MARKET MICROSTRUCTURE</div>
    <div class="sim-overview-grid">
      <div class="sim-kv"><span class="sim-kv-k">Current Price</span><span class="sim-kv-v" style="color:${dayCol}">${sym}${fmt(price)}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Prev. Close</span><span class="sim-kv-v">${sym}${fmt(prevClose)}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Day Range</span><span class="sim-kv-v">${sym}${fmt(fund.dayLow || lows[lows.length-1])} — ${sym}${fmt(fund.dayHigh || highs[highs.length-1])}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">52W High</span><span class="sim-kv-v">${sym}${fmt(high52w)}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">52W Low</span><span class="sim-kv-v">${sym}${fmt(low52w)}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">From 52W High</span><span class="sim-kv-v" style="color:#ff8844">-${nearHigh}%</span></div>
      <div class="sim-kv"><span class="sim-kv-k">From 52W Low</span><span class="sim-kv-v" style="color:#00ff88">+${nearLow}%</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Volume</span><span class="sim-kv-v">${lastVol ? (lastVol / 1e6).toFixed(2) + 'M' : '—'}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Vol vs 20D Avg</span><span class="sim-kv-v" style="color:${volRatio > 120 ? '#00ff88' : '#aaa'}">${volRatio}%</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Beta</span><span class="sim-kv-v">${fund.beta ? fund.beta.toFixed(2) : '—'}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">ATR (14)</span><span class="sim-kv-v">${sym}${atrVal}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Max Drawdown (1Y)</span><span class="sim-kv-v" style="color:#ff8844">-${mdd}%</span></div>
    </div>
  </div>

  <!-- SECTION 3: TECHNICAL ANALYSIS -->
  <div class="sim-section">
    <div class="sim-section-title">⚡ TECHNICAL ANALYSIS — MULTI-INDICATOR FRAMEWORK</div>

    <!-- RSI Gauge -->
    <div class="sim-tech-top-row">
      <div class="sim-tech-gauge-box">
        <div class="sim-sub-title">RSI (14-Period)</div>
        ${rsiGauge(techResult.rsiVal)}
      </div>
      <div class="sim-tech-ma-box">
        <div class="sim-sub-title">Moving Average Alignment</div>
        <div class="sim-ma-list">
          <div class="sim-ma-row">
            <span class="sim-ma-label">SMA 20</span>
            <span class="sim-ma-val">${sym}${fmt(sma20v)}</span>
            <span class="sim-ma-status" style="color:${price > sma20v ? '#00ff88' : '#ff4466'}">${price > sma20v ? '▲ ABOVE' : '▼ BELOW'}</span>
          </div>
          ${sma50v ? `<div class="sim-ma-row">
            <span class="sim-ma-label">SMA 50</span>
            <span class="sim-ma-val">${sym}${fmt(sma50v)}</span>
            <span class="sim-ma-status" style="color:${price > sma50v ? '#00ff88' : '#ff4466'}">${price > sma50v ? '▲ ABOVE' : '▼ BELOW'}</span>
          </div>` : ''}
          ${sma200v ? `<div class="sim-ma-row">
            <span class="sim-ma-label">SMA 200</span>
            <span class="sim-ma-val">${sym}${fmt(sma200v)}</span>
            <span class="sim-ma-status" style="color:${price > sma200v ? '#00ff88' : '#ff4466'}">${price > sma200v ? '▲ ABOVE' : '▼ BELOW'}</span>
          </div>` : ''}
        </div>
      </div>
    </div>

    <!-- Indicators Grid -->
    <div class="sim-overview-grid" style="margin-top:1rem">
      <div class="sim-kv"><span class="sim-kv-k">MACD Signal</span>
        <span class="sim-kv-v" style="color:${techResult.macdData ? (techResult.macdData.histogram > 0 ? '#00ff88' : '#ff4466') : '#aaa'}">
          ${techResult.macdData ? (techResult.macdData.bullishCross ? '🟢 GOLDEN CROSS' : techResult.macdData.bearishCross ? '🔴 DEATH CROSS' : techResult.macdData.histogram > 0 ? '📈 BULLISH' : '📉 BEARISH') : '—'}
        </span>
      </div>
      <div class="sim-kv"><span class="sim-kv-k">Bollinger %B</span>
        <span class="sim-kv-v" style="color:${techResult.bolBands ? (techResult.bolBands.pctB < 20 ? '#00ff88' : techResult.bolBands.pctB > 80 ? '#ff4466' : '#aaa') : '#aaa'}">
          ${techResult.bolBands ? techResult.bolBands.pctB.toFixed(0) + '% | BW: ' + techResult.bolBands.bandwidth.toFixed(1) + '%' : '—'}
        </span>
      </div>
      <div class="sim-kv"><span class="sim-kv-k">Stochastic K/D</span>
        <span class="sim-kv-v" style="color:${techResult.stoch && techResult.stoch.k !== null ? (techResult.stoch.k < 20 ? '#00ff88' : techResult.stoch.k > 80 ? '#ff4466' : '#aaa') : '#aaa'}">
          ${techResult.stoch && techResult.stoch.k !== null ? techResult.stoch.k.toFixed(0) + ' / ' + (techResult.stoch.d || 0).toFixed(0) : '—'}
        </span>
      </div>
      <div class="sim-kv"><span class="sim-kv-k">Williams %R</span>
        <span class="sim-kv-v" style="color:${techResult.willR !== null ? (techResult.willR < -80 ? '#00ff88' : techResult.willR > -20 ? '#ff4466' : '#aaa') : '#aaa'}">
          ${techResult.willR !== null ? techResult.willR.toFixed(1) + (techResult.willR < -80 ? ' (Oversold)' : techResult.willR > -20 ? ' (Overbought)' : '') : '—'}
        </span>
      </div>
      <div class="sim-kv"><span class="sim-kv-k">OBV Trend</span>
        <span class="sim-kv-v" style="color:${techResult.obvData?.trend === 'Rising' ? '#00ff88' : '#ff4466'}">
          ${techResult.obvData ? (techResult.obvData.trend === 'Rising' ? '📈 RISING — Accumulation' : '📉 FALLING — Distribution') : '—'}
        </span>
      </div>
      <div class="sim-kv"><span class="sim-kv-k">Pivot Point</span><span class="sim-kv-v">${sym}${fmt(sr.pivot)}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Resistance R1</span><span class="sim-kv-v" style="color:#ff8844">${sym}${fmt(sr.r1)}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Support S1</span><span class="sim-kv-v" style="color:#00ff88">${sym}${fmt(sr.s1)}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Fib 38.2%</span><span class="sim-kv-v">${sym}${fmt(fib.r382)}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Fib 61.8%</span><span class="sim-kv-v">${sym}${fmt(fib.r618)}</span></div>
    </div>

    <!-- Bull/Bear Signals -->
    <div class="sim-signals-grid">
      <div class="sim-signals-box">
        <div class="sim-sub-title" style="color:#00ff88">✅ Bullish Signals</div>
        ${signalList(techResult.bullSignals, 'bull') || '<div class="sim-na">No strong bullish signals</div>'}
      </div>
      <div class="sim-signals-box">
        <div class="sim-sub-title" style="color:#ff8844">⚠️ Risk Signals</div>
        ${signalList(techResult.riskSignals, 'bear') || '<div class="sim-na">No strong risk signals</div>'}
      </div>
    </div>
  </div>

  <!-- SECTION 4: FUNDAMENTAL ANALYSIS -->
  ${fund.trailingPE || fund.returnOnEquity || fund.totalRevenue ? `
  <div class="sim-section">
    <div class="sim-section-title">📈 FUNDAMENTAL ANALYSIS — FINANCIAL X-RAY</div>
    <div class="sim-fund-grid">
      <div class="sim-fund-group">
        <div class="sim-sub-title">📊 Valuation Multiples</div>
        <div class="sim-kv"><span class="sim-kv-k">P/E (TTM)</span><span class="sim-kv-v">${fund.trailingPE ? fund.trailingPE.toFixed(1) + 'x' : '—'}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">P/E (Forward)</span><span class="sim-kv-v">${fund.forwardPE ? fund.forwardPE.toFixed(1) + 'x' : '—'}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">PEG Ratio</span><span class="sim-kv-v" style="color:${fund.pegRatio && fund.pegRatio < 1 ? '#00ff88' : fund.pegRatio && fund.pegRatio > 2 ? '#ff4466' : '#aaa'}">${fund.pegRatio ? fund.pegRatio.toFixed(2) : '—'}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">P/B Ratio</span><span class="sim-kv-v">${fund.priceToBook ? fund.priceToBook.toFixed(2) + 'x' : '—'}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">P/S Ratio</span><span class="sim-kv-v">${fund.priceToSales ? fund.priceToSales.toFixed(2) + 'x' : '—'}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">EV/EBITDA</span><span class="sim-kv-v">${fund.evToEbitda ? fund.evToEbitda.toFixed(1) + 'x' : '—'}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">EPS (TTM)</span><span class="sim-kv-v">${fund.eps ? sym + fmt(fund.eps) : '—'}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">EPS (Forward)</span><span class="sim-kv-v">${fund.forwardEps ? sym + fmt(fund.forwardEps) : '—'}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">Book Value/Share</span><span class="sim-kv-v">${fund.bookValue ? sym + fmt(fund.bookValue) : '—'}</span></div>
      </div>
      <div class="sim-fund-group">
        <div class="sim-sub-title">💹 Profitability & Growth</div>
        <div class="sim-kv"><span class="sim-kv-k">Total Revenue</span><span class="sim-kv-v">${fund.totalRevenueFmt || fmtCap(fund.totalRevenue)}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">Revenue Growth</span><span class="sim-kv-v" style="color:${colorVal(fund.revenueGrowth)}">${fund.revenueGrowth !== undefined ? (fund.revenueGrowth * 100).toFixed(1) + '%' : '—'}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">Earnings Growth</span><span class="sim-kv-v" style="color:${colorVal(fund.earningsGrowth)}">${fund.earningsGrowth !== undefined ? (fund.earningsGrowth * 100).toFixed(1) + '%' : '—'}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">Gross Margin</span><span class="sim-kv-v" style="color:${fund.grossMargins > 0.3 ? '#00ff88' : '#aaa'}">${fund.grossMargins ? (fund.grossMargins * 100).toFixed(1) + '%' : '—'}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">Operating Margin</span><span class="sim-kv-v" style="color:${fund.operatingMargins > 0.15 ? '#00ff88' : fund.operatingMargins > 0 ? '#ffcc00' : '#ff4466'}">${fund.operatingMargins !== undefined ? (fund.operatingMargins * 100).toFixed(1) + '%' : '—'}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">Net Profit Margin</span><span class="sim-kv-v" style="color:${colorVal(fund.profitMargins)}">${fund.profitMargins !== undefined ? (fund.profitMargins * 100).toFixed(1) + '%' : '—'}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">EBITDA</span><span class="sim-kv-v">${fund.ebitdaFmt || fmtCap(fund.ebitda)}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">Free Cash Flow</span><span class="sim-kv-v" style="color:${colorVal(fund.freeCashflow)}">${fund.freeCashflowFmt || fmtCap(fund.freeCashflow)}</span></div>
      </div>
      <div class="sim-fund-group">
        <div class="sim-sub-title">🏦 Balance Sheet & Returns</div>
        <div class="sim-kv"><span class="sim-kv-k">ROE</span><span class="sim-kv-v" style="color:${fund.returnOnEquity > 0.15 ? '#00ff88' : fund.returnOnEquity > 0 ? '#ffcc00' : '#ff4466'}">${fund.returnOnEquity !== undefined ? (fund.returnOnEquity * 100).toFixed(1) + '%' : '—'}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">ROA</span><span class="sim-kv-v" style="color:${colorVal(fund.returnOnAssets)}">${fund.returnOnAssets !== undefined ? (fund.returnOnAssets * 100).toFixed(1) + '%' : '—'}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">Debt/Equity</span><span class="sim-kv-v" style="color:${fund.debtToEquity !== null ? (fund.debtToEquity < 0.5 ? '#00ff88' : fund.debtToEquity > 1.5 ? '#ff4466' : '#ffcc00') : '#aaa'}">${fund.debtToEquity !== null && fund.debtToEquity !== undefined ? fund.debtToEquity.toFixed(2) : '—'}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">Current Ratio</span><span class="sim-kv-v" style="color:${fund.currentRatio > 1.5 ? '#00ff88' : fund.currentRatio > 1 ? '#ffcc00' : '#ff4466'}">${fund.currentRatio ? fund.currentRatio.toFixed(2) : '—'}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">Total Cash</span><span class="sim-kv-v">${fmtCap(fund.totalCash)}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">Total Debt</span><span class="sim-kv-v">${fmtCap(fund.totalDebt)}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">Dividend Yield</span><span class="sim-kv-v" style="color:${fund.dividendYield > 0.02 ? '#00ff88' : '#aaa'}">${fund.dividendYield ? (fund.dividendYield * 100).toFixed(2) + '%' : '—'}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">Dividend Rate</span><span class="sim-kv-v">${fund.dividendRate ? sym + fmt(fund.dividendRate) : '—'}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">Insider Holding</span><span class="sim-kv-v">${fund.insiderHoldPct ? (fund.insiderHoldPct * 100).toFixed(1) + '%' : '—'}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">Institutional Hold</span><span class="sim-kv-v">${fund.institutionHoldPct ? (fund.institutionHoldPct * 100).toFixed(1) + '%' : '—'}</span></div>
      </div>
    </div>
    <!-- Fundamental Signals -->
    <div class="sim-signals-grid" style="margin-top:1rem">
      <div class="sim-signals-box">
        <div class="sim-sub-title" style="color:#00ff88">✅ Fundamental Strengths</div>
        ${signalList(fundResult.signals, 'bull') || '<div class="sim-na">Insufficient data</div>'}
      </div>
      <div class="sim-signals-box">
        <div class="sim-sub-title" style="color:#ff8844">⚠️ Fundamental Risks</div>
        ${signalList(fundResult.risks, 'bear') || '<div class="sim-na">No significant red flags</div>'}
      </div>
    </div>
  </div>` : ''}

  <!-- SECTION 5: PREDICTIVE FORECAST -->
  <div class="sim-section">
    <div class="sim-section-title">🔮 PREDICTIVE PRICE FORECAST — QUANTITATIVE MODEL</div>
    <div class="sim-forecast-meta">
      <div class="sim-kv"><span class="sim-kv-k">Trend Direction</span>
        <span class="sim-kv-v" style="color:${forecast.annualReturn >= 0 ? '#00ff88' : '#ff4466'}">
          ${forecast.annualReturn >= 5 ? '↗️ BULLISH TREND' : forecast.annualReturn <= -5 ? '↘️ BEARISH TREND' : '→ SIDEWAYS / NEUTRAL'}
        </span>
      </div>
      <div class="sim-kv"><span class="sim-kv-k">Trend Strength (R²)</span>
        <span class="sim-kv-v">${(forecast.reg.r2 * 100).toFixed(1)}% ${forecast.reg.r2 > 0.5 ? '(Strong)' : forecast.reg.r2 > 0.25 ? '(Moderate)' : '(Weak)'}</span>
      </div>
      <div class="sim-kv"><span class="sim-kv-k">Expected Annual Return</span>
        <span class="sim-kv-v" style="color:${colorVal(forecast.annualReturn)}">${forecast.annualReturn >= 0 ? '+' : ''}${forecast.annualReturn.toFixed(1)}%</span>
      </div>
      <div class="sim-kv"><span class="sim-kv-k">Annualized Volatility</span>
        <span class="sim-kv-v">${forecast.vol.toFixed(1)}%</span>
      </div>
      <div class="sim-kv"><span class="sim-kv-k">Sharpe Ratio</span>
        <span class="sim-kv-v" style="color:${parseFloat(forecast.sharpe) > 1.5 ? '#00ff88' : parseFloat(forecast.sharpe) > 0.5 ? '#ffcc00' : '#ff4466'}">${forecast.sharpe}</span>
      </div>
      <div class="sim-kv"><span class="sim-kv-k">Prob. of Positive Return</span>
        <span class="sim-kv-v" style="color:${forecast.probProfit > 60 ? '#00ff88' : '#ffcc00'}">${forecast.probProfit.toFixed(0)}%</span>
      </div>
    </div>
    <div class="sim-forecast-cards">
      ${forecastCard('3-Month', forecast.m3, curr)}
      ${forecastCard('6-Month', forecast.m6, curr)}
      ${forecastCard('12-Month', forecast.m12, curr)}
    </div>
    <div class="sim-forecast-note">
      📐 Model: Linear regression (1Y data, ${closes.length} sessions) + GBM volatility bands at 90% confidence intervals.
      Bull = +1.65σ, Bear = -1.65σ scenario.
    </div>
  </div>

  <!-- SECTION 6: OVERALL VERDICT -->
  <div class="sim-section sim-verdict-section">
    <div class="sim-section-title">💡 INVESTMENT VERDICT — SENTINEL CONSENSUS</div>
    <div class="sim-verdict-main" style="border:2px solid ${verdict.color}66;background:${verdict.color}08">
      <div class="sim-verdict-rating-big" style="color:${verdict.color}">${verdict.icon} ${verdict.rating}</div>
      <div class="sim-verdict-grid">
        <div class="sim-kv"><span class="sim-kv-k">Technical Score</span><span class="sim-kv-v">${verdict.techScore}/100</span></div>
        <div class="sim-kv"><span class="sim-kv-k">Fundamental Score</span><span class="sim-kv-v">${verdict.fundScore}/100</span></div>
        <div class="sim-kv"><span class="sim-kv-k">Overall Conviction</span><span class="sim-kv-v">${verdict.combined}/100</span></div>
        <div class="sim-kv"><span class="sim-kv-k">Confidence Level</span><span class="sim-kv-v">${verdict.confidence}</span></div>
        <div class="sim-kv"><span class="sim-kv-k">Risk Classification</span>
          <span class="sim-kv-v" style="color:${verdict.riskLevel === 'LOW' ? '#00ff88' : verdict.riskLevel === 'MODERATE' ? '#ffcc00' : verdict.riskLevel === 'HIGH' ? '#ff8844' : '#ff2222'}">${verdict.riskLevel}</span>
        </div>
        <div class="sim-kv"><span class="sim-kv-k">Max 1Y Drawdown</span><span class="sim-kv-v" style="color:#ff8844">-${mdd}%</span></div>
      </div>
    </div>
    <div class="sim-disclaimer">
      ⚠️ <b>DISCLAIMER:</b> This report is generated by SENTINEL's quantitative models using publicly available market data.
      It is for <b>informational and educational purposes only</b> and does NOT constitute financial advice,
      investment recommendation, or solicitation. Past performance does not guarantee future results.
      Always consult a SEBI-registered investment advisor before making investment decisions.
      Predictive forecasts carry inherent uncertainty.
    </div>
  </div>

</div>`;
  }

  // ═══════════════════════════════════════════════════════════
  // MUTUAL FUND REPORT GENERATOR
  // ═══════════════════════════════════════════════════════════

  function buildMFReport(mfData) {
    const prices = mfData.prices;
    if (!prices || prices.length < 30) return '<div class="sim-error-msg">Insufficient NAV history for analysis.</div>';
    const nav = prices[prices.length - 1];
    const nav30ago = prices[prices.length - 31] || prices[0];
    const nav365ago = prices[0];
    const ret1m = ((nav / nav30ago) - 1) * 100;
    const ret1y = ((nav / nav365ago) - 1) * 100;
    const vol = annualizedVol(prices);
    const reg = linearRegression(prices);
    const forecast = computeForecast(prices, vol);
    const dd = maxDrawdown(prices);
    const sh = parseFloat(sharpeRatio(prices));
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' });

    const techVerdict = ret1y > 20 && ret1m > 0 ? { text: 'STRONG BUY', col: '#00ff88', icon: '🚀' }
      : ret1y > 12 && ret1m >= 0 ? { text: 'BUY', col: '#44ff66', icon: '📈' }
      : ret1y > 5 ? { text: 'HOLD', col: '#ffcc00', icon: '⚖️' }
      : { text: 'UNDERPERFORMING', col: '#ff8844', icon: '📉' };

    // SIP Projection (12-month)
    const monthlyReturn = Math.pow(1 + ret1y / 100, 1 / 12) - 1;
    const sipMonths = 12;
    const sipAmount = 5000;
    let sipValue = 0;
    for (let i = 0; i < sipMonths; i++) sipValue = (sipValue + sipAmount) * (1 + monthlyReturn);

    return `
<div class="sim-report-wrap">
  <div class="sim-rpt-header">
    <div class="sim-rpt-title-area">
      <div class="sim-rpt-symbol">MF</div>
      <div class="sim-rpt-name">${mfData.name}</div>
      <div class="sim-rpt-meta-row">
        ${badge(mfData.category || 'Mutual Fund', '#4488ff')}
        ${badge(mfData.type || 'Open Ended', '#9966ff')}
        ${badge('AMFI Registered', '#00ccff')}
      </div>
    </div>
    <div class="sim-rpt-price-area">
      <div class="sim-rpt-price">₹${fmt(nav)}</div>
      <div class="sim-rpt-change" style="color:${colorVal(ret1m)}">1M: ${ret1m >= 0 ? '+' : ''}${ret1m.toFixed(2)}% | 1Y: ${ret1y >= 0 ? '+' : ''}${ret1y.toFixed(2)}%</div>
      <div class="sim-rpt-update">NAV as of: ${now}</div>
      <div class="sim-rpt-verdict-badge" style="background:${techVerdict.col}22;color:${techVerdict.col};border:2px solid ${techVerdict.col}88">
        ${techVerdict.icon} ${techVerdict.text}
      </div>
    </div>
  </div>
  <div class="sim-section">
    <div class="sim-section-title">🏢 FUND DETAILS</div>
    <div class="sim-overview-grid">
      <div class="sim-kv"><span class="sim-kv-k">AMC / Fund House</span><span class="sim-kv-v">${mfData.amc}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Scheme Category</span><span class="sim-kv-v">${mfData.category}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Scheme Type</span><span class="sim-kv-v">${mfData.type}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">AMFI Scheme Code</span><span class="sim-kv-v">${mfData.schemeCode}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Data Period</span><span class="sim-kv-v">${prices.length} days</span></div>
    </div>
  </div>
  <div class="sim-section">
    <div class="sim-section-title">📊 PERFORMANCE METRICS</div>
    <div class="sim-overview-grid">
      <div class="sim-kv"><span class="sim-kv-k">Current NAV</span><span class="sim-kv-v">₹${fmt(nav)}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">1 Month Return</span><span class="sim-kv-v" style="color:${colorVal(ret1m)}">${ret1m >= 0 ? '+' : ''}${ret1m.toFixed(2)}%</span></div>
      <div class="sim-kv"><span class="sim-kv-k">1 Year Return</span><span class="sim-kv-v" style="color:${colorVal(ret1y)}">${ret1y >= 0 ? '+' : ''}${ret1y.toFixed(2)}%</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Annualized Volatility</span><span class="sim-kv-v">${vol.toFixed(1)}%</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Sharpe Ratio</span><span class="sim-kv-v" style="color:${sh > 1.5 ? '#00ff88' : sh > 0.5 ? '#ffcc00' : '#ff4466'}">${sh}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Max Drawdown</span><span class="sim-kv-v" style="color:#ff8844">-${dd.toFixed(1)}%</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Trend Direction</span><span class="sim-kv-v" style="color:${colorVal(forecast.annualReturn)}">${forecast.annualReturn > 0 ? '↗️ UPTREND' : '↘️ DOWNTREND'} (R²: ${(forecast.reg.r2 * 100).toFixed(0)}%)</span></div>
    </div>
  </div>
  <div class="sim-section">
    <div class="sim-section-title">🔮 NAV FORECAST</div>
    <div class="sim-forecast-cards">
      ${forecastCard('3-Month NAV', forecast.m3, 'INR')}
      ${forecastCard('6-Month NAV', forecast.m6, 'INR')}
      ${forecastCard('12-Month NAV', forecast.m12, 'INR')}
    </div>
  </div>
  <div class="sim-section">
    <div class="sim-section-title">💰 SIP PROJECTION (₹5,000/month × 12 months)</div>
    <div class="sim-overview-grid">
      <div class="sim-kv"><span class="sim-kv-k">Total Invested</span><span class="sim-kv-v">₹60,000</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Projected Value</span><span class="sim-kv-v" style="color:${colorVal(ret1y)}">₹${fmt(sipValue)}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Projected Gain</span><span class="sim-kv-v" style="color:${colorVal(sipValue - 60000)}">₹${fmt(sipValue - 60000)}</span></div>
      <div class="sim-kv"><span class="sim-kv-k">Expected XIRR</span><span class="sim-kv-v" style="color:${colorVal(ret1y)}">${ret1y.toFixed(1)}% p.a.</span></div>
    </div>
  </div>
  <div class="sim-disclaimer">
    ⚠️ <b>DISCLAIMER:</b> NAV and performance data sourced from MFAPI (AMFI). Projections are based on historical returns
    and do not guarantee future NAV. Mutual fund investments are subject to market risks.
    Read all scheme-related documents carefully before investing.
  </div>
</div>`;
  }

  // ═══════════════════════════════════════════════════════════
  // MAIN ANALYZER
  // ═══════════════════════════════════════════════════════════

  async function runAnalysis(query) {
    const steps = document.getElementById('sim-loading-steps');
    function step(msg) { if (steps) steps.innerHTML += `<div class="sim-step">▶ ${msg}</div>`; }

    const resultEl = document.getElementById('sim-report');
    const loadingEl = document.getElementById('sim-loading');
    const errorEl = document.getElementById('sim-error');

    resultEl.classList.add('hidden');
    errorEl.classList.add('hidden');
    loadingEl.classList.remove('hidden');
    if (steps) steps.innerHTML = '';

    try {
      // 1. Check if it's a MF query first
      step('Resolving instrument — scanning symbol databases...');

      // Try MF first if query looks like a fund name
      const mfKeywords = ['fund', 'sbi', 'hdfc', 'axis', 'mirae', 'nippon', 'icici prudential',
        'uti', 'aditya birla', 'dsp', 'parag parikh', 'motilal', 'kotak', 'canara',
        'sundaram', 'tata', 'invesco', 'franklin', 'quantum', 'bluechip', 'flexicap',
        'midcap', 'smallcap', 'elss', 'balanced', 'liquid', 'gilt', 'debt'];
      const isMFQuery = mfKeywords.some(k => query.toLowerCase().includes(k)) && !SYMBOL_MAP[query.toLowerCase()];

      if (isMFQuery) {
        step('Detected mutual fund — querying AMFI database...');
        const mfData = await fetchMF(query);
        if (mfData) {
          step('Computing NAV trend analysis and SIP projection...');
          loadingEl.classList.add('hidden');
          resultEl.innerHTML = buildMFReport(mfData);
          resultEl.classList.remove('hidden');
          resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }

      // 2. Resolve stock/ETF/index symbol
      const candidates = resolveSymbol(query);
      let chartData = null, symbol = null;

      step('Fetching 1-year OHLCV price history...');
      for (const cand of candidates) {
        try {
          chartData = await fetchYahooChart(cand.symbol);
          symbol = cand.symbol;
          break;
        } catch (_) {}
      }

      if (!chartData) {
        // Final fallback: try MF
        step('Stock not found — trying mutual fund database...');
        const mfData = await fetchMF(query);
        if (mfData) {
          step('Found as mutual fund — computing analysis...');
          loadingEl.classList.add('hidden');
          resultEl.innerHTML = buildMFReport(mfData);
          resultEl.classList.remove('hidden');
          resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        throw new Error(`Could not find data for "${query}". Try the exact ticker symbol (e.g., RELIANCE.NS, AAPL, ^NSEI).`);
      }

      step('Fetching fundamental data — P&L, balance sheet, valuation multiples...');
      let fundamentals = null;
      try { fundamentals = await fetchYahooFundamentals(symbol); } catch (_) {}

      // 3. Prepare price arrays
      step('Running technical analysis — RSI, MACD, Bollinger, Stochastic, OBV...');
      const closes  = chartData.closes.filter(c => c != null);
      const highs   = chartData.highs.filter(h => h != null);
      const lows    = chartData.lows.filter(l => l != null);
      const volumes = chartData.volumes.filter(v => v != null);

      if (closes.length < 20) throw new Error('Insufficient price history for analysis (need >20 days).');

      const rsiVal  = rsi(closes);
      const macdD   = macd(closes);
      const sma20v  = closes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, closes.length);
      const sma50v  = closes.length >= 50 ? closes.slice(-50).reduce((a, b) => a + b, 0) / 50 : null;
      const sma200v = closes.length >= 200 ? closes.slice(-200).reduce((a, b) => a + b, 0) / 200 : null;
      const bolB    = bollinger(closes);
      const stochD  = stochastic(highs, lows, closes);
      const willRV  = williamsR(highs, lows, closes);
      const obvD    = obv(closes, volumes);
      const price   = closes[closes.length - 1];

      const techIndicators = { rsiVal, macdData: macdD, sma20: sma20v, sma50: sma50v, sma200: sma200v, bolBands: bolB, stoch: stochD, willR: willRV, obvData: obvD, price };
      const techResult = scoreTechnical(techIndicators);
      techResult.rsiVal = rsiVal;
      techResult.macdData = macdD;
      techResult.bolBands = bolB;
      techResult.stoch = stochD;
      techResult.willR = willRV;
      techResult.obvData = obvD;
      techResult.bullSignals = techResult.signals;
      techResult.riskSignals = techResult.risks;

      step('Running quantitative forecast — linear regression + GBM volatility model...');
      const vol = annualizedVol(closes);
      const forecast = computeForecast(closes, vol);

      step('Scoring fundamentals and computing investment verdict...');
      const sector = fundamentals?.sector || 'default';
      const fundResult = scoreFundamental(fundamentals || {}, sector);

      const verdictData = overallVerdict(techResult.score, fundResult.score, forecast.annualReturn, vol, forecast.sharpe);

      step('Generating institutional intelligence report...');
      const html = buildReport(chartData, fundamentals, techResult, fundResult, forecast, verdictData);

      loadingEl.classList.add('hidden');
      resultEl.innerHTML = html;
      resultEl.classList.remove('hidden');
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
      loadingEl.classList.add('hidden');
      errorEl.classList.remove('hidden');
      document.getElementById('sim-error-msg').textContent = err.message || 'Analysis failed. Please try again.';
    }
  }

  // ═══════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════

  function init() {
    const btn = document.getElementById('sim-analyze-btn');
    const input = document.getElementById('sim-search-input');
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
      const q = input.value.trim();
      if (q.length < 1) { input.focus(); return; }
      runAnalysis(q);
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { const q = input.value.trim(); if (q) runAnalysis(q); }
    });

    document.querySelectorAll('.quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.getAttribute('data-query');
        input.value = q;
        runAnalysis(q);
      });
    });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
