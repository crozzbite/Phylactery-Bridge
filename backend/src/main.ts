import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true, rawBody: true });
  app.useLogger(app.get(Logger));
  
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;
  const allowedOrigins = configService.get('ALLOWED_ORIGINS');

  app.enableCors({
    origin: allowedOrigins === '*' ? '*' : allowedOrigins,
    credentials: true,
  });
  
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  await app.listen(port);
  const logger = app.get(Logger);
  logger.log(`Application is running on: ${await app.getUrl()}/api/v1`);
}
bootstrap();
