import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('linkedin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  getStatus: () => api.get('/auth/status'),
  loginWithLinkedIn: () => {
    window.location.href = `${API_BASE_URL}/auth/linkedin`;
  },
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  getPreferences: () => api.get('/user/preferences'),
  updatePreferences: (preferences: any) => api.put('/user/preferences', preferences),
  getDashboard: () => api.get('/user/dashboard'),
};

export const postsAPI = {
  createPost: (content: string, isAIGenerated: boolean = false) => 
    api.post('/posts/create', { content, isAIGenerated }),
  generateAIContent: () => api.get('/posts/generate-ai-content'),
  getMyPosts: () => api.get('/posts/my-posts'),
  getAllPosts: () => api.get('/posts/all'),
  getLinkedInProfile: () => api.get('/posts/linkedin-profile'),
};

export default api;
