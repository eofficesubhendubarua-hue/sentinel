import puppeteer from 'puppeteer';

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));

  console.log("Navigating...");
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  
  console.log("Running Mutual Fund simulation...");
  await page.evaluate(() => {
    window.runSimulatorSymbol('Parag Parikh');
  });

  console.log("Waiting 6s...");
  await new Promise(resolve => setTimeout(resolve, 6000));

  const debugInfo = await page.evaluate(() => {
    const errorEl = document.getElementById('sim-error');
    const errorMsg = document.getElementById('sim-error-msg')?.innerText;
    const steps = document.getElementById('sim-loading-steps')?.innerHTML;
    const containers = document.querySelectorAll('.analyzer-chart-container');
    const containerInfos = Array.from(containers).map(c => ({
      id: c.id,
      symbol: c.getAttribute('data-symbol'),
      uniqueId: c.getAttribute('data-unique-id'),
      mainChartHtml: c.querySelector('[id^="analyzer-main-chart-"]')?.outerHTML
    }));
    
    return {
      errorVisible: errorEl ? !errorEl.classList.contains('hidden') : null,
      errorMsg,
      steps,
      containerInfos
    };
  });

  console.log("DEBUG INFO:", debugInfo);
  await browser.close();
})();
