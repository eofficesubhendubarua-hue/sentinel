// ============================================================
// SENTINEL Intelligence Brief — RSS Feed Definitions
// 40+ curated intelligence sources across 12 categories
// ============================================================

export const CATEGORIES = {
  breaking_news: {
    id: "breaking_news",
    name: "Breaking News",
    shortName: "Breaking",
    description: "Real-time breaking stories from around the world",
    icon: "🔴",
    priority: 1,
  },
  world_news: {
    id: "world_news",
    name: "World News",
    shortName: "World",
    description: "Global headlines and international affairs",
    icon: "🌍",
    priority: 2,
  },
  india_analysis: {
    id: "india_analysis",
    name: "India & What's Next",
    shortName: "India",
    description: "India news, policy analysis, and future outlook",
    icon: "🇮🇳",
    priority: 3,
  },
  politics: {
    id: "politics",
    name: "Politics & Governance",
    shortName: "Politics",
    description: "Political developments, elections, and policy changes",
    icon: "🏛️",
    priority: 4,
  },
  business: {
    id: "business",
    name: "Business & Economy",
    shortName: "Business",
    description: "Business news, economic trends, and corporate developments",
    icon: "💼",
    priority: 5,
  },
  share_market: {
    id: "share_market",
    name: "Share Market & Screener",
    shortName: "Markets",
    description: "Indian & US stock markets, mutual funds, ETFs, screener analysis, Nifty, Sensex, S&P 500, NASDAQ, Dow Jones",
    icon: "📈",
    priority: 6,
  },
  daily_market_news: {
    id: "daily_market_news",
    name: "Daily Market News",
    shortName: "Daily Markets",
    description: "Daily latest reports from CNBC, ET Now, and leading financial networks",
    icon: "📊",
    priority: 6.5,
  },
  technology: {
    id: "technology",
    name: "Technology",
    shortName: "Tech",
    description: "Latest in tech, gadgets, and digital innovation",
    icon: "⚡",
    priority: 7,
  },
  ai_future: {
    id: "ai_future",
    name: "AI & Future Tech",
    shortName: "AI",
    description: "Artificial intelligence, machine learning, and what's next",
    icon: "🤖",
    priority: 8,
  },
  cybersecurity: {
    id: "cybersecurity",
    name: "Cyber Security & Hacking",
    shortName: "Cyber",
    description: "Hacking news, vulnerabilities, data breaches, and cyber warfare",
    icon: "🛡️",
    priority: 9,
  },
  intelligence: {
    id: "intelligence",
    name: "Intelligence & OSINT",
    shortName: "Intel",
    description: "Open-source intelligence, defense analysis, and geopolitical reports",
    icon: "🕵️",
    priority: 10,
  },
  education: {
    id: "education",
    name: "Education",
    shortName: "Education",
    description: "Education news, exam updates, and academic developments",
    icon: "📚",
    priority: 11,
  },
  cyber_threat_intel: {
    id: "cyber_threat_intel",
    name: "Cyber Threat Intel",
    shortName: "Threats",
    description: "Advanced threat analysis, CVEs, APTs, and malware reports",
    icon: "☠️",
    priority: 12,
  },
  upsc_current_affairs: {
    id: "upsc_current_affairs",
    name: "UPSC Daily Current Affairs",
    shortName: "UPSC",
    description: "Daily current affairs, editorials, PIB summaries, government schemes & policy analysis for UPSC CSE preparation",
    icon: "🎓",
    priority: 13,
  },
  science: {
    id: "science",
    name: "Science",
    shortName: "Science",
    description: "Discoveries, space exploration, physics, and scientific breakthroughs",
    icon: "🔬",
    priority: 10.2,
  },
  health_medtech: {
    id: "health_medtech",
    name: "Health & Medical Tech",
    shortName: "Health",
    description: "Medical breakthroughs, health IT, biotechnology, and medical advancements",
    icon: "🧬",
    priority: 10.4,
  },
  career_job: {
    id: "career_job",
    name: "Career & Job",
    shortName: "Careers",
    description: "Job notifications, career advice, and hiring announcements from Google, FreeJobAlert, and top employment resources",
    icon: "👔",
    priority: 10.6,
  },
};

