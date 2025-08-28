import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEnumUserEntity1754903538544 implements MigrationInterface {
  name = 'UpdateEnumUserEntity1754903538544';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."users_status_enum" RENAME TO "users_status_enum_old"`);
    await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('inactive', 'active')`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "status" TYPE "public"."users_status_enum" USING "status"::"text"::"public"."users_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'inactive'`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum_old"`);
    await queryRunner.query(`ALTER TYPE "public"."users_gender_enum" RENAME TO "users_gender_enum_old"`);
    await queryRunner.query(`CREATE TYPE "public"."users_gender_enum" AS ENUM('male', 'female', 'other')`);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "gender" TYPE "public"."users_gender_enum" USING "gender"::"text"::"public"."users_gender_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_gender_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."users_gender_enum_old" AS ENUM('1', '2', '3')`);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "gender" TYPE "public"."users_gender_enum_old" USING "gender"::"text"::"public"."users_gender_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."users_gender_enum_old" RENAME TO "users_gender_enum"`);
    await queryRunner.query(`CREATE TYPE "public"."users_status_enum_old" AS ENUM('0', '1')`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "status" TYPE "public"."users_status_enum_old" USING "status"::"text"::"public"."users_status_enum_old"`,
    );
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT '0'`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."users_status_enum_old" RENAME TO "users_status_enum"`);
  }
}
