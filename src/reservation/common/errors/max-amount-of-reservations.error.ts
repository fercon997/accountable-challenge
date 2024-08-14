import { LoggerService } from '@nestjs/common';
import { BadRequestError } from '@shared/errors';

export class MaxAmountOfReservationsError extends BadRequestError {
  constructor(logger: LoggerService, userId: string, inner?: Error) {
    const message = `User ${userId} already has the maximum amount of active reservations `;
    super(logger, message, inner);
  }
}
