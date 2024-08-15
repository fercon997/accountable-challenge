import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { IBatchService } from '../../domain/services/batch';
import { ScheduleService } from './schedule.service';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let batchService: IBatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        { provide: IBatchService, useValue: createMock() },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    batchService = module.get<IBatchService>(IBatchService);
  });

  describe('late fees schedule tests', () => {
    it('should run schedule', async () => {
      await service.lateFeesSchedule();

      expect(batchService.handleLateReservations).toHaveBeenCalled();
    });
  });
  describe('close to return schedule tests', () => {
    it('should run schedule', async () => {
      await service.closeToReturnSchedule();

      expect(batchService.handleCloseToReturn).toHaveBeenCalled();
    });
  });
  describe('7 days late schedule tests', () => {
    it('should run schedule', async () => {
      await service.sevenDaysLateSchedule();

      expect(batchService.handle7DaysLate).toHaveBeenCalled();
    });
  });
});
