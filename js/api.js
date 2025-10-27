const API_BASE_URL = 'https://bluebub-backend.vercel.app/api';
const ML_API_URL = 'https://bluebub-ml-service.vercel.app/api/ml';

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('bluebub_token');

// API Helper function
async function apiCall(endpoint, options = {}) {
    const token = getAuthToken();
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Authentication APIs
const authAPI = {
    register: (userData) => apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),
    
    login: (credentials) => apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),
    
    getProfile: () => apiCall('/auth/me')
};

// Product APIs
const productAPI = {
    getAll: () => apiCall('/products'),
    
    getById: (id) => apiCall(`/products/${id}`),
    
    create: (productData) => apiCall('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
    }),
    
    search: (query) => apiCall(`/products/search?q=${query}`)
};

// Payment APIs
const paymentAPI = {
    createPayment: (paymentData) => apiCall('/payment/create', {
        method: 'POST',
        body: JSON.stringify(paymentData)
    })
};

// Ocean Data APIs
const oceanDataAPI = {
    getAnalysis: (region) => apiCall(`/ocean-data/analysis?region=${region}`),
    
    getNoaaData: (params) => apiCall('/ocean-data/noaa', {
        method: 'GET',
        params
    })
};

// ML APIs
const mlAPI = {
    getRecommendations: async (userProfile) => {
        const response = await fetch(`${ML_API_URL}/recommend-collaborators`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_profile: userProfile })
        });
        return response.json();
    },
    
    predictOpportunity: async (location, category) => {
        const response = await fetch(`${ML_API_URL}/predict-opportunity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location, category })
        });
        return response.json();
    },
    
    analyzeMarket: async (products) => {
        const response = await fetch(`${ML_API_URL}/analyze-market`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products })
        });
        return response.json();
    }
};

// Export APIs
window.BluebubAPI = {
    auth: authAPI,
    products: productAPI,
    payment: paymentAPI,
    oceanData: oceanDataAPI,
    ml: mlAPI
};