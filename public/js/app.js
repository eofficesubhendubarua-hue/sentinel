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


// ─── HTML5 CYBERNETIC ENGINES (Audio, Sensors, Voice) ──────

// ─── Global State
let audioCtx = null;
let sysAudioEnabled = false;
let ambientOsc = null;
let ambientLfo = null;
let ambientGain = null;

let voiceRecognition = null;
let voiceHudActive = false;

// ─── Web Audio API Synthesizer
function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playCyberClick() {
  if (!sysAudioEnabled) return;
  try {
    initAudioContext();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    // Crisp dual-oscillator high-pitch cyber click
    const now = audioCtx.currentTime;
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1000, now);
    osc1.frequency.exponentialRampToValueAtTime(700, now + 0.05);
    
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1700, now);
    osc2.frequency.exponentialRampToValueAtTime(1300, now + 0.05);
    
    gainNode.gain.setValueAtTime(0.03, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.06);
    osc2.stop(now + 0.06);
  } catch (e) {
    console.error("Audio error:", e);
  }
}

function playSelectSweep() {
  if (!sysAudioEnabled) return;
  try {
    initAudioContext();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    // Triangle wave slide down
    osc.type = "triangle";
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);
    
    gainNode.gain.setValueAtTime(0.05, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.13);
  } catch (e) {
    console.error("Audio error:", e);
  }
}

function startAmbientHum() {
  try {
    initAudioContext();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const now = audioCtx.currentTime;
    ambientOsc = audioCtx.createOscillator();
    ambientLfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    ambientGain = audioCtx.createGain();
    const lowpass = audioCtx.createBiquadFilter();
    
    // 55Hz starship sub-hum
    ambientOsc.type = "sine";
    ambientOsc.frequency.setValueAtTime(55, now);
    
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(80, now);
    
    // Breathing volume LFO at 0.5Hz
    ambientLfo.type = "sine";
    ambientLfo.frequency.setValueAtTime(0.4, now);
    
    lfoGain.gain.setValueAtTime(0.006, now);
    
    // Constant low base volume
    ambientGain.gain.setValueAtTime(0.008, now);
    
    // Connect LFO modulator to gain node gain parameter
    ambientLfo.connect(lfoGain);
    lfoGain.connect(ambientGain.gain);
    
    ambientOsc.connect(lowpass);
    lowpass.connect(ambientGain);
    ambientGain.connect(audioCtx.destination);
    
    ambientOsc.start(now);
    ambientLfo.start(now);
  } catch (e) {
    console.error("Ambient hum error:", e);
  }
}

function stopAmbientHum() {
  try {
    if (ambientOsc) {
      ambientOsc.stop();
      ambientOsc.disconnect();
      ambientOsc = null;
    }
    if (ambientLfo) {
      ambientLfo.stop();
      ambientLfo.disconnect();
      ambientLfo = null;
    }
    if (ambientGain) {
      ambientGain.disconnect();
      ambientGain = null;
    }
  } catch (e) {
    console.error("Stop hum error:", e);
  }
}

