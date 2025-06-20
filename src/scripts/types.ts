export type SensorType = 'temperature' | 'turbidity' | 'tds';

export type TimeWindow = 10 | 30 | 60 | 240 | 1440 | 4320 | 10080 | typeof Infinity;

export interface Sensor {
  type: SensorType;
  value: number;
  timestamp: string;
}

export interface SensorMeta {
  unit: string;
  title: string;
  status: (value: number) => [string, string]; // [status text, status class]
}

export interface SensorAverage {
  average: number;
  timestamp: number;
}