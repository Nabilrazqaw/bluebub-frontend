const API_URL = 'http://localhost:5000/api';
let currentTopic = null;
let pollingInterval = null;

// DOM Elements
const topicsList = document.getElementById('topicsList');
const welcomeScreen = document.getElementById('welcomeScreen');
const discussionRoom = document.getElementById('discussionRoom');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const roomTitle = document.getElementById('roomTitle');
const roomDescription = document.getElementById('roomDescription');
const roomHeader = document.getElementById('roomHeader');
const messageCount = document.getElementById('messageCount');
const participantCount = document.getElementById('participantCount');

// Load topics on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTopics();
    updateAuthLinks();
    setupMessageInput();
});

// Load all discussion topics
async function loadTopics() {
    try {
        const response = await fetch(`${API_URL}/discussion/topics`);
        const data = await response.json();
        
        if (data.success) {
            displayTopics(data.data);
        }
    } catch (error) {
        console.error('Load topics error:', error);
        topicsList.innerHTML = '<div class="loading">Gagal memuat topik</div>';
    }
}

// Display topics in sidebar
function displayTopics(topics) {
    topicsList.innerHTML = '';
    
    topics.forEach(topic => {
        const topicCard = document.createElement('div');
        topicCard.className = 'topic-card';
        topicCard.innerHTML = `
            <div class="topic-header">
                <div class="topic-icon">${topic.icon}</div>
                <div class="topic-info">
                    <div class="topic-title">${topic.title}</div>
                </div>
            </div>
            <div class="topic-description">${topic.description}</div>
            <div class="topic-stats">
                <span>💬 ${topic.messageCount} pesan</span>
                <span>🕒 ${formatDate(topic.lastActivity)}</span>
            </div>
        `;
        
        topicCard.addEventListener('click', () => selectTopic(topic.topic, topicCard));
        topicsList.appendChild(topicCard);
    });
}

// Select and load a topic
async function selectTopic(topic, cardElement) {
    // Update UI
    document.querySelectorAll('.topic-card').forEach(card => {
        card.classList.remove('active');
    });
    cardElement.classList.add('active');
    
    currentTopic = topic;
    welcomeScreen.style.display = 'none';
    discussionRoom.style.display = 'flex';
    
    // Load discussion
    await loadDiscussion(topic);
    
    // Start polling for new messages
    startPolling();
}

// Load discussion messages
async function loadDiscussion(topic) {
    try {
        const response = await fetch(`${API_URL}/discussion/${topic}`);
        const data = await response.json();
        
        if (data.success) {
            const discussion = data.data;
            
            // Update header
            const icon = document.querySelector('.room-icon');
            icon.textContent = discussion.icon;
            roomTitle.textContent = discussion.title;
            roomDescription.textContent = discussion.description;
            messageCount.textContent = discussion.messageCount;
            participantCount.textContent = discussion.participants.length;
            
            // Display messages
            displayMessages(discussion.messages);
        }
    } catch (error) {
        console.error('Load discussion error:', error);
    }
}

// Display messages
function displayMessages(messages) {
    messagesContainer.innerHTML = '';
    
    messages.forEach(msg => {
        addMessageToUI(msg);
    });
    
    scrollToBottom();
}

// Add single message to UI
function addMessageToUI(msg) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    const initial = msg.username.charAt(0).toUpperCase();
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${initial}</div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-username">${msg.username}</span>
                <span class="message-time">${formatTime(msg.timestamp)}</span>
            </div>
            <div class="message-text">${escapeHtml(msg.message)}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
}

// Send message
async function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    const token = localStorage.getItem('bluebub_token');
    if (!token) {
        alert('Silakan login terlebih dahulu untuk mengirim pesan!');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/discussion/${currentTopic}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        if (data.success) {
            messageInput.value = '';
            messageInput.style.height = 'auto';
            sendButton.disabled = true;
            
            // Reload discussion to show new message
            await loadDiscussion(currentTopic);
        } else {
            alert(data.message || 'Gagal mengirim pesan');
        }
    } catch (error) {
        console.error('Send message error:', error);
        alert('Gagal mengirim pesan');
    }
}

// Setup message input
function setupMessageInput() {
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        sendButton.disabled = this.value.trim() === '';
    });
    
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendButton.disabled) {
                sendMessage();
            }
        }
    });
    
    sendButton.addEventListener('click', sendMessage);
}

// Polling for new messages (every 5 seconds)
function startPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
    
    pollingInterval = setInterval(() => {
        if (currentTopic) {
            loadDiscussion(currentTopic);
        }
    }, 5000); // Poll every 5 seconds
}

// Stop polling when leaving page
window.addEventListener('beforeunload', () => {
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
});

// Utility functions
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Baru saja';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} menit lalu`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`;
    return `${Math.floor(diff / 86400000)} hari lalu`;
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateAuthLinks() {
    const authLinks = document.getElementById('auth-links');
    const token = localStorage.getItem('bluebub_token');
    const userStr = localStorage.getItem('bluebub_user');
    
    if (token && userStr) {
        try {
            const user = JSON.parse(userStr);
            authLinks.innerHTML = 
                `<a href="profile.html" class="nav-link">👤 ${user.username}</a>` +
                `<a href="#" class="nav-link" onclick="handleLogout(event)" style="color: #fc8181;">Logout</a>`;
        } catch (e) {}
    } else {
        authLinks.innerHTML = 
            `<a href="login.html" class="nav-link">Login</a>` +
            `<a href="register.html" class="nav-link profile-btn">Register</a>`;
    }
}

function handleLogout(e) {
    e.preventDefault();
    if (confirm('Yakin ingin logout?')) {
        localStorage.removeItem('bluebub_token');
        localStorage.removeItem('bluebub_user');
        window.location.href = 'index.html';
    }
}