function toggleSysAudio() {
  sysAudioEnabled = !sysAudioEnabled;
  const label = document.getElementById("audio-toggle-label");
  const btn = document.getElementById("sys-audio-toggle");
  
  if (sysAudioEnabled) {
    btn.classList.add("active");
    label.textContent = "SYS_AUDIO [ON]";
    startAmbientHum();
    
    // Dual pitch ascending activation chime
    setTimeout(() => {
      try {
        const now = audioCtx.currentTime;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.frequency.setValueAtTime(500, now);
        o.frequency.setValueAtTime(800, now + 0.08);
        g.gain.setValueAtTime(0.05, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start(now);
        o.stop(now + 0.26);
      } catch(err){}
    }, 50);
  } else {
    btn.classList.remove("active");
    label.textContent = "SYS_AUDIO [OFF]";
    stopAmbientHum();
  }
}

// ─── Web Sensor Diagnostics HUD
function updateDisplayDiagnostics() {
  const resVal = document.getElementById("diag-screen-res");
  const detailsVal = document.getElementById("diag-screen-details");
  if (!resVal || !detailsVal) return;
  
  const w = window.screen.width;
  const h = window.screen.height;
  const ratio = window.devicePixelRatio ? window.devicePixelRatio.toFixed(1) : "1.0";
  const depth = window.screen.colorDepth || 24;
  const orient = window.screen.orientation ? window.screen.orientation.type.split("-")[0].toUpperCase() : "PORTRAIT";
  
  resVal.textContent = `${w} x ${h} (${orient})`;
  detailsVal.textContent = `DPR: ${ratio} // Color Depth: ${depth}b // Viewport: ${window.innerWidth}w`;
}

function updateTemporalDiagnostics() {
  const tzVal = document.getElementById("diag-timezone");
  const timeVal = document.getElementById("diag-local-time");
  if (!tzVal || !timeVal) return;
  
  // Custom Timezone calculation
  const offsetMin = -new Date().getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const hours = Math.floor(Math.abs(offsetMin) / 60).toString().padStart(2, "0");
  const mins = (Math.abs(offsetMin) % 60).toString().padStart(2, "0");
  const tzString = `GMT${sign}${hours}:${mins}`;
  const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  
  tzVal.textContent = `${tzName} (${tzString})`;
  
  // Format local clock
  const d = new Date();
  timeVal.textContent = `NODE_LOCAL: ${d.toLocaleTimeString()} // DST: ${d.dstActive ? 'YES' : 'NO'}`;
}

// Custom Date property helper
Object.defineProperty(Date.prototype, 'dstActive', {
  get: function() {
    var jan = new Date(this.getFullYear(), 0, 1).getTimezoneOffset();
    var jul = new Date(this.getFullYear(), 6, 1).getTimezoneOffset();
    return Math.max(jan, jul) !== this.getTimezoneOffset();
  }
});

function initSensorGrid() {
  // Update battery status
  const batteryPct = document.getElementById("diag-battery-pct");
  const batteryBar = document.getElementById("diag-battery-bar");
  const batteryStatus = document.getElementById("diag-battery-status");
  
  if (navigator.getBattery && batteryPct && batteryBar) {
    navigator.getBattery().then(battery => {
      function updateBattery() {
        const pct = Math.round(battery.level * 100);
        batteryPct.textContent = pct + "%";
        batteryBar.style.width = pct + "%";
        
        // Colors warning levels
        if (pct < 20) {
          batteryBar.style.background = "#ff3b30";
        } else if (pct < 50) {
          batteryBar.style.background = "var(--accent-amber)";
        } else {
          batteryBar.style.background = "var(--accent-emerald)";
        }
        
        const stateText = battery.charging ? "⚡ CHARGING // MAINFRAME_ONLINE" : "🔋 DISCHARGING // INTERNAL_CELLS";
        batteryStatus.textContent = `Bus voltage: NOMINAL // Status: ${stateText}`;
      }
      updateBattery();
      battery.addEventListener("levelchange", updateBattery);
      battery.addEventListener("chargingchange", updateBattery);
    });
  } else if (batteryPct) {
    batteryPct.textContent = "BUS ACTIVE";
    batteryBar.style.width = "100%";
    batteryBar.style.background = "var(--primary)";
    batteryStatus.textContent = "Battery Telemetry unsupported on this device";
  }

  // Update Network Diagnostics
  const netSpeed = document.getElementById("diag-net-speed");
  const netBar = document.getElementById("diag-net-bar");
  const netStatus = document.getElementById("diag-net-status");
  
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn && netSpeed && netBar) {
    function updateNet() {
      const downlink = conn.downlink || 10;
      const speedStr = conn.downlink ? conn.downlink.toFixed(1) + " Mbps" : "UNMEASURED";
      const rtt = conn.rtt ? conn.rtt + " ms" : "LOCAL";
      netSpeed.textContent = `${speedStr} (RTT: ${rtt})`;
      
      const pct = Math.min(100, (downlink / 15) * 100);
      netBar.style.width = pct + "%";
      
      const type = conn.effectiveType ? conn.effectiveType.toUpperCase() : "ETHERNET";
      netStatus.textContent = `Datalink type: ${type} // Signal mode: SYMMETRIC`;
    }
    updateNet();
    conn.addEventListener("change", updateNet);
  } else if (netSpeed) {
    netSpeed.textContent = navigator.onLine ? "TELEMETRY LINK ACTIVE" : "DISCONNECTED";
    netBar.style.width = "100%";
    netBar.style.background = "var(--primary)";
    netStatus.textContent = `Connection Mode: ${navigator.onLine ? 'ONLINE' : 'OFFLINE'} // Native API N/A`;
  }

  // Dynamic updates
  updateDisplayDiagnostics();
  updateTemporalDiagnostics();
  setInterval(() => {
    updateTemporalDiagnostics();
  }, 1000);
}

// ─── Voice HUD Command Console (Web Speech API)
function speakRobotic(text) {
  if (!window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Search elegant sci-fi voices
    const prefVoice = voices.find(v => v.lang.includes("en") && 
      (v.name.toLowerCase().includes("google") || 
       v.name.toLowerCase().includes("female") || 
       v.name.toLowerCase().includes("zira") || 
       v.name.toLowerCase().includes("samantha"))
    ) || voices[0];
    
    if (prefVoice) utterance.voice = prefVoice;
    utterance.pitch = 1.05; // Cyber frequency
    utterance.rate = 1.05;  // Cyber speed
    utterance.volume = sysAudioEnabled ? 0.8 : 0.0;
    
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error("Speech Synthesis error:", e);
  }
}

