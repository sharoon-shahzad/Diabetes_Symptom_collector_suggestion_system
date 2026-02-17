/**
 * Exercise Plan API - RTK Query
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@services/api';
import type { 
  ExercisePlan, 
  GenerateExercisePlanRequest,
  ApiResponse 
} from '@app-types/api';

export const exercisePlanApi = createApi({
  reducerPath: 'exercisePlanApi',
  baseQuery,
  tagTypes: ['ExercisePlan'],
  endpoints: (builder) => ({
    generateExercisePlan: builder.mutation<ApiResponse<ExercisePlan>, GenerateExercisePlanRequest>({
      query: (data) => ({
        url: '/exercise-plan/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ExercisePlan'],
    }),
    
    getExercisePlans: builder.query<ApiResponse<ExercisePlan[]>, void>({
      query: () => '/exercise-plan',
      providesTags: ['ExercisePlan'],
    }),
    
    getExercisePlanById: builder.query<ApiResponse<ExercisePlan>, string>({
      query: (id) => `/exercise-plan/${id}`,
      providesTags: (result, error, id) => [{ type: 'ExercisePlan', id }],
    }),
    
    deleteExercisePlan: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/exercise-plan/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExercisePlan'],
    }),
    
    downloadExercisePlanPDF: builder.mutation<Blob, string>({
      query: (id) => ({
        url: `/exercise-plan/${id}/download`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGenerateExercisePlanMutation,
  useGetExercisePlansQuery,
  useGetExercisePlanByIdQuery,
  useDeleteExercisePlanMutation,
  useDownloadExercisePlanPDFMutation,
} = exercisePlanApi;
