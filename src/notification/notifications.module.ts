import { Module } from '@nestjs/common';
import { SharedModule } from '@shared/shared.module';
import { EmailService, IEmailService } from './domain/services/email';

@Module({
  imports: [SharedModule],
  providers: [{ provide: IEmailService, useClass: EmailService }],
  exports: [IEmailService],
})
export class NotificationsModule {}
