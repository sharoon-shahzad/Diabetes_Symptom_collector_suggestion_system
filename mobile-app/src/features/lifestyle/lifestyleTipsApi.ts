/**
 * Lifestyle Tips API - RTK Query
 * Dedicated lifestyle tips generation and management (separate from content browsing)
 *
 * Backend response shapes:
 *   getCurrentTips   → { success, tips: LifestyleTipsData }
 *   autoGenerate     → { success, message, tips: LifestyleTipsData, region_coverage, emailSent }
 *   getHistory       → { success, history: LifestyleTipsData[], count }
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@services/api';

/* ── Types matching backend LifestyleTip Mongoose model ── */

export interface TipItem {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TipCategory {
  name: string;
  icon?: string;
  tips: TipItem[];
}

export interface LifestyleTipsData {
  _id: string;
  user_id: string;
  categories: TipCategory[];
  personalized_insights?: string[];
  sources?: { title: string; country: string; doc_type: string }[];
  target_date: string;
  region: string;
  status: 'active' | 'archived';
  generated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LifestyleTipsStats {
  totalGenerated: number;
  categoryCounts: Record<string, number>;
}

/* ── API slice ── */

export const lifestyleTipsApi = createApi({
  reducerPath: 'lifestyleTipsApi',
  baseQuery,
  tagTypes: ['LifestyleTips'],
  endpoints: (builder) => ({

    autoGenerateTips: builder.mutation<LifestyleTipsData | null, void>({
      query: () => ({
        url: '/lifestyle-tips/auto-generate',
        method: 'POST',
      }),
      transformResponse: (res: any) => res?.tips ?? res?.data ?? null,
      invalidatesTags: ['LifestyleTips'],
    }),

    generateTips: builder.mutation<LifestyleTipsData | null, { target_date: string }>({
      query: (data) => ({
        url: '/lifestyle-tips/generate',
        method: 'POST',
        body: data,
      }),
      transformResponse: (res: any) => res?.tips ?? res?.data ?? null,
      invalidatesTags: ['LifestyleTips'],
    }),

    getCurrentTips: builder.query<LifestyleTipsData | null, void>({
      query: () => '/lifestyle-tips/current',
      transformResponse: (res: any) => res?.tips ?? res?.data ?? null,
      providesTags: ['LifestyleTips'],
    }),

    getTipsByDate: builder.query<LifestyleTipsData | null, string>({
      query: (date) => `/lifestyle-tips/date/${date}`,
      transformResponse: (res: any) => res?.tips ?? res?.data ?? null,
      providesTags: ['LifestyleTips'],
    }),

    getTipsHistory: builder.query<LifestyleTipsData[], { limit?: number }>({
      query: ({ limit = 10 } = {}) => ({
        url: '/lifestyle-tips/history',
        params: { limit },
      }),
      transformResponse: (res: any) => res?.history ?? res?.data ?? [],
      providesTags: ['LifestyleTips'],
    }),

    getTipsById: builder.query<LifestyleTipsData | null, string>({
      query: (id) => `/lifestyle-tips/${id}`,
      transformResponse: (res: any) => res?.tips ?? res?.data ?? null,
      providesTags: ['LifestyleTips'],
    }),

    deleteTips: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/lifestyle-tips/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LifestyleTips'],
    }),

    getTipsRegionCoverage: builder.query<{ region: string; canGenerateTips: boolean; documentCount: number }, void>({
      query: () => '/lifestyle-tips/region-coverage',
      transformResponse: (res: any) => res?.data ?? res,
    }),

    getTipsStats: builder.query<LifestyleTipsStats, void>({
      query: () => '/lifestyle-tips/stats',
      transformResponse: (res: any) => res?.data ?? res,
    }),
  }),
});

export const {
  useAutoGenerateTipsMutation,
  useGenerateTipsMutation,
  useGetCurrentTipsQuery,
  useGetTipsByDateQuery,
  useGetTipsByIdQuery,
  useGetTipsHistoryQuery,
  useDeleteTipsMutation,
  useGetTipsRegionCoverageQuery,
  useGetTipsStatsQuery,
} = lifestyleTipsApi;
