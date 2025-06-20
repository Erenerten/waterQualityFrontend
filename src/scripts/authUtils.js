// Use relative paths for API endpoints
export async function login(username, password) {
  try {
    const response = await fetch('/api/auth/login', {
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
    // Server returns JWT in { jwt: "token" } format
    const token = data.jwt;
    
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      throw new Error('Invalid token format');
    }

    localStorage.setItem('token', token);
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
  const token = localStorage.getItem('token');
  return token && token.split('.').length === 3;
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