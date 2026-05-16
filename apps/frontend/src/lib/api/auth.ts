import type {
  IAuthResponse,
  IMeResponse,
  ILoginRequest,
  IUser,
} from '@blog/types';
import { apiClient } from './client';

export const authApi = {
  login: (data: ILoginRequest) =>
    apiClient<IAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () => apiClient<void>('/auth/logout', { method: 'POST' }),

  me: () => apiClient<IMeResponse>('/auth/me'),

  register: (data: {
    email: string;
    password: string;
    profile: { firstName: string; lastName: string };
  }) =>
    apiClient<IUser>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
