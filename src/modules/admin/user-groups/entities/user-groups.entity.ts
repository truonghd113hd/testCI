import { BaseEntity } from 'src/modules/typeorm/base.entity';
import { User } from 'src/modules/users/entities/users.entity';
import { generateEntityId } from 'src/shares/helpers/utils';
import { AfterLoad, BeforeInsert, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity('user_groups')
export class UserGroupsEntity extends BaseEntity {
  @PrimaryColumn({ type: 'int8' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'bigint', default: 0, nullable: true })
  require_point: number | null;

  @OneToMany(() => User, (user) => user.userGroup, {
    createForeignKeyConstraints: false,
  })
  users: User[];

  @BeforeInsert()
  generateSlug() {
    this.id = generateEntityId();
  }

  @AfterLoad()
  castIdToInt() {
    this.id = Number(this.id);
  }
}
