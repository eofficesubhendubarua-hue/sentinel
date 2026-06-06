// Fetch is global in Node.js 20+


function cleanText(text) {
  if (!text) return "";
  let str = "";
  if (typeof text === "string") {
    str = text;
  } else if (typeof text === "object") {
    if (text._ && typeof text._ === "string") {
      str = text._;
    } else if (text.title && typeof text.title === "string") {
      str = text.title;
    } else {
      try {
        str = JSON.stringify(text);
      } catch (e) {
        str = "";
      }
    }
  } else {
    str = String(text);
  }
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function scrapeChinaDaily() {
  const urls = [
    "https://www.chinadaily.com.cn/china/",
    "https://www.chinadaily.com.cn/world/"
  ];
  const articles = [];
  const seenLinks = new Set();

  for (const pageUrl of urls) {
    try {
      console.log(`Fetching ${pageUrl}...`);
      const response = await fetch(pageUrl);
      if (!response.ok) {
        console.log(`Failed to fetch ${pageUrl}: ${response.statusText}`);
        continue;
      }
      const html = await response.text();

      const regex = /href=\s*["']([^"']+\/a\/(\d{4})(\d{2})\/(\d{2})\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
      let match;
      while ((match = regex.exec(html)) !== null) {
        let link = match[1].trim();
        if (link.startsWith('//')) {
          link = 'https:' + link;
        } else if (link.startsWith('/')) {
          link = 'https://www.chinadaily.com.cn' + link;
        }
        
        if (seenLinks.has(link) || !link.includes('chinadaily.com.cn')) continue;
        
        const year = match[2];
        const month = match[3];
        const day = match[4];

        let titleText = cleanText(match[5]);
        
        if (!titleText || titleText.length < 5) {
          continue;
        }

        if (titleText.toLowerCase().includes('click here') || titleText.toLowerCase().includes('read more')) {
          continue;
        }

        let pubDate;
        try {
          pubDate = new Date(`${year}-${month}-${day}T08:00:00.000Z`).toISOString();
        } catch(e) {
          pubDate = new Date().toISOString();
        }

        articles.push({
          title: titleText,
          link: link,
          pubDate: pubDate,
          source: "China Daily"
        });
        seenLinks.add(link);
      }
    } catch (err) {
      console.log(`Scrape error for ${pageUrl}: ${err.message}`);
    }
  }

  console.log(`Scraped ${articles.length} unique articles:`);
  console.log(articles.slice(0, 10));
}

scrapeChinaDaily();
