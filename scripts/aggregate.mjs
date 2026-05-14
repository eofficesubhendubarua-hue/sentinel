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
    const articles = (feed.items || []).slice(0, 15).map((item) => ({
      title: cleanText(item.title) || "Untitled",
      link: item.link || item.guid || "#",
      description: truncate(
        cleanText(item.contentSnippet || item.content || item.summary || "")
      ),
      pubDate: item.pubDate
        ? new Date(item.pubDate).toISOString()
        : new Date().toISOString(),
      source: feedConfig.name,
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

  return unique.slice(0, 12);
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
