import { BaseEntity } from 'src/modules/typeorm/base.entity';
import { generateEntityId } from 'src/shares/helpers/utils';
import { AfterLoad, BeforeInsert, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { DevicesEntity } from './devices.entity';
import { DeviceType } from '../types/devices.type';

@Entity('device_types')
export class DeviceTypesEntity extends BaseEntity {
  @PrimaryColumn({ type: 'int8' })
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ name: 'bonus_percentage' })
  bonusPercentage: number;

  @Column({ name: 'steps_per_point' })
  stepsPerPoint: number;

  @Column({ name: 'device_type', type: 'varchar' })
  deviceType: DeviceType;

  @OneToMany(() => DevicesEntity, (device) => device.type, {
    createForeignKeyConstraints: false,
  })
  devices: DevicesEntity[];

  @BeforeInsert()
  generateSlug() {
    this.id = generateEntityId();
  }

  @AfterLoad()
  castIdToInt() {
    this.id = Number(this.id);
  }
}
