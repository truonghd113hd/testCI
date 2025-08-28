import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserGroupEntit1755100859276 implements MigrationInterface {
  name = 'UpdateUserGroupEntit1755100859276';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_groups" RENAME COLUMN "description" TO "require_point"`);
    await queryRunner.query(`ALTER TABLE "user_groups" DROP COLUMN "require_point"`);
    await queryRunner.query(`ALTER TABLE "user_groups" ADD "require_point" bigint DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_groups" DROP COLUMN "require_point"`);
    await queryRunner.query(`ALTER TABLE "user_groups" ADD "require_point" character varying(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_groups" RENAME COLUMN "require_point" TO "description"`);
  }
}
