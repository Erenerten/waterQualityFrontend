// Chart management and data utilities
import Chart from 'chart.js/auto';

// Poll interval for data refresh
let pollInterval = null;

// Initialize dashboard functionality
export function initDashboard() {
  try {
    // Auth check
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/dashboard/login';
      return false;
    }

    // Initialize mobile menu
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    
    if (burger && nav) {
      burger.addEventListener('click', () => {
        nav.classList.toggle('active');
        burger.classList.toggle('toggle');
      });
    }

    // Initialize clock
    const clockEl = document.getElementById('clock');
    if (clockEl) {
      updateClock();
      setInterval(updateClock, 1000);
    }

    return true;
  } catch (error) {
    console.error('Dashboard initialization error:', error);
    return false;
  }
}

// Update clock display
function updateClock() {
  const clock = document.getElementById('clock');
  if (clock) {
    clock.textContent = new Date().toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Cleanup function
export function cleanup() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}