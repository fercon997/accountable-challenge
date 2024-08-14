import { TokenUser } from '@shared/types';

export interface IUserService {
  login(email: string, password: string): Promise<string>;

  verifyToken(token: string): TokenUser;
}

export const IUserService = Symbol('IUserService');
