import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { EmailInput, IEmailService } from './email-service.interface';

@Injectable()
export class EmailService implements IEmailService {
  constructor(@Inject('LoggerService') private logger: LoggerService) {}

  sendEmail(mail: EmailInput): boolean {
    this.logger.log(`Sending email to ${mail.email}`);

    this.logger.log(JSON.stringify(mail));

    this.logger.log(`Mail sent to ${mail.email}`);

    return true;
  }
}
