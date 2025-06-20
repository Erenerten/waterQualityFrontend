import type { Chart, ChartData, Point } from 'chart.js';
import type { SensorType, SensorData, SensorMeta } from './types';
import { Chart as ChartJS } from 'chart.js/auto';

export const META: Record<SensorType, SensorMeta> = {
  temperature: {
    unit: '°C',
    title: 'Su Sıcaklığı',
    color: '#FF6384',
    backgroundColor: 'rgba(255, 99, 132, 0.2)',
    warningThreshold: 30,
    criticalThreshold: 35,
    status: v => v > 35 ? ['Kritik', 'danger'] : 
            v > 30 ? ['Yüksek', 'warning'] : 
            ['Normal', 'success']
  },
  turbidity: {
    unit: 'NTU',
    title: 'Bulanıklık',
    color: '#45B7D1',
    backgroundColor: 'rgba(69, 183, 209, 0.2)',  
    status: v => v > 5 ? ['Yüksek', 'warning'] : ['Normal', 'success']
  },
  tds: {
    unit: 'ppm',
    title: 'TDS / İletkenlik',
    color: '#4ECDC4',
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    status: v => v > 1000 ? ['Kritik', 'danger'] :
            v > 500 ? ['Yüksek', 'warning'] :
            ['Normal', 'success']
  },
  'flow-comparison': {
    title: 'Akış Karşılaştırma',
    unit: 'm³/s',
    color: '#9966FF',
    backgroundColor: 'rgba(153, 102, 255, 0.2)',
    color1: '#9966FF',
    color2: '#FF9F40',
    colorDiff: '#e74c3c',
    backgroundColor1: 'rgba(153, 102, 255, 0.1)',
    backgroundColor2: 'rgba(255, 159, 64, 0.1)',
    backgroundColorDiff: 'rgba(231, 76, 60, 0.08)',
    status: v => Math.abs(v) > 1 ? ['FARK VAR', 'danger'] : ['Normal', 'success']
  }
};

export const createChart = (canvasId: string, sensorType: SensorType): Chart | null => {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  const ctx = canvas?.getContext('2d');
  if (!ctx) return null;
  
  const meta = META[sensorType];
  
  return new ChartJS(ctx, {
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
            label: function(context: any) {
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

export const updateChart = (chart: Chart, data: SensorData[], timeWindow: number): void => {
  const now = Date.now();
  const cutoff = timeWindow === Infinity ? 0 : now - timeWindow * 60 * 1000;
  
  const filteredData = data
    .filter(r => new Date(r.timestamp).getTime() >= cutoff)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  chart.data.labels = filteredData.map(r => 
    new Date(r.timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  );
  
  chart.data.datasets[0].data = filteredData.map(r => ({
    x: new Date(r.timestamp).getTime(),
    y: typeof r.value === 'number' ? r.value : parseFloat(String(r.value).replace(',', '.'))
  } as Point));
  
  chart.update();
};

interface AverageResult {
  average: number;
  timestamp: number;
}

export const calculate30MinAverage = (data: SensorData[], sensorType: SensorType): AverageResult | null => {
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

export const fetchSensorData = async (): Promise<SensorData[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    localStorage.removeItem('token');
    window.location.href = '/dashboard/login';
    throw new Error('No auth token');
  }

  try {
    const res = await fetch('/api/sensor-data', {
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
    if (error instanceof Error && error.message.includes('Authentication failed')) {
      window.location.href = '/dashboard/login';
    }
    throw error;
  }
};