// Use Vite env variables (import.meta.env) with VITE_ prefix
const API_BASE_URL = (import.meta.env?.VITE_API_URL) || 'http://localhost:5000/api';

const getAIApiKey = () => {
  return localStorage.getItem('aiApiKey') || import.meta.env?.VITE_AI_API_KEY;
};

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    // Backend uses /api/auth/signup
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },
};

// User API calls
export const userAPI = {
  getProfile: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  updateProfile: async (profileData) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    return response.json();
  },
};

// Skills API
export const skillsAPI = {
  get: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/skills`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
  save: async (skills) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/skills`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(skills),
    });
    return response.json();
  },
};

// Current user API
export const currentUserAPI = {
  me: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
  markOnboarded: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/user/onboarded`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
};

// Internship API calls with AI recommendations
export const internshipAPI = {
  getRecommendations: async (filters = {}) => {
    const token = localStorage.getItem('authToken');
    // Normalize inputs: accept array of skills or various object shapes
    let sector = '';
    let location = '';
    let tech = '';

    try {
      if (Array.isArray(filters)) {
        // Treat as skills array
        tech = filters.filter(Boolean).join(', ');
      } else if (filters && typeof filters === 'object') {
        sector = typeof filters.sector === 'string' ? filters.sector : '';
        // If sectors array provided, use the first as primary sector
        if (!sector && Array.isArray(filters.sectors) && filters.sectors.length) {
          sector = String(filters.sectors[0] ?? '');
        }

        location = typeof filters.location === 'string' ? filters.location : '';
        if (!location && Array.isArray(filters.locations) && filters.locations.length) {
          location = String(filters.locations[0] ?? '');
        }

        tech = typeof filters.tech === 'string' ? filters.tech : '';
        if (!tech && Array.isArray(filters.skills)) {
          tech = filters.skills.filter(Boolean).join(', ');
        }
      }
    } catch {}

    // Call POST /api/recommendations with sector, location, tech
    const response = await fetch(`${API_BASE_URL}/recommendations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sector, location, tech }),
    });
    return response.json();
  },

  getAllInternships: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/internships`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  // Discover internships from CSV (fallback/feed)
  getDiscoverInternships: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/internships/discover`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  // No apply endpoint in backend currently
};

// Applications API (tracker)
export const applicationsAPI = {
  list: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/applications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
  recentActivity: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/applications/recent-activity`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
  upcomingDeadlines: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/applications/upcoming-deadlines`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
  upsert: async (payload) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/applications/upsert`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  },
  update: async (id, updates) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  },
};

// Settings API for AI configuration
export const settingsAPI = {
  saveAIApiKey: async (apiKey) => {
    localStorage.setItem('aiApiKey', apiKey);
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/user/ai-settings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ aiApiKey: apiKey }),
    });
    return response.json();
  },

  getAIApiKey: () => {
    return getAIApiKey();
  },
};
