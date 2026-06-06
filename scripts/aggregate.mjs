// ============================================================
// SENTINEL Intelligence Brief — RSS Aggregation Engine
// Fetches all feeds, deduplicates, sorts, and saves data
// ============================================================

import RSSParser from "rss-parser";
import { FEEDS, CATEGORIES, CATEGORY_ORDER } from "./feeds.mjs";
import { writeFileSync, mkdirSync, readdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "data");
const ARCHIVE_DIR = join(ROOT, "archive");

const parser = new RSSParser({
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
  maxRedirects: 5,
});

// ─── Utility Functions ────────────────────────────────────

function getISTDate() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist;
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function formatTime(date) {
  const h = date.getUTCHours().toString().padStart(2, "0");
  const m = date.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m} IST`;
}

function getTimePeriod() {
  const ist = getISTDate();
  const hour = ist.getUTCHours();
  return hour < 14 ? "morning" : "evening";
}

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

function truncate(text, maxLen = 200) {
  if (!text || text.length <= maxLen) return text;
  return text.substring(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

function similarity(a, b) {
  if (!a || !b) return 0;
  const wordsA = new Set(a.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);
  return intersection.size / union.size;
}

// ─── Image Extraction and Fallbacks ─────────────────────────

function isImageUrl(url) {
  if (!url) return false;
  return url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || url.includes('image') || url.includes('img') || url.includes('photo-');
}

function isGenericOrLogo(url) {
  if (!url) return true;
  const lower = url.toLowerCase();
  const genericTerms = [
    'logo', 'default', 'placeholder', 'avatar', 'sharing', 'social', 'facebook', 
    'twitter', 'fallback', 'feed-icon', 'rss', 'wp-content/uploads/assets/logo',
    'favicon', 'apple-touch-icon', 'static/images/brand', 'generic', 'analytics', 'pixel'
  ];
  return genericTerms.some(term => lower.includes(term));
}

async function fetchOpenGraphData(url) {
  if (!url || url === '#' || !url.startsWith('http')) return { image: null, description: null };
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // Strict 2.5s timeout
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });
    
    clearTimeout(timeoutId);
    if (!response.ok) return { image: null, description: null };
    const html = await response.text();
    
    let image = null;
    const ogImageRegex = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i;
    const ogImageRegex2 = /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i;
    const twitterImageRegex = /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i;
    const twitterImageRegex2 = /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i;
    
    const imgMatch = html.match(ogImageRegex) || html.match(ogImageRegex2) || html.match(twitterImageRegex) || html.match(twitterImageRegex2);
    if (imgMatch && imgMatch[1]) {
      let imgUrl = imgMatch[1].trim();
      if (imgUrl.startsWith('//')) {
        imgUrl = 'https:' + imgUrl;
      } else if (imgUrl.startsWith('/')) {
        const parsedUrl = new URL(url);
        imgUrl = parsedUrl.origin + imgUrl;
      }
      image = imgUrl;
    }

    let description = null;
    const ogDescRegex = /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i;
    const ogDescRegex2 = /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i;
    const descRegex = /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i;
    const descRegex2 = /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i;

    const descMatch = html.match(ogDescRegex) || html.match(ogDescRegex2) || html.match(descRegex) || html.match(descRegex2);
    if (descMatch && descMatch[1]) {
      description = cleanText(descMatch[1].trim());
    }

    return { image, description };
  } catch (e) {
    // Silent fail
  }
  return { image: null, description: null };
}

function extractImageUrl(item) {
  // 1. Direct check of enclosure (singular or plural)
  if (item.enclosure && item.enclosure.url && isImageUrl(item.enclosure.url)) {
    return item.enclosure.url;
  }
  if (Array.isArray(item.enclosures)) {
    for (const enc of item.enclosures) {
      if (enc && enc.url && isImageUrl(enc.url)) return enc.url;
    }
  }

  // 2. Direct object properties
  const directProperties = ['thumbnail', 'image', 'img', 'pic', 'photo'];
  for (const prop of directProperties) {
    if (item[prop]) {
      if (typeof item[prop] === 'string' && isImageUrl(item[prop])) return item[prop];
      if (typeof item[prop] === 'object') {
        const obj = item[prop];
        if (obj.url && isImageUrl(obj.url)) return obj.url;
        if (obj.$ && obj.$.url && isImageUrl(obj.$.url)) return obj.$.url;
        if (obj.src && isImageUrl(obj.src)) return obj.src;
      }
    }
  }

  // 3. Custom namespaces: media:content / media:thumbnail / media:group / media:image
  const mediaKeys = ['media:content', 'media:thumbnail', 'media:group', 'media:image'];
  for (const key of mediaKeys) {
    const media = item[key];
    if (media) {
      if (media.$ && media.$.url && isImageUrl(media.$.url)) return media.$.url;
      if (media.url && isImageUrl(media.url)) return media.url;
      if (Array.isArray(media)) {
        for (const m of media) {
          if (m && m.$ && m.$.url && isImageUrl(m.$.url)) return m.$.url;
          if (m && m.url && isImageUrl(m.url)) return m.url;
        }
      }
    }
  }

  // 4. Custom parser item attributes
  if (item.$) {
    const namespaces = ['media:content', 'media:thumbnail'];
    for (const ns of namespaces) {
      if (item.$[ns] && item.$[ns].url && isImageUrl(item.$[ns].url)) {
        return item.$[ns].url;
      }
    }
  }

  // 5. Exhaustive check in HTML description / content / encoded / summary via robust regex
  const searchStrings = [
    item['content:encoded'],
    item.description,
    item.content,
    item.contentSnippet,
    item.summary
  ];
  // Regex matches double, single, or quote-less image src tags while skipping empty/tracking trackers
  const imgRegex = /<img[^>]+src=\s*["']?([^"' >]+)["']?/i;
  for (const str of searchStrings) {
    if (str && typeof str === 'string') {
      const match = str.match(imgRegex);
      if (match && match[1]) {
        const url = match[1];
        if (!url.includes('doubleclick') && !url.includes('analytics') && !url.includes('pixel') && !url.includes('1x1') && isImageUrl(url)) {
          return url;
        }
      }
    }
  }

  return null;
}

function getCategoryPlaceholder(categoryId, article = {}) {
  // Extract words from title to perform semantic/topic matching
  const title = (article.title || '').toLowerCase();
  
  // Curved matching rules: Title keyword -> curating high-definition futuristic Unsplash images
  const keywordMappings = [
    {
      keywords: ['ai', 'artificial intelligence', 'llm', 'gpt', 'openai', 'claude', 'gemini', 'robot', 'deep learning', 'machine learning', 'nvidia'],
      images: [
        "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=400&auto=format&fit=crop&q=80", // AI neural mesh
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80"  // Cybernetic brain
      ]
    },
    {
      keywords: ['hacker', 'hacking', 'cyberattack', 'ransomware', 'breach', 'malware', 'exploit', 'phishing', 'vulnerability', 'ddos', 'security', 'leak'],
      images: [
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=80", // Cyan server rack
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=80"  // Hacker command console
      ]
    },
    {
      keywords: ['bitcoin', 'crypto', 'cryptocurrency', 'ethereum', 'btc', 'eth', 'blockchain', 'solana', 'doge', 'ledger'],
      images: [
        "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&auto=format&fit=crop&q=80", // Golden bitcoin on hardware board
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80"  // Crypto neon matrix chart
      ]
    },
    {
      keywords: ['stock', 'market', 'nifty', 'sensex', 'trading', 'bull', 'bear', 'shares', 'nasdaq', 'sebi', 'invest', 'portfolio', 'quarterly', 'profit', 'dividend'],
      images: [
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&auto=format&fit=crop&q=80", // Blue neon financial terminal
        "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&auto=format&fit=crop&q=80"  // Green/red stock chart console
      ]
    },
    {
      keywords: ['gold', 'silver', 'commodity', 'oil', 'crude', 'metals', 'zinc', 'copper', 'mcx'],
      images: [
        "https://images.unsplash.com/photo-1610375461246-83df859d8222?w=400&auto=format&fit=crop&q=80", // Fluid gold abstract matrix
        "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&auto=format&fit=crop&q=80"  // Modern gold/silver bars grid
      ]
    },
    {
      keywords: ['india', 'indian', 'delhi', 'mumbai', 'modi', 'rbi', 'bjp', 'congress', 'gandhi', 'bharat', 'pib'],
      images: [
        "https://images.unsplash.com/photo-1506461883276-594a12b11cc3?w=400&auto=format&fit=crop&q=80", // Taj Mahal silhouette in cyber glow
        "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&auto=format&fit=crop&q=80"  // Golden Gate Taj Mahal glowing light
      ]
    },
    {
      keywords: ['space', 'satellite', 'nasa', 'isro', 'rocket', 'moon', 'mars', 'spacex', 'orbit', 'astronaut', 'telescope'],
      images: [
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80", // Earth satellite orbital cyber feed
        "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&auto=format&fit=crop&q=80"  // Space network telemetry sweep
      ]
    },
    {
      keywords: ['defense', 'military', 'war', 'army', 'navy', 'pentagon', 'missile', 'combat', 'soldiers', 'iaf', 'weapon', 'border', 'china', 'taiwan', 'russia', 'ukraine', 'gaza', 'israel'],
      images: [
        "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&auto=format&fit=crop&q=80", // Tactical green radar HUD grid
        "https://images.unsplash.com/photo-1518364538800-6bcb3f25da49?w=400&auto=format&fit=crop&q=80"  // Cyber surveillance coordinate screen
      ]
    },
    {
      keywords: ['politics', 'election', 'president', 'government', 'senate', 'parliament', 'court', 'judge', 'vote', 'biden', 'trump', 'minister'],
      images: [
        "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=400&auto=format&fit=crop&q=80", // Cyber vote ledger terminal
        "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&auto=format&fit=crop&q=80"  // Abstract law & governance grid
      ]
    },
    {
      keywords: ['study', 'exam', 'syllabus', 'upsc', 'ias', 'education', 'learning', 'iasbaba', 'insightsias', 'drishti'],
      images: [
        "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&auto=format&fit=crop&q=80", // Modern tactical work study desk
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80"  // Cyber learning/digital database matrix
      ]
    }
  ];

  // Try to match keywords in the article title
  for (const mapping of keywordMappings) {
    for (const kw of mapping.keywords) {
      if (title.includes(kw)) {
        const list = mapping.images;
        // Deterministically pick one of the matching images using title length to avoid duplicate images on contiguous items
        const index = Math.abs(title.length + kw.length) % list.length;
        return list[index];
      }
    }
  }

  // If no keywords matched, fall back to our premium category-specific lists
  const placeholders = {
    breaking_news: [
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80"
    ],
    world_news: [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518364538800-6bcb3f25da49?w=400&auto=format&fit=crop&q=80"
    ],
    india_analysis: [
      "https://images.unsplash.com/photo-1506461883276-594a12b11cc3?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&auto=format&fit=crop&q=80"
    ],
    politics: [
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=400&auto=format&fit=crop&q=80"
    ],
    business: [
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80"
    ],
    share_market: [
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&auto=format&fit=crop&q=80"
    ],
    daily_market_news: [
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&auto=format&fit=crop&q=80"
    ],
    technology: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&auto=format&fit=crop&q=80"
    ],
    ai_future: [
      "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80"
    ],
    cybersecurity: [
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80"
    ],
    intelligence: [
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&auto=format&fit=crop&q=80"
    ],
    education: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&auto=format&fit=crop&q=80"
    ],
    cyber_threat_intel: [
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1601597111158-2fceff270190?w=400&auto=format&fit=crop&q=80"
    ],
    upsc_current_affairs: [
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&auto=format&fit=crop&q=80"
    ],
    science: [
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80"
    ],
    health_medtech: [
      "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=400&auto=format&fit=crop&q=80"
    ],
    career_job: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=80"
    ]
  };

  const list = placeholders[categoryId] || placeholders.breaking_news;
  let sum = 0;
  for (let i = 0; i < categoryId.length; i++) sum += categoryId.charCodeAt(i);
  return list[sum % list.length];
}

// ─── Feed Fetching ────────────────────────────────────────

async function scrapeChinaDaily() {
  const urls = [
    "https://www.chinadaily.com.cn/china/",
    "https://www.chinadaily.com.cn/world/"
  ];
  const articles = [];
  const seenLinks = new Set();
  const maxPerCategory = 5;

  for (const pageUrl of urls) {
    let categoryCount = 0;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(pageUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      clearTimeout(timeoutId);
      if (!response.ok) continue;
      const html = await response.text();

      const regex = /href=\s*["']([^"']+\/a\/(\d{4})(\d{2})\/(\d{2})\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
      let match;
      while ((match = regex.exec(html)) !== null) {
        if (categoryCount >= maxPerCategory) break;

        let link = match[1].trim();
        if (link.startsWith('//')) {
          link = 'https:' + link;
        } else if (link.startsWith('/')) {
          link = 'https://www.chinadaily.com.cn' + link;
        }
        
        if (seenLinks.has(link) || !link.includes('chinadaily.com.cn')) continue;
        
        let titleText = cleanText(match[5]);
        
        if (!titleText || titleText.length < 5) {
          continue;
        }

        if (titleText.toLowerCase().includes('click here') || titleText.toLowerCase().includes('read more')) {
          continue;
        }

        // Set pubDate spaced out from current time to mix properly with other live feeds
        const offsetMs = articles.length * 45 * 60 * 1000;
        const pubDate = new Date(Date.now() - offsetMs).toISOString();

        articles.push({
          title: titleText,
          link: link,
          description: "", // filled in concurrently later
          pubDate: pubDate,
          source: "China Daily",
          image: null // filled in concurrently later
        });
        seenLinks.add(link);
        categoryCount++;
      }
    } catch (err) {
      console.log(`  ❌ China Daily Scrape error for ${pageUrl}: ${err.message}`);
    }
  }

  console.log(`  ✅ China Daily Scrape: ${articles.length} articles`);
  return articles;
}

async function fetchFeed(feedConfig) {
  if (feedConfig.isCustomScrape) {
    if (feedConfig.name === "China Daily") {
      return await scrapeChinaDaily();
    }
  }

  const absoluteTimeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Absolute timeout exceeded")), 20000)
  );

  try {
    const feed = await Promise.race([
      parser.parseURL(feedConfig.url),
      absoluteTimeout
    ]);
    const articles = (feed.items || []).slice(0, 20).map((item) => ({
      title: cleanText(item.title) || "Untitled",
      link: item.link || item.guid || "#",
      description: truncate(
        cleanText(item.contentSnippet || item.content || item.summary || "")
      ),
      pubDate: (() => {
        if (!item.pubDate) return new Date().toISOString();
        try {
          const parsed = new Date(item.pubDate);
          if (isNaN(parsed.getTime())) {
            return new Date().toISOString();
          }
          return parsed.toISOString();
        } catch (e) {
          return new Date().toISOString();
        }
      })(),
      source: feedConfig.name,
      image: extractImageUrl(item),
    }));
    console.log(`  ✅ ${feedConfig.name}: ${articles.length} articles`);
    return articles;
  } catch (err) {
    console.log(`  ❌ ${feedConfig.name}: ${err.message}`);
    return [];
  }
}

async function fetchCategory(categoryId) {
  const feeds = FEEDS[categoryId] || [];
  console.log(
    `\n📂 Fetching ${CATEGORIES[categoryId]?.name || categoryId} (${feeds.length} feeds)...`
  );

  const results = await Promise.allSettled(feeds.map(fetchFeed));
  let articles = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    }
  }

  // Sort by date newest first
  articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Deduplicate by title similarity
  const unique = [];
  for (const article of articles) {
    const isDuplicate = unique.some(
      (existing) => similarity(existing.title, article.title) > 0.6
    );
    if (!isDuplicate) {
      unique.push(article);
    }
  }

  // Slice to the top 24 first to minimize OG scraping network requests!
  const topArticles = unique.slice(0, 24);

  // Scrape Open Graph images concurrently for articles that need it
  console.log(`🔍 Resolving high-fidelity original news images for ${CATEGORIES[categoryId]?.name || categoryId}...`);
  const scrapePromises = topArticles.map(async (article) => {
    const needImage = !article.image || isGenericOrLogo(article.image);
    const needDesc = !article.description;
    if (needImage || needDesc) {
      const ogData = await fetchOpenGraphData(article.link);
      if (needImage && ogData.image && !isGenericOrLogo(ogData.image)) {
        article.image = ogData.image;
      }
      if (needDesc && ogData.description) {
        article.description = truncate(ogData.description);
      }
    }
    // If still no image or generic, fallback to keyword placeholder or category placeholder
    if (!article.image || isGenericOrLogo(article.image)) {
      article.image = getCategoryPlaceholder(categoryId, article);
    }
    // If still no description, fallback to title
    if (!article.description) {
      article.description = article.title;
    }
  });

  await Promise.all(scrapePromises);

  return topArticles;
}

// ─── Archive Index ────────────────────────────────────────

function updateArchiveIndex() {
  const files = readdirSync(ARCHIVE_DIR)
    .filter((f) => f.endsWith(".json") && f !== "index.json")
    .sort()
    .reverse();

  const archiveIndex = [];
  for (const file of files) {
    try {
      const data = JSON.parse(readFileSync(join(ARCHIVE_DIR, file), "utf-8"));
      archiveIndex.push({
        file,
        date: data.meta.date,
        time: data.meta.time,
        period: data.meta.period,
        totalArticles: data.meta.totalArticles,
      });
    } catch {
      // skip corrupted files
    }
  }

  writeFileSync(
    join(ARCHIVE_DIR, "index.json"),
    JSON.stringify(archiveIndex, null, 2)
  );
  console.log(`📋 Archive index updated (${archiveIndex.length} entries)`);
}

// ─── Main Aggregation ─────────────────────────────────────

async function aggregate() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  SENTINEL Intelligence Brief — Aggregation Engine");
  console.log("═══════════════════════════════════════════════════");

  const ist = getISTDate();
  const dateStr = formatDate(ist);
  const timeStr = formatTime(ist);
  const period = getTimePeriod();

  console.log(`\n📅 Date: ${dateStr}`);
  console.log(`⏰ Time: ${timeStr}`);
  console.log(`🌤️  Period: ${period}`);

  mkdirSync(DATA_DIR, { recursive: true });
  mkdirSync(ARCHIVE_DIR, { recursive: true });

  const briefing = {
    meta: {
      date: dateStr,
      time: timeStr,
      period,
      generatedAt: new Date().toISOString(),
      totalArticles: 0,
      totalFeeds: Object.values(FEEDS).flat().length,
      totalCategories: Object.keys(FEEDS).length,
    },
    categories: {},
  };

  for (const cat of CATEGORY_ORDER) {
    const articles = await fetchCategory(cat.id);
    briefing.categories[cat.id] = {
      ...CATEGORIES[cat.id],
      articles,
      articleCount: articles.length,
    };
    briefing.meta.totalArticles += articles.length;
  }

  console.log(`\n══════════════════════════════════════`);
  console.log(`✅ Total articles: ${briefing.meta.totalArticles}`);
  console.log(`📊 Categories: ${briefing.meta.totalCategories}`);
  console.log(`📡 Feeds: ${briefing.meta.totalFeeds}`);

  // Save current briefing
  writeFileSync(join(DATA_DIR, "latest.json"), JSON.stringify(briefing, null, 2));
  console.log(`\n💾 Saved: data/latest.json`);

  // Archive
  const archivePath = join(ARCHIVE_DIR, `${dateStr}_${period}.json`);
  writeFileSync(archivePath, JSON.stringify(briefing, null, 2));
  console.log(`📦 Archived: archive/${dateStr}_${period}.json`);

  updateArchiveIndex();

  return briefing;
}

aggregate()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Aggregation failed:", err);
    process.exit(1);
  });
