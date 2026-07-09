const API_URL = 'http://localhost:8001';
const TOKEN_KEY = 'token';

export const authProvider = {
  login: async ({ email, password }) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: { name: 'LoginError', message: data.error || 'Login failed' },
      };
    }
    localStorage.setItem(TOKEN_KEY, data.token);
    return { success: true, redirectTo: '/dashboard' };
  },

  register: async ({ name, email, password }) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: { name: 'RegisterError', message: data.error || 'Signup failed' },
      };
    }
    localStorage.setItem(TOKEN_KEY, data.token);
    return { success: true, redirectTo: '/dashboard' };
  },

  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    return { success: true, redirectTo: '/login' };
  },

  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return { authenticated: false, redirectTo: '/login' };
    }
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      localStorage.removeItem(TOKEN_KEY);
      return { authenticated: false, redirectTo: '/login' };
    }
    return { authenticated: true };
  },

  onError: async (error) => {
    if (error?.statusCode === 401 || error?.status === 401) {
      return { logout: true, redirectTo: '/login' };
    }
    return { error };
  },

  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  },
};
