import { TokenUser } from '@shared/types';
import { User } from '../../../common/entities';

export interface IUserService {
  login(email: string, password: string): Promise<string>;

  verifyToken(token: string): TokenUser;

  getByIds(userIds: string[]): Promise<User[]>;
}

export const IUserService = Symbol('IUserService');
