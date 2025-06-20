export type SensorType = 'temperature' | 'turbidity' | 'tds';

export interface Sensor {
  type: SensorType;
  value: number;
  timestamp: string;
}

export interface SensorMeta {
  unit: string;
  title: string;
  color: string;
  status: (value: number) => [string, string]; // [status text, status class]
}

export interface SensorAverage {
  average: number;
  timestamp: number;
}

export type SensorMetadata = {
  [key in SensorType]: SensorMeta;
};