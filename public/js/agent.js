// ============================================================
// SENTINEL AI AGENT
// Client-side integration with Google Gemini 1.5 Flash API
// ============================================================

let currentImageBase64 = null;
let currentImageMime = null;
const MODEL_NAME = "gemini-1.5-flash";

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
    const key = localStorage.getItem("gemini_api_key");
    if (key) {
        document.getElementById("api-key-input").value = key;
    }
}

function closeAISettings() {
    document.getElementById("ai-settings-modal").classList.remove("active");
}

function saveAPIKey() {
    const key = document.getElementById("api-key-input").value.trim();
    if (key) {
        localStorage.setItem("gemini_api_key", key);
        closeAISettings();
        addMessage("ai", "API Key saved securely in your browser! I am ready to assist.");
    } else {
        alert("Please enter a valid API key.");
    }
}

function checkAPIKey() {
    const key = localStorage.getItem("gemini_api_key");
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
    document.getElementById("image-preview-area").innerHTML = '';
    document.getElementById("ai-file-input").value = '';
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
    // Very basic markdown parsing for bold and line breaks
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

// ─── GEMINI API CALL ──────────────────────────────────────

function buildSystemContext() {
    // Provide the AI with the dashboard's current state
    if (!window.briefingData) return "You are Sentinel AI, a super advanced intelligence analyst.";
    
    let context = "You are Sentinel AI, a highly advanced intelligence analyst embedded in a dashboard. You must be extremely concise, sharp, and accurate.\n\n";
    context += "CURRENT DASHBOARD HEADLINES (To use as context if the user asks for news/summaries):\n";
    
    const maxCategories = 5;
    const cats = Object.values(window.briefingData.categories).slice(0, maxCategories);
    
    for (const cat of cats) {
        context += `\n[${cat.name}]\n`;
        const topArticles = cat.articles.slice(0, 5); // Limit context size
        for (const article of topArticles) {
            context += `- ${article.title} (${article.source})\n`;
        }
    }
    
    return context;
}

async function sendAIMessage() {
    const input = document.getElementById("ai-input");
    const text = input.value.trim();
    const apiKey = localStorage.getItem("gemini_api_key");

    if (!text && !currentImageBase64) return;
    
    if (!apiKey) {
        openAISettings();
        return;
    }

    // Capture image before clearing UI
    const previewSrc = currentImageBase64 ? `data:${currentImageMime};base64,${currentImageBase64}` : null;
    const payloadImageBase64 = currentImageBase64;
    const payloadImageMime = currentImageMime;

    // Clear UI
    input.value = "";
    removeImage();
    
    // Show User Message
    addMessage("user", text, previewSrc);
    showTyping();

    try {
        // Build API Payload
        const contents = [];
        const parts = [];
        
        if (text) {
            parts.push({ text: text });
        }
        
        if (payloadImageBase64) {
            parts.push({
                inline_data: {
                    mime_type: payloadImageMime,
                    data: payloadImageBase64
                }
            });
        }
        
        contents.push({ role: "user", parts: parts });

        const requestBody = {
            system_instruction: {
                parts: [{ text: buildSystemContext() }]
            },
            contents: contents,
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 1000
            }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        hideTyping();

        if (!response.ok) {
            console.error("Gemini Error:", data);
            if (response.status === 400 && data.error && data.error.message.includes("API key not valid")) {
                addMessage("ai", "❌ Your API key is invalid. Please check your settings.");
                openAISettings();
            } else {
                addMessage("ai", `❌ API Error: ${data.error?.message || response.statusText}`);
            }
            return;
        }

        const aiText = data.candidates[0]?.content?.parts[0]?.text || "I have no response.";
        addMessage("ai", aiText);

    } catch (error) {
        console.error("Network Error:", error);
        hideTyping();
        addMessage("ai", `❌ Network error: ${error.message}`);
    }
}
