import apiClient from '../api-client';

export interface AnalyticsDataset {
  id: string;
  name: string;
  source_type: string;
  columns: string[];
  row_count: number;
  sample_rows: Record<string, unknown>[];
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AnalyticsInsight {
  id: string;
  key_metrics: Record<string, unknown>;
  insights: Array<{ title: string; detail: string; confidence: string }>;
  recommendations: Array<{ action: string; expected_impact: string; priority: string }>;
  chart_data: Array<Record<string, unknown>>;
  summary_text: string;
  created_at: string;
}

export interface AnalyticsRecommendations {
  summary: string;
  insights: string[];
  recommendations: string[];
  predicted_outcomes: string[];
}

export interface AnalyticsQueryResponse {
  chart_type: 'line' | 'bar' | 'area' | 'pie' | 'table';
  metric: string;
  insight: string;
  visual_data: Array<Record<string, unknown>>;
  x_key?: string | null;
  y_key?: string | null;
  suggested_followups?: string[];
}

export interface AnalyticsReport {
  dataset: AnalyticsDataset;
  insight: AnalyticsInsight | null;
}

export interface AnalyticsForecast {
  forecast_summary: string;
  forecast_data: Array<Record<string, unknown>>;
  confidence?: number | null;
  notes?: string[];
}

export async function uploadAnalyticsDataset(file: File, name?: string) {
  const formData = new FormData();
  formData.append('file', file);
  if (name) formData.append('name', name);

  const data = await apiClient.request<any>('/analytics/upload', {
    method: 'POST',
    body: formData,
    isFormData: true
  });

  return data.dataset as AnalyticsDataset;
}

export async function analyzeAnalyticsDataset(datasetId: string) {
  return apiClient.request<any>(`/analytics/analyze/${datasetId}`, {
    method: 'POST'
  });
}

export async function fetchAnalyticsReport(datasetId: string) {
  const data = await apiClient.request<any>(`/analytics/report/${datasetId}`, {
    method: 'GET'
  });
  return data.report as AnalyticsReport;
}

export async function fetchAnalyticsKPIs(datasetId: string) {
  const data = await apiClient.request<any>(`/analytics/kpis/${datasetId}`, {
    method: 'GET'
  });
  return data.keyMetrics as Record<string, unknown>;
}

export async function fetchAnalyticsVisuals(datasetId: string) {
  const data = await apiClient.request<any>(`/analytics/visual/${datasetId}`, {
    method: 'GET'
  });
  return data.chartData as Array<Record<string, unknown>>;
}

export async function fetchAnalyticsRecommendations(datasetId: string, domain?: string) {
  const payload: Record<string, unknown> = { datasetId };
  if (domain) {
    payload.domain = domain;
  }

  const data = await apiClient.request<any>('/ai/analytics/recommendations', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return data.recommendations as AnalyticsRecommendations;
}

export async function runAnalyticsQuery(datasetId: string, question: string, domain?: string) {
  const payload: Record<string, unknown> = {
    datasetId,
    question
  };
  if (domain) {
    payload.domain = domain;
  }

  const data = await apiClient.request<any>('/ai/analytics/query', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return data.response as AnalyticsQueryResponse;
}

export async function runAnalyticsForecast(
  datasetId: string,
  options?: { horizon?: number; metric?: string; domain?: string }
) {
  const payload: Record<string, unknown> = { datasetId };
  if (options?.horizon) payload.horizon = options.horizon;
  if (options?.metric) payload.metric = options.metric;
  if (options?.domain) payload.domain = options.domain;

  const data = await apiClient.request<any>('/ai/analytics/forecast', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return data.forecast as AnalyticsForecast;
}

