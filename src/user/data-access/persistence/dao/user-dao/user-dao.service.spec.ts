import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { createMock } from '@golevelup/ts-jest';
import { FilterQuery, Model, Query, Types } from 'mongoose';
import { PersistenceError } from '@shared/errors';
import { User } from '../../../../common/entities';
import { IUserDao } from './user-dao.interface';
import { UserDaoService } from './user-dao.service';

describe('UserDaoService', () => {
  let service: IUserDao;
  let model: Model<User>;

  const _id = new Types.ObjectId();
  const email = 'test@test.com';
  const password = '1234';
  const createdAt = new Date();
  const updatedAt = new Date();

  const user: User = {
    _id: _id.toString(),
    name: 'test user',
    email,
    password,
    createdAt,
    updatedAt,
    role: {
      _id: _id.toString(),
      name: 'role',
      createdAt,
      updatedAt,
      permissions: [
        { _id: _id.toString(), name: 'create', createdAt, updatedAt },
      ],
    },
  };

  const userDocument = {
    ...user,
    _id,
    createdAt,
    updatedAt,
    role: {
      ...user.role,
      _id,
      permissions: [{ ...user.role.permissions[0], _id }],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: IUserDao, useClass: UserDaoService },
        {
          provide: getModelToken(User.name),
          useValue: createMock(),
        },
        { provide: 'LoggerService', useValue: createMock() },
      ],
    }).compile();

    service = module.get<IUserDao>(IUserDao);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  describe('Get user test', () => {
    const getMock = ({ email }: FilterQuery<User>): Query<any, any> => {
      return {
        populate() {
          if (user.email === email) {
            return {
              toJSON() {
                return userDocument;
              },
            };
          }
          return null;
        },
      } as unknown as Query<any, any>;
    };

    it('should return user when found', async () => {
      jest.spyOn(model, 'findOne').mockImplementationOnce(getMock);

      expect(await service.get(email)).toEqual(user);
    });

    it('should return null when not found', async () => {
      jest.spyOn(model, 'findOne').mockImplementationOnce(getMock);

      expect(await service.get('pepe@mail.to')).toBeNull();
    });

    it('should throw an error when something goes wrong', async () => {
      jest.spyOn(model, 'findOne').mockImplementationOnce(() => {
        throw new Error('cannot get');
      });

      await expect(service.get(email)).rejects.toBeInstanceOf(PersistenceError);
    });
  });
});
