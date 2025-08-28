import { Entity, Column, ManyToOne, JoinColumn, Index, PrimaryColumn, BeforeInsert, AfterLoad } from 'typeorm';
import { User } from 'src/modules/users/entities/users.entity';
import { DevicesEntity } from 'src/modules/devices/entities/devices.entity';
import { BaseEntity } from '../../typeorm/base.entity';
import { generateEntityId } from '../../../shares/helpers/utils';

@Entity({ name: 'user_health_metrics' })
export class UserHealthMetric extends BaseEntity {
  @PrimaryColumn({ type: 'int8' })
  id: number;

  @Index()
  @Column({ name: 'user_id' })
  userId: number;

  @Index()
  @Column({ name: 'device_id' })
  deviceId: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  activeEnergy: number; // kcal

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  bodyTemperature: number; // °C

  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  cyclingDistance: number; // km

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  heartRate: number; // bpm

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  height: number; // cm

  @Column({ type: 'int', nullable: true })
  steps: number; // steps

  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  walkingDistance: number; // km

  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  runningDistance: number; // km

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  weight: number; // kg

  @ManyToOne(() => User, (user) => user.userHealthMetrics, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => DevicesEntity, (device) => device.userHealthMetrics, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'device_id' })
  device: DevicesEntity;

  @BeforeInsert()
  generateSlug() {
    this.id = generateEntityId();
  }

  @AfterLoad()
  castIdToInt() {
    this.id = Number(this.id);
  }
}
