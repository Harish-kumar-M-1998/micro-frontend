import { apiClient } from '../api/client';
import type { ReportSummary } from '../types';

const MOCK_REPORTS: ReportSummary[] = [
  {
    id: 'r1',
    title: 'Q2 Sales Performance',
    type: 'sales',
    generatedAt: '2026-06-10T10:00:00Z',
    status: 'ready',
  },
  {
    id: 'r2',
    title: 'User Engagement Analytics',
    type: 'analytics',
    generatedAt: '2026-06-11T15:30:00Z',
    status: 'ready',
  },
  {
    id: 'r3',
    title: 'GDPR Compliance Audit',
    type: 'compliance',
    generatedAt: '2026-06-12T09:00:00Z',
    status: 'processing',
  },
  {
    id: 'r4',
    title: 'Monthly Revenue Forecast',
    type: 'sales',
    generatedAt: '2026-06-09T08:00:00Z',
    status: 'failed',
  },
];

export interface ReportListParams {
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const reportService = {
  async getReports(params: ReportListParams = {}): Promise<{ reports: ReportSummary[]; total: number }> {
    if (import.meta.env.DEV) {
      await new Promise((r) => setTimeout(r, 400));
      let filtered = [...MOCK_REPORTS];
      if (params.type) filtered = filtered.filter((r) => r.type === params.type);
      if (params.status) filtered = filtered.filter((r) => r.status === params.status);
      return { reports: filtered, total: filtered.length };
    }

    const { data } = await apiClient.get('/reports', { params });
    return data;
  },

  async generateReport(type: string, options?: Record<string, unknown>): Promise<ReportSummary> {
    const { data } = await apiClient.post('/reports/generate', { type, ...options });
    return data;
  },

  async downloadReport(id: string): Promise<Blob> {
    const { data } = await apiClient.get(`/reports/${id}/download`, {
      responseType: 'blob',
    });
    return data;
  },
};
