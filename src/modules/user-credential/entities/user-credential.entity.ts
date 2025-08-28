import { BaseEntity } from 'src/modules/typeorm/base.entity';
import { User } from 'src/modules/users/entities/users.entity';

import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class UserCredential extends BaseEntity {
  @PrimaryColumn({ type: 'int8' })
  user_id: number;

  @OneToOne(() => User)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @Column({
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  username: string;

  @Column({
    type: 'varchar',
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
  })
  password: string;
}
