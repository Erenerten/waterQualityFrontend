import {
  createChart,
  updateChart,
  initDataPolling,
  getSensorUnit,
  generateMockSensorData
} from './dashboardUtils';

let charts = {};

export function initDashboard() {
  // Initialize charts
  charts = {
    temperature: createChart('temperatureChart', 'Sıcaklık (°C)', '#FF6B6B'),
    tds: createChart('tdsChart', 'TDS (ppm)', '#4ECDC4'),
    turbidity: createChart('turbidityChart', 'Bulanıklık (NTU)', '#45B7D1'),
    conductivity: createChart('conductivityChart', 'İletkenlik (µS/cm)', '#96CEB4')
  };

  // Initialize data polling
  initDataPolling(updateSensorData);

  // Add refresh button handler
  const refreshBtn = document.querySelector('.refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      updateSensorData(generateMockSensorData());
    });
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
}

function updateSensorData(data) {
  const now = new Date();
  const lastUpdate = document.getElementById('lastUpdate');
  if (lastUpdate) {
    lastUpdate.textContent = `Son Güncelleme: ${now.toLocaleTimeString()}`;
  }

  // Update sensor boxes
  for (const [key, value] of Object.entries(data)) {
    const element = document.getElementById(key);
    if (element) {
      element.textContent = `${value}${getSensorUnit(key)}`;
    }
  }

  // Update charts
  for (const [key, value] of Object.entries(data)) {
    if (charts[key]) {
      updateChart(charts[key], value);
    }
  }
}