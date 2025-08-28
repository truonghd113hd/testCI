import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitEntities1754672499968 implements MigrationInterface {
  name = 'InitEntities1754672499968';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "device_types" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" bigint NOT NULL, "name" character varying NOT NULL, "bonus_percentage" integer NOT NULL, "steps_per_point" integer NOT NULL, CONSTRAINT "UQ_755591f9e972996061e1e90eb38" UNIQUE ("name"), CONSTRAINT "PK_c22e8985afe8ffe3ee485e41af8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."devices_status_enum" AS ENUM('connected', 'disconnected')`);
    await queryRunner.query(`CREATE TYPE "public"."devices_device_os_enum" AS ENUM('android', 'ios')`);
    await queryRunner.query(
      `CREATE TABLE "devices" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" bigint NOT NULL, "name" character varying NOT NULL, "serial_number" character varying NOT NULL, "user_id" bigint, "type_id" bigint, "IMEI" character varying NOT NULL, "status" "public"."devices_status_enum" NOT NULL DEFAULT 'disconnected', "device_os" "public"."devices_device_os_enum" NOT NULL DEFAULT 'android', "config" jsonb, "last_time_sync" TIMESTAMP, CONSTRAINT "UQ_b99cbe1786e714fc0f19a40fcb1" UNIQUE ("IMEI"), CONSTRAINT "PK_b1514758245c12daf43486dd1f0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "coin_setting" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" bigint NOT NULL, "user_id" bigint NOT NULL, "upgrade_coin" bigint NOT NULL, "reward_bonus" double precision NOT NULL, CONSTRAINT "PK_dc210b1340ebc3f9542c441e582" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_groups" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" bigint NOT NULL, "name" character varying(255) NOT NULL, "description" character varying(255) NOT NULL, CONSTRAINT "PK_ea7760dc75ee1bf0b09ab9b3289" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('0', '1')`);
    await queryRunner.query(`CREATE TYPE "public"."users_gender_enum" AS ENUM('1', '2', '3')`);
    await queryRunner.query(
      `CREATE TABLE "users" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" bigint NOT NULL, "email" character varying NOT NULL, "username" character varying, "status" "public"."users_status_enum" NOT NULL DEFAULT '0', "user_oauth_id" integer, "first_name" character varying, "last_name" character varying, "phone" character varying, "full_name" character varying, "address" character varying, "identity_token_id" character varying, "avatar" character varying, "date_of_birth" TIMESTAMP, "gender" "public"."users_gender_enum" NOT NULL DEFAULT '3', "age" integer, "weight" double precision, "height" double precision, "coin" double precision NOT NULL DEFAULT '0', "point" bigint NOT NULL DEFAULT '0', "user_group_id" bigint, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users" ("username") `);
    await queryRunner.query(
      `CREATE TYPE "public"."user_oauth_providers_provider_enum" AS ENUM('google', 'apple', 'facebook')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_oauth_providers" ("id" SERIAL NOT NULL, "provider" "public"."user_oauth_providers_provider_enum" NOT NULL DEFAULT 'google', "provider_user_id" character varying NOT NULL, "email" character varying, "name" character varying, "avatar" text, "id_token" text, "user_id" bigint NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_737b8e721a2847c80c36e757006" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_credential" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" bigint NOT NULL, "username" character varying, "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_2f755083f60abe808c609bcfd08" UNIQUE ("username"), CONSTRAINT "UQ_d2b2a0dd7463a0fa2a203e55f90" UNIQUE ("email"), CONSTRAINT "PK_e3ed75d626fd1dc6847bfae267e" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "admin" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" bigint NOT NULL, "name" character varying NOT NULL, "password" character varying NOT NULL, "email" character varying NOT NULL, "avatar" character varying, CONSTRAINT "UQ_de87485f6489f5d0995f5841952" UNIQUE ("email"), CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_oauth_providers" ADD CONSTRAINT "FK_8654b29b5b8234a8fe1297d1c72" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_credential" ADD CONSTRAINT "FK_e3ed75d626fd1dc6847bfae267e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_credential" DROP CONSTRAINT "FK_e3ed75d626fd1dc6847bfae267e"`);
    await queryRunner.query(`ALTER TABLE "user_oauth_providers" DROP CONSTRAINT "FK_8654b29b5b8234a8fe1297d1c72"`);
    await queryRunner.query(`DROP TABLE "admin"`);
    await queryRunner.query(`DROP TABLE "user_credential"`);
    await queryRunner.query(`DROP TABLE "user_oauth_providers"`);
    await queryRunner.query(`DROP TYPE "public"."user_oauth_providers_provider_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_fe0bb3f6520ee0469504521e71"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`DROP TABLE "user_groups"`);
    await queryRunner.query(`DROP TABLE "coin_setting"`);
    await queryRunner.query(`DROP TABLE "devices"`);
    await queryRunner.query(`DROP TYPE "public"."devices_device_os_enum"`);
    await queryRunner.query(`DROP TYPE "public"."devices_status_enum"`);
    await queryRunner.query(`DROP TABLE "device_types"`);
  }
}
