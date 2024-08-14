import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  BaseController,
  Response,
  ResponsePaginated,
} from '@shared/base.controller';
import {
  ApiOkResponse,
  ApiOkResponsePaginated,
  Auth,
  User,
} from '@shared/decorators';
import { ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@shared/dto';
import { TokenUser } from '@shared/types';
import { IReservationService } from '../../domain/services/reservation/reservation-service.interface';
import { CreateReservationDto, ReservationDto } from '../../domain/dto';
import { mapReservationToDto } from '../../domain/mappers';
import { Reservation } from '../../common/entities';

@ApiTags('Reservations')
@Controller()
export class ReservationController extends BaseController {
  constructor(
    @Inject(IReservationService)
    private reservationService: IReservationService,
  ) {
    super();
  }

  @Get('history')
  @Auth()
  @ApiOkResponsePaginated(ReservationDto)
  async getReservationsHistory(
    @Query() options: PaginationDto,
  ): Promise<ResponsePaginated<ReservationDto>> {
    const result = await this.reservationService.getPaginated({}, options);

    return this.okPaginated({
      ...result,
      data: result.data.map(mapReservationToDto),
    });
  }

  @ApiOkResponse(ReservationDto)
  @Auth()
  @Post()
  async createReservation(
    @Body() { bookId, expectedReturnDate }: CreateReservationDto,
    @User('id') userId: string,
  ): Promise<Response<ReservationDto>> {
    const result = await this.reservationService.createReservation(
      userId,
      bookId,
      expectedReturnDate,
    );

    return this.ok(mapReservationToDto(result));
  }

  @ApiOkResponse(ReservationDto)
  @Auth()
  @Patch(':id/pay')
  async payReservation(
    @User('id') userId: string,
    @Param('id') id: string,
  ): Promise<Response<Reservation>> {
    const result = await this.reservationService.payReservation(id, userId);

    return this.ok(mapReservationToDto(result));
  }

  @ApiOkResponse(ReservationDto)
  @Auth()
  @Patch(':id/cancel')
  async cancelReservation(
    @User('id') userId: string,
    @Param('id') id: string,
  ): Promise<Response<Reservation>> {
    const result = await this.reservationService.cancelReservation(id, userId);

    return this.ok(mapReservationToDto(result));
  }

  @ApiOkResponse(ReservationDto)
  @Auth()
  @Patch(':id/end')
  async endReservation(
    @User('id') userId: string,
    @Param('id') id: string,
  ): Promise<Response<Reservation>> {
    const result = await this.reservationService.endReservation(id, userId);

    return this.ok(mapReservationToDto(result));
  }
}
