import { User } from 'src/modules/users/entities/users.entity';
import { generateEntityId } from 'src/shares/helpers/utils';
import { AfterLoad, BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '../../typeorm/base.entity';
import { DeviceStatus } from '../types/devices.type';
import { DeviceTypesEntity } from './devices_type.entity';
import { UserHealthMetric } from '../../user-health-metric/entities/user-health-metric.entity';

@Entity('devices')
export class DevicesEntity extends BaseEntity {
  @PrimaryColumn({ type: 'int8' })
  id: number;

  @Column()
  name: string;

  @Column({ name: 'serial_number' })
  serialNumber: string;

  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @Column({ name: 'type_id', nullable: true })
  typeId: number;

  @Column({
    unique: true,
  })
  IMEI: string;

  @Column({
    type: 'enum',
    enum: DeviceStatus,
    default: DeviceStatus.DISCONNECTED,
  })
  status: DeviceStatus;

  @Column({
    type: 'timestamp',
    name: 'last_time_sync',
    nullable: true,
  })
  lastTimeSync: Date;

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, (user) => user.devices, {
    createForeignKeyConstraints: false,
  })
  user: User;

  @JoinColumn({ name: 'type_id' })
  @ManyToOne(() => DeviceTypesEntity, (type) => type.devices, {
    createForeignKeyConstraints: false,
  })
  type: DeviceTypesEntity;

  @OneToMany(() => UserHealthMetric, (userHealthMetric) => userHealthMetric.device)
  userHealthMetrics: UserHealthMetric[];

  @BeforeInsert()
  generateSlug() {
    this.id = generateEntityId();
  }

  @AfterLoad()
  castIdToInt() {
    this.id = Number(this.id);
  }
}
