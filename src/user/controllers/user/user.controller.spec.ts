import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { IUserService } from '../../domain/services/user';
import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;
  let service: IUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: IUserService, useValue: createMock<IUserService>() },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<IUserService>(IUserService);
  });

  describe('POST login tests', () => {
    it('should return token', async () => {
      const email = 'test@mail.com';
      const password = '12334';
      const token = 'asdasd12312312';
      jest
        .spyOn(service, 'login')
        .mockImplementationOnce(async (mail, pass) => {
          if (mail === email && pass === password) {
            return token;
          }
        });

      expect(await controller.login({ email, password })).toEqual({
        statusCode: 200,
        data: { token },
      });
    });
  });
});