export const FEEDS = {
  // ─────────────────────────────────────────────
  // 🔴 BREAKING NEWS
  // ─────────────────────────────────────────────
  breaking_news: [
    {
      name: "BBC News - Top Stories",
      url: "http://feeds.bbci.co.uk/news/rss.xml",
    },
    {
      name: "Reuters - Top News",
      url: "https://feeds.reuters.com/reuters/topNews",
    },
    {
      name: "NDTV - Latest",
      url: "https://feeds.feedburner.com/ndtvnews-latest",
    },
    {
      name: "Al Jazeera",
      url: "https://www.aljazeera.com/xml/rss/all.xml",
    },
    {
      name: "Times of India",
      url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    },
  ],

  // ─────────────────────────────────────────────
  // 🌍 WORLD NEWS
  // ─────────────────────────────────────────────
  world_news: [
    {
      name: "BBC World",
      url: "http://feeds.bbci.co.uk/news/world/rss.xml",
    },
    {
      name: "Reuters World",
      url: "https://feeds.reuters.com/Reuters/worldNews",
    },
    {
      name: "The Guardian - World",
      url: "https://www.theguardian.com/world/rss",
    },
    {
      name: "AP News",
      url: "https://rsshub.app/apnews/topics/apf-topnews",
    },
    {
      name: "New York Times",
      url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    },
    {
      name: "RT News",
      url: "https://www.rt.com/rss/",
    },
    {
      name: "SCMP - China News",
      url: "https://www.scmp.com/rss/91/feed",
    },
    {
      name: "Sixth Tone - China",
      url: "https://www.sixthtone.com/rss",
    },
    {
      name: "China Daily",
      url: "https://www.chinadaily.com.cn/",
      isCustomScrape: true
    },
    {
      name: "WION",
      url: "https://www.wionews.com/rss",
    },
  ],

  // ─────────────────────────────────────────────
  // 🇮🇳 INDIA & WHAT'S NEXT
  // ─────────────────────────────────────────────
  india_analysis: [
    {
      name: "The Hindu",
      url: "https://www.thehindu.com/news/national/feeder/default.rss",
    },
    {
      name: "Times of India",
      url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    },
    {
      name: "India Today",
      url: "https://www.indiatoday.in/rss/home",
    },
    {
      name: "NDTV India",
      url: "https://feeds.feedburner.com/ndtvnews-india-news",
    },
    {
      name: "The Wire",
      url: "https://thewire.in/feed",
    },
    {
      name: "ThePrint",
      url: "https://theprint.in/feed/",
    },
    {
      name: "Scroll.in",
      url: "https://feeds.feedburner.com/Scrollin",
    },
  ],

  // ─────────────────────────────────────────────
  // 🏛️ POLITICS & GOVERNANCE
  // ─────────────────────────────────────────────
  politics: [
    {
      name: "The Hindu - National Politics",
      url: "https://www.thehindu.com/news/national/feeder/default.rss",
    },
    {
      name: "NDTV - India",
      url: "https://feeds.feedburner.com/ndtvnews-india-news",
    },
    {
      name: "Foreign Policy",
      url: "https://foreignpolicy.com/feed/",
    },
    {
      name: "The Diplomat",
      url: "https://thediplomat.com/feed/",
    },
  ],

  // ─────────────────────────────────────────────
  // 💼 BUSINESS & ECONOMY
  // ─────────────────────────────────────────────
  business: [
    {
      name: "Economic Times",
      url: "https://economictimes.indiatimes.com/rssfeedsdefault.cms",
    },
    {
      name: "Moneycontrol",
      url: "https://www.moneycontrol.com/rss/latestnews.xml",
    },
    {
      name: "LiveMint",
      url: "https://www.livemint.com/rss/news",
    },
    {
      name: "Business Standard",
      url: "https://www.business-standard.com/rss/home_page_top_stories.rss",
    },
  ],

  // ─────────────────────────────────────────────
  // 📊 DAILY MARKET NEWS
  // ─────────────────────────────────────────────
  daily_market_news: [
    {
      name: "ET Now - Latest",
      url: "https://www.etnownews.com/feeds/gns-etn-latest",
    },
    {
      name: "CNBC - Finance",
      url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664",
    },
    {
      name: "Economic Times - Markets",
      url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
    },
    {
      name: "Moneycontrol News",
      url: "https://www.moneycontrol.com/rss/latestnews.xml",
    },
    {
      name: "LiveMint Markets",
      url: "https://www.livemint.com/rss/market",
    },
    {
      name: "Trade Brains",
      url: "https://tradebrains.in/feed/",
    },
  ],

  // ─────────────────────────────────────────────
  // 📈 SHARE MARKET — INDIA, US, GLOBAL, MF, ETF
  // ─────────────────────────────────────────────
  share_market: [
    // ── Indian Markets ──
    {
      name: "Economic Times - Markets",
      url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
    },
    {
      name: "Moneycontrol - Markets",
      url: "https://www.moneycontrol.com/rss/marketreports.xml",
    },
    {
      name: "LiveMint - Markets",
      url: "https://www.livemint.com/rss/market",
    },
    {
      name: "ET - Mutual Funds",
      url: "https://economictimes.indiatimes.com/mf/rssfeeds/2146842.cms",
    },
    {
      name: "Moneycontrol - MF",
      url: "https://www.moneycontrol.com/rss/mfnews.xml",
    },
    // ── US & International Markets ──
    {
      name: "CNBC Markets",
      url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258",
    },
    {
      name: "MarketWatch",
      url: "https://feeds.marketwatch.com/marketwatch/topstories/",
    },
    {
      name: "Yahoo Finance",
      url: "https://finance.yahoo.com/news/rssindex",
    },
    {
      name: "Seeking Alpha",
      url: "https://seekingalpha.com/market_currents.xml",
    },
    {
      name: "Investing.com",
      url: "https://www.investing.com/rss/news.rss",
    },
  ],

  // ─────────────────────────────────────────────
  // ⚡ TECHNOLOGY
  // ─────────────────────────────────────────────
  technology: [
    {
      name: "TechCrunch",
      url: "https://techcrunch.com/feed/",
    },
    {
      name: "The Verge",
      url: "https://www.theverge.com/rss/index.xml",
    },
    {
      name: "Wired",
      url: "https://www.wired.com/feed/rss",
    },
    {
      name: "Ars Technica",
      url: "https://feeds.arstechnica.com/arstechnica/features",
    },
  ],

  // ─────────────────────────────────────────────
  // 🤖 AI & FUTURE TECH
  // ─────────────────────────────────────────────
  ai_future: [
    {
      name: "MIT Technology Review - AI",
      url: "https://www.technologyreview.com/feed/",
    },
    {
      name: "VentureBeat - AI",
      url: "https://venturebeat.com/category/ai/feed/",
    },
    {
      name: "The Decoder",
      url: "https://the-decoder.com/feed/",
    },
    {
      name: "AI News",
      url: "https://www.artificialintelligence-news.com/feed/",
    },
  ],

  // ─────────────────────────────────────────────
  // 🛡️ CYBER SECURITY & HACKING
  // ─────────────────────────────────────────────
  cybersecurity: [
    {
      name: "The Hacker News",
      url: "https://feeds.feedburner.com/TheHackersNews",
    },
    {
      name: "BleepingComputer",
      url: "https://www.bleepingcomputer.com/feed/",
    },
    {
      name: "Dark Reading",
      url: "https://www.darkreading.com/rss.xml",
    },
    {
      name: "Krebs on Security",
      url: "https://krebsonsecurity.com/feed/",
    },
    {
      name: "Threatpost",
      url: "https://threatpost.com/feed/",
    },
  ],

  // ─────────────────────────────────────────────
  // 🕵️ INTELLIGENCE & OSINT
  // ─────────────────────────────────────────────
  intelligence: [
    {
      name: "Bellingcat",
      url: "https://www.bellingcat.com/feed/",
    },
    {
      name: "The War Zone",
      url: "https://www.thedrive.com/the-war-zone/feed",
    },
    {
      name: "Foreign Policy",
      url: "https://foreignpolicy.com/feed/",
    },
    {
      name: "Defense One",
      url: "https://www.defenseone.com/rss/",
    },
    {
      name: "The Intercept",
      url: "https://theintercept.com/feed/?rss",
    },
    {
      name: "Public Intelligence",
      url: "https://publicintelligence.net/feed/",
    },
    {
      name: "IntelNews",
      url: "https://intelnews.org/feed/",
    },
    {
      name: "OSINT Me",
      url: "https://osintme.com/index.php/feed/",
    },
  ],

  // ─────────────────────────────────────────────
  // 📚 EDUCATION
  // ─────────────────────────────────────────────
  education: [
    {
      name: "NDTV Education",
      url: "https://feeds.feedburner.com/ndtvnews-education-news",
    },
    {
      name: "India Today Education",
      url: "https://www.indiatoday.in/rss/education",
    },
    {
      name: "The Hindu - Education",
      url: "https://www.thehindu.com/education/feeder/default.rss",
    },
  ],

  // ─────────────────────────────────────────────
  // ☠️ CYBER THREAT INTELLIGENCE
  // ─────────────────────────────────────────────
  cyber_threat_intel: [
    {
      name: "CISA Advisories",
      url: "https://www.cisa.gov/cybersecurity-advisories/all.xml",
    },
    {
      name: "Google Mandiant Threat Intel",
      url: "https://cloud.google.com/blog/topics/threat-intelligence/rss/",
    },
    {
      name: "SANS ISC",
      url: "https://isc.sans.edu/rssfeed.xml",
    },
    {
      name: "Rapid7 Blog",
      url: "https://blog.rapid7.com/rss/",
    },
  ],

  // ─────────────────────────────────────────────
  // 🎓 UPSC DAILY CURRENT AFFAIRS
  // ─────────────────────────────────────────────
  upsc_current_affairs: [
    {
      name: "InsightsIAS",
      url: "https://www.insightsonindia.com/feed/",
    },
    {
      name: "ClearIAS",
      url: "https://www.clearias.com/feed/",
    },
    {
      name: "Drishti IAS",
      url: "https://www.drishtiias.com/rss-feed.xml",
    },
    {
      name: "The Hindu Editorial",
      url: "https://www.thehindu.com/opinion/editorial/feeder/default.rss",
    },
    {
      name: "PIB India",
      url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3",
    },
    {
      name: "Indian Express Explained",
      url: "https://indianexpress.com/section/explained/feed/",
    },
    {
      name: "PRS Legislative",
      url: "https://prsindia.org/rss/bills",
    },
    {
      name: "Civilsdaily",
      url: "https://www.civilsdaily.com/feed/",
    },
    {
      name: "GK Today",
      url: "https://www.gktoday.in/feed/",
    },
    {
      name: "ForumIAS Blog",
      url: "https://blog.forumias.com/feed/",
    },
  ],
  science: [
    {
      name: "ScienceDaily - Top Science",
      url: "https://www.sciencedaily.com/rss/top/science.xml",
    },
    {
      name: "Nature News",
      url: "http://feeds.nature.com/nature/rss/current",
    },
    {
      name: "Science Magazine Express",
      url: "https://www.science.org/rss/express.xml",
    },
    {
      name: "Phys.org",
      url: "https://phys.org/rss-feed/",
    },
    {
      name: "Space.com",
      url: "https://www.space.com/feeds/all",
    },
    {
      name: "Wired Science",
      url: "https://www.wired.com/feed/category/science/rss",
    },
  ],
  health_medtech: [
    {
      name: "ScienceDaily - Top Health",
      url: "https://www.sciencedaily.com/rss/top/health.xml",
    },
    {
      name: "Medical Xpress",
      url: "https://medicalxpress.com/rss-feed/",
    },
    {
      name: "Fierce Biotech",
      url: "https://www.fiercebiotech.com/rss/xml",
    },
    {
      name: "Fierce Healthcare",
      url: "https://www.fiercehealthcare.com/rss/xml",
    },
  ],
  career_job: [
    {
      name: "Google Blog - Careers",
      url: "https://blog.google/rss/",
    },
    {
      name: "FreeJobAlert",
      url: "https://currentaffairs.freejobalert.com/feed",
    },
    {
      name: "FreeJobAlert Latest",
      url: "https://www.freejobalert.com/feed/",
    },
    {
      name: "RojgarLive",
      url: "https://www.rojgarlive.com/category/sarkari-naukri/feed",
    },
    {
      name: "JobRasta",
      url: "https://jobrasta.com/feed/",
    },
    {
      name: "Hacker News Jobs",
      url: "https://hnrss.org/jobs",
    },
  ],
};

export const CATEGORY_ORDER = Object.values(CATEGORIES).sort(
  (a, b) => a.priority - b.priority
);
