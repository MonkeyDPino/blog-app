import type { ICategory, IPost } from '@blog/types';
import { apiClient } from './client';

export const categoriesApi = {
  getAll: () => apiClient<ICategory[]>('/categories'),

  getOne: (id: number) => apiClient<ICategory>(`/categories/${id}`),

  getPosts: (id: number) => apiClient<IPost[]>(`/categories/${id}/posts`),

  create: (data: { name: string; description?: string; coverImage?: string }) =>
    apiClient<ICategory>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (
    id: number,
    data: { name?: string; description?: string; coverImage?: string },
  ) =>
    apiClient<ICategory>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiClient<void>(`/categories/${id}`, { method: 'DELETE' }),
};
