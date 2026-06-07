// ============================================================
// SENTINEL UNIVERSAL AI AGENT
// Supports Gemini, Groq, and OpenRouter with Perplexity-style UX
// ============================================================

let currentImageBase64 = null;
let currentImageMime = null;

const PROVIDERS = {
    gemini: {
        name: "Google Gemini",
        models: [
            { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (Fast, Multimodal)" },
            { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (Advanced)" }
        ],
        url: "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
    },
    groq: {
        name: "Groq (Ultra-Fast)",
        models: [
            { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B" },
            { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B" }
        ],
        url: "https://api.groq.com/openai/v1/chat/completions"
    },
    openrouter: {
        name: "OpenRouter (Community)",
        models: [
            { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (Free)" },
            { id: "deepseek/deepseek-v4-flash:free", name: "DeepSeek V4-Flash (Free)" },
            { id: "google/gemma-4-31b-it:free", name: "Google Gemma 4 31B (Free)" },
            { id: "meta-llama/llama-3.2-3b-instruct:free", name: "Llama 3.2 3B (Free)" }
        ],
        url: "https://openrouter.ai/api/v1/chat/completions"
    },
    pollinations: {
        name: "Public Web (No Key Required)",
        models: [
            { id: "pollinations-default", name: "Free Public AI (Instant)" }
        ],
        url: "https://text.pollinations.ai/"
    }
};

// Map to easily find provider by model ID
const MODEL_TO_PROVIDER = {};
Object.keys(PROVIDERS).forEach(providerKey => {
    PROVIDERS[providerKey].models.forEach(model => {
        MODEL_TO_PROVIDER[model.id] = providerKey;
    });
});

// ─── INITIALIZATION ───────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    initModelDropdown();
});

function initModelDropdown() {
    const select = document.getElementById("chat-model-select");
    if (!select) return;
    
    select.innerHTML = "";
    
    // Group models by provider
    Object.keys(PROVIDERS).forEach(providerKey => {
        const group = document.createElement("optgroup");
        group.label = PROVIDERS[providerKey].name;
        
        PROVIDERS[providerKey].models.forEach(model => {
            const opt = document.createElement("option");
            opt.value = model.id;
            opt.textContent = model.name;
            group.appendChild(opt);
        });
        select.appendChild(group);
    });

    // Restore last selected model
    const savedModel = localStorage.getItem("ai_active_model");
    if (savedModel && MODEL_TO_PROVIDER[savedModel]) {
        select.value = savedModel;
    }
    
    handleModelChange();
}

// ─── UI CONTROLS ──────────────────────────────────────────

function toggleAIChat() {
    const panel = document.getElementById("ai-chat-panel");
    panel.classList.toggle("active");
    if (panel.classList.contains("active")) {
        document.getElementById("ai-input").focus();
    }
}

function handleModelChange() {
    const select = document.getElementById("chat-model-select");
    if (!select) return;
    
    const modelId = select.value;
    localStorage.setItem("ai_active_model", modelId);
    
    const provider = MODEL_TO_PROVIDER[modelId];
    const attachBtn = document.getElementById("ai-attach-btn");
    
    // Toggle Image Attachment UI (Only Gemini natively supports it here right now)
    if (attachBtn) {
        if (provider === "gemini") {
            attachBtn.style.display = "flex";
        } else {
            attachBtn.style.display = "none";
            removeImage(); // clear if any
        }
    }
}

function openAISettings() {
    document.getElementById("ai-settings-modal").classList.add("active");
    
    // Load saved keys
    document.getElementById("key-gemini").value = localStorage.getItem("ai_key_gemini") || localStorage.getItem("gemini_api_key") || "";
    document.getElementById("key-groq").value = localStorage.getItem("ai_key_groq") || "";
    document.getElementById("key-openrouter").value = localStorage.getItem("ai_key_openrouter") || "";
}

function closeAISettings() {
    document.getElementById("ai-settings-modal").classList.remove("active");
}

function saveAPIKeys() {
    const keyGemini = document.getElementById("key-gemini").value.trim();
    const keyGroq = document.getElementById("key-groq").value.trim();
    const keyOpenrouter = document.getElementById("key-openrouter").value.trim();
    
    if (keyGemini) localStorage.setItem("ai_key_gemini", keyGemini);
    if (keyGroq) localStorage.setItem("ai_key_groq", keyGroq);
    if (keyOpenrouter) localStorage.setItem("ai_key_openrouter", keyOpenrouter);
    
    closeAISettings();
    addMessage("ai", "🔑 API Keys saved securely in your browser!");
}

// ─── IMAGE HANDLING ───────────────────────────────────────

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result.split(',')[1];
        currentImageBase64 = base64Data;
        currentImageMime = file.type;

        const previewArea = document.getElementById("image-preview-area");
        previewArea.innerHTML = `
            <div class="image-preview">
                <img src="${e.target.result}">
                <button class="remove-img" onclick="removeImage()">✕</button>
            </div>
        `;
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    currentImageBase64 = null;
    currentImageMime = null;
    const previewArea = document.getElementById("image-preview-area");
    if(previewArea) previewArea.innerHTML = '';
    const fileInput = document.getElementById("ai-file-input");
    if(fileInput) fileInput.value = '';
}

// ─── CHAT LOGIC ───────────────────────────────────────────

function handleEnter(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendAIMessage();
    }
}

function escapeHtmlText(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatMarkdown(text) {
    let formatted = escapeHtmlText(text);
    
    // Multi-line code blocks
    formatted = formatted.replace(/```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Inline code blocks
    formatted = formatted.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    
    // Bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

function addMessage(role, text, imageSrc = null) {
    const messagesDiv = document.getElementById("chat-messages");
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${role}`;
    
    msgDiv.innerHTML = formatMarkdown(text);
    
    if (imageSrc) {
        const img = document.createElement("img");
        img.src = imageSrc;
        msgDiv.appendChild(img);
    }
    
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showTyping() {
    const messagesDiv = document.getElementById("chat-messages");
    const msgDiv = document.createElement("div");
    msgDiv.className = "message ai typing-indicator-wrap";
    msgDiv.id = "typing-indicator";
    msgDiv.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function hideTyping() {
    const indicator = document.getElementById("typing-indicator");
    if (indicator) indicator.remove();
}

// ─── API CALL ROUTER ──────────────────────────────────────

function buildSystemContext() {
    if (!window.briefingData) return "You are Sentinel AI, an advanced analyst.";
    
    let context = "You are Sentinel AI, a highly advanced intelligence analyst embedded in a dashboard. You must be extremely concise, sharp, and accurate.\n\n";
    context += "CURRENT DASHBOARD HEADLINES (Use as context if asked for news):\n";
    
    const cats = Object.values(window.briefingData.categories).slice(0, 5);
    for (const cat of cats) {
        context += `\n[${cat.name}]\n`;
        const topArticles = cat.articles.slice(0, 5);
        for (const article of topArticles) {
            context += `- ${article.title} (${article.source})\n`;
        }
    }
    return context;
}

async function sendAIMessage() {
    const input = document.getElementById("ai-input");
    const text = input.value.trim();
    
    const select = document.getElementById("chat-model-select");
    const modelName = select.value;
    const provider = MODEL_TO_PROVIDER[modelName];
    
    // Check Firebase Auth
    if (typeof firebase !== 'undefined' && firebase.auth) {
        const user = firebase.auth().currentUser;
        if (!user) {
            addMessage("ai", `❌ **Authentication Required:** You must be logged in with Google or GitHub to use the Sentinel AI.`);
            return;
        }
    }
    
    // Check new storage key, fallback to legacy storage key for Gemini
    let apiKey = localStorage.getItem(`ai_key_${provider}`);
    if (!apiKey && provider === "gemini") {
        apiKey = localStorage.getItem("gemini_api_key");
        if (apiKey) localStorage.setItem("ai_key_gemini", apiKey); // Migrate it
    }

    if (!text && !currentImageBase64) return;
    
    if (!apiKey && provider !== "pollinations") {
        addMessage("ai", `❌ **Missing API Key:** You selected a model from **${PROVIDERS[provider].name}**, but you haven't saved a key for them. Please click the 🔑 icon to enter your key.`);
        openAISettings();
        return;
    }

    const previewSrc = currentImageBase64 ? `data:${currentImageMime};base64,${currentImageBase64}` : null;
    const payloadImageBase64 = currentImageBase64;
    const payloadImageMime = currentImageMime;

    input.value = "";
    removeImage();
    
    addMessage("user", text, previewSrc);
    showTyping();

    try {
        if (provider === "pollinations") {
            await fetchPollinations(text);
        } else if (provider === "gemini") {
            await fetchGemini(apiKey, modelName, text, payloadImageBase64, payloadImageMime);
        } else {
            await fetchOpenAICompatible(provider, apiKey, modelName, text);
        }
    } catch (error) {
        console.error("Network Error:", error);
        hideTyping();
        addMessage("ai", `❌ Network error: ${error.message}`);
    }
}

// ─── GEMINI SPECIFIC ──────────────────────────────────────
async function fetchGemini(apiKey, modelName, text, imgB64, imgMime) {
    const contents = [];
    const parts = [];
    
    if (text) parts.push({ text: text });
    if (imgB64) {
        parts.push({
            inline_data: { mime_type: imgMime, data: imgB64 }
        });
    }
    
    contents.push({ role: "user", parts: parts });

    let requestBody = {};
    if (modelName.startsWith("gemini")) {
        requestBody = {
            system_instruction: { parts: [{ text: buildSystemContext() }] },
            contents: contents,
            generationConfig: { temperature: 0.2, maxOutputTokens: 1000 }
        };
    } else {
        const firstPart = { text: buildSystemContext() + "\n\nUser Question:\n" + (text || "") };
        parts[0] = firstPart;
        requestBody = {
            contents: [{ role: "user", parts: parts }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 1000 }
        };
    }

    const url = PROVIDERS.gemini.url.replace("{model}", modelName).replace("{key}", apiKey);
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    hideTyping();

    if (!response.ok) {
        addMessage("ai", `❌ Gemini API Error: ${data.error?.message || response.statusText}`);
        return;
    }

    const aiText = data.candidates[0]?.content?.parts[0]?.text || "I have no response.";
    addMessage("ai", aiText);
}

// ─── OPENAI COMPATIBLE (GROQ / OPENROUTER) ────────────────
async function fetchOpenAICompatible(provider, apiKey, modelName, text) {
    const requestBody = {
        model: modelName,
        messages: [
            { role: "system", content: buildSystemContext() },
            { role: "user", content: text }
        ],
        temperature: 0.2,
        max_tokens: 1000
    };

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    if (provider === "openrouter") {
        headers['HTTP-Referer'] = window.location.href;
        headers['X-Title'] = "Sentinel Dashboard";
    }

    const url = PROVIDERS[provider].url;
    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    hideTyping();

    if (!response.ok) {
        const errMsg = data.error?.message || data.error || response.statusText;
        addMessage("ai", `❌ ${PROVIDERS[provider].name} API Error: ${errMsg}`);
        return;
    }

    const aiText = data.choices[0]?.message?.content || "I have no response.";
    addMessage("ai", aiText);
}

// ─── POLLINATIONS (KEYLESS) ───────────────────────────────
async function fetchPollinations(text) {
    const context = buildSystemContext();
    const prompt = context + "\n\nUser Question:\n" + text;
    
    // Pollinations accepts raw GET requests where the URL is the prompt
    const url = PROVIDERS.pollinations.url + encodeURIComponent(prompt);
    
    const response = await fetch(url);
    const dataText = await response.text();
    
    hideTyping();
    
    if (!response.ok) {
        addMessage("ai", `❌ Public Web API Error: Could not generate response.`);
        return;
    }
    
    addMessage("ai", dataText);
}
