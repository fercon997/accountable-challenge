import { Module } from '@nestjs/common';
import { ReservationModule } from '@reservation/reservation.module';
import { UserModule } from '@user/user.module';
import { BooksModule } from '@book/books.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [ReservationModule, UserModule, BooksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
