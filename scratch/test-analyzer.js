import puppeteer from 'puppeteer';

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Capture page errors
  page.on('pageerror', err => {
    console.error('PAGE ERROR:', err.toString());
    process.exit(1);
  });

  console.log("Navigating to local site...");
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  
  // Switch to AI Analyzer tab if needed, wait, runAnalysis does it or we can run it directly
  console.log("Testing Stock search: RELIANCE...");
  await page.evaluate(async () => {
    window.runSimulatorSymbol('RELIANCE');
  });

  // Wait 4 seconds for analysis and rendering
  console.log("Waiting for stock chart to render...");
  await new Promise(resolve => setTimeout(resolve, 4000));

  // Check if chart container exists in DOM
  const stockChartExists = await page.evaluate(() => {
    const container = document.querySelector('.analyzer-chart-container');
    const mainChart = container ? container.querySelector('[id^="analyzer-main-chart-"]') : null;
    return !!container && !!mainChart;
  });

  console.log(`VERIFICATION - Stock chart container rendered: ${stockChartExists}`);
  if (!stockChartExists) {
    throw new Error('Stock chart failed to render in AI Analyzer!');
  }

  // Get the unique ID from the container
  const uniqueId = await page.evaluate(() => {
    const container = document.querySelector('.analyzer-chart-container');
    return container ? container.getAttribute('data-unique-id') : null;
  });
  console.log(`Found unique ID: ${uniqueId}`);

  // Test Indicators toggle
  console.log("Testing indicators toggles...");
  await page.evaluate((uid) => {
    window.toggleAnalyzerIndicator(uid, 'sma');
  }, uniqueId);
  await new Promise(resolve => setTimeout(resolve, 500));

  await page.evaluate((uid) => {
    window.toggleAnalyzerIndicator(uid, 'ema');
  }, uniqueId);
  await new Promise(resolve => setTimeout(resolve, 500));

  await page.evaluate((uid) => {
    window.toggleAnalyzerIndicator(uid, 'rsi');
  }, uniqueId);
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check if RSI split is applied
  const rsiApplied = await page.evaluate((uid) => {
    const rsiDiv = document.getElementById("analyzer-rsi-chart-" + uid);
    return rsiDiv && rsiDiv.style.display === 'block' && rsiDiv.style.height === '30%';
  }, uniqueId);
  console.log(`VERIFICATION - RSI split applied: ${rsiApplied}`);
  if (!rsiApplied) {
    throw new Error('RSI split pane failed to render!');
  }

  // Test style switcher
  console.log("Testing style switcher...");
  await page.evaluate((uid) => {
    window.toggleAnalyzerChartStyle(uid);
  }, uniqueId);
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test Mutual Fund search
  console.log("Testing Mutual Fund search: Parag Parikh...");
  await page.evaluate(async () => {
    window.runSimulatorSymbol('Parag Parikh');
  });

  // Wait 4 seconds for mutual fund data and chart rendering
  console.log("Waiting for Mutual Fund chart to render...");
  await new Promise(resolve => setTimeout(resolve, 4000));

  // Check if mutual fund chart container exists in DOM (should be the top prepended one)
  const mfChartExists = await page.evaluate(() => {
    const containers = document.querySelectorAll('.analyzer-chart-container');
    // First container should be SBI Blue Chip MF (prepended)
    const container = containers[0];
    const mainChart = container ? container.querySelector('[id^="analyzer-main-chart-"]') : null;
    return !!container && !!mainChart && !isNaN(container.getAttribute('data-symbol'));
  });

  console.log(`VERIFICATION - MF chart container rendered: ${mfChartExists}`);
  if (!mfChartExists) {
    throw new Error('Mutual Fund chart failed to render in AI Analyzer!');
  }

  console.log("Closing browser...");
  await browser.close();
  console.log("Test successfully passed!");
  process.exit(0);
})().catch(err => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
