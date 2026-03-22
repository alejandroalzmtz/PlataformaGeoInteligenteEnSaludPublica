// Interfaces para la respuesta de prevalencia del backend

export interface PrevalenceData {
  idEstado: number;
  nombreEstado: string;
  casosExistentes: number;
  poblacionTotal: number;
  prevalencia: number; // Ya calculada en el backend usando la fórmula
}

export interface PrevalenceResponse {
  indicator: string;
  year?: number;
  period?: string;
  multiplier: number; // 10^n de la fórmula
  data: PrevalenceData[];
  generatedAt: string;
  summary: {
    totalStates: number;
    minPrevalence: number;
    maxPrevalence: number;
    avgPrevalence: number;
  };
}

export interface ColorClassification {
  breaks: number[];
  colors: string[];
  method: 'quantile' | 'equal-interval' | 'manual';
  classes: number;
}

export interface PrevalenceMapData extends PrevalenceData {
  colorClass: number;
  color: string;
}