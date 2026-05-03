import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { buildCorsOptions, resolveDocsConfig } from './bootstrap/bootstrap-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true, rawBody: true });
  app.useLogger(app.get(Logger));

  // Security Headers
  app.use(helmet());

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;
  const nodeEnv =
    (configService.get<'development' | 'production' | 'test'>('NODE_ENV') ?? 'development');
  const corsAllowedOrigins = configService.get<string[]>('CORS_ALLOWED_ORIGINS') ?? [];
  const docsEnabled = configService.get<boolean>('DOCS_ENABLED') ?? false;
  const docsPath = configService.get<string>('DOCS_PATH');
  const docsConfig = resolveDocsConfig({ docsEnabled, docsPath });

  app.enableCors(
    buildCorsOptions({
      nodeEnv,
      corsAllowedOrigins,
    }),
  );

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (docsConfig.enabled) {
    const config = new DocumentBuilder()
      .setTitle('Phylactery Bridge API')
      .setDescription('The commercial SaaS backend for SkullRender.')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(docsConfig.path, app, document);
  }

  await app.listen(port);
  const logger = app.get(Logger);
  logger.log(`Application is running on: ${await app.getUrl()}/api/v1`);
  logger.log(
    JSON.stringify({
      event: 'bootstrap_security_config',
      docsEnabled: docsConfig.enabled,
      docsPath: docsConfig.path,
      corsAllowedOrigins,
    }),
  );
}
bootstrap();
