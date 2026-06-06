async function test() {
  const url = 'https://sentinel-eofficesubhendubarua-hues-projects.vercel.app/api/mf-search/axis';
  console.log(`Testing newly public Vercel MF API: ${url}...`);
  try {
    const res = await fetch(url);
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Length: ${text.length}`);
    console.log(`Snippet: ${text.slice(0, 300)}`);
    if (res.status === 200 && text.includes('schemeCode')) {
      console.log('🎉 VERIFICATION SUCCESSFUL! THE MF PROXY IS ALSO FULLY OPERATIONAL!');
    } else {
      console.log('❌ VERIFICATION FAILED.');
    }
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

test();
