import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { Request } from 'express';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        customProps: (req: Request) => {
          return {
            trace_id: req.headers['x-request-id'],
          };
        },
        autoLogging: false,
        serializers: {
            req: (req) => ({
                id: req.id,
                method: req.method,
                url: req.url,
                query: req.query,
                params: req.params,
                remoteAddress: req.remoteAddress,
                remotePort: req.remotePort,
            }),
        }
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerConfigModule {} // Renamed to avoid collision with common usage
