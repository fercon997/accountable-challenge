import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import {
  BaseController,
  BaseResponse,
  Response,
} from '@shared/base.controller';
import { ApiOkResponse, Auth, User } from '@shared/decorators';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { IWalletService } from '../../domain/services/wallet';
import { UpdateBalanceDto, WalletDto } from '../../domain/dto';
import { mapWalletToDto } from '../../domain/mappers';

@ApiTags('Reservations')
@Controller('wallet')
export class WalletController extends BaseController {
  constructor(@Inject(IWalletService) private walletService: IWalletService) {
    super();
  }

  @Post('balance/add')
  @Auth()
  @ApiResponse({ type: BaseResponse })
  async postAddBalance(
    @User('id') userId: string,
    @Body() dto: UpdateBalanceDto,
  ): Promise<Response<void>> {
    await this.walletService.incrementBalance(userId, dto.amount);
    return this.ok();
  }

  @Get('')
  @ApiOkResponse(WalletDto)
  @Auth()
  async getWallet(@User('id') userId: string): Promise<Response<WalletDto>> {
    const result = await this.walletService.get(userId, true);
    return this.ok(mapWalletToDto(result));
  }
}
