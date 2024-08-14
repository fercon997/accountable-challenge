import * as path from 'node:path';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { DaoService } from '@shared/dao.service';
import { Model, Promise } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  Permission,
  Role,
  User,
  UserDocument,
} from '../../../../common/entities';
import { IUserDao } from './user-dao.interface';

@Injectable()
export class UserDaoService extends DaoService implements IUserDao {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject('LoggerService') logger: LoggerService,
  ) {
    super(logger);
  }

  private parseDbResult(document: UserDocument): User {
    if (document) {
      const doc = document.toJSON();
      const { role } = doc;
      const { permissions } = role;
      return new User({
        ...doc,
        role: new Role({
          ...role,
          permissions: permissions.map((perm) => new Permission(perm)),
        }),
      });
    }
    return null;
  }

  async get(email: string): Promise<User> {
    try {
      const result = await this.userModel.findOne({ email }).populate({
        path: 'role',
        populate: { path: 'permissions' },
      });

      return this.parseDbResult(result);
    } catch (e) {
      this.throwError('Cannot find user', e);
    }
  }
}
