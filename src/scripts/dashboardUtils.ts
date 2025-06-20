import Chart from 'chart.js/auto';
import type { Sensor, SensorType, SensorMeta, SensorAverage, TimeWindow } from './types';

export const META: Record<SensorType, SensorMeta> = {
  temperature: {
    unit: '°C',
    title: 'Su Sıcaklığı',
    status: (v: number): [string, string] =>
      v > 26 ? ['Tehlikeli', 'danger'] : v > 24 ? ['Yüksek', 'warning'] : ['Normal', 'success']
  },
  turbidity: {
    unit: 'NTU',
    title: 'Bulanıklık',
    status: (v: number): [string, string] =>
      v > 5 ? ['Yüksek', 'warning'] : ['Normal', 'success']
  },
  tds: {
    unit: 'ppm',
    title: 'TDS / İletkenlik',
    status: (v: number): [string, string] =>
      v > 1000 ? ['Yüksek', 'warning'] : ['Normal', 'success']
  }
};

export const createChart = (canvasId: string, color = '#0066cc'): Chart | null => {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  const ctx = canvas?.getContext('2d');
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

export const updateChart = (chart: Chart | null, data: Sensor[], timeWindow: TimeWindow): void => {
  if (!chart) return;
  
  const now = Date.now();
  const cutoff = timeWindow === Infinity ? 0 : now - timeWindow * 60 * 1000;
  
  const filteredData = data
    .filter(r => new Date(r.timestamp).getTime() >= cutoff)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  chart.data.labels = filteredData.map(r => 
    new Date(r.timestamp).toLocaleTimeString('tr-TR', {hour12: false})
  );
  chart.data.datasets[0].data = filteredData.map(r => r.value);
  
  chart.update();
};

export const calculate30MinAverage = (data: Sensor[], sensorType: SensorType): SensorAverage | null => {
  const now = Date.now();
  const thirtyMinutesAgo = now - 30 * 60 * 1000;
  
  const recentData = data
    .filter(r => r.type === sensorType && r.value != null && 
            new Date(r.timestamp).getTime() >= thirtyMinutesAgo)
    .map(r => ({
      value: r.value,
      timestamp: new Date(r.timestamp).getTime()
    }));
  
  if (recentData.length === 0) return null;
  
  const sum = recentData.reduce((acc, curr) => acc + curr.value, 0);
  const average = sum / recentData.length;
  const latestTimestamp = Math.max(...recentData.map(r => r.timestamp));
  
  return { average, timestamp: latestTimestamp };
};

export const fetchSensorData = async (): Promise<Sensor[]> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No auth token');

  const res = await fetch('/api/sensor-data', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};