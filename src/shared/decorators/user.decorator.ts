import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenUser } from '../types';

export const User = createParamDecorator(
  <T extends keyof TokenUser>(
    data: T,
    context: ExecutionContext,
  ): TokenUser | TokenUser[T] => {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    return data ? user?.[data] : user;
  },
);
