import { config as dotenvConfig } from 'dotenv';
dotenvConfig();
import { DataSource } from 'typeorm';
import config from 'config';
const { database, typeorm } = config;
export const typeOrmConnectionDataSource = new DataSource({
  type: typeorm.type,
  host: database.host,
  port: Number(database.port),
  username: database.username,
  password: database.password,
  database: database.database,
  entities: ['src/modules/**/entities/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});
