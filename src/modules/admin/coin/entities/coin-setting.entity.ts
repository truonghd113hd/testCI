import { BaseEntity } from 'src/modules/typeorm/base.entity';
import { User } from 'src/modules/users/entities/users.entity';
import { generateEntityId } from 'src/shares/helpers/utils';
import { AfterLoad, BeforeInsert, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity('coin_setting')
export class CoinSettingEntity extends BaseEntity {
  @PrimaryColumn({ type: 'int8' })
  id: number;

  @Column({ type: 'int8' })
  user_id: number;

  // coin need to upgrade level
  @Column({ type: 'int8' })
  upgrade_coin: number;

  // reward bonus when complete mission
  @Column({ type: 'float' })
  reward_bonus: number;

  @OneToOne(() => User, (user) => user.id, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @BeforeInsert()
  generateSlug() {
    this.id = generateEntityId();
  }

  @AfterLoad()
  castIdToInt() {
    this.id = Number(this.id);
  }
}
