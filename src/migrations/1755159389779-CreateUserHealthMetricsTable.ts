import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserHealthMetricsTable1755159389779 implements MigrationInterface {
  name = 'CreateUserHealthMetricsTable1755159389779';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_health_metrics" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" bigint NOT NULL, "user_id" bigint NOT NULL, "device_id" bigint NOT NULL, "activeEnergy" numeric(8,2), "bodyTemperature" numeric(5,2), "cyclingDistance" numeric(8,2), "heartRate" numeric(5,2), "height" numeric(5,2), "steps" integer, "walkingDistance" numeric(8,2), "runningDistance" numeric(8,2), "weight" numeric(6,2), CONSTRAINT "PK_9dcf98151c74efdb8fbc1913d57" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_f56fee4dd145e4a7591d0b9c7d" ON "user_health_metrics" ("user_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_aed73fd7d1a22c4644277b336d" ON "user_health_metrics" ("device_id") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_aed73fd7d1a22c4644277b336d"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f56fee4dd145e4a7591d0b9c7d"`);
    await queryRunner.query(`DROP TABLE "user_health_metrics"`);
  }
}
