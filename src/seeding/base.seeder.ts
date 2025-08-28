import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource, QueryRunner } from 'typeorm';
import { Logger } from 'nestjs-pino';

export class BaseSeeder {
  protected app: INestApplication;
  protected logger: Logger;
  protected dataSource: DataSource;
  protected queryRunner: QueryRunner;
  async up() {
    try {
      await this.initialize();
      await this.process();
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async down() {
    try {
      await this.initialize();
      await this.clear();
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  protected async initialize() {
    this.app = await NestFactory.create(AppModule);
    this.logger = this.app.get(Logger);
    this.logger.debug('initialize [START]');
    this.dataSource = this.app.get(DataSource);
    this.queryRunner = this.dataSource.createQueryRunner();
    this.logger.debug('initialize [DONE]');
  }

  protected async process() {
    this.logger.debug('process [START]');
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
    try {
      await this.seed();
      await this.queryRunner.commitTransaction();
    } catch (err) {
      await this.queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await this.queryRunner.release();
    }
    this.logger.debug('process [DONE]');
  }

  protected async seed() {}

  protected async clear() {}
}