// Trigger voices list initialization
if (window.speechSynthesis) {
  window.speechSynthesis.getVoices();
}

function addConsoleLog(text, type = "info") {
  const consoleLog = document.getElementById("voice-console-logs");
  if (!consoleLog) return;
  
  const line = document.createElement("div");
  line.className = `console-line ${type}`;
  
  const d = new Date();
  const timeStr = d.toTimeString().split(" ")[0];
  line.innerHTML = `<span class="console-time">[${timeStr}]</span> <span class="console-text">${text}</span>`;
  
  consoleLog.appendChild(line);
  consoleLog.scrollTop = consoleLog.scrollHeight;
  
  while (consoleLog.children.length > 15) {
    consoleLog.removeChild(consoleLog.firstChild);
  }
}

function handleCategoryVoiceCommand(catName) {
  const categoriesMap = {
    "all": "all",
    "tech": "technology",
    "technology": "technology",
    "cyber": "cyber_security",
    "cyber security": "cyber_security",
    "cybersecurity": "cyber_security",
    "security": "cyber_security",
    "world": "world_news",
    "world news": "world_news",
    "india": "india_news",
    "india news": "india_news",
    "business": "business",
    "markets": "share_market",
    "share market": "share_market",
    "stocks": "share_market",
    "upsc": "upsc_current_affairs",
    "upsc current affairs": "upsc_current_affairs",
    "study": "upsc_current_affairs",
    "science": "science",
    "space": "science"
  };
  
  const targetId = categoriesMap[catName];
  if (targetId) {
    filterCategory(targetId);
    const btn = document.querySelector(`.cat-btn[data-category="${targetId}"]`);
    const label = btn ? btn.textContent.trim() : targetId;
    speakRobotic(`Displaying ${label}`);
    addConsoleLog(`Switched channel: ${label.toUpperCase()}`, "action");
  } else {
    speakRobotic(`Category ${catName} not found.`);
    addConsoleLog(`Error: Category "${catName}" not found.`, "error");
  }
}

function processVoiceCommand(phrase) {
  const p = phrase.toLowerCase().trim();
  const hasWakeWord = p.includes("computer") || p.includes("sentinel");
  if (!hasWakeWord) {
    addConsoleLog("Awaiting wake word prefix: 'Computer' or 'Sentinel'", "hint");
    return;
  }
  
  // Clean command string
  let cmd = p.replace("computer", "").replace("sentinel", "").trim();
  addConsoleLog(`Executing command: ${cmd.toUpperCase()}`, "action");
  
  if (cmd.startsWith("display") || cmd.startsWith("show")) {
    const cat = cmd.replace("display", "").replace("show", "").trim();
    handleCategoryVoiceCommand(cat);
  } else if (cmd.startsWith("search")) {
    const query = cmd.replace("search", "").trim();
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.value = query;
      searchArticles(query);
      speakRobotic(`Searching articles matching ${query}`);
      addConsoleLog(`Searching: "${query}"`, "action");
    }
  } else if (cmd.includes("system status") || cmd.includes("status")) {
    const activeCat = document.querySelector(".cat-btn.active")?.textContent?.trim() || "All";
    speakRobotic(`System fully operational. Mainframe core synchronized. Audio channels active. Active channel is ${activeCat}.`);
    addConsoleLog("STATUS: OPERATIONAL // 0 ANOMALIES", "action");
  } else if (cmd === "mute" || cmd === "turn off audio" || cmd === "disable audio") {
    if (sysAudioEnabled) {
      toggleSysAudio();
      speakRobotic("Audio feed disabled.");
    }
  } else if (cmd === "unmute" || cmd === "turn on audio" || cmd === "enable audio") {
    if (!sysAudioEnabled) {
      toggleSysAudio();
      speakRobotic("Audio feed enabled.");
    }
  } else if (cmd.includes("scroll down") || cmd === "down") {
    window.scrollBy({ top: window.innerHeight * 0.7, behavior: "smooth" });
    speakRobotic("Scrolling down.");
  } else if (cmd.includes("scroll up") || cmd === "up") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    speakRobotic("Scrolling to top.");
  } else {
    speakRobotic("Command not recognized. Please retry.");
    addConsoleLog("COMMAND UNRECOGNIZED // AVAILABLE: display [cat], search [term], status, mute, unmute, scroll", "hint");
  }
}

