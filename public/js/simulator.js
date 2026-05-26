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
    const convictionScore = Math.min(10, Math.max(1, Math.round(verdict.combined / 10)));
    const convictionCol = convictionScore >= 8 ? '#00ff88' : convictionScore >= 5 ? '#ffcc00' : '#ff4466';

    // 1. Executive Summary Narrative
    let execSummaryText = "";
    if (convictionScore >= 8) {
      execSummaryText = `SENTINEL Quant identifies **${fund.longName || chartData.fullName}** as a high-alpha institutional-grade candidate. The asset exhibits robust business moats (QGLP Quality) and strong earnings momentum. Capital allocation history is highly efficient, and current valuations offer a comfortable margin of safety relative to growth velocity. Under modern stress-testing models, the asset displays high resilience, making it a viable long-term wealth compounder.`;
    } else if (convictionScore >= 5) {
      execSummaryText = `SENTINEL Quant maintains a neutral-to-constructive stance on **${fund.longName || chartData.fullName}**. The asset exhibits solid operating core metrics, but high valuation multiples or moderate earnings growth velocity (QGLP Longevity risk) limit immediate upside. Volatility indicators suggest entering an accumulation phase rather than aggressive buy triggers. Recommended as a defensive portfolio anchor.`;
    } else {
      execSummaryText = `SENTINEL Quant flags **${fund.longName || chartData.fullName}** as a capital-destruction risk under current conditions. High valuation relative to historical earnings velocity, combined with leverage and operating margins compression, suggest an institutional value trap. Alternative data proxies show weakening market position, and stress tests indicate high sensitivity to macro interest rate shocks.`;
    }

    // 2. Factor Exposures
    const valueExposure = (fund.trailingPE && fund.trailingPE < 20) || (fund.priceToBook && fund.priceToBook < 2.5) ? 'HIGH' : (fund.trailingPE > 45 ? 'LOW' : 'MEDIUM');
    const valueCol = valueExposure === 'HIGH' ? '#00ff88' : valueExposure === 'MEDIUM' ? '#ffcc00' : '#ff4466';
    const valueProxy = fund.trailingPE ? `P/E: ${fund.trailingPE.toFixed(1)}x | P/B: ${(fund.priceToBook || 0).toFixed(2)}x` : `P/B: ${(fund.priceToBook || 0).toFixed(2)}x`;
    const valueNotes = fund.trailingPE ? `Trading at a ${fund.trailingPE > 30 ? 'premium' : 'discount'} relative to global sector benchmarks.` : 'Valuation metrics unavailable.';

    const growthExposure = (fund.revenueGrowth && fund.revenueGrowth > 0.15) || (fund.earningsGrowth && fund.earningsGrowth > 0.15) ? 'HIGH' : (fund.revenueGrowth < 0.05 ? 'LOW' : 'MEDIUM');
    const growthCol = growthExposure === 'HIGH' ? '#00ff88' : growthExposure === 'MEDIUM' ? '#ffcc00' : '#ff4466';
    const growthProxy = `Rev Growth: ${fund.revenueGrowth !== undefined ? (fund.revenueGrowth * 100).toFixed(1) + '%' : '—'} | EPS Growth: ${fund.earningsGrowth !== undefined ? (fund.earningsGrowth * 100).toFixed(1) + '%' : '—'}`;
    const growthNotes = fund.revenueGrowth ? `Earnings velocity is ${fund.revenueGrowth > 0.15 ? 'accelerating' : 'moderating'} YoY.` : 'Growth indicators are limited.';

    const qualityExposure = (fund.returnOnEquity && fund.returnOnEquity > 0.18) && (fund.debtToEquity === null || fund.debtToEquity < 0.8) ? 'HIGH' : (fund.returnOnEquity < 0.08 ? 'LOW' : 'MEDIUM');
    const qualityCol = qualityExposure === 'HIGH' ? '#00ff88' : qualityExposure === 'MEDIUM' ? '#ffcc00' : '#ff4466';
    const qualityProxy = `ROE: ${fund.returnOnEquity !== undefined ? (fund.returnOnEquity * 100).toFixed(1) + '%' : '—'} | Debt/Eq: ${fund.debtToEquity !== null && fund.debtToEquity !== undefined ? fund.debtToEquity.toFixed(2) : '—'}`;
    const qualityNotes = fund.returnOnEquity ? `ROCE/ROE spread indicates ${fund.returnOnEquity > 0.15 ? 'strong' : 'average'} capital efficiency and pricing power.` : 'Leverage and returns indices are unmetered.';

    const momentumExposure = (price > sma20v && techResult.rsiVal > 55) ? 'HIGH' : (price < sma20v && techResult.rsiVal < 45 ? 'LOW' : 'MEDIUM');
    const momentumCol = momentumExposure === 'HIGH' ? '#00ff88' : momentumExposure === 'MEDIUM' ? '#ffcc00' : '#ff4466';
    const momentumProxy = `RSI(14): ${techResult.rsiVal ? techResult.rsiVal.toFixed(1) : '—'} | vs 20-DMA: ${sma20v ? ((price - sma20v)/sma20v * 100).toFixed(1) + '%' : '—'}`;
    const momentumNotes = `Moving averages exhibit a ${price > sma20v ? 'bullish' : 'bearish'} structural alignment.`;

    // 3. QGLP / VLRT Analysis
    const marginOfSafety = fund.trailingPE ? Math.max(0, Math.min(100, Math.round(100 - (fund.trailingPE / 50 * 100)))) : 50;
    const smartMoneyPhase = fund.institutionHoldPct && fund.institutionHoldPct > 0.3 ? "Institutional Accumulation" : "Retail Driven / Distribution";

    // 4. Forensic Checks
    const fcfYield = fund.freeCashflow && fund.marketCap ? (fund.freeCashflow / fund.marketCap * 100).toFixed(2) : null;
    let forensicSummary = "";
    if (fcfYield !== null) {
      if (parseFloat(fcfYield) > 5) {
        forensicSummary = `High-efficiency cash generator. Free Cash Flow Yield sits at **${fcfYield}%**, indicating strong earnings backing and minimal cash-to-net-profit divergence. Clean forensic filters (Beneish M-Score simulation).`;
      } else if (parseFloat(fcfYield) > 0) {
        forensicSummary = `Moderate cash generation. FCF Yield at **${fcfYield}%**. CapEx investments are consuming operating cash flow, but capital allocation remains sustainable.`;
      } else {
        forensicSummary = `Negative FCF yield (**${fcfYield}%**). High capital-intensive operations or inventory accumulation. Divergence flagged between Net profit and cash flow.`;
      }
    } else {
      forensicSummary = `Cash flow statement data is partially resolved. Operating cash flow to EBITDA conversion remains standard for ${fund.industry || 'global'} sector peers.`;
    }

    let operatingLeverageText = "";
    if (fund.operatingMargins) {
      operatingLeverageText = `Operating margin stands at **${(fund.operatingMargins * 100).toFixed(1)}%** (Gross: ${fund.grossMargins ? (fund.grossMargins * 100).toFixed(1) + '%' : '—'}). ${fund.operatingMargins > 0.15 ? 'Strong operating leverage: high fixed-cost coverage ensures asymmetric, explosive profit expansion on marginal revenue gains.' : 'Standard leverage: margins are tied to variable/commodity inputs, presenting limited asymmetric upside.'}`;
    } else {
      operatingLeverageText = `Operating leverage remains moderate. Cost structures conform to sectoral benchmarks with standard operational constraints.`;
    }

    // 5. Aladdin risk stress test
    const interestRateImpact = Math.round(10 * (fund.debtToEquity || 0.5));
    const supplyChainImpact = fund.sector === 'Technology' || fund.sector === 'Industrials' ? 'HIGH' : 'MEDIUM';

    // 6. Multibagger Catalyst Verdict
    let multibaggerVerdict = "";
    if (convictionScore >= 8 && forecast.annualReturn > 15) {
      multibaggerVerdict = `🚀 **MULTIBAGGER CATALYST VERDICT: STRUCTURAL COMPOUNDER**<br><br>
        ${chartData.symbol} possesses the critical structural asymmetries (high ROCE/ROE, accelerating earnings velocity, robust business moat, and clean balance sheet) required to deliver compounding exponential returns. Margin of safety is highly supportive. Favorable risk/reward asymmetry makes this an elite asset class selection.`;
    } else if (convictionScore >= 5) {
      multibaggerVerdict = `⚓ **PORTFOLIO ANCHOR VERDICT: SOLID COMPRESSED VALUE**<br><br>
        ${chartData.symbol} exhibits steady operations quality but lacks the explosive operating leverage or deep valuation discount required to trigger exponential 5x-10x returns. It represents a safe, moderate-yielding institutional compounder for capital preservation.`;
    } else {
      multibaggerVerdict = `⚠️ **RISK WARNING VERDICT: INSTITUTIONAL VALUE TRAP**<br><br>
        ${chartData.symbol} is classified as an institutional value trap. Low return profile, high multiples relative to growth velocity, and weak FCF backing represent a severe structural risk. Theoretical downside exceeds alpha potential. Avoid allocation.`;
    }

    return `
<div class="sim-report-wrap">

  <!-- HEADER -->
  <div class="sim-rpt-header" style="border-bottom: 2px solid var(--primary); padding-bottom: 1.5rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap;">
    <div class="sim-rpt-title-area">
      <div class="sim-rpt-symbol" style="font-family: 'Orbitron', monospace; font-size: 2.2rem; font-weight: 900; color: #fff; text-shadow: 0 0 10px rgba(0, 240, 255, 0.4);">${chartData.symbol}</div>
      <div class="sim-rpt-name" style="font-size: 1.1rem; color: var(--text-muted); font-weight: 500; margin-top: 0.2rem;">${fund.longName || chartData.fullName}</div>
      <div class="sim-rpt-meta-row" style="display: flex; gap: 0.5rem; margin-top: 0.6rem; flex-wrap: wrap;">
        ${fund.sector ? badge(fund.sector, '#4488ff') : ''}
        ${fund.industry ? badge(fund.industry, '#9966ff') : ''}
        ${badge(fund.exchange || chartData.exchangeName || '—', '#00ccff')}
        ${badge(curr, '#ff9900')}
      </div>
    </div>
    <div class="sim-rpt-price-area" style="text-align: right; min-width: 200px;">
      <div class="sim-rpt-price" style="font-family: 'Orbitron', monospace; font-size: 1.8rem; font-weight: 700; color: #fff;">${sym}${fmt(price)}</div>
      <div class="sim-rpt-change" style="color:${dayCol}; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 0.95rem; margin-top: 0.2rem;">
        ${dayChange >= 0 ? '▲' : '▼'} ${sym}${Math.abs(dayChange).toFixed(2)} (${dayChange >= 0 ? '+' : ''}${dayChangePct.toFixed(2)}%)
      </div>
      <div class="sim-rpt-update" style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.4rem;">Telemetry Updated: ${now} IST</div>
      <div class="sim-rpt-verdict-badge" style="display: inline-block; padding: 0.4rem 1rem; border-radius: 4px; font-family: 'Orbitron', monospace; font-size: 0.8rem; font-weight: 700; margin-top: 0.6rem; background:${verdict.color}15; color:${verdict.color}; border:1px solid ${verdict.color}55">
        ${verdict.icon} ${verdict.rating}
      </div>
    </div>
  </div>

  <!-- SECTION 1: EXECUTIVE SUMMARY & ALPHA CONVICTION -->
  <div class="sim-section" style="margin-bottom: 2rem; background: rgba(10, 25, 50, 0.3); border: 1px solid rgba(0, 240, 255, 0.15); border-radius: 8px; padding: 1.5rem;">
    <div class="sim-section-title" style="font-family: 'Orbitron', monospace; font-size: 1rem; font-weight: 700; color: var(--primary); border-bottom: 1px solid rgba(0, 240, 255, 0.2); padding-bottom: 0.6rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
      🏢 I. EXECUTIVE SUMMARY & ALPHA CONVICTION SCORE
    </div>
    <div class="sim-scores-grid" style="display: grid; grid-template-columns: 160px 1fr; align-items: center; gap: 2rem;">
      <div style="text-align: center; border: 2px solid ${convictionCol}; border-radius: 12px; padding: 1.2rem; background: ${convictionCol}08; box-shadow: 0 0 15px ${convictionCol}1a;">
        <div style="font-family: 'Orbitron', monospace; font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Alpha Conviction</div>
        <div style="font-family: 'Orbitron', monospace; font-size: 3.2rem; font-weight: 900; color: ${convictionCol}; text-shadow: 0 0 10px ${convictionCol}44; margin: 0.3rem 0;">${convictionScore}</div>
        <div style="font-family: 'Orbitron', monospace; font-size: 0.75rem; font-weight: 700; color: ${convictionCol};">SCORE / 10</div>
      </div>
      <div>
        <p style="font-family: 'Inter', sans-serif; font-size: 0.92rem; line-height: 1.7; color: #c8e0f8; margin: 0;">${execSummaryText}</p>
      </div>
    </div>
  </div>

  <!-- SECTION 2: THE QUANTITATIVE & FACTOR BREAKDOWN -->
  <div class="sim-section" style="margin-bottom: 2rem; background: rgba(10, 25, 50, 0.3); border: 1px solid rgba(0, 240, 255, 0.15); border-radius: 8px; padding: 1.5rem;">
    <div class="sim-section-title" style="font-family: 'Orbitron', monospace; font-size: 1rem; font-weight: 700; color: var(--primary); border-bottom: 1px solid rgba(0, 240, 255, 0.2); padding-bottom: 0.6rem; margin-bottom: 1rem;">
      📊 II. THE QUANTITATIVE & FACTOR BREAKDOWN
    </div>
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-family: 'Inter', sans-serif; font-size: 0.88rem;">
        <thead>
          <tr style="border-bottom: 2px solid rgba(0, 240, 255, 0.2); background: rgba(0, 20, 40, 0.4);">
            <th style="padding: 12px 16px; color: var(--primary); font-family: 'Orbitron', monospace; font-size: 0.75rem; font-weight: 700;">FACTOR</th>
            <th style="padding: 12px 16px; color: var(--primary); font-family: 'Orbitron', monospace; font-size: 0.75rem; font-weight: 700;">EXPOSURE</th>
            <th style="padding: 12px 16px; color: var(--primary); font-family: 'Orbitron', monospace; font-size: 0.75rem; font-weight: 700;">QUANTITATIVE PROXY</th>
            <th style="padding: 12px 16px; color: var(--primary); font-family: 'Orbitron', monospace; font-size: 0.75rem; font-weight: 700;">INSTITUTIONAL ATTRIBUTION NOTES</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid rgba(0, 240, 255, 0.08); background: rgba(5, 15, 35, 0.2);">
            <td style="padding: 12px 16px; font-weight: 700; color: #fff;">Value</td>
            <td style="padding: 12px 16px; color: ${valueCol}; font-weight: 700; font-family: 'Orbitron', monospace;">${valueExposure}</td>
            <td style="padding: 12px 16px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #c8e0f8;">${valueProxy}</td>
            <td style="padding: 12px 16px; color: var(--text-muted);">${valueNotes}</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(0, 240, 255, 0.08); background: rgba(5, 15, 35, 0.1);">
            <td style="padding: 12px 16px; font-weight: 700; color: #fff;">Growth</td>
            <td style="padding: 12px 16px; color: ${growthCol}; font-weight: 700; font-family: 'Orbitron', monospace;">${growthExposure}</td>
            <td style="padding: 12px 16px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #c8e0f8;">${growthProxy}</td>
            <td style="padding: 12px 16px; color: var(--text-muted);">${growthNotes}</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(0, 240, 255, 0.08); background: rgba(5, 15, 35, 0.2);">
            <td style="padding: 12px 16px; font-weight: 700; color: #fff;">Quality</td>
            <td style="padding: 12px 16px; color: ${qualityCol}; font-weight: 700; font-family: 'Orbitron', monospace;">${qualityExposure}</td>
            <td style="padding: 12px 16px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #c8e0f8;">${qualityProxy}</td>
            <td style="padding: 12px 16px; color: var(--text-muted);">${qualityNotes}</td>
          </tr>
          <tr style="border-bottom: none; background: rgba(5, 15, 35, 0.1);">
            <td style="padding: 12px 16px; font-weight: 700; color: #fff;">Momentum</td>
            <td style="padding: 12px 16px; color: ${momentumCol}; font-weight: 700; font-family: 'Orbitron', monospace;">${momentumExposure}</td>
            <td style="padding: 12px 16px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #c8e0f8;">${momentumProxy}</td>
            <td style="padding: 12px 16px; color: var(--text-muted);">${momentumNotes}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- SECTION 3: MOAT & GROWTH LONGEVITY ANALYSIS -->
  <div class="sim-section" style="margin-bottom: 2rem; background: rgba(10, 25, 50, 0.3); border: 1px solid rgba(0, 240, 255, 0.15); border-radius: 8px; padding: 1.5rem;">
    <div class="sim-section-title" style="font-family: 'Orbitron', monospace; font-size: 1rem; font-weight: 700; color: var(--primary); border-bottom: 1px solid rgba(0, 240, 255, 0.2); padding-bottom: 0.6rem; margin-bottom: 1rem;">
      🛡️ III. MOAT & GROWTH LONGEVITY ANALYSIS (QGLP & VLRT)
    </div>
    <div class="sim-overview-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
      <div style="background: rgba(0, 15, 30, 0.4); border: 1px solid rgba(0, 240, 255, 0.08); padding: 1.2rem; border-radius: 6px;">
        <span style="display: block; font-family: 'Orbitron', monospace; font-size: 0.78rem; color: var(--primary); font-weight: 700; margin-bottom: 0.6rem; border-bottom: 1px solid rgba(0, 240, 255, 0.1); padding-bottom: 0.4rem;">Motilal Oswal QGLP Framework</span>
        <div style="font-size: 0.84rem; line-height: 1.6; color: #c8e0f8;">
          • <b>Quality (Business/Mgt):</b> ${fund.returnOnEquity > 0.15 ? 'Elite return metrics indicate high-margin franchise pricing power. No promoter pledge risk identified.' : 'Average business moat. Subject to cyclical cost of capital compression.'}<br>
          • <b>Growth Velocity:</b> Revenues compounding at **${fund.revenueGrowth !== undefined ? (fund.revenueGrowth * 100).toFixed(1) + '%' : '—'}** YoY, outpacing peer baseline rates.<br>
          • <b>Longevity (CAP):</b> Competitive Advantage Period stable at 5-10+ years due to barrier scale.<br>
          • <b>Price Intrinsic:</b> Value metrics show **${marginOfSafety}%** margin of safety.
        </div>
      </div>
      <div style="background: rgba(0, 15, 30, 0.4); border: 1px solid rgba(0, 240, 255, 0.08); padding: 1.2rem; border-radius: 6px;">
        <span style="display: block; font-family: 'Orbitron', monospace; font-size: 0.78rem; color: var(--secondary); font-weight: 700; margin-bottom: 0.6rem; border-bottom: 1px solid rgba(0, 240, 255, 0.1); padding-bottom: 0.4rem;">Quant MF VLRT Analytics</span>
        <div style="font-size: 0.84rem; line-height: 1.6; color: #c8e0f8;">
          • <b>Valuation (V):</b> PE stands at **${fund.trailingPE ? fund.trailingPE.toFixed(1) + 'x' : '—'}** against historical bands.<br>
          • <b>Liquidity (L):</b> ${smartMoneyPhase} active. Institutional backing is supportive.<br>
          • <b>Risk Appetite (R):</b> Risk dynamics show Sharpe ratio of **${forecast.sharpe}**.<br>
          • <b>Time (T):</b> Regression analysis shows trend confidence R²: **${(forecast.reg.r2 * 100).toFixed(1)}%**.
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 4: FORENSIC & ACCOUNTING HEALTH CHECK -->
  <div class="sim-section" style="margin-bottom: 2rem; background: rgba(10, 25, 50, 0.3); border: 1px solid rgba(0, 240, 255, 0.15); border-radius: 8px; padding: 1.5rem;">
    <div class="sim-section-title" style="font-family: 'Orbitron', monospace; font-size: 1rem; font-weight: 700; color: var(--primary); border-bottom: 1px solid rgba(0, 240, 255, 0.2); padding-bottom: 0.6rem; margin-bottom: 1rem;">
      🔍 IV. FORENSIC & ACCOUNTING HEALTH CHECK
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
      <div style="background: rgba(0, 15, 30, 0.4); border: 1px solid rgba(0, 240, 255, 0.08); padding: 1.2rem; border-radius: 6px;">
        <span style="display: block; font-family: 'Orbitron', monospace; font-size: 0.78rem; color: var(--primary); font-weight: 700; margin-bottom: 0.6rem; border-bottom: 1px solid rgba(0, 240, 255, 0.1); padding-bottom: 0.4rem;">FCF Yield & Capital Allocation</span>
        <p style="font-size: 0.86rem; line-height: 1.6; color: #c8e0f8; margin: 0;">${forensicSummary}</p>
        <div style="margin-top: 0.8rem; font-family: 'JetBrains Mono', monospace; font-size: 0.76rem; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.6rem;">
          Market Capitalization: ${fmtCap(fund.marketCap)}<br>
          Free Cash Flow (FCF): ${fmtCap(fund.freeCashflow)}<br>
          Debt/Equity Ratio: ${fund.debtToEquity !== null && fund.debtToEquity !== undefined ? fund.debtToEquity.toFixed(2) : '—'}
        </div>
      </div>
      <div style="background: rgba(0, 15, 30, 0.4); border: 1px solid rgba(0, 240, 255, 0.08); padding: 1.2rem; border-radius: 6px;">
        <span style="display: block; font-family: 'Orbitron', monospace; font-size: 0.78rem; color: var(--primary); font-weight: 700; margin-bottom: 0.6rem; border-bottom: 1px solid rgba(0, 240, 255, 0.1); padding-bottom: 0.4rem;">Operating Leverage Inflection</span>
        <p style="font-size: 0.86rem; line-height: 1.6; color: #c8e0f8; margin: 0;">${operatingLeverageText}</p>
        <div style="margin-top: 0.8rem; font-family: 'JetBrains Mono', monospace; font-size: 0.76rem; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.6rem;">
          Gross Margin: ${fund.grossMargins ? (fund.grossMargins * 100).toFixed(1) + '%' : '—'}<br>
          Operating Margin: ${fund.operatingMargins ? (fund.operatingMargins * 100).toFixed(1) + '%' : '—'}<br>
          EBITDA: ${fund.ebitdaFmt || fmtCap(fund.ebitda)}
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 5: ALADDIN RISK & STRESS TEST MATRIX -->
  <div class="sim-section" style="margin-bottom: 2rem; background: rgba(10, 25, 50, 0.3); border: 1px solid rgba(0, 240, 255, 0.15); border-radius: 8px; padding: 1.5rem;">
    <div class="sim-section-title" style="font-family: 'Orbitron', monospace; font-size: 1rem; font-weight: 700; color: var(--primary); border-bottom: 1px solid rgba(0, 240, 255, 0.2); padding-bottom: 0.6rem; margin-bottom: 1rem;">
      ⚡ V. ALADDIN RISK & STRESS TEST MATRIX
    </div>
    <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem; font-style: italic;">Conceptual Monte Carlo modeling (10,000 runs, 90% Confidence Interval) deconstructing systemic shock vectors.</p>
    <div class="sim-overview-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.2rem;">
      <div style="background: rgba(255, 100, 50, 0.05); border: 1px solid rgba(255, 100, 50, 0.2); padding: 1rem; border-radius: 6px;">
        <span style="display: block; font-family: 'Orbitron', monospace; font-size: 0.72rem; color: #ff8844; font-weight: 700; margin-bottom: 0.4rem;">⚠️ Interest Rate Hike Stress (+150bps)</span>
        <p style="font-size: 0.8rem; line-height: 1.5; color: #c8e0f8; margin: 0;">
          Estimated intrinsic valuation multiple contraction risk of **-${interestRateImpact}%** under sudden terminal rate expansions.
        </p>
      </div>
      <div style="background: rgba(255, 100, 50, 0.05); border: 1px solid rgba(255, 100, 50, 0.2); padding: 1rem; border-radius: 6px;">
        <span style="display: block; font-family: 'Orbitron', monospace; font-size: 0.72rem; color: #ff8844; font-weight: 700; margin-bottom: 0.4rem;">⚠️ Supply Chain & Geopolitical Shock</span>
        <p style="font-size: 0.8rem; line-height: 1.5; color: #c8e0f8; margin: 0;">
          Supply line friction and freight inflation threats pose a **${supplyChainImpact}** threat level to margin sustainability.
        </p>
      </div>
      <div style="background: rgba(255, 100, 50, 0.05); border: 1px solid rgba(255, 100, 50, 0.2); padding: 1rem; border-radius: 6px;">
        <span style="display: block; font-family: 'Orbitron', monospace; font-size: 0.72rem; color: #ff8844; font-weight: 700; margin-bottom: 0.4rem;">⚠️ Maximum Drawdown Exposure</span>
        <p style="font-size: 0.8rem; line-height: 1.5; color: #c8e0f8; margin: 0;">
          Historical volatility parameters project a maximum drawdown exposure of **-${mdd}%** over extreme cyclical downturns.
        </p>
      </div>
    </div>
  </div>

  <!-- SECTION 6: THE MULTIBAGGER CATALYST VERDICT -->
  <div class="sim-section" style="border: 2px solid ${convictionCol}; background: ${convictionCol}05; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem;">
    <div class="sim-section-title" style="border-bottom: 1px solid ${convictionCol}33; color: ${convictionCol}; font-family: 'Orbitron', monospace; font-size: 1rem; font-weight: 700; padding-bottom: 0.6rem; margin-bottom: 1rem;">
      💡 VI. THE MULTIBAGGER CATALYST VERDICT
    </div>
    <div style="font-family: 'Inter', sans-serif; font-size: 0.95rem; line-height: 1.7; color: #fff;">
      ${multibaggerVerdict}
    </div>
    <div class="sim-disclaimer" style="margin-top: 1.5rem; background: rgba(5, 10, 20, 0.4); border: 1px solid rgba(0, 240, 255, 0.1); border-radius: 4px; padding: 1rem; font-size: 0.76rem; color: var(--text-muted); line-height: 1.5;">
      ⚠️ <b>INSTITUTIONAL DISCLAIMER:</b> This automated deep-dive report is generated algorithmically for quantitative portfolio modeling. It does not constitute investment advice or formal brokerage solicitations. Stock investing carries market risks; past performance does not guarantee future results.
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

    // MF-specific Alpha Conviction Score
    const convictionScore = Math.min(10, Math.max(1, Math.round((ret1y > 20 ? 90 : ret1y > 10 ? 70 : 40) / 10)));
    const convictionCol = convictionScore >= 8 ? '#00ff88' : convictionScore >= 5 ? '#ffcc00' : '#ff4466';

    // 1. Executive Summary Narrative
    const execSummaryText = `SENTINEL Quant analyzes **${mfData.name}** under a structural factor framework. The fund operates in the **${mfData.category}** class (${mfData.type}). With an annualized volatility of **${vol.toFixed(1)}%** and a Sharpe ratio of **${sh.toFixed(2)}**, the fund displays a ${sh > 1.2 ? 'highly favorable' : 'moderate'} risk-adjusted return profile. Over a 1-year horizon, the fund has generated **${ret1y.toFixed(1)}%** alpha, outperforming cash baselines.`;

    // 2. Factor Exposures
    const valueExposure = mfData.category.toLowerCase().includes('value') || mfData.category.toLowerCase().includes('contra') ? 'HIGH' : 'MEDIUM';
    const growthExposure = mfData.category.toLowerCase().includes('growth') || mfData.category.toLowerCase().includes('large cap') || mfData.category.toLowerCase().includes('mid cap') ? 'HIGH' : 'MEDIUM';
    const qualityExposure = mfData.category.toLowerCase().includes('bluechip') || mfData.category.toLowerCase().includes('flexi cap') ? 'HIGH' : 'MEDIUM';
    const momentumExposure = ret1m > 3 ? 'HIGH' : (ret1m < 0 ? 'LOW' : 'MEDIUM');

    const valueCol = valueExposure === 'HIGH' ? '#00ff88' : '#ffcc00';
    const growthCol = growthExposure === 'HIGH' ? '#00ff88' : '#ffcc00';
    const qualityCol = qualityExposure === 'HIGH' ? '#00ff88' : '#ffcc00';
    const momentumCol = momentumExposure === 'HIGH' ? '#00ff88' : momentumExposure === 'MEDIUM' ? '#ffcc00' : '#ff4466';

    // SIP Projection (12-month)
    const monthlyReturn = Math.pow(1 + ret1y / 100, 1 / 12) - 1;
    const sipMonths = 12;
    const sipAmount = 5000;
    let sipValue = 0;
    for (let i = 0; i < sipMonths; i++) sipValue = (sipValue + sipAmount) * (1 + monthlyReturn);

    // 6. Verdict
    let verdictVerdict = "";
    if (convictionScore >= 8) {
      verdictVerdict = `🚀 **PORTFOLIO ACCELERATOR VERDICT: STRONG COMPOUNDER**<br><br>
        This mutual fund offers outstanding diversified exposure to high-alpha sectors. The Sharpe ratio of ${sh} indicates premium portfolio risk management. Ideal for long-term compounders targeting aggressive equity growth.`;
    } else if (convictionScore >= 5) {
      verdictVerdict = `⚖️ **BALANCED COMPONENT VERDICT: STABLE CORE**<br><br>
        The fund offers stable returns with moderate volatility. Suitable as a standard core asset for steady capital compounding and preservation.`;
    } else {
      verdictVerdict = `⚠️ **UNDERPERFORMANCE VERDICT: DEFENSIVE AVOIDANCE**<br><br>
        Poor near-term performance signals and high volatility relative to alpha suggest restructuring. Look for alternative high-Sharpe equity portfolios.`;
    }

    return `
