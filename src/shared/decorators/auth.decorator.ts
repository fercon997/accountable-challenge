import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { PermissionMap } from '../types';
import { AuthGuard } from '../guards';

export function Auth(...permissions: PermissionMap[]) {
  return applyDecorators(
    SetMetadata('permissions', permissions),
    UseGuards(AuthGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse(),
  );
}
