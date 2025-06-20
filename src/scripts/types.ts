import type { Chart } from 'chart.js';

export type SensorType = 'temperature' | 'turbidity' | 'tds' | 'flow1' | 'flow2' | 'flow-comparison';

export interface SensorData {
  type: SensorType;
  value: number;
  timestamp: string;
  flow1?: number;  // Added for flow comparison
  flow2?: number;  // Added for flow comparison
}

export interface SensorMeta {
  unit: string;
  title: string;
  color: string;
  backgroundColor: string;
  status: (v: number) => [string, string];
  warningThreshold?: number;
  criticalThreshold?: number;
  color1?: string;
  color2?: string;
  colorDiff?: string;
  backgroundColor1?: string;
  backgroundColor2?: string;
  backgroundColorDiff?: string;
}