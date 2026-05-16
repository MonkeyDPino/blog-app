import type { IUser, IPost } from '@blog/types';
import { apiClient } from './client';

export const usersApi = {
  getOne: (id: number) => apiClient<IUser>(`/users/${id}`),

  getPosts: (id: number) => apiClient<IPost[]>(`/users/${id}/posts`),

  update: (
    id: number,
    data: {
      email?: string;
      password?: string;
      profile?: {
        firstName?: string;
        lastName?: string;
        avatarUrl?: string;
      };
    },
  ) =>
    apiClient<IUser>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