function initVoiceHUD() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    const status = document.getElementById("voice-hud-status");
    if (status) {
      status.textContent = "SYS_VOICE [UNSUPPORTED]";
      status.style.color = "#ff3b30";
      addConsoleLog("SPEECH RECOGNITION API NOT SUPPORTED BY BROWSER.", "error");
    }
    return;
  }

  voiceRecognition = new SpeechRecognition();
  voiceRecognition.continuous = true;
  voiceRecognition.interimResults = false;
  voiceRecognition.lang = 'en-US';
  
  voiceRecognition.onstart = () => {
    document.getElementById("voice-hud-indicator").classList.add("listening");
    document.getElementById("voice-hud-status").textContent = "SYS_VOICE [LISTENING...]";
    document.getElementById("voice-hud-status").style.color = "var(--secondary)";
    addConsoleLog("SPEECH CHANNELS OPENED. LISTENING...", "system");
    speakRobotic("Voice console activated. Standby for commands.");
  };
  
  voiceRecognition.onend = () => {
    document.getElementById("voice-hud-indicator").classList.remove("listening");
    if (voiceHudActive) {
      try { voiceRecognition.start(); } catch(e) {}
    } else {
      document.getElementById("voice-hud-status").textContent = "SYS_VOICE [STANDBY]";
      document.getElementById("voice-hud-status").style.color = "var(--text-muted)";
      document.getElementById("voice-hud-status").parentElement.querySelector(".hud-mic-btn").classList.remove("active");
      addConsoleLog("SPEECH CHANNELS CLOSED.", "system");
    }
  };
  
  voiceRecognition.onerror = (event) => {
    console.error("Speech Recognition Error:", event.error);
    if (event.error === 'not-allowed') {
      addConsoleLog("ERROR: MICROPHONE PERMISSION DENIED.", "error");
      speakRobotic("Microphone access denied.");
      deactivateVoiceHUD();
    } else {
      addConsoleLog(`ERROR: ${event.error.toUpperCase()}`, "error");
    }
  };
  
  voiceRecognition.onresult = (event) => {
    const resultIndex = event.resultIndex;
    const transcript = event.results[resultIndex][0].transcript;
    const confidence = event.results[resultIndex][0].confidence;
    
    addConsoleLog(`Heard: "${transcript}" (Confidence: ${Math.round(confidence * 100)}%)`, "user");
    processVoiceCommand(transcript);
  };
}

function deactivateVoiceHUD() {
  voiceHudActive = false;
  const btn = document.getElementById("voice-hud-btn");
  if (btn) btn.classList.remove("active");
  if (voiceRecognition) {
    try { voiceRecognition.stop(); } catch(e){}
  }
}

function toggleVoiceHUD() {
  voiceHudActive = !voiceHudActive;
  const btn = document.getElementById("voice-hud-btn");
  if (voiceHudActive) {
    btn.classList.add("active");
    try {
      initAudioContext();
      voiceRecognition.start();
    } catch(e) {
      console.error(e);
      voiceHudActive = false;
      btn.classList.remove("active");
    }
  } else {
    deactivateVoiceHUD();
    speakRobotic("Voice console deactivated.");
  }
}

function attachCyberAudioGlobalListeners() {
  // Global Event Delegation for Cyber Audio hover feedbacks
  let lastHoveredElement = null;
  document.body.addEventListener("mouseover", (e) => {
    const target = e.target.closest(".cat-btn, .news-card, .market-link-card, button, a, #searchInput, .attach-btn, .send-btn");
    if (target && target !== lastHoveredElement) {
      lastHoveredElement = target;
      playCyberClick();
    }
  });

  document.body.addEventListener("mouseout", (e) => {
    const target = e.target.closest(".cat-btn, .news-card, .market-link-card, button, a, #searchInput, .attach-btn, .send-btn");
    if (target && e.relatedTarget && !target.contains(e.relatedTarget)) {
      lastHoveredElement = null;
    }
  });

  // Global Click delegate
  document.body.addEventListener("click", (e) => {
    const target = e.target.closest(".cat-btn, .news-card a, .read-more, button, #sys-audio-toggle");
    if (target) {
      playSelectSweep();
    }
  });
}

// ─── Holographic 3D Spatial Computing Parallax Layers ─────
function initHolographicParallax() {
  const panels = document.querySelectorAll(".hud-panel");
  
  document.addEventListener("mousemove", (e) => {
    const mx = e.clientX;
    const my = e.clientY;
    
    panels.forEach((panel) => {
      const rect = panel.getBoundingClientRect();
      const px = rect.left + rect.width / 2;
      const py = rect.top + rect.height / 2;
      
      // Compute 3D rotation offsets (max 7 degrees tilt for premium subtlety)
      const dx = (mx - px) / window.innerWidth;
      const dy = (my - py) / window.innerHeight;
      
      const rx = (-dy * 7).toFixed(2);
      const ry = (dx * 7).toFixed(2);
      
      // Calculate highlight reflection point percentage
      const hx = Math.round(((mx - rect.left) / rect.width) * 100);
      const hy = Math.round(((my - rect.top) / rect.height) * 100);
      
      panel.style.setProperty("--rx", `${rx}deg`);
      panel.style.setProperty("--ry", `${ry}deg`);
      panel.style.setProperty("--mx", `${hx}%`);
      panel.style.setProperty("--my", `${hy}%`);
    });
  });
  
  // Gracefully reset orientation when mouse leaves the page viewport
  document.addEventListener("mouseleave", () => {
    panels.forEach((panel) => {
      panel.style.setProperty("--rx", `0deg`);
      panel.style.setProperty("--ry", `0deg`);
    });
  });
}

