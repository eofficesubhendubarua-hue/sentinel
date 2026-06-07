import puppeteer from 'puppeteer';

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));

  console.log("Navigating...");
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  
  console.log("Running simulation...");
  await page.evaluate(() => {
    window.runSimulatorSymbol('RELIANCE');
  });

  console.log("Waiting 5s...");
  await new Promise(resolve => setTimeout(resolve, 5000));

  const debugInfo = await page.evaluate(() => {
    const errorEl = document.getElementById('sim-error');
    const errorMsg = document.getElementById('sim-error-msg')?.innerText;
    const steps = document.getElementById('sim-loading-steps')?.innerHTML;
    const container = document.querySelector('.analyzer-chart-container');
    
    return {
      errorVisible: errorEl ? !errorEl.classList.contains('hidden') : null,
      errorMsg,
      steps,
      containerOuterHTML: container ? container.outerHTML : null
    };
  });

  console.log("DEBUG INFO:", debugInfo);
  await browser.close();
})();