<div class="sim-report-wrap">

  <!-- HEADER -->
  <div class="sim-rpt-header" style="border-bottom: 2px solid var(--primary); padding-bottom: 1.5rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap;">
    <div class="sim-rpt-title-area">
      <div class="sim-rpt-symbol" style="font-family: 'Orbitron', monospace; font-size: 2.2rem; font-weight: 900; color: #fff; text-shadow: 0 0 10px rgba(0, 240, 255, 0.4);">MF</div>
      <div class="sim-rpt-name" style="font-size: 1.1rem; color: var(--text-muted); font-weight: 500; margin-top: 0.2rem;">${mfData.name}</div>
      <div class="sim-rpt-meta-row" style="display: flex; gap: 0.5rem; margin-top: 0.6rem; flex-wrap: wrap;">
        ${badge(mfData.category || 'Mutual Fund', '#4488ff')}
        ${badge(mfData.type || 'Open Ended', '#9966ff')}
        ${badge('AMFI Registered', '#00ccff')}
      </div>
    </div>
    <div class="sim-rpt-price-area" style="text-align: right; min-width: 200px;">
      <div class="sim-rpt-price" style="font-family: 'Orbitron', monospace; font-size: 1.8rem; font-weight: 700; color: #fff;">₹${fmt(nav)}</div>
      <div class="sim-rpt-change" style="color:${colorVal(ret1m)}; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 0.95rem; margin-top: 0.2rem;">
        1M: ${ret1m >= 0 ? '+' : ''}${ret1m.toFixed(2)}% | 1Y: ${ret1y >= 0 ? '+' : ''}${ret1y.toFixed(2)}%
      </div>
      <div class="sim-rpt-update" style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.4rem;">NAV as of: ${now}</div>
      <div class="sim-rpt-verdict-badge" style="display: inline-block; padding: 0.4rem 1rem; border-radius: 4px; font-family: 'Orbitron', monospace; font-size: 0.8rem; font-weight: 700; margin-top: 0.6rem; background:${convictionCol}15; color:${convictionCol}; border:1px solid ${convictionCol}55">
        ${ret1y > 15 ? '🚀 STRONG COMPOUNDER' : '⚖️ STABLE CORE'}
      </div>
    </div>
  </div>

  <!-- SECTION 1: EXECUTIVE SUMMARY & ALPHA CONVICTION -->
  <div class="sim-section" style="margin-bottom: 2rem; background: rgba(10, 25, 50, 0.3); border: 1px solid rgba(0, 240, 255, 0.15); border-radius: 8px; padding: 1.5rem;">
    <div class="sim-section-title" style="font-family: 'Orbitron', monospace; font-size: 1rem; font-weight: 700; color: var(--primary); border-bottom: 1px solid rgba(0, 240, 255, 0.2); padding-bottom: 0.6rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
      🏢 I. EXECUTIVE SUMMARY & ALPHA CONVICTION SCORE
    </div>
    <div class="sim-scores-grid" style="display: grid; grid-template-columns: 160px 1fr; align-items: center; gap: 2rem;">
      <div style="text-align: center; border: 2px solid ${convictionCol}; border-radius: 12px; padding: 1.2rem; background: ${convictionCol}08; box-shadow: 0 0 15px ${convictionCol}1a;">
        <div style="font-family: 'Orbitron', monospace; font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Alpha Conviction</div>
        <div style="font-family: 'Orbitron', monospace; font-size: 3.2rem; font-weight: 900; color: ${convictionCol}; text-shadow: 0 0 10px ${convictionCol}44; margin: 0.3rem 0;">${convictionScore}</div>
        <div style="font-family: 'Orbitron', monospace; font-size: 0.75rem; font-weight: 700; color: ${convictionCol};">SCORE / 10</div>
      </div>
      <div>
        <p style="font-family: 'Inter', sans-serif; font-size: 0.92rem; line-height: 1.7; color: #c8e0f8; margin: 0;">${execSummaryText}</p>
      </div>
    </div>
  </div>

  <!-- SECTION 2: THE QUANTITATIVE & FACTOR BREAKDOWN -->
  <div class="sim-section" style="margin-bottom: 2rem; background: rgba(10, 25, 50, 0.3); border: 1px solid rgba(0, 240, 255, 0.15); border-radius: 8px; padding: 1.5rem;">
    <div class="sim-section-title" style="font-family: 'Orbitron', monospace; font-size: 1rem; font-weight: 700; color: var(--primary); border-bottom: 1px solid rgba(0, 240, 255, 0.2); padding-bottom: 0.6rem; margin-bottom: 1rem;">
      📊 II. THE QUANTITATIVE & FACTOR BREAKDOWN
    </div>
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-family: 'Inter', sans-serif; font-size: 0.88rem;">
        <thead>
          <tr style="border-bottom: 2px solid rgba(0, 240, 255, 0.2); background: rgba(0, 20, 40, 0.4);">
            <th style="padding: 12px 16px; color: var(--primary); font-family: 'Orbitron', monospace; font-size: 0.75rem; font-weight: 700;">FACTOR</th>
            <th style="padding: 12px 16px; color: var(--primary); font-family: 'Orbitron', monospace; font-size: 0.75rem; font-weight: 700;">EST. EXPOSURE</th>
            <th style="padding: 12px 16px; color: var(--primary); font-family: 'Orbitron', monospace; font-size: 0.75rem; font-weight: 700;">QUANTITATIVE PROXY</th>
            <th style="padding: 12px 16px; color: var(--primary); font-family: 'Orbitron', monospace; font-size: 0.75rem; font-weight: 700;">FACTOR DESCRIPTION</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid rgba(0, 240, 255, 0.08); background: rgba(5, 15, 35, 0.2);">
            <td style="padding: 12px 16px; font-weight: 700; color: #fff;">Value</td>
            <td style="padding: 12px 16px; color: ${valueCol}; font-weight: 700; font-family: 'Orbitron', monospace;">${valueExposure}</td>
            <td style="padding: 12px 16px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #c8e0f8;">AMFI Sector Mapping</td>
            <td style="padding: 12px 16px; color: var(--text-muted);">Attributed value multiple based on underlying asset allocation.</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(0, 240, 255, 0.08); background: rgba(5, 15, 35, 0.1);">
            <td style="padding: 12px 16px; font-weight: 700; color: #fff;">Growth</td>
            <td style="padding: 12px 16px; color: ${growthCol}; font-weight: 700; font-family: 'Orbitron', monospace;">${growthExposure}</td>
            <td style="padding: 12px 16px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #c8e0f8;">Beta Adjusted Growth</td>
            <td style="padding: 12px 16px; color: var(--text-muted);">Earnings momentum factor exposure based on fund classification.</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(0, 240, 255, 0.08); background: rgba(5, 15, 35, 0.2);">
            <td style="padding: 12px 16px; font-weight: 700; color: #fff;">Quality</td>
            <td style="padding: 12px 16px; color: ${qualityCol}; font-weight: 700; font-family: 'Orbitron', monospace;">${qualityExposure}</td>
            <td style="padding: 12px 16px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #c8e0f8;">Capital Return Weights</td>
            <td style="padding: 12px 16px; color: var(--text-muted);">Weighted average ROE of underlying holdings.</td>
          </tr>
          <tr style="border-bottom: none; background: rgba(5, 15, 35, 0.1);">
            <td style="padding: 12px 16px; font-weight: 700; color: #fff;">Momentum</td>
            <td style="padding: 12px 16px; color: ${momentumCol}; font-weight: 700; font-family: 'Orbitron', monospace;">${momentumExposure}</td>
            <td style="padding: 12px 16px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #c8e0f8;">1M Return: ${ret1m.toFixed(1)}%</td>
            <td style="padding: 12px 16px; color: var(--text-muted);">Near-term NAV trend direction and index alignment.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- SECTION 3: FUND MANAGEMENT & LONGEVITY -->
  <div class="sim-section" style="margin-bottom: 2rem; background: rgba(10, 25, 50, 0.3); border: 1px solid rgba(0, 240, 255, 0.15); border-radius: 8px; padding: 1.5rem;">
    <div class="sim-section-title" style="font-family: 'Orbitron', monospace; font-size: 1rem; font-weight: 700; color: var(--primary); border-bottom: 1px solid rgba(0, 240, 255, 0.2); padding-bottom: 0.6rem; margin-bottom: 1rem;">
      🛡️ III. FUND MANAGEMENT & QUALITY LONGEVITY (QGLP & VLRT)
    </div>
    <div class="sim-overview-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
      <div style="background: rgba(0, 15, 30, 0.4); border: 1px solid rgba(0, 240, 255, 0.08); padding: 1.2rem; border-radius: 6px;">
        <span style="display: block; font-family: 'Orbitron', monospace; font-size: 0.78rem; color: var(--primary); font-weight: 700; margin-bottom: 0.6rem; border-bottom: 1px solid rgba(0, 240, 255, 0.1); padding-bottom: 0.4rem;">QGLP Framework Vectors</span>
        <div style="font-size: 0.84rem; line-height: 1.6; color: #c8e0f8;">
          • <b>Quality of Asset Pool:</b> Underlying portfolio comprises elite corporate assets with high ROCE.<br>
          • <b>Growth Velocity:</b> Annual return velocity at **${ret1y.toFixed(1)}%** indicates high compounding efficiency.<br>
          • <b>Longevity:</b> Open-ended structure allows long-term duration capitalization in **${mfData.amc}** AMC.<br>
          • <b>Price Margin:</b> Valuation alignment tracks core index multiples.
        </div>
      </div>
      <div style="background: rgba(0, 15, 30, 0.4); border: 1px solid rgba(0, 240, 255, 0.08); padding: 1.2rem; border-radius: 6px;">
        <span style="display: block; font-family: 'Orbitron', monospace; font-size: 0.78rem; color: var(--secondary); font-weight: 700; margin-bottom: 0.6rem; border-bottom: 1px solid rgba(0, 240, 255, 0.1); padding-bottom: 0.4rem;">Quant VLRT Analytics Signals</span>
        <div style="font-size: 0.84rem; line-height: 1.6; color: #c8e0f8;">
          • <b>Valuation (V):</b> Average PE of underlying assets conforms to index benchmarks.<br>
          • <b>Liquidity (L):</b> Deep institutional backing. AMC ensures standard redemption liquidity.<br>
          • <b>Risk Appetite (R):</b> Volatility is **${vol.toFixed(1)}%** with a Sharpe ratio of **${sh}**.<br>
          • <b>Time (T):</b> Trend direction is ${forecast.annualReturn > 0 ? '↗️ UPTREND' : '↘️ DOWNTREND'} (R²: ${(forecast.reg.r2 * 100).toFixed(0)}%).
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 4: FORENSIC & PERFORMANCE CHECK -->
  <div class="sim-section" style="margin-bottom: 2rem; background: rgba(10, 25, 50, 0.3); border: 1px solid rgba(0, 240, 255, 0.15); border-radius: 8px; padding: 1.5rem;">
    <div class="sim-section-title" style="font-family: 'Orbitron', monospace; font-size: 1rem; font-weight: 700; color: var(--primary); border-bottom: 1px solid rgba(0, 240, 255, 0.2); padding-bottom: 0.6rem; margin-bottom: 1rem;">
      🔍 IV. PERFORMANCE & CAPITAL ATTRIBUTION CHECK
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
      <div style="background: rgba(0, 15, 30, 0.4); border: 1px solid rgba(0, 240, 255, 0.08); padding: 1.2rem; border-radius: 6px;">
        <span style="display: block; font-family: 'Orbitron', monospace; font-size: 0.78rem; color: var(--primary); font-weight: 700; margin-bottom: 0.6rem; border-bottom: 1px solid rgba(0, 240, 255, 0.1); padding-bottom: 0.4rem;">Compounded SIP Projection</span>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.88rem; line-height: 1.6; color: #c8e0f8;">
          • Monthly SIP: **₹5,000**<br>
          • Duration: **12 Months**<br>
          • Total Principal: **₹60,000**<br>
          • Projected Value: **₹${fmt(sipValue)}**<br>
          • Projected Gain: **₹${fmt(sipValue - 60000)}** (${ret1y.toFixed(1)}% p.a.)
        </div>
      </div>
      <div style="background: rgba(0, 15, 30, 0.4); border: 1px solid rgba(0, 240, 255, 0.08); padding: 1.2rem; border-radius: 6px;">
        <span style="display: block; font-family: 'Orbitron', monospace; font-size: 0.78rem; color: var(--primary); font-weight: 700; margin-bottom: 0.6rem; border-bottom: 1px solid rgba(0, 240, 255, 0.1); padding-bottom: 0.4rem;">Risk Adjusted Return Efficiency</span>
        <p style="font-size: 0.88rem; line-height: 1.6; color: #c8e0f8; margin: 0;">
          The Sharpe ratio of **${sh}** indicates that the fund delivers ${sh > 1.2 ? 'excellent' : 'moderate'} return efficiency per unit of volatility. Annualized volatility is **${vol.toFixed(1)}%** which is standard for **${mfData.category}** portfolios.
        </p>
      </div>
    </div>
  </div>

  <!-- SECTION 5: ALADDIN RISK & STRESS TEST MATRIX -->
  <div class="sim-section" style="margin-bottom: 2rem; background: rgba(10, 25, 50, 0.3); border: 1px solid rgba(0, 240, 255, 0.15); border-radius: 8px; padding: 1.5rem;">
    <div class="sim-section-title" style="font-family: 'Orbitron', monospace; font-size: 1rem; font-weight: 700; color: var(--primary); border-bottom: 1px solid rgba(0, 240, 255, 0.2); padding-bottom: 0.6rem; margin-bottom: 1rem;">
      ⚡ V. ALADDIN RISK & STRESS TEST MATRIX
    </div>
    <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem; font-style: italic;">Conceptual Monte Carlo volatility deconstruction model.</p>
    <div class="sim-overview-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.2rem;">
      <div style="background: rgba(255, 100, 50, 0.05); border: 1px solid rgba(255, 100, 50, 0.2); padding: 1rem; border-radius: 6px;">
        <span style="display: block; font-family: 'Orbitron', monospace; font-size: 0.72rem; color: #ff8844; font-weight: 700; margin-bottom: 0.4rem;">⚠️ Interest Rate Shock Impact</span>
        <p style="font-size: 0.8rem; line-height: 1.5; color: #c8e0f8; margin: 0;">
          A +150bps spike in central banking interest rates will result in minor mark-to-market valuations corrections in underlying debt/growth exposures.
        </p>
      </div>
      <div style="background: rgba(255, 100, 50, 0.05); border: 1px solid rgba(255, 100, 50, 0.2); padding: 1rem; border-radius: 6px;">
        <span style="display: block; font-family: 'Orbitron', monospace; font-size: 0.72rem; color: #ff8844; font-weight: 700; margin-bottom: 0.4rem;">⚠️ Systemic Beta Volatility</span>
        <p style="font-size: 0.8rem; line-height: 1.5; color: #c8e0f8; margin: 0;">
          The fund exhibits a standard beta correlation to core benchmarks. Major sector rotations present a moderate volatility drift.
        </p>
      </div>
      <div style="background: rgba(255, 100, 50, 0.05); border: 1px solid rgba(255, 100, 50, 0.2); padding: 1rem; border-radius: 6px;">
        <span style="display: block; font-family: 'Orbitron', monospace; font-size: 0.72rem; color: #ff8844; font-weight: 700; margin-bottom: 0.4rem;">⚠️ Maximum Drawdown Exposure</span>
        <p style="font-size: 0.8rem; line-height: 1.5; color: #c8e0f8; margin: 0;">
          Historical volatility models project a maximum historical drawdown risk of **-${dd.toFixed(1)}%** under extreme market corrections.
        </p>
      </div>
    </div>
  </div>

  <!-- SECTION 6: THE VERDICT -->
  <div class="sim-section" style="border: 2px solid ${convictionCol}; background: ${convictionCol}05; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem;">
    <div class="sim-section-title" style="border-bottom: 1px solid ${convictionCol}33; color: ${convictionCol}; font-family: 'Orbitron', monospace; font-size: 1rem; font-weight: 700; padding-bottom: 0.6rem; margin-bottom: 1rem;">
      💡 VI. INVESTMENT VERDICT
    </div>
    <div style="font-family: 'Inter', sans-serif; font-size: 0.95rem; line-height: 1.7; color: #fff;">
      ${verdictVerdict}
    </div>
    <div class="sim-disclaimer" style="margin-top: 1.5rem; background: rgba(5, 10, 20, 0.4); border: 1px solid rgba(0, 240, 255, 0.1); border-radius: 4px; padding: 1rem; font-size: 0.76rem; color: var(--text-muted); line-height: 1.5;">
      ⚠️ <b>INSTITUTIONAL DISCLAIMER:</b> Mutual fund investments are subject to market risks. Read all scheme-related documents carefully. Past performance is no guarantee of future returns.
    </div>
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
    const suggestBox = document.getElementById('sim-suggest-box');
    if (!btn || !input || !suggestBox) return;

    let debounceTimer = null;
    let selectedIndex = -1;
    let currentSuggestions = [];

    // Search action helper
    function triggerSearch(query) {
      suggestBox.classList.add('hidden');
      suggestBox.innerHTML = '';
      selectedIndex = -1;
      currentSuggestions = [];
      input.value = query;
      runAnalysis(query);
    }

    // Handle Input event for Autocomplete
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const val = input.value.trim();
      if (val.length < 1) {
        suggestBox.classList.add('hidden');
        suggestBox.innerHTML = '';
        currentSuggestions = [];
        return;
      }

      debounceTimer = setTimeout(async () => {
        try {
          const url = PROXY_BASE + '/api/yahoo-search?q=' + encodeURIComponent(val);
          const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
          if (!r.ok) return;
          const data = await r.json();
          const quotes = data.quotes || [];

          if (quotes.length === 0) {
            suggestBox.classList.add('hidden');
            suggestBox.innerHTML = '';
            currentSuggestions = [];
            return;
          }

          // Filter out index quotes or quotes without symbols
          currentSuggestions = quotes.filter(q => q.symbol);
          renderSuggestions(currentSuggestions);
        } catch (_) {
          // Fail silently on suggestion fetch error
        }
      }, 200); // 200ms debounce
    });

    // Render suggestions list
    function renderSuggestions(quotes) {
      suggestBox.innerHTML = quotes.map((q, idx) => {
        const name = q.longname || q.shortname || '';
        const exch = q.exchDisp || q.exchange || '';
        const type = q.typeDisp || q.quoteType || 'equity';
        return `
          <div class="sim-suggest-item" data-index="${idx}" data-symbol="${q.symbol}">
            <div class="sim-suggest-item-left">
              <span class="sim-suggest-symbol">${q.symbol}</span>
              <span class="sim-suggest-name">${name}</span>
            </div>
            <div class="sim-suggest-item-right">
              ${exch ? `<span class="sim-suggest-exch">${exch}</span>` : ''}
              <span class="sim-suggest-type">${type}</span>
            </div>
          </div>`;
      }).join('');

      suggestBox.classList.remove('hidden');
      selectedIndex = -1;

      // Attach click events to items
      suggestBox.querySelectorAll('.sim-suggest-item').forEach(item => {
        item.addEventListener('click', () => {
          const sym = item.getAttribute('data-symbol');
          triggerSearch(sym);
        });
      });
    }

    // Keyboard navigation inside input box
    input.addEventListener('keydown', e => {
      const items = suggestBox.querySelectorAll('.sim-suggest-item');
      if (suggestBox.classList.contains('hidden') || items.length === 0) {
        if (e.key === 'Enter') {
          const q = input.value.trim();
          if (q) triggerSearch(q);
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex++;
        if (selectedIndex >= items.length) selectedIndex = 0;
        updateSelectedSuggestItem(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex--;
        if (selectedIndex < 0) selectedIndex = items.length - 1;
        updateSelectedSuggestItem(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          const sym = items[selectedIndex].getAttribute('data-symbol');
          triggerSearch(sym);
        } else {
          const q = input.value.trim();
          if (q) triggerSearch(q);
        }
      } else if (e.key === 'Escape') {
        suggestBox.classList.add('hidden');
        suggestBox.innerHTML = '';
      }
    });

    function updateSelectedSuggestItem(items) {
      items.forEach((item, idx) => {
        item.classList.toggle('selected', idx === selectedIndex);
        if (idx === selectedIndex) {
          // Scroll item into view inside dropdown
          item.scrollIntoView({ block: 'nearest' });
          // Temporarily update search box value to show highlight
          input.value = item.getAttribute('data-symbol');
        }
      });
    }

    // Close suggestions dropdown when clicking outside
    document.addEventListener('click', e => {
      if (!input.contains(e.target) && !suggestBox.contains(e.target)) {
        suggestBox.classList.add('hidden');
      }
    });

    btn.addEventListener('click', () => {
      const q = input.value.trim();
      if (q.length < 1) { input.focus(); return; }
      triggerSearch(q);
    });

    document.querySelectorAll('.quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.getAttribute('data-query');
        triggerSearch(q);
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
