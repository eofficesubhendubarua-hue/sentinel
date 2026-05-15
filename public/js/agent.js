// ============================================================
// SENTINEL UNIVERSAL AI AGENT
// Supports Gemini, Groq (Llama-3), and OpenRouter
// ============================================================

let currentImageBase64 = null;
let currentImageMime = null;

const PROVIDERS = {
    gemini: {
        models: [
            { id: "gemini-1.5-flash-latest", name: "Gemini 1.5 Flash (Fast, Free, Multimodal)" },
            { id: "gemini-1.5-pro-latest", name: "Gemini 1.5 Pro (Advanced, Multimodal)" },
            { id: "gemini-1.0-pro", name: "Gemini 1.0 Pro (Text Only)" }
        ],
        url: "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}",
        helpText: "Get a free key from: aistudio.google.com"
    },
    groq: {
        models: [
            { id: "llama3-70b-8192", name: "Llama 3 70B (Extremely Fast, Smart)" },
            { id: "llama3-8b-8192", name: "Llama 3 8B (Instant)" },
            { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B (Large Context)" }
        ],
        url: "https://api.groq.com/openai/v1/chat/completions",
        helpText: "Get a free key from: console.groq.com/keys"
    },
    openrouter: {
        models: [
            { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B (Free)" },
            { id: "google/gemma-7b-it:free", name: "Google Gemma 7B (Free)" },
            { id: "meta-llama/llama-3-8b-instruct:free", name: "Llama 3 8B (Free)" }
        ],
        url: "https://openrouter.ai/api/v1/chat/completions",
        helpText: "Get a free key from: openrouter.ai/keys"
    }
};

// ─── UI CONTROLS ──────────────────────────────────────────

function toggleAIChat() {
    const panel = document.getElementById("ai-chat-panel");
    panel.classList.toggle("active");
    if (panel.classList.contains("active")) {
        checkAPIKey();
        document.getElementById("ai-input").focus();
    }
}

function openAISettings() {
    document.getElementById("ai-settings-modal").classList.add("active");
    
    // Load last used provider
    const savedProvider = localStorage.getItem("ai_active_provider") || "gemini";
    const providerSelect = document.getElementById("ai-provider-select");
    if (providerSelect) providerSelect.value = savedProvider;
    
    handleProviderChange();
}

function handleProviderChange() {
    const provider = document.getElementById("ai-provider-select").value;
    const modelSelect = document.getElementById("ai-model-select");
    const helpText = document.getElementById("api-key-help");
    const keyInput = document.getElementById("api-key-input");
    const attachBtn = document.querySelector(".attach-btn");

    // Populate models
    modelSelect.innerHTML = "";
    PROVIDERS[provider].models.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.name;
        modelSelect.appendChild(opt);
    });

    // Load saved model for this provider if any
    const savedModel = localStorage.getItem(`ai_model_${provider}`);
    if (savedModel && PROVIDERS[provider].models.some(m => m.id === savedModel)) {
        modelSelect.value = savedModel;
    }

    // Load saved key for this provider
    const savedKey = localStorage.getItem(`ai_key_${provider}`);
    keyInput.value = savedKey || "";
    
    // Update help text
    helpText.textContent = PROVIDERS[provider].helpText;

    // Toggle Image Attachment UI (Only Gemini supports it easily here right now)
    if (provider === "gemini") {
        attachBtn.style.display = "flex";
    } else {
        attachBtn.style.display = "none";
        removeImage(); // clear if any
    }
}

function closeAISettings() {
    document.getElementById("ai-settings-modal").classList.remove("active");
}

function saveAPIKey() {
    const provider = document.getElementById("ai-provider-select").value;
    const model = document.getElementById("ai-model-select").value;
    const key = document.getElementById("api-key-input").value.trim();
    
    if (key) {
        localStorage.setItem(`ai_key_${provider}`, key);
        localStorage.setItem(`ai_model_${provider}`, model);
        localStorage.setItem("ai_active_provider", provider);
        closeAISettings();
        addMessage("ai", `Settings saved! Using **${provider.toUpperCase()}** with model **${model}**.`);
    } else {
        alert("Please enter a valid API key for the selected provider.");
    }
}

function checkAPIKey() {
    const provider = localStorage.getItem("ai_active_provider") || "gemini";
    const key = localStorage.getItem(`ai_key_${provider}`);
    if (!key) {
        openAISettings();
    }
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
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
}

function formatMarkdown(text) {
    let formatted = escapeHtmlText(text);
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
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
    
    const provider = localStorage.getItem("ai_active_provider") || "gemini";
    const apiKey = localStorage.getItem(`ai_key_${provider}`);
    const modelName = localStorage.getItem(`ai_model_${provider}`) || PROVIDERS[provider].models[0].id;

    if (!text && !currentImageBase64) return;
    
    if (!apiKey) {
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
        if (provider === "gemini") {
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
    if (modelName.includes("1.5")) {
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
        addMessage("ai", `❌ ${provider.toUpperCase()} API Error: ${errMsg}`);
        return;
    }

    const aiText = data.choices[0]?.message?.content || "I have no response.";
    addMessage("ai", aiText);
}
