import { Injectable } from '@nestjs/common';
import { IConfiguration } from '../../shares/interfaces/config/configuration.interface';
import { IAuthConfiguration } from '../../shares/interfaces/config/auth-configuration.interface';
import { ILoggerConfiguration } from '../../shares/interfaces/config/logger-configuration.interface';
import { IRedisConfiguration } from '../../shares/interfaces/config/redis-configuration.interface';
import { IDatabaseConfiguration } from 'src/shares/interfaces/config/postgres-configuration.interface';
import { IAppConfiguration } from 'src/shares/interfaces/config/app-configuration.interface';
import { IThrottleConfiguration } from 'src/shares/interfaces/config/throttle-configuration.interface';
import { IQueueJobConfiguration } from '../../shares/interfaces/config/queue-job-configuration.interface';
import { getConfig } from '../../shares/helpers/utils';
import { ISMTPConfiguration } from '../../shares/interfaces/config/smtp-configuration.interface';

@Injectable()
export class ConfigService {
  private readonly configuration: IConfiguration;

  constructor() {
    this.configuration = getConfig();
  }

  getAuthConfiguration(): IAuthConfiguration {
    return this.configuration.auth;
  }

  getDatabaseConfiguration(): IDatabaseConfiguration {
    return {
      ...this.configuration.database,
      port: Number(this.configuration.database.port),
    };
  }

  getEnvironment(): string {
    return this.configuration.app.env;
  }

  getAppName(): string {
    return this.configuration.app.name;
  }

  getLoggerConfiguration(): ILoggerConfiguration {
    return this.configuration.logger;
  }

  getRedisConfiguration(): IRedisConfiguration {
    return this.configuration.redis;
  }

  getAppConfiguration(): IAppConfiguration {
    return this.configuration.app;
  }

  getThrottleConfiguration(): IThrottleConfiguration {
    return this.configuration.throttle;
  }

  getRedisQueueConfiguration(): IQueueJobConfiguration {
    return this.configuration.queue_job;
  }

  getSMTPConfiguration(): ISMTPConfiguration {
    return this.configuration.smtp;
  }
}