// ─── Cognitive Waveform Spectrum Canvas Wave Engine ───────
let voiceCanvas = null;
let voiceCanvasCtx = null;
let voiceAnimFrameId = null;
let voiceWaveTargetAmplitude = 0.04;
let voiceWaveCurrentAmplitude = 0.04;

function initVoiceSpectrumCanvas() {
  voiceCanvas = document.getElementById("voice-spectrum-canvas");
  if (!voiceCanvas) return;
  
  voiceCanvasCtx = voiceCanvas.getContext("2d");
  if (!voiceCanvasCtx) return;
  
  // Seamless high-performance scaling support
  function resize() {
    if (!voiceCanvas) return;
    voiceCanvas.width = voiceCanvas.parentElement.clientWidth;
    voiceCanvas.height = voiceCanvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener("resize", resize);
  
  let phase = 0;
  
  function draw() {
    voiceAnimFrameId = requestAnimationFrame(draw);
    if (!voiceCanvas || !voiceCanvasCtx) return;
    
    const w = voiceCanvas.width;
    const h = voiceCanvas.height;
    
    voiceCanvasCtx.clearRect(0, 0, w, h);
    
    // Check voice states to adjust waveform energy in real time
    let activeSpeaking = false;
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      activeSpeaking = true;
    }
    
    if (voiceHudActive) {
      voiceWaveTargetAmplitude = activeSpeaking ? 0.85 : 0.3;
    } else {
      voiceWaveTargetAmplitude = activeSpeaking ? 0.65 : 0.05;
    }
    
    // Smooth linear interpolation (lerp)
    voiceWaveCurrentAmplitude += (voiceWaveTargetAmplitude - voiceWaveCurrentAmplitude) * 0.12;
    
    phase += 0.07 * (1 + voiceWaveCurrentAmplitude);
    
    // Render triple overlapping harmonic wave bands
    const waves = [
      { frequency: 0.025, phaseOffset: 0, ampMult: 0.85, color: "rgba(0, 240, 255, 0.65)" },    // Primary (Cyan)
      { frequency: 0.045, phaseOffset: Math.PI / 2, ampMult: 0.5, color: "rgba(157, 78, 221, 0.5)" }, // Secondary (Purple)
      { frequency: 0.018, phaseOffset: Math.PI, ampMult: 0.35, color: "rgba(16, 185, 129, 0.45)" }    // Accent (Emerald)
    ];
    
    waves.forEach((wave) => {
      voiceCanvasCtx.beginPath();
      voiceCanvasCtx.lineWidth = wave.frequency === 0.025 ? 1.8 : 1.0;
      voiceCanvasCtx.strokeStyle = wave.color;
      
      for (let x = 0; x < w; x++) {
        // Standard Gaussian envelope for smooth mathematical fade out at borders
        const envelope = Math.sin((x / w) * Math.PI);
        const y = h / 2 + Math.sin(x * wave.frequency + phase + wave.phaseOffset) * (h * 0.38) * voiceWaveCurrentAmplitude * envelope;
        
        if (x === 0) {
          voiceCanvasCtx.moveTo(x, y);
        } else {
          voiceCanvasCtx.lineTo(x, y);
        }
      }
      voiceCanvasCtx.stroke();
    });
    
    // Inundate with real-time bio-spectrum diagnostics logs
    voiceCanvasCtx.fillStyle = "rgba(0, 240, 255, 0.25)";
    voiceCanvasCtx.font = "6px monospace";
    voiceCanvasCtx.fillText(`AMP: ${voiceWaveCurrentAmplitude.toFixed(4)} // SPECTRUM_CORE_OK`, 12, h - 8);
    voiceCanvasCtx.fillText(`FREQ: ${(0.05 * (1 + voiceWaveCurrentAmplitude)).toFixed(4)}Hz`, w - 110, h - 8);
  }
  
  draw();
}

