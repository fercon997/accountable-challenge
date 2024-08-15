import * as process from 'node:process';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ReservationModule } from '@reservation/reservation.module';
import { UsersModule } from '@user/users.module';
import { BooksModule } from '@book/books.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RouterModule } from '@nestjs/core';
import { SharedModule } from '@shared/shared.module';
import { HttpLoggerMiddleware } from '@shared/middleware/http-logger.middleware';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from './notification/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 100,
    }),
    RouterModule.register([
      { path: 'book', module: BooksModule },
      {
        path: 'user',
        module: UsersModule,
      },
      { path: 'reservation', module: ReservationModule },
    ]),
    ReservationModule,
    UsersModule,
    BooksModule,
    NotificationsModule,
    SharedModule,
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
