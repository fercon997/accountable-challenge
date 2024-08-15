import {
  Inject,
  Injectable,
  Logger,
  LoggerService,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(@Inject('LoggerService') private logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = new Date();
    this.logger.log(`Request to ${req.method} ${req.url} started`, 'HTTP');
    this.logger.debug(
      { body: req.body, headers: req.headers, originalUrl: req.originalUrl },
      'HTTP',
    );

    let body = {};
    const chunks = [];
    const oldEnd = res.end;
    res.end = (chunk) => {
      if (chunk) {
        chunks.push(Buffer.from(chunk));
      }
      body = Buffer.concat(chunks).toString('utf8');
      return oldEnd.call(res, body);
    };

    res.on('finish', async () => {
      return setTimeout(() => {
        const duration = new Date().getMilliseconds() - start.getMilliseconds();
        this.logger.log(
          `Request to ${req.method} ${req.url} finished with status code ${res.statusCode}. Duration: ${duration} ms`,
          'HTTP',
        );
        this.logger.debug({
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          body,
        });
      }, 0);
    });

    if (next) {
      next();
    }
  }
}
