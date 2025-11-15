(function() {
    'use strict';
    
    console.log('🔐 Auth.js loading...');
    
    // ===== AUTH UTILITY FUNCTIONS =====
    const Auth = {
        // Check if user is logged in
        isLoggedIn: function() {
            const token = localStorage.getItem('bluebub_token');
            const user = localStorage.getItem('bluebub_user');
            return !!(token && user);
        },
        
        // Get current user
        getUser: function() {
            try {
                const userStr = localStorage.getItem('bluebub_user');
                return userStr ? JSON.parse(userStr) : null;
            } catch (e) {
                console.error('❌ Error parsing user data:', e);
                return null;
            }
        },
        
        // Get auth token
        getToken: function() {
            return localStorage.getItem('bluebub_token');
        },
        
        // Save login data
        saveLogin: function(token, user) {
            localStorage.setItem('bluebub_token', token);
            localStorage.setItem('bluebub_user', JSON.stringify(user));
            console.log('✅ Login data saved');
            this.updateNavbar();
        },
        
        // Logout
        logout: function(redirect = true) {
            localStorage.removeItem('bluebub_token');
            localStorage.removeItem('bluebub_user');
            console.log('✅ User logged out');
            
            if (redirect) {
                window.location.href = 'index.html';
            } else {
                this.updateNavbar();
            }
        },
        
        // Handle logout with confirmation
        handleLogout: function(event) {
            if (event) {
                event.preventDefault();
            }
            
            if (confirm('Yakin ingin logout?')) {
                this.logout(true);
            }
        },
        
        // Update navbar based on auth state
        updateNavbar: function() {
            const authLinks = document.getElementById('auth-links');
            
            if (!authLinks) {
                console.warn('⚠️ auth-links element not found');
                return;
            }
            
            if (this.isLoggedIn()) {
                const user = this.getUser();
                if (user) {
                    this.showProfileLinks(authLinks, user);
                }
            } else {
                this.showAuthLinks(authLinks);
            }
        },
        
        // Show profile & logout buttons
        showProfileLinks: function(container, user) {
            container.innerHTML = `
                <a href="profile.html" class="nav-link profile-link">
                    <span class="profile-avatar">👤</span>
                    <span class="profile-name">${this.escapeHtml(user.username)}</span>
                </a>
                <a href="#" class="nav-link logout-btn" onclick="Auth.handleLogout(event)">
                    Logout
                </a>
            `;
            console.log('✅ Showing profile links for:', user.username);
        },
        
        // Show login & register buttons
        showAuthLinks: function(container) {
            container.innerHTML = `
                <a href="login.html" class="nav-link login-btn">Login</a>
                <a href="register.html" class="nav-link profile-btn">Register</a>
            `;
            console.log('✅ Showing login/register buttons');
        },
        
        // Escape HTML to prevent XSS
        escapeHtml: function(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
        
        // Initialize auth on page load
        init: function() {
            console.log('⚙️ Initializing auth system...');
            this.updateNavbar();
            
            // Listen for storage changes (login/logout in other tabs)
            window.addEventListener('storage', (e) => {
                if (e.key === 'bluebub_token' || e.key === 'bluebub_user') {
                    console.log('🔄 Auth state changed in another tab');
                    this.updateNavbar();
                }
            });
            
            console.log('✅ Auth system initialized');
        }
    };
    
    // Make Auth globally accessible
    window.Auth = Auth;
    
    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Auth.init());
    } else {
        Auth.init();
    }
    
})();