// ─── Y2K38 Temporal Divergence HUD Countdown Ticker ───────
function initTemporalDivergenceHUD() {
  const epochValueSec = document.getElementById("epoch-value-sec");
  const epochValueNano = document.getElementById("epoch-value-nano");
  const epochProgressBar = document.getElementById("epoch-progressbar");
  const entropyValue = document.getElementById("entropy-value");
  
  if (!epochValueSec) return;
  
  // Absolute Y2K38 Integer Limit: January 19, 2038 03:14:07 UTC (2147483647000 Epoch ms)
  const targetEpochMs = 2147483647000;
  
  // Systems hum simulation
  let currentEntropy = 0.0105;
  
  function updateTemporalHUD() {
    const nowMs = Date.now();
    const deltaMs = targetEpochMs - nowMs;
    
    if (deltaMs <= 0) {
      epochValueSec.textContent = "0.000000000";
      epochProgressBar.style.width = "100%";
      entropyValue.textContent = "CORE_OVERFLOW // INTEGERS_SATURATED";
      return;
    }
    
    // Ultra high nanosecond calculation
    const totalSecs = Math.floor(deltaMs / 1000);
    const fractionalMs = deltaMs % 1000;
    const randomNanos = Math.floor(Math.random() * 1000); // Fractional microsecond simulation
    
    const nanoString = (fractionalMs * 1000000 + randomNanos).toString().padStart(9, "0");
    
    epochValueSec.textContent = totalSecs.toLocaleString() + " s";
    epochValueNano.textContent = "." + nanoString + " ns";
    
    // Relative year 2020-2038 progression percentage
    const startMs = 1577836800000; // Jan 1, 2020
    const pct = ((nowMs - startMs) / (targetEpochMs - startMs)) * 100;
    if (epochProgressBar) {
      epochProgressBar.style.width = `${Math.min(100, Math.max(0, pct)).toFixed(6)}%`;
    }
    
    // Generate fractional Brownian drift core telemetry entropy
    currentEntropy += (Math.random() - 0.5) * 0.0004;
    currentEntropy = Math.max(0.005, Math.min(0.08, currentEntropy));
    if (entropyValue) {
      entropyValue.textContent = `SYSTEM_ENTROPY: ${currentEntropy.toFixed(5)}% // CORE_TEMP: ${((36.5 + currentEntropy * 120).toFixed(2))}°C`;
    }
    
    requestAnimationFrame(updateTemporalHUD);
  }
  
  updateTemporalHUD();
}

// ─── Cyber Maincore Terminal Bootloader Decrypter ────────
function initMaincoreBootloader() {
  const overlay = document.getElementById("sys-bootloader-overlay");
  const monitor = document.getElementById("boot-monitor");
  const fill = document.getElementById("boot-progress-fill");
  const decryptEl = document.getElementById("boot-decrypt");
  
  if (!overlay) return;
  
  const bootLogs = [
    { text: "Initializing SENTINEL SECURE TERMINAL v4.8...", type: "system", delay: 80 },
    { text: "Loading mainframe core configurations...", type: "system", delay: 240 },
    { text: "Querying physical network datalink status...", type: "system", delay: 420 },
    { text: "WAN: Connected to global legacy node via IPv4/IPv6 symmetric link.", type: "ok", delay: 600 },
    { text: "Memory block allocations initializing...", type: "system", delay: 800 },
    { text: "ALLOC: 16TB synthetic cache block secured in virtual paging grid.", type: "ok", delay: 960 },
    { text: "Decrypting Web 3.0 secure identity modules...", type: "sec", delay: 1150 },
    { text: "DECRYPT: Core key block [0x9F4ED8] fully resolved.", type: "ok", delay: 1400 },
    { text: "Loading spatial 3D holographic matrix shaders...", type: "system", delay: 1600 },
    { text: "WARNING: High temporal delta detected. Current node: Year 2026.", type: "warn", delay: 1800 },
    { text: "CHRONOLOGY: Temporal Safe-Node fully active (Y2K38 Divergence enabled).", type: "alert", delay: 2050 },
    { text: "Initializing cybernetic synthesized feedback audio bus...", type: "system", delay: 2250 },
    { text: "AUDIO: Starship ambient 55Hz mainframe sub-hum standing by.", type: "ok", delay: 2450 },
    { text: "Mainframe synchronization complete. Launching dashboard...", type: "ok", delay: 2750 }
  ];
  
  // Real-time hex characters decryption ticker
  let decryptInterval = setInterval(() => {
    if (!decryptEl) return;
    const characters = "0123456789ABCDEF[]{}//$#@!%^&*()";
    let hex = "SEC_DECRYPT // [";
    for (let i = 0; i < 16; i++) {
      hex += characters[Math.floor(Math.random() * characters.length)];
    }
    hex += "]";
    decryptEl.textContent = hex;
  }, 40);
  
  // Print each bootline sequential log
  bootLogs.forEach((log) => {
    setTimeout(() => {
      if (!monitor) return;
      const line = document.createElement("div");
      line.className = `boot-line ${log.type || ''}`;
      line.innerHTML = `<span class="boot-arrow">>></span> <span class="boot-text">${log.text}</span>`;
      monitor.appendChild(line);
      monitor.scrollTop = monitor.scrollHeight;
      
      // Tick cyber audio
      if (sysAudioEnabled && audioCtx) {
        try {
          const now = audioCtx.currentTime;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.frequency.setValueAtTime(1100, now);
          gain.gain.setValueAtTime(0.004, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.03);
        } catch(e){}
      }
    }, log.delay);
  });
  
  const startBootTime = Date.now();
  const totalBootTime = 3100;
  
  // Handle loader filling and removal
  const progressInterval = setInterval(() => {
    const elapsed = Date.now() - startBootTime;
    const pct = Math.min(100, (elapsed / totalBootTime) * 100);
    
    if (fill) fill.style.width = `${pct}%`;
    
    if (elapsed >= totalBootTime) {
      clearInterval(progressInterval);
      clearInterval(decryptInterval);
      
      // Play ascending high-fidelity boot activation chime
      if (sysAudioEnabled && audioCtx) {
        try {
          const now = audioCtx.currentTime;
          const osc1 = audioCtx.createOscillator();
          const osc2 = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          
          osc1.frequency.setValueAtTime(440, now);
          osc1.frequency.exponentialRampToValueAtTime(880, now + 0.28);
          
          osc2.frequency.setValueAtTime(554.37, now);
          osc2.frequency.exponentialRampToValueAtTime(1108.73, now + 0.28);
          
          g.gain.setValueAtTime(0.06, now);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
          
          osc1.connect(g);
          osc2.connect(g);
          g.connect(audioCtx.destination);
          
          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.4);
          osc2.stop(now + 0.4);
        } catch(e){}
      }
      
      // Speak final voice welcome prompt
      setTimeout(() => {
        speakRobotic("Sentinel Intelligence Mainframe core active. System fully operational.");
      }, 350);
      
      // Fade boot overlay
      overlay.style.transition = "opacity 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)";
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.style.display = "none";
      }, 800);
    }
  }, 30);
}

