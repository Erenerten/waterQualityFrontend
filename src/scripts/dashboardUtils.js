// Chart management
export const createChart = (canvasId, label, color) => {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;
  
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: label,
        data: [],
        borderColor: color,
        tension: 0.4,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0,0,0,0.1)'
          }
        }
      },
      plugins: {
        legend: {
          position: 'top'
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      animation: {
        duration: 500
      }
    }
  });
};

export const updateChart = (chart, value) => {
  if (!chart) return;
  
  const now = new Date();
  const time = now.toLocaleTimeString();
  
  chart.data.labels.push(time);
  chart.data.datasets[0].data.push(value);
  
  if (chart.data.labels.length > 10) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  
  chart.update();
};

// WebSocket handling
export const initWebSocket = (onDataReceived) => {
  const socket = new WebSocket('ws://154.53.180.35/ws');
  
  socket.onopen = () => {
    console.log('WebSocket connected');
  };
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onDataReceived(data);
    } catch (e) {
      console.error('WebSocket message error:', e);
    }
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  socket.onclose = () => {
    console.log('WebSocket disconnected. Reconnecting...');
    setTimeout(() => initWebSocket(onDataReceived), 5000);
  };
  
  return socket;
};

// Sensor data utilities
export const getSensorUnit = (sensorType) => {
  const units = {
    temperature: '°C',
    tds: ' ppm',
    turbidity: ' NTU',
    conductivity: ' µS/cm'
  };
  return units[sensorType] || '';
};

export const generateMockSensorData = () => ({
  temperature: (20 + Math.random() * 5).toFixed(1),
  tds: Math.floor(500 + Math.random() * 200),
  turbidity: (2 + Math.random() * 3).toFixed(1),
  conductivity: Math.floor(1000 + Math.random() * 500)
});