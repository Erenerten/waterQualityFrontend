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
  flow1: {
    unit: 'm³/s',
    title: 'Akış 1',
    color: '#9966FF',
    backgroundColor: 'rgba(153, 102, 255, 0.2)',
    status: v => v > 10 ? ['Yüksek', 'warning'] : ['Normal', 'success']
  },
  flow2: {
    unit: 'm³/s',
    title: 'Akış 2',
    color: '#FF9F40',
    backgroundColor: 'rgba(255, 159, 64, 0.2)',
    status: v => v > 10 ? ['Yüksek', 'warning'] : ['Normal', 'success']
  },
  'flow-comparison': {
    unit: 'm³/s',
    title: 'Akış Karşılaştırma',
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
  
  if (sensorType === 'flow-comparison') {
    return new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Akış 1',
            data: [],
            borderColor: meta.color1,
            backgroundColor: meta.backgroundColor1,
            borderWidth: 2,
            tension: 0.25,
            fill: true,
            pointRadius: 2
          },
          {
            label: 'Akış 2',
            data: [],
            borderColor: meta.color2,
            backgroundColor: meta.backgroundColor2,
            borderWidth: 2,
            tension: 0.25,
            fill: true,
            pointRadius: 2
          },
          {
            label: 'Fark',
            data: [],
            borderColor: meta.colorDiff,
            backgroundColor: meta.backgroundColorDiff,
            borderWidth: 2,
            tension: 0.25,
            fill: true,
            pointRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                const value = context.parsed.y;
                const date = new Date(context.raw.timestamp);
                return `${context.dataset.label}: ${value} ${meta.unit} (${date.toLocaleString('tr-TR')})`;
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
  }

  return new ChartJS(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        data: [],
        borderColor: meta.color,
        backgroundColor: meta.backgroundColor,
        borderWidth: 2,
        tension: 0.25,
        fill: true,
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

  const labels = filteredData.map(r => 
    new Date(r.timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  );

  if (chart.data.datasets.length === 3) { // Flow comparison chart
    const flow1Values = filteredData.map(r => r.flow1 ?? null);
    const flow2Values = filteredData.map(r => r.flow2 ?? null);
    const diffValues = filteredData.map(r => {
      if (r.flow1 != null && r.flow2 != null) {
        return r.flow1 - r.flow2;
      }
      return null;
    });

    chart.data.labels = labels;
    chart.data.datasets[0].data = flow1Values;
    chart.data.datasets[1].data = flow2Values;
    chart.data.datasets[2].data = diffValues;
  } else {
    chart.data.labels = labels;
    chart.data.datasets[0].data = filteredData.map(r => ({
      x: new Date(r.timestamp).getTime(),
      y: typeof r.value === 'number' ? r.value : parseFloat(String(r.value).replace(',', '.'))
    }));
  }
  
  chart.update();
};

// Update calculate30MinAverage to handle flow comparison
export const calculate30MinAverage = (data: SensorData[], sensorType: SensorType): { average: number; timestamp: number } | null => {
  const now = Date.now();
  const thirtyMinutesAgo = now - 30 * 60 * 1000;
  
  const recentData = data
    .filter(r => {
      const timestamp = new Date(r.timestamp).getTime();
      if (sensorType === 'flow-comparison') {
        return timestamp >= thirtyMinutesAgo && r.flow1 != null && r.flow2 != null;
      }
      return r.type === sensorType && r.value != null && timestamp >= thirtyMinutesAgo;
    })
    .map(r => {
      if (sensorType === 'flow-comparison' && r.flow1 != null && r.flow2 != null) {
        return {
          value: r.flow1 - r.flow2,
          timestamp: new Date(r.timestamp).getTime()
        };
      }
      return {
        value: typeof r.value === 'number' ? r.value : parseFloat(String(r.value).replace(',', '.')),
        timestamp: new Date(r.timestamp).getTime()
      };
    });
  
  if (recentData.length === 0) return null;
  
  const sum = recentData.reduce((acc, curr) => acc + curr.value, 0);
  const average = sum / recentData.length;
  const latestTimestamp = Math.max(...recentData.map(r => r.timestamp));
  
  return { average, timestamp: latestTimestamp };
};

export const fetchSensorData = async (
  type?: SensorType,
  startDate?: Date,
  endDate?: Date
): Promise<SensorData[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    localStorage.removeItem('token');
    window.location.href = '/dashboard/login';
    throw new Error('No auth token');
  }

  try {
    // Special handling for flow-comparison: fetch both flow1 and flow2
    if (type === 'flow-comparison') {
      const [flow1Data, flow2Data] = await Promise.all([
        fetchSensorData('flow1', startDate, endDate),
        fetchSensorData('flow2', startDate, endDate)
      ]);

      // Combine timestamps from both datasets
      const timestamps = [...new Set([
        ...flow1Data.map(d => d.timestamp),
        ...flow2Data.map(d => d.timestamp)
      ])].sort();

      // Create combined dataset
      return timestamps.map(timestamp => {
        const flow1 = flow1Data.find(d => d.timestamp === timestamp)?.value;
        const flow2 = flow2Data.find(d => d.timestamp === timestamp)?.value;
        return {
          type: 'flow-comparison',
          timestamp,
          value: flow1 != null && flow2 != null ? flow1 - flow2 : 0,
          flow1: flow1 ?? undefined,
          flow2: flow2 ?? undefined
        };
      });
    }

    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const url = `/api/sensor-data/filter?${params.toString()}`;

    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
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