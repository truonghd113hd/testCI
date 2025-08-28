import 'reflect-metadata';
import { ConfigService } from 'src/modules/core/config.service';
import { DataSource } from 'typeorm';
import { getConfig } from '../../shares/helpers/utils';
const config = getConfig();
export const AppDataSource = {
  provide: DataSource,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    return new DataSource({
      type: config.get<string>('typeorm.type'),
      synchronize: false,
      migrationsRun: config.get<boolean>('typeorm.migrationOnStartup'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: ['dist/src/migrations/*.js'],
      logging: config.get<string[]>('typeorm.log'),
      ...configService.getDatabaseConfiguration(),
    }).initialize();
  },
};
