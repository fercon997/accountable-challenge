import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '@shared/shared.module';
import {
  Permission,
  PermissionSchema,
  Role,
  RoleSchema,
  User,
  UserSchema,
} from './common/entities';
import {
  UserDaoService,
  IUserDao,
} from './data-access/persistence/dao/user-dao';
import { UserService, IUserService } from './domain/services/user';
import { UserController } from './controllers/user/user.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
    SharedModule,
  ],
  providers: [
    { provide: IUserDao, useClass: UserDaoService },
    { provide: IUserService, useClass: UserService },
  ],
  exports: [IUserService],
  controllers: [UserController],
})
export class UsersModule {}
