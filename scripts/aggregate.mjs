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
      "SENTINEL-Intelligence-Brief/1.0 (RSS Aggregator; +https://github.com)",
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
  return text
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

function extractImageUrl(item) {
  // 1. Check enclosure
  if (item.enclosure && item.enclosure.url && isImageUrl(item.enclosure.url)) {
    return item.enclosure.url;
  }

  // 2. Check media:content / media:thumbnail
  const mediaKeys = ['media:content', 'media:thumbnail', 'media:group'];
  for (const key of mediaKeys) {
    const media = item[key];
    if (media) {
      if (media.$ && media.$.url && isImageUrl(media.$.url)) return media.$.url;
      if (media.url && isImageUrl(media.url)) return media.url;
      if (Array.isArray(media)) {
        for (const m of media) {
          if (m.$ && m.$.url && isImageUrl(m.$.url)) return m.$.url;
          if (m.url && isImageUrl(m.url)) return m.url;
        }
      }
    }
  }

  // 3. Search in description / content / contentSnippet via regex for <img> tag
  const searchStrings = [
    item.description,
    item.content,
    item.contentSnippet,
    item.summary
  ];
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
  for (const str of searchStrings) {
    if (str && typeof str === 'string') {
      const match = str.match(imgRegex);
      if (match && match[1]) {
        return match[1];
      }
    }
  }

  return null;
}

function getCategoryPlaceholder(categoryId) {
  const placeholders = {
    breaking_news: [
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
    ],
    world_news: [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518364538800-6bcb3f25da49?w=600&auto=format&fit=crop&q=80"
    ],
    india_analysis: [
      "https://images.unsplash.com/photo-1506461883276-594a12b11cc3?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1596422846543-75c6fc1f7f43?w=600&auto=format&fit=crop&q=80"
    ],
    politics: [
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&auto=format&fit=crop&q=80"
    ],
    business: [
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80"
    ],
    share_market: [
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80"
    ],
    daily_market_news: [
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80"
    ],
    technology: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&auto=format&fit=crop&q=80"
    ],
    ai_future: [
      "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80"
    ],
    cybersecurity: [
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80"
    ],
    intelligence: [
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80"
    ],
    education: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&auto=format&fit=crop&q=80"
    ],
    cyber_threat_intel: [
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1601597111158-2fceff270190?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80"
    ],
    upsc_current_affairs: [
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80"
    ]
  };

  const list = placeholders[categoryId] || placeholders.breaking_news;
  let sum = 0;
  for (let i = 0; i < categoryId.length; i++) sum += categoryId.charCodeAt(i);
  return list[sum % list.length];
}

// ─── Feed Fetching ────────────────────────────────────────

async function fetchFeed(feedConfig) {
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
      pubDate: item.pubDate
        ? new Date(item.pubDate).toISOString()
        : new Date().toISOString(),
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
      if (!article.image) {
        article.image = getCategoryPlaceholder(categoryId);
      }
      unique.push(article);
    }
  }

  return unique.slice(0, 24);
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
