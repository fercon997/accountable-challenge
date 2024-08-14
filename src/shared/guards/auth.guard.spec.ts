import { Test } from '@nestjs/testing';
import { IUserService } from '@user/domain/services/user';
import { createMock } from '@golevelup/ts-jest';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { PermissionMap, TokenUser } from '../types';
import { AuthGuard } from './auth.guard';

describe('AuthGuard tests', () => {
  let guard: AuthGuard;
  let service: IUserService;
  let reflector: Reflector;

  const user: TokenUser = {
    id: '12312321',
    role: { name: 'testRole', permissions: [PermissionMap.getUser] },
    email: 'test@mail.ocm',
  };

  const token = 'asiudhb612799ofew';

  const context = (token: string): ExecutionContext => {
    return {
      switchToHttp() {
        return {
          getRequest() {
            return {
              headers: {
                authorization: token ? `Bearer ${token}` : null,
              },
            };
          },
        };
      },
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: IUserService, useValue: createMock() },
        {
          provide: Reflector,
          useValue: createMock(),
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    service = module.get<IUserService>(IUserService);
    reflector = module.get<Reflector>(Reflector);

    jest.spyOn(service, 'verifyToken').mockImplementationOnce((tkn) => {
      if (tkn === token) {
        return user;
      }

      throw new UnauthorizedException();
    });
  });

  it('should allow authorization when no roles', () => {
    expect(guard.canActivate(context(token))).toBe(true);
  });

  it('should allow authorization when roles', () => {
    jest
      .spyOn(reflector, 'get')
      .mockImplementationOnce(() => [
        PermissionMap.getUser,
        PermissionMap.getBook,
      ]);

    expect(guard.canActivate(context(token))).toBe(true);
  });

  it('should throw an error when token is invalid', async () => {
    expect(() => guard.canActivate(context('adqweq'))).toThrow(
      UnauthorizedException,
    );
  });

  it('should throw an error when permissions are not valid', async () => {
    jest
      .spyOn(reflector, 'get')
      .mockImplementationOnce(() => [PermissionMap.getBook]);

    expect(() => guard.canActivate(context(token))).toThrow(
      UnauthorizedException,
    );
  });

  it('should throw an error if token is null', () => {
    expect(() => guard.canActivate(context(null))).toThrow(
      UnauthorizedException,
    );
  });
});
