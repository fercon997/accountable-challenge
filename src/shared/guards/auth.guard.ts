import {
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { IUserService } from '@user/domain/services/user';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { PermissionMap } from '../types';

export class AuthGuard implements CanActivate {
  constructor(
    @Inject(IUserService) private userService: IUserService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    const token = authHeader ? authHeader.split(' ')[1] : null;

    const permissions = this.reflector.get<PermissionMap>(
      'permissions',
      context.getHandler,
    );

    const payload = this.userService.verifyToken(token);

    if (permissions && permissions.length > 0) {
      for (const permission of payload.role.permissions) {
        if (permissions.includes(permission)) {
          return true;
        }
      }
      throw new UnauthorizedException();
    }

    request['user'] = payload;

    return true;
  }
}
