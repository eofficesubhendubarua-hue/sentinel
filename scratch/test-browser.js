import puppeteer from 'puppeteer';

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Capture page errors
  page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));

  console.log("Navigating to local site...");
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  
  console.log("Opening chart modal via page.evaluate...");
  await page.evaluate(() => {
    openChartModal('TMPV.NS', 'Tata Motors Pass Veh Ltd');
  });

  // Wait 3 seconds for data to fetch and charts to render
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log("Checking LTP and Legend contents...");
  const ltpText = await page.evaluate(() => {
    return document.getElementById('chart-ltp-container')?.innerText;
  });
  const changeText = await page.evaluate(() => {
    return document.getElementById('chart-change-container')?.innerText;
  });
  const legendOpen = await page.evaluate(() => {
    return document.getElementById('legend-open')?.innerText;
  });
  console.log(`VERIFICATION - LTP: ${ltpText}, Change: ${changeText}, Open Price in Legend: ${legendOpen}`);

  if (ltpText === '—' || legendOpen === '—') {
    throw new Error('LTP or Legend failed to populate!');
  }
  
  console.log("Testing Toggle SMA Indicator...");
  await page.evaluate(() => {
    toggleIndicator('sma');
  });
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log("Testing Toggle RSI Split Pane...");
  await page.evaluate(() => {
    toggleIndicator('rsi');
  });
  await new Promise(resolve => setTimeout(resolve, 2000));

  const rsiHeight = await page.evaluate(() => {
    const el = document.getElementById('rsi-chart-container');
    return {
      display: el?.style.display,
      height: el?.style.height
    };
  });
  console.log(`VERIFICATION - RSI Sub-pane Style: display=${rsiHeight.display}, height=${rsiHeight.height}`);

  if (rsiHeight.display !== 'block' || rsiHeight.height !== '30%') {
    throw new Error('RSI Sub-pane layout resizing failed!');
  }

  console.log("Closing browser...");
  await browser.close();
  console.log("Test successfully passed!");
})();
