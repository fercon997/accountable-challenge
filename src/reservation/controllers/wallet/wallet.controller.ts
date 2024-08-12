import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import {
  BaseController,
  BaseResponse,
  Response,
} from '@shared/base.controller';
import { ApiOkResponse } from '@shared/decorators';
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

  @Post('balance/add/:userId')
  @ApiResponse({ type: BaseResponse })
  async postAddBalance(
    @Param('userId') userId: string,
    @Body() dto: UpdateBalanceDto,
  ): Promise<Response<void>> {
    await this.walletService.incrementBalance(userId, dto.amount);
    return this.ok();
  }

  @Get('/:userId')
  @ApiOkResponse(WalletDto)
  async getWallet(
    @Param('userId') userId: string,
  ): Promise<Response<WalletDto>> {
    const result = await this.walletService.get(userId, true);
    return this.ok(mapWalletToDto(result));
  }
}
