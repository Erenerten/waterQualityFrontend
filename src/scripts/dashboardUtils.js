// Chart management and data utilities
import Chart from 'chart.js/auto';

export const META = {
  temperature: {
    unit: '°C',
    title: 'Su Sıcaklığı',
    status: v => v > 26 ? ['Tehlikeli', 'danger'] : v > 24 ? ['Yüksek', 'warning'] : ['Normal', 'success']
  },
  turbidity: {
    unit: 'NTU',
    title: 'Bulanıklık',
    status: v => v > 5 ? ['Yüksek', 'warning'] : ['Normal', 'success']
  },
  tds: {
    unit: 'ppm',
    title: 'TDS / İletkenlik',
    status: v => v > 1000 ? ['Yüksek', 'warning'] : ['Normal', 'success']
  }
};

export const createChart = (canvasId, label, color = '#0066cc') => {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;
  
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        data: [],
        borderColor: color,
        borderWidth: 2,
        tension: 0.25,
        fill: false,
        pointRadius: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { display: false } }
      }
    }
  });
};

export const updateChart = (chart, data, timeWindow) => {
  if (!chart) return;
  
  const now = Date.now();
  const cutoff = timeWindow === Infinity ? 0 : now - timeWindow * 60 * 1000;
  
  const filteredData = data
    .filter(r => new Date(r.timestamp).getTime() >= cutoff)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  chart.data.labels = filteredData.map(r => 
    new Date(r.timestamp).toLocaleTimeString('tr-TR', {hour12: false})
  );
  chart.data.datasets[0].data = filteredData.map(r => 
    typeof r.value === 'number' ? r.value : parseFloat(String(r.value).replace(',', '.'))
  );
  
  chart.update();
};

export const calculate30MinAverage = (data, sensorType) => {
  const now = Date.now();
  const thirtyMinutesAgo = now - 30 * 60 * 1000;
  
  const recentData = data
    .filter(r => r.type === sensorType && r.value != null && 
            new Date(r.timestamp).getTime() >= thirtyMinutesAgo)
    .map(r => ({
      value: typeof r.value === 'number' ? r.value : parseFloat(String(r.value).replace(',', '.')),
      timestamp: new Date(r.timestamp).getTime()
    }));
  
  if (recentData.length === 0) return null;
  
  const sum = recentData.reduce((acc, curr) => acc + curr.value, 0);
  const average = sum / recentData.length;
  const latestTimestamp = Math.max(...recentData.map(r => r.timestamp));
  
  return { average, timestamp: latestTimestamp };
};

export const fetchSensorData = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    localStorage.removeItem('token'); // Clear invalid token
    window.location.href = '/dashboard/login';
    throw new Error('No auth token');
  }

  try {
    const res = await fetch('https://www.ehmsukalitesi.online/api/sensor-data', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    
    if (res.status === 403) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/dashboard/login';
      throw new Error('Authentication failed');
    }
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Fetch error:', error);
    // Only redirect if it's an auth error
    if (error.message.includes('Authentication failed')) {
      window.location.href = '/dashboard/login';
    }
    throw error;
  }
};