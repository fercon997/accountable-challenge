import {
  Inject,
  Injectable,
  LoggerService,
  UnauthorizedException,
} from '@nestjs/common';
import { compareSync } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { TokenUser } from '@shared/types';
import { IUserDao } from '../../../data-access/persistence/dao/user-dao';
import { Role, User } from '../../../common/entities';
import { IUserService } from './user-service.interface';

@Injectable()
export class UserService implements IUserService {
  private tokenKey = 'accountabletest';

  constructor(
    @Inject(IUserDao) private dao: IUserDao,
    @Inject('LoggerService') private logger: LoggerService,
  ) {}

  async login(email: string, password: string): Promise<string> {
    const user = await this.dao.get(email);

    if (!user || !compareSync(password, user.password)) {
      throw new UnauthorizedException();
    }

    const role = user.role as Role;

    const result: TokenUser = {
      id: user._id,
      email: user.email,
      role: {
        name: role.name,
        permissions: role.permissions.map((permission) => permission.name),
      },
    };

    return sign(result, this.tokenKey);
  }

  verifyToken(token: string): TokenUser {
    try {
      return verify(token, this.tokenKey) as TokenUser;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async getByIds(userIds: string[]): Promise<User[]> {
    const users = await this.dao.getByIds(userIds);

    return users;
  }
}
