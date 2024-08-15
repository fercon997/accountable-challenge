import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IBatchService } from '../../domain/services/batch';

@Injectable()
export class ScheduleService {
  constructor(@Inject(IBatchService) private batchService: IBatchService) {}

  @Cron('0 0 0 * * *')
  async lateFeesSchedule() {
    await this.batchService.handleLateReservations();
  }

  @Cron('0 0 12 * * *')
  async closeToReturnSchedule() {
    await this.batchService.handleCloseToReturn();
  }

  @Cron('0 0 12 * * *')
  async sevenDaysLateSchedule() {
    await this.batchService.handle7DaysLate();
  }
}
