import { BaseEntity } from 'src/modules/typeorm/base.entity';
import { HeightUnit, UserGender, UserStatus, WeightUnit } from 'src/modules/users/users.constants';
import {
  AfterLoad,
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { generateEntityId } from '../../../shares/helpers/utils';
import { DevicesEntity } from 'src/modules/devices/entities/devices.entity';
import { CoinSettingEntity } from 'src/modules/admin/coin/entities/coin-setting.entity';
import { UserGroupsEntity } from 'src/modules/admin/user-groups/entities/user-groups.entity';
import { UserHealthMetric } from '../../user-health-metric/entities/user-health-metric.entity';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryColumn({ type: 'int8' })
  id: number;

  @Index({
    unique: true,
  })
  @Column()
  email: string;

  @Index({
    unique: true,
  })
  @Column({
    nullable: true,
  })
  username: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.INACTIVE,
  })
  status: UserStatus;

  @Column({
    nullable: true,
  })
  user_oauth_id: number;

  @Column({
    nullable: true,
  })
  first_name: string;

  @Column({
    nullable: true,
  })
  last_name: string;

  @Column({
    nullable: true,
  })
  phone: string;

  @Column({
    nullable: true,
  })
  full_name: string;

  @Column({
    nullable: true,
  })
  address: string;

  @Column({
    nullable: true,
  })
  identity_token_id?: string;

  @Column({
    nullable: true,
  })
  avatar: string;

  @Column({
    nullable: true,
    type: 'date',
  })
  date_of_birth: Date;

  @Column({
    type: 'enum',
    enum: UserGender,
    nullable: true,
  })
  gender: UserGender;

  @Column({
    nullable: true,
    type: 'int',
  })
  age: number;

  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  height_cm: number;

  @Column({
    type: 'enum',
    enum: HeightUnit,
    nullable: true,
  })
  height_unit: HeightUnit;

  @Column({
    type: 'numeric',
    precision: 6,
    scale: 2,
    nullable: true,
  })
  weight_kg?: number;

  @Column({
    type: 'enum',
    enum: WeightUnit,
    nullable: true,
  })
  weight_unit: WeightUnit;

  @Column({ type: 'float', default: 0 })
  coin: number;

  @Column({ type: 'int8', default: 0 })
  point: number;

  @Column({ type: 'int8', nullable: true })
  user_group_id: number;

  @OneToMany(() => DevicesEntity, (device) => device.user)
  devices: DevicesEntity[];

  @OneToMany(() => UserHealthMetric, (userHealthMetric) => userHealthMetric.user)
  userHealthMetrics: UserHealthMetric[];

  @OneToOne(() => CoinSettingEntity, (coinSetting) => coinSetting.user_id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'id' })
  coinSetting: CoinSettingEntity;

  @ManyToOne(() => UserGroupsEntity, (userGroup) => userGroup.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_group_id' })
  userGroup: UserGroupsEntity;

  @BeforeInsert()
  generateSlug() {
    this.id = generateEntityId();
  }

  @AfterLoad()
  castIdToInt() {
    this.id = Number(this.id);
  }
}
