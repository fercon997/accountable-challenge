import { Logger, Module } from '@nestjs/common';

@Module({
  providers: [{ provide: 'LoggerService', useClass: Logger }],
  exports: ['LoggerService'],
})
export class SharedModule {}
