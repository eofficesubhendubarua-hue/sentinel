// ============================================================
// SENTINEL Intelligence Brief — Client-Side Interactivity
// ============================================================

// ─── Category Filtering ─────────────────────────────────
function filterCategory(categoryId) {
  // Reset search box when clicking a category
  const searchInput = document.getElementById("searchInput");
  if (searchInput && searchInput.value) {
    searchInput.value = "";
    // Unhide all cards previously hidden by search
    document.querySelectorAll(".news-card").forEach(c => c.classList.remove("hidden-article"));
    document.querySelectorAll(".market-link-card").forEach(c => c.style.display = "");
  }

  const buttons = document.querySelectorAll(".cat-btn");
  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.category === categoryId);
  });

  const sections = document.querySelectorAll(".category-section");
  sections.forEach((section) => {
    if (categoryId === "all") {
      section.classList.remove("hidden");
    } else {
      const isMarketTools = section.id === "section-market-tools";
      const isUpscTools = section.id === "section-upsc-tools";
      const match = section.dataset.category === categoryId;
      const showMarketTools = isMarketTools && categoryId === "share_market";
      const showUpscTools = isUpscTools && categoryId === "upsc_current_affairs";
      section.classList.toggle("hidden", !match && !showMarketTools && !showUpscTools);
    }
  });

  // Smooth scroll to top of content
  document.querySelector(".main-content")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── Search ─────────────────────────────────────────────
function searchArticles(query) {
  const q = query.toLowerCase().trim();
  const newsCards = document.querySelectorAll(".news-card");
  const toolCards = document.querySelectorAll(".market-link-card");
  const sections = document.querySelectorAll(".category-section");

  if (!q) {
    newsCards.forEach((card) => card.classList.remove("hidden-article"));
    toolCards.forEach((card) => card.style.display = "");
    
    // Re-apply the currently active category filter
    const activeBtn = document.querySelector(".cat-btn.active");
    const cat = activeBtn ? activeBtn.dataset.category : "all";
    filterCategory(cat);
    return;
  }

  // When searching, switch category button to 'All' because search is global
  document.querySelectorAll(".cat-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.category === "all");
  });

  // Filter News Cards
  newsCards.forEach((card) => {
    const title = card.querySelector(".card-title")?.textContent?.toLowerCase() || "";
    const desc = card.querySelector(".card-desc")?.textContent?.toLowerCase() || "";
    const source = card.querySelector(".source-badge")?.textContent?.toLowerCase() || "";
    const match = title.includes(q) || desc.includes(q) || source.includes(q);
    card.classList.toggle("hidden-article", !match);
  });

  // Filter Tool Cards (Market, UPSC, etc.)
  toolCards.forEach((card) => {
    const name = card.querySelector(".market-name")?.textContent?.toLowerCase() || "";
    const desc = card.querySelector(".market-desc")?.textContent?.toLowerCase() || "";
    const match = name.includes(q) || desc.includes(q);
    card.style.display = match ? "" : "none";
  });

  // Hide sections with no visible content
  sections.forEach((section) => {
    const visibleNews = section.querySelectorAll(".news-card:not(.hidden-article)");
    
    let visibleTools = 0;
    if (section.id === "section-market-tools" || section.id === "section-upsc-tools" || section.classList.contains("market-subsection")) {
       const tools = section.querySelectorAll(".market-link-card");
       tools.forEach(t => { if(t.style.display !== "none") visibleTools++; });
    }

    section.classList.toggle("hidden", visibleNews.length === 0 && visibleTools === 0);
  });
}

// ─── Keyboard shortcut ──────────────────────────────────
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    document.getElementById("searchInput")?.focus();
  }
  if (e.key === "Escape") {
    const input = document.getElementById("searchInput");
    if (input) {
      input.value = "";
      searchArticles("");
      input.blur();
    }
  }
});

// ─── Staggered card animation on load ───────────────────
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".news-card");
  cards.forEach((card, i) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(12px)";
    setTimeout(() => {
      card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, Math.min(i * 30, 600));
  });
});
