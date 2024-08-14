import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { BaseController, Response } from '@shared/base.controller';
import { ApiOkResponse } from '@shared/decorators';
import { ApiTags } from '@nestjs/swagger';
import { IUserService } from '../../domain/services/user';
import { TokenDTO, UserLoginDTO } from '../../domain/dto';

@ApiTags('Users')
@Controller()
export class UserController extends BaseController {
  constructor(
    @Inject(IUserService) private readonly userService: IUserService,
  ) {
    super();
  }

  @HttpCode(200)
  @ApiOkResponse(TokenDTO)
  @Post('login')
  async login(
    @Body() { email, password }: UserLoginDTO,
  ): Promise<Response<TokenDTO>> {
    return this.ok({ token: await this.userService.login(email, password) });
  }
}
