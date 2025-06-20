const API_BASE = 'http://154.53.180.35';

export async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

export function logout() {
  localStorage.removeItem('token');
  window.location.href = '/dashboard/login';
}

export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

export function getAuthToken() {
  return localStorage.getItem('token');
}

export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/dashboard/login';
    return false;
  }
  return true;
}