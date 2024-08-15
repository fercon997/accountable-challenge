import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { EmailService } from './email.service';
import { IEmailService } from './email-service.interface';

describe('EmailService', () => {
  let service: IEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: IEmailService, useClass: EmailService },
        {
          provide: 'LoggerService',
          useValue: createMock(),
        },
      ],
    }).compile();

    service = module.get<IEmailService>(IEmailService);
  });

  it('should send email', () => {
    expect(
      service.sendEmail({
        email: 'test@mail.com',
        body: 'Email Body',
        title: 'Email title',
      }),
    ).toBe(true);
  });
});
