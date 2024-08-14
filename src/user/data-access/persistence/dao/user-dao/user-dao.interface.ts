import { User } from '../../../../common/entities';

export interface IUserDao {
  get(email: string): Promise<User>;
}

export const IUserDao = Symbol('IUserDao');
