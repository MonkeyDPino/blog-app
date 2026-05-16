import type { IUser } from './user.interface';

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: IUser;
}

export type IMeResponse = IUser;
