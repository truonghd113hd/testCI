import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateWeightHeightToUsersTable1754885768228 implements MigrationInterface {
  name = 'UpdateWeightHeightToUsersTable1754885768228';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "weight"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "height"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "height_cm" numeric(5,2)`);
    await queryRunner.query(`CREATE TYPE "public"."users_height_unit_enum" AS ENUM('cm', 'ft/inch')`);
    await queryRunner.query(`ALTER TABLE "users" ADD "height_unit" "public"."users_height_unit_enum"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "weight_kg" numeric(6,2)`);
    await queryRunner.query(`CREATE TYPE "public"."users_weight_unit_enum" AS ENUM('kg', 'lb')`);
    await queryRunner.query(`ALTER TABLE "users" ADD "weight_unit" "public"."users_weight_unit_enum"`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "gender" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "gender" DROP DEFAULT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "gender" SET DEFAULT '3'`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "gender" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "weight_unit"`);
    await queryRunner.query(`DROP TYPE "public"."users_weight_unit_enum"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "weight_kg"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "height_unit"`);
    await queryRunner.query(`DROP TYPE "public"."users_height_unit_enum"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "height_cm"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "height" double precision`);
    await queryRunner.query(`ALTER TABLE "users" ADD "weight" double precision`);
  }
}
