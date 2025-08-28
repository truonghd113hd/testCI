import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { getConfig } from './shares/helpers/utils';
import { Logger } from 'nestjs-pino';
const config = getConfig();

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule);
  const appConfig = config.get('app');
  const { version } = appConfig;
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.init();
  logger.log(`Worker (${version}) is running PID: ${process.pid}`);
}

bootstrap();
