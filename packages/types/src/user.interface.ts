export type UserRole = 'user' | 'admin';

export interface IProfile {
  id: number;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser {
  id: number;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  profile: IProfile;
}
