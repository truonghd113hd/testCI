import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { JwtModule } from '@nestjs/jwt';
import { CacheService } from './cache.service';
import { PaginationMetadataHelper } from '../../shares/pagination/pagination.helper';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import Redis from 'ioredis';
import { redisStore } from 'cache-manager-redis-store';
import { BullModule } from '@nestjs/bull';
import { QueuePrefixKey } from '../queue/queue.constant';
import { LoggerModule, Params } from 'nestjs-pino';
import { getCorrelationId, pinoConfig } from '../../shares/logger/Logger';
import * as pino from 'pino';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';

@Global()
@Module({})
export class CoreModule {
  static register(): DynamicModule {
    return {
      module: CoreModule,
      providers: [ConfigService, CacheService, PaginationMetadataHelper],
      imports: [
        JwtModule.registerAsync({
          useFactory: async (configService: ConfigService) => ({
            secret: configService.getAuthConfiguration().jwt.secretKey,
            signOptions: {
              expiresIn: configService.getAuthConfiguration().jwt.expireTime,
            },
          }),
          inject: [ConfigService],
        }),
        CacheModule.registerAsync({
          useFactory: async (configService: ConfigService) => {
            const store = await redisStore({
              socket: {
                host: configService.getRedisConfiguration().host,
                port: configService.getRedisConfiguration().port,
                passphrase: configService.getRedisConfiguration().password,
              },
            });

            return {
              store: store as unknown as CacheStore,
            };
          },
          inject: [ConfigService],
        }),
        LoggerModule.forRootAsync({
          useFactory: async () => {
            return {
              pinoHttp: {
                ...pinoConfig,
                serializers: {
                  err: pino.stdSerializers.err,
                  req: (req) => {
                    req.body = req.raw.body;
                    return req;
                  },
                },
                customProps: () => ({
                  correlationId: getCorrelationId(),
                }),
              },
            } as Params;
          },
        }),
        ThrottlerModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            ttl: config.getThrottleConfiguration().ttl,
            limit: config.getThrottleConfiguration().limit,
            throttlers: [],
            storage: new ThrottlerStorageRedisService(
              new Redis({
                host: config.getRedisConfiguration().host,
                port: config.getRedisConfiguration().port,
                password: config.getRedisConfiguration().password,
              }),
            ),
          }),
        }),
        BullModule.forRootAsync({
          useFactory: async (configService: ConfigService) => {
            return {
              redis: {
                host: configService.getRedisConfiguration().host,
                port: configService.getRedisConfiguration().port,
                password: configService.getRedisConfiguration().password,
              },
              prefix: QueuePrefixKey,
            };
          },
          inject: [ConfigService],
        }),
      ],
      exports: [ConfigService, JwtModule, CacheModule, CacheService, PaginationMetadataHelper],
    };
  }
}
