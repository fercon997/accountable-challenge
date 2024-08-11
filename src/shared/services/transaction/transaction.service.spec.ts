import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { ClientSession } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { TransactionService } from './transaction.service';
import { ITransactionService } from './transaction-service.interface';

describe('TransactionService', () => {
  let service: ITransactionService<ClientSession>;
  let sessionMock: ClientSession;

  beforeEach(async () => {
    sessionMock = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    } as unknown as ClientSession;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ITransactionService, useClass: TransactionService },
        { provide: 'LoggerService', useValue: createMock() },
        {
          provide: getConnectionToken(),
          useValue: createMock({
            startSession() {
              return sessionMock;
            },
          }),
        },
      ],
    }).compile();

    service =
      await module.resolve<ITransactionService<ClientSession>>(
        ITransactionService,
      );
  });

  describe('Start transaction tests', () => {
    it('should execute function and commit transaction', async () => {
      const executor = jest.fn();

      await service.startTransaction(executor);
      expect(executor).toHaveBeenCalled();
      expect(sessionMock.commitTransaction).toHaveBeenCalled();
      expect(sessionMock.endSession).toHaveBeenCalled();
      expect(sessionMock.abortTransaction).not.toHaveBeenCalled();
    });

    it('should execute function and rollback transaction if something fails', async () => {
      const executor = jest.fn(async () => {
        throw new Error('something failed');
      });

      await expect(service.startTransaction(executor)).rejects.toThrow(
        'something failed',
      );
      expect(executor).toHaveBeenCalled();
      expect(sessionMock.abortTransaction).toHaveBeenCalled();
      expect(sessionMock.endSession).toHaveBeenCalled();
      expect(sessionMock.commitTransaction).not.toHaveBeenCalled();
    });
  });

  describe('Get current transaction tests', () => {
    it('should return transaction only in transaction scope', async () => {
      await service.startTransaction(async () => {
        expect(service.getCurrentTransaction()).toBe(sessionMock);
      });

      expect(service.getCurrentTransaction()).toBeUndefined();
    });
  });
});
