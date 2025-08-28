import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEntityDevice1755181747431 implements MigrationInterface {
  name = 'UpdateEntityDevice1755181747431';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "config"`);
    await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "device_os"`);
    await queryRunner.query(`DROP TYPE "public"."devices_device_os_enum"`);
    await queryRunner.query(`ALTER TABLE "device_types" ADD "device_type" character varying NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "device_types" DROP COLUMN "device_type"`);
    await queryRunner.query(`CREATE TYPE "public"."devices_device_os_enum" AS ENUM('android', 'ios')`);
    await queryRunner.query(
      `ALTER TABLE "devices" ADD "device_os" "public"."devices_device_os_enum" NOT NULL DEFAULT 'android'`,
    );
    await queryRunner.query(`ALTER TABLE "devices" ADD "config" jsonb`);
  }
}
