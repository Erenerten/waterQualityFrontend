// Chart management and data utilities
import Chart from 'chart.js/auto';

export const META = {
  temperature: {
    unit: '°C',
    title: 'Su Sıcaklığı',
    color: '#0066cc',
    status: v => v > 26 ? ['Tehlikeli', 'danger'] : v > 24 ? ['Yüksek', 'warning'] : ['Normal', 'success']
  },
  turbidity: {
    unit: 'NTU',
    title: 'Bulanıklık',
    color: '#45B7D1',
    status: v => v > 5 ? ['Yüksek', 'warning'] : ['Normal', 'success']
  },
  tds: {
    unit: 'ppm',
    title: 'TDS / İletkenlik',
    color: '#4ECDC4',
    status: v => v > 1000 ? ['Yüksek', 'warning'] : ['Normal', 'success']
  }
};

export const createChart = (canvasId, sensorType) => {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;
  
  const meta = META[sensorType];
  
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        data: [],
        borderColor: meta.color,
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
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed.y;
              const date = new Date(context.raw.timestamp);
              return `${value} ${meta.unit} (${date.toLocaleString('tr-TR')})`;
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          title: {
            display: true,
            text: `${meta.title} (${meta.unit})`
          }
        }
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
    new Date(r.timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  );
  
  chart.data.datasets[0].data = filteredData.map(r => ({
    y: typeof r.value === 'number' ? r.value : parseFloat(String(r.value).replace(',', '.')),
    timestamp: r.timestamp
  }));
  
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
    localStorage.removeItem('token');
    window.location.href = '/dashboard/login';
    throw new Error('No auth token');
  }

  try {
    const res = await fetch('/api/sensor-data', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (res.status === 403) {
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
    if (error.message.includes('Authentication failed')) {
      window.location.href = '/dashboard/login';
    }
    throw error;
  }
};