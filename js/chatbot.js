// ===================================
// BLUEBUB AI CHATBOT - NO LOGIN REQUIRED
// ===================================

// Global variables
let chatbotActive = false;
let sessionId = null;

// ===================================
// INITIALIZATION
// ===================================

// Initialize chatbot on page load
document.addEventListener('DOMContentLoaded', () => {
    // Get or create session ID from localStorage
    sessionId = localStorage.getItem('bluebub_chat_session');
    
    if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem('bluebub_chat_session', sessionId);
    }
    
    console.log('✅ Chatbot initialized with session:', sessionId);
    
    // Setup Enter key listener
    const inputField = document.getElementById('chatbot-input-field');
    if (inputField) {
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
    
    // Show quick actions after a short delay
    setTimeout(() => {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (messagesContainer && messagesContainer.children.length === 1) {
            addQuickActions();
        }
    }, 1000);
});

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Generate unique session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Toggle chatbot visibility
function toggleChatbot() {
    const chatbot = document.getElementById('bluebub-chatbot');
    const toggleBtn = document.querySelector('.chatbot-toggle');
    chatbotActive = !chatbotActive;
    
    if (chatbotActive) {
        chatbot.classList.add('active');
        toggleBtn.style.display = 'none';
    } else {
        chatbot.classList.remove('active');
        toggleBtn.style.display = 'block';
    }
}

// ===================================
// CHAT MESSAGE FUNCTIONS
// ===================================


function addMessage(text, isUser, context = null) {
    hideWelcome();
    
    // ✅ Simple Markdown conversion
    let html = text
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>') // ***bold italic***
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')               // **bold**
        .replace(/\*(.+?)\*/g, '<em>$1</em>')                           // *italic*
        .replace(/\n/g, '<br>');                                        // newlines
    
    const msg = document.createElement('div');
    msg.className = isUser ? 'message user-message' : 'message ai-message';
    msg.innerHTML = `<div class="message-content">
        <div class="message-avatar">${isUser ? '👤' : '🤖'}</div>
        <div class="message-text">${html}</div>
    </div>`;
    
    chatArea.appendChild(msg);
    setTimeout(() => {chatArea.scrollTop = chatArea.scrollHeight;}, 2);
}

// Main function to send chat message
async function sendChatMessage() {
    const inputField = document.getElementById('chatbot-input-field');
    const message = inputField.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    inputField.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Determine API URL based on environment
        const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:5000/api/chatbot/chat'
            : 'https://bluebub-backend.vercel.app/api/chatbot/chat';
        
        console.log('📤 Sending to:', API_URL);
        console.log('🔑 Session ID:', sessionId);
        console.log('💬 Message:', message);
        
        // Send to backend API (NO AUTH TOKEN NEEDED)
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                message,
                sessionId: sessionId
            })
        });
        
        console.log('📥 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 Response data:', data);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        if (data.success) {
            // Update session ID if returned
            if (data.sessionId) {
                sessionId = data.sessionId;
                localStorage.setItem('bluebub_chat_session', sessionId);
            }
            
            // Add bot response
            addMessageToChat(data.message, 'bot');
            
            // Show context tags if available
            if (data.context && data.context.length > 0) {
                addContextTags(data.context);
            }
        } else {
            // Handle error from API
            addMessageToChat('Maaf, terjadi kesalahan: ' + (data.error || 'Unknown error'), 'bot');
        }
        
    } catch (error) {
        console.error('❌ Chat error:', error);
        removeTypingIndicator();
        
        // Determine error type and show appropriate message
        let errorMsg = '⚠️ Koneksi bermasalah. ';
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMsg += 'Backend tidak dapat dijangkau. Pastikan server running di http://localhost:5000';
        } else if (error.message.includes('CORS')) {
            errorMsg += 'CORS error. Check backend CORS configuration.';
        } else if (error.message.includes('500')) {
            errorMsg += 'Server error. Check backend logs.';
        } else {
            errorMsg += error.message;
        }
        
        addMessageToChat(errorMsg, 'bot');
    }
}

// Add message to chat interface
function addMessageToChat(message, type) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'user' ? 'user-message' : 'bot-message';
    
    // Support HTML and line breaks in bot messages
    if (type === 'bot') {
        messageDiv.innerHTML = message.replace(/\n/g, '<br>');
    } else {
        messageDiv.textContent = message;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbot-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'bot-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// Add context tags below bot message
function addContextTags(contexts) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'context-tags';
    tagsDiv.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap; margin: 10px 0;';
    tagsDiv.innerHTML = contexts.map(ctx => 
        `<span class="tag" style="background: #e8eaf6; color: #5568d3; padding: 4px 12px; border-radius: 12px; font-size: 12px;">📚 ${ctx}</span>`
    ).join('');
    messagesContainer.appendChild(tagsDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ===================================
// SESSION MANAGEMENT
// ===================================

// Reset chat session
async function resetChatSession() {
    try {
        const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:5000/api/chatbot/reset'
            : 'https://bluebub-backend.vercel.app/api/chatbot/reset';
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Clear chat messages
            const messagesContainer = document.getElementById('chatbot-messages');
            messagesContainer.innerHTML = `
                <div class="bot-message">
                    <p><strong>✨ Chat direset!</strong></p>
                    <p>Percakapan baru dimulai. Silakan tanya apa saja tentang ekonomi biru Indonesia!</p>
                </div>
            `;
            
            // Generate new session ID
            sessionId = generateSessionId();
            localStorage.setItem('bluebub_chat_session', sessionId);
            
            console.log('🔄 Chat reset. New session:', sessionId);
            
            // Show quick actions again
            setTimeout(() => addQuickActions(), 500);
        }
        
    } catch (error) {
        console.error('❌ Reset error:', error);
        addMessageToChat('Gagal reset chat. Silakan refresh halaman.', 'bot');
    }
}

// ===================================
// QUICK ACTIONS
// ===================================

// Add quick action buttons
function addQuickActions() {
    const messagesContainer = document.getElementById('chatbot-messages');
    
    // Check if quick actions already exist
    if (messagesContainer.querySelector('.quick-actions')) {
        return;
    }
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'quick-actions';
    actionsDiv.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap; margin: 10px 0;';
    
    const actions = [
        'Data perikanan Indonesia',
        'Kolaborasi riset',
        'Peluang bisnis laut',
        'Teknologi ocean monitoring'
    ];
    
    actionsDiv.innerHTML = actions.map(action => 
        `<button class="quick-action-btn" onclick="quickAction('${action}')" style="padding: 8px 16px; background: white; border: 1px solid #ddd; border-radius: 20px; cursor: pointer; font-size: 13px; transition: all 0.3s;">
            ${action}
        </button>`
    ).join('');
    
    messagesContainer.appendChild(actionsDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Handle quick action click
function quickAction(message) {
    const inputField = document.getElementById('chatbot-input-field');
    inputField.value = message;
    sendChatMessage();
}

// ===================================
// CONSOLE INFO
// ===================================

console.log('%c🌊 Bluebub AI Chatbot Loaded', 'color: #667eea; font-size: 14px; font-weight: bold;');
console.log('%cVersion: 1.0.0', 'color: #999; font-size: 12px;');
console.log('%cNo login required - Public access enabled', 'color: #28a745; font-size: 12px;');