// ===================================
// BLUEBUB NAVBAR - Complete Version
// Handles: Scroll Effect, Mobile Menu, Auth, Dropdowns
// ===================================

(function() {
    'use strict';
    
    console.log('🚀 Navbar.js loading...');
    
    // ===== DOM ELEMENTS =====
    const navbar = document.getElementById('navbar');
    const navbarToggle = document.getElementById('navbar-toggle');
    const navbarMenu = document.getElementById('navbar-menu');
    const authLinks = document.getElementById('auth-links');
    const navLinks = document.querySelectorAll('.nav-link');
    const dropdowns = document.querySelectorAll('.dropdown');
    
    // Exit if navbar not found
    if (!navbar) {
        console.warn('⚠️ Navbar element not found');
        return;
    }
    
    // Store navbar state
    let navbarScrolled = false;
    let mobileMenuOpen = false;
    
    // ===== INITIALIZE =====
    function initialize() {
        console.log('⚙️ Initializing navbar...');
        
        initScrollEffect();
        initMobileMenu();
        initDropdowns();
        initSmoothScroll();
        initAuthLinks();
        
        console.log('✅ Navbar initialized successfully');
    }
    
    // ===== SCROLL EFFECT (Optimized) =====
        // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
    
    // ===== MOBILE MENU =====
    function initMobileMenu() {
        if (!navbarToggle || !navbarMenu) {
            console.warn('⚠️ Mobile menu elements not found');
            return;
        }
        
        // Toggle menu
        navbarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileMenu();
        });
        
        // Close menu when link clicked (not dropdown)
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (!link.closest('.dropdown')) {
                    closeMobileMenu();
                }
            });
        });
        
        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (mobileMenuOpen && 
                !e.target.closest('.navbar-menu') && 
                !e.target.closest('.navbar-toggle')) {
                closeMobileMenu();
            }
        });
        
        // Close menu on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenuOpen) {
                closeMobileMenu();
            }
        });
        
        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 768) {
                    closeMobileMenu();
                    closeAllDropdowns();
                }
            }, 250);
        }, { passive: true });
    }
    
    function toggleMobileMenu() {
        mobileMenuOpen = !mobileMenuOpen;
        navbarMenu.classList.toggle('active');
        navbarToggle.classList.toggle('active');
        
        // Prevent body scroll on mobile
        if (window.innerWidth <= 768) {
            document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        }
    }
    
    function closeMobileMenu() {
        if (!mobileMenuOpen) return;
        
        mobileMenuOpen = false;
        navbarMenu.classList.remove('active');
        navbarToggle.classList.remove('active');
        document.body.style.overflow = '';
        
        // Also close dropdowns
        closeAllDropdowns();
    }
    
    
    function closeAllDropdowns() {
        dropdowns.forEach(d => d.classList.remove('active'));
    }
    
    // ===== SMOOTH SCROLL =====
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                
                // Skip if href is just '#' or empty
                if (!href || href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    // Smooth scroll to target
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Close mobile menu
                    closeMobileMenu();
                    
                    // Update URL without scroll
                    if (history.pushState) {
                        history.pushState(null, null, href);
                    }
                }
            });
        });
    }
    
    // ===== AUTH LINKS =====
    function initAuthLinks() {
        if (!authLinks) {
            console.warn('⚠️ Auth links element not found');
            return;
        }
        
        updateAuthLinks();
        
        // Listen for storage changes (if user logs in/out in another tab)
        window.addEventListener('storage', (e) => {
            if (e.key === 'bluebub_token' || e.key === 'bluebub_user') {
                updateAuthLinks();
            }
        });
    }
    
    function updateAuthLinks() {
        const token = localStorage.getItem('bluebub_token');
        const userStr = localStorage.getItem('bluebub_user');
        
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                authLinks.innerHTML = 
                    `<a href="profile.html" class="nav-link">👤 ${escapeHtml(user.username)}</a>` +
                    `<a href="#" class="nav-link" onclick="handleNavbarLogout(event)">Logout</a>`;
                console.log('✅ User logged in:', user.username);
            } catch (e) {
                console.error('❌ Parse user error:', e);
                showDefaultAuthLinks();
            }
        } else {
            showDefaultAuthLinks();
        }
    }
    
    function showDefaultAuthLinks() {
        authLinks.innerHTML = 
            `<a href="login.html">Login</a>` +
            `<a href="register.html" class="profile-btn">Register</a>`;
        console.log('✅ Showing login/register buttons');
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // ===== GLOBAL LOGOUT HANDLER =====
    window.handleNavbarLogout = function(e) {
        e.preventDefault();
        if (confirm('Yakin ingin logout?')) {
            localStorage.removeItem('bluebub_token');
            localStorage.removeItem('bluebub_user');
            console.log('✅ Logged out');
            window.location.href = 'index.html';
        }
    };
    
    // ===== UTILITY FUNCTIONS =====
    
    // Get current page name
    function getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page;
    }
    
    // Set active nav link based on current page
    function setActiveNavLink() {
        const currentPage = getCurrentPage();
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || 
                (currentPage === 'index.html' && href === './') ||
                (currentPage === '' && href === './')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // ===== PUBLIC API =====
    window.BluebubNavbar = {
        updateAuth: updateAuthLinks,
        closeMobileMenu: closeMobileMenu,
        setActive: setActiveNavLink
    };
    
    // ===== INITIALIZE ON DOM READY =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
})();
