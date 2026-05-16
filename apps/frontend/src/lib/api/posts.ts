import type { IPost } from '@blog/types';
import { apiClient } from './client';

export const postsApi = {
  getAll: () => apiClient<IPost[]>('/posts'),

  getOne: (id: number) => apiClient<IPost>(`/posts/${id}`),

  search: (q: string) =>
    apiClient<IPost[]>(`/posts/search?q=${encodeURIComponent(q)}`),

  create: (data: Partial<IPost> & { title: string; categoryIds?: number[] }) =>
    apiClient<IPost>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<IPost> & { categoryIds?: number[] }) =>
    apiClient<IPost>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) => apiClient<void>(`/posts/${id}`, { method: 'DELETE' }),

  publish: (id: number) =>
    apiClient<IPost>(`/posts/${id}/publish`, { method: 'PATCH' }),

  suggestCategories: (id: number) =>
    apiClient<{ suggestions: string[] }>(`/posts/${id}/suggest-categories`, {
      method: 'POST',
    }),
};