// ─── Continuous Futuristic Live Market Ticker tape ────────
function initLiveTicker() {
  const track = document.getElementById("cyber-ticker-track-el");
  if (!track) return;

  // Real-time market indices starting state matching real benchmarks
  const marketIndices = [
    { id: "nifty50", name: "NIFTY 50", price: 22475.85, change: 124.50, pct: 0.56, base: 22475.85 },
    { id: "sensex", name: "SENSEX", price: 73910.45, change: 350.20, pct: 0.48, base: 73910.45 },
    { id: "banknifty", name: "BANK NIFTY", price: 47924.90, change: -180.40, pct: -0.37, base: 47924.90 },
    { id: "niftyit", name: "NIFTY IT", price: 34150.15, change: 245.80, pct: 0.72, base: 34150.15 },
    { id: "sp500", name: "S&P 500", price: 5120.35, change: 18.90, pct: 0.37, base: 5120.35 },
    { id: "nasdaq", name: "NASDAQ", price: 16185.20, change: 85.60, pct: 0.53, base: 16185.20 },
    { id: "usdinr", name: "USD / INR", price: 83.4250, change: -0.0150, pct: -0.018, base: 83.4250 }
  ];

  // Function to build HTML for index list (single copy)
  function renderIndexHtml(item, index) {
    const isUp = item.change >= 0;
    const changeClass = isUp ? "tick-up" : "tick-down";
    const changeSign = isUp ? "+" : "";
    const changeArrow = isUp ? "▲" : "▼";
    const formattedPrice = item.price.toLocaleString("en-IN", {
      minimumFractionDigits: item.id === "usdinr" ? 4 : 2,
      maximumFractionDigits: item.id === "usdinr" ? 4 : 2
    });
    const formattedChange = Math.abs(item.change).toLocaleString("en-IN", {
      minimumFractionDigits: item.id === "usdinr" ? 4 : 2,
      maximumFractionDigits: item.id === "usdinr" ? 4 : 2
    });
    const formattedPct = Math.abs(item.pct).toFixed(2);

    return `
      <div class="ticker-item" data-index-id="${item.id}" data-item-idx="${index}">
        <span class="ticker-item-name">${item.name}</span>
        <span class="ticker-item-price">${formattedPrice}</span>
        <span class="ticker-item-change ${changeClass}">
          <span>${changeArrow}</span>
          <span>${changeSign}${formattedChange} (${changeSign}${formattedPct}%)</span>
        </span>
      </div>
    `;
  }

  // Render both copies side by side for infinite marquee loop
  function renderTicker() {
    let html = "";
    // Copy 1
    marketIndices.forEach((item, idx) => {
      html += renderIndexHtml(item, idx);
    });
    // Copy 2 (identical duplicate for seamless scroll)
    marketIndices.forEach((item, idx) => {
      html += renderIndexHtml(item, idx);
    });
    track.innerHTML = html;
  }

  // Initial render
  renderTicker();

  // High-frequency continuous tick simulation engine
  setInterval(() => {
    // Randomly pick 1 to 3 indices to update on this tick
    const countToUpdate = Math.floor(Math.random() * 3) + 1;
    const updatedIndices = [];

    for (let i = 0; i < countToUpdate; i++) {
      const idx = Math.floor(Math.random() * marketIndices.length);
      if (updatedIndices.includes(idx)) continue;
      updatedIndices.push(idx);

      const item = marketIndices[idx];
      const isUpTick = Math.random() > 0.45; // slightly bullish bias
      
      // Calculate micro-change percentage (e.g., between 0.005% and 0.03%)
      const tickPct = (Math.random() * 0.025 + 0.005) / 100;
      const priceDelta = item.price * tickPct * (isUpTick ? 1 : -1);
      
      // Update price
      item.price += priceDelta;
      
      // Update overall day's change relative to base price
      item.change += priceDelta;
      item.pct = (item.change / item.base) * 100;

      // Find matching items in DOM (both copies) and animate/flash them
      const tickerElements = track.querySelectorAll(`.ticker-item[data-index-id="${item.id}"]`);
      tickerElements.forEach((el) => {
        const priceEl = el.querySelector(".ticker-item-price");
        const changeEl = el.querySelector(".ticker-item-change");

        // Format values
        const formattedPrice = item.price.toLocaleString("en-IN", {
          minimumFractionDigits: item.id === "usdinr" ? 4 : 2,
          maximumFractionDigits: item.id === "usdinr" ? 4 : 2
        });
        const isUp = item.change >= 0;
        const changeClass = isUp ? "tick-up" : "tick-down";
        const changeSign = isUp ? "+" : "";
        const changeArrow = isUp ? "▲" : "▼";
        const formattedChange = Math.abs(item.change).toLocaleString("en-IN", {
          minimumFractionDigits: item.id === "usdinr" ? 4 : 2,
          maximumFractionDigits: item.id === "usdinr" ? 4 : 2
        });
        const formattedPct = Math.abs(item.pct).toFixed(2);

        // Instantly update values
        if (priceEl) {
          priceEl.textContent = formattedPrice;
          
          // Flash tick direction styling
          priceEl.classList.remove("tick-up", "tick-down");
          priceEl.classList.add(isUpTick ? "tick-up" : "tick-down");
          
          // Glow animation on ticker item
          el.classList.remove("flash-up", "flash-down");
          // Force layout reflow to restart animation
          void el.offsetWidth;
          el.classList.add(isUpTick ? "flash-up" : "flash-down");

          // Play subtle micro cyber-click audio chime on live change if sound is enabled!
          if (sysAudioEnabled && typeof playCyberClick === "function" && Math.random() > 0.7) {
            playCyberClick();
          }

          // Reset price text styling after a brief delay
          setTimeout(() => {
            priceEl.classList.remove("tick-up", "tick-down");
          }, 400);
        }

        if (changeEl) {
          changeEl.className = `ticker-item-change ${changeClass}`;
          changeEl.innerHTML = `
            <span>${changeArrow}</span>
            <span>${changeSign}${formattedChange} (${changeSign}${formattedPct}%)</span>
          `;
        }
      });
    }
  }, 1200); // 1.2 second tick intervals
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

  // Initialize Cyber mainframe HUD features
  initSensorGrid();
  initVoiceHUD();
  attachCyberAudioGlobalListeners();
  
  // Initialize newly loaded 2037 advanced telemetry engines
  initHolographicParallax();
  initVoiceSpectrumCanvas();
  initTemporalDivergenceHUD();
  initMaincoreBootloader();
  
  // Initialize continuous live indices ticker tape
  initLiveTicker();
});

// ─── Telemetry HUD Collapsible Toggle ─────────────────────
function toggleTelemetryHUD() {
  const hud = document.querySelector(".cyber-hud-dashboard");
  const btn = document.getElementById("telemetryToggleBtn");
  const arrow = document.getElementById("telemetry-arrow");
  
  if (!hud || !btn) return;
  
  const isCollapsed = hud.classList.contains("collapsed");
  
  if (isCollapsed) {
    hud.classList.remove("collapsed");
    btn.classList.add("active");
    if (arrow) arrow.textContent = "▲";
    
    // Play cyber click when opening
    if (typeof playCyberClick === "function") {
      playCyberClick();
    }
  } else {
    hud.classList.add("collapsed");
    btn.classList.remove("active");
    if (arrow) arrow.textContent = "▼";
    
    // Play cyber click when closing
    if (typeof playCyberClick === "function") {
      playCyberClick();
    }
  }
}
