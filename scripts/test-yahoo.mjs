async function testFetch() {
  const symbol = "^NSEI";
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
  
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    const data = await res.json();
    console.log("Success! Data preview:", JSON.stringify(data.chart.result[0].meta, null, 2));
  } catch (err) {
    console.error("Failed to fetch:", err);
  }
}

testFetch();
