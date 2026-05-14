// ============================================================
// SENTINEL Intelligence Brief — Client-Side Interactivity
// ============================================================

// ─── Category Filtering ─────────────────────────────────
function filterCategory(categoryId) {
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
  const cards = document.querySelectorAll(".news-card");
  const sections = document.querySelectorAll(".category-section");
  let anyVisible = false;

  if (!q) {
    cards.forEach((card) => card.classList.remove("hidden-article"));
    sections.forEach((s) => s.classList.remove("hidden"));
    return;
  }

  // Reset category filter
  document.querySelectorAll(".cat-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.category === "all");
  });

  cards.forEach((card) => {
    const title = card.querySelector(".card-title")?.textContent?.toLowerCase() || "";
    const desc = card.querySelector(".card-desc")?.textContent?.toLowerCase() || "";
    const source = card.querySelector(".source-badge")?.textContent?.toLowerCase() || "";
    const match = title.includes(q) || desc.includes(q) || source.includes(q);
    card.classList.toggle("hidden-article", !match);
    if (match) anyVisible = true;
  });

  // Hide sections with no visible cards
  sections.forEach((section) => {
    const visibleCards = section.querySelectorAll(".news-card:not(.hidden-article)");
    section.classList.toggle("hidden", visibleCards.length === 0);
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
