const verify = jest.fn();
const sign = jest.fn();

jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  verify,
  sign,
}));

import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { genSaltSync, hashSync } from 'bcrypt';
import { TokenUser } from '@shared/types';
import { UnauthorizedException } from '@nestjs/common';
import { IUserDao } from '../../../data-access/persistence/dao/user-dao';
import { User } from '../../../common/entities';
import { UserService } from './user.service';
import { IUserService } from './user-service.interface';

describe('UserService', () => {
  let service: IUserService;
  let dao: IUserDao;

  const _id = 'das761ashdb';
  const email = 'test@test.com';
  const password = '1234';
  const createdAt = new Date();
  const updatedAt = new Date();

  const user: User = {
    _id: _id.toString(),
    name: 'test user',
    email,
    password: hashSync(password, genSaltSync()),
    createdAt,
    updatedAt,
    role: {
      _id,
      name: 'role',
      createdAt,
      updatedAt,
      permissions: [{ _id, name: 'create', createdAt, updatedAt }],
    },
  };

  const tokenUser: TokenUser = {
    id: user._id,
    email: user.email,
    iat: 12234984239,
    role: {
      name: user.role.name,
      permissions: user.role.permissions.map((permissions) => permissions.name),
    },
  };

  const token = 'asnd87y219odsdsa';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: IUserService, useClass: UserService },
        {
          provide: IUserDao,
          useValue: createMock(),
        },
        { provide: 'LoggerService', useValue: createMock() },
      ],
    }).compile();

    service = module.get<IUserService>(IUserService);
    dao = module.get<IUserDao>(IUserDao);

    sign.mockImplementationOnce(() => token);
    verify.mockImplementationOnce((tok: string) => {
      if (tok === token) {
        return tokenUser;
      }
      throw new Error('invalid jwt');
    });
  });

  describe('login tests', () => {
    beforeEach(() => {
      jest.spyOn(dao, 'get').mockImplementationOnce(async (email) => {
        if (email === user.email) {
          return user;
        }
        return null;
      });
    });

    it('should return token', async () => {
      expect(await service.login(email, password)).toEqual(token);
    });

    it('should throw error if not found', async () => {
      await expect(service.login('other@mail.ot', password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('verify token tests', () => {
    it('should return user token', () => {
      expect(service.verifyToken(token)).toEqual(tokenUser);
    });

    it('should throw error if cant verify', () => {
      expect(() => service.verifyToken('asdia7y12')).toThrow(
        UnauthorizedException,
      );
    });
  });
});
