// ============================================================
// SENTINEL Intelligence Brief — Client-Side Cyber Interactivity
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

// ─── Live Clock & System Telemetry ──────────────────────
function updateClock() {
  const clockElement = document.getElementById("live-clock");
  if (!clockElement) return;

  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  // Custom futuristic timestamp addition
  clockElement.textContent = formatter.format(new Date()) + " IST";
}

setInterval(updateClock, 1000);
updateClock();

// ─── Interactive Neural Network Particle Background ──────
function initNeuralNet() {
  const canvas = document.getElementById("neural-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  const maxParticles = Math.min(60, Math.floor((width * height) / 25000)); // Dynamic count
  const connectionDistance = 120;
  const mouse = { x: null, y: null, radius: 180 };

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1;
      this.color = Math.random() > 0.5 ? "rgba(0, 240, 255, 0.4)" : "rgba(157, 78, 221, 0.4)";
    }

    update() {
      // Keep inside bounds
      if (this.x < 0 || this.x > width) this.vx = -this.vx;
      if (this.y < 0 || this.y > height) this.vy = -this.vy;

      this.x += this.vx;
      this.y += this.vy;

      // Mouse interactive magnetism
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= dx * force * 0.02;
          this.y -= dy * force * 0.02;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  // Populate particles
  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
  }

  // Mouse Listeners
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Drawing physics loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    // Draw lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDistance) {
          const alpha = (1 - dist / connectionDistance) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Draw cursor connection
      if (mouse.x !== null && mouse.y !== null) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius - 30) {
          const alpha = (1 - dist / (mouse.radius - 30)) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(157, 78, 221, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

// ─── Stats Number Counter Animation ──────────────────────
function animateCounters() {
  const elements = document.querySelectorAll(".stat-num");
  elements.forEach((el) => {
    const originalText = el.textContent.trim();
    // Match only clean positive integers
    const targetVal = parseInt(originalText.replace(/[^0-9]/g, ""));
    if (isNaN(targetVal)) return;

    let current = 0;
    const duration = 1200; // Total animation ms
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = targetVal / steps;

    const suffix = originalText.replace(/[0-9]/g, ""); // Keep non-numeric characters (e.g. m, h, +, etc.)

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetVal) {
        el.textContent = targetVal + suffix;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current) + suffix;
      }
    }, stepTime);
  });
}

// ─── Load Trigger ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Staggered card entry
  const cards = document.querySelectorAll(".news-card");
  cards.forEach((card, i) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(16px)";
    setTimeout(() => {
      card.style.transition = "opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out)";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, Math.min(i * 20, 500));
  });

  // Start background canvas and counter animations
  initNeuralNet();
  animateCounters();
});
