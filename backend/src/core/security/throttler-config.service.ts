import { Injectable } from '@nestjs/common';
import { ThrottlerOptionsFactory, ThrottlerModuleOptions } from '@nestjs/throttler';

@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  createThrottlerOptions(): ThrottlerModuleOptions {
    return [
      {
        name: 'short',
        ttl: 10000, // 10 seconds
        limit: 10,
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100,
      },
    ];
  }
}
