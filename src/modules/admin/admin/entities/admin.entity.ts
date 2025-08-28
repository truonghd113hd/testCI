import { BaseEntity } from 'src/modules/typeorm/base.entity';
import { generateEntityId } from 'src/shares/helpers/utils';
import { AfterLoad, BeforeInsert, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin')
export class AdminEntity extends BaseEntity {
  @PrimaryColumn({ type: 'int8' })
  id: number;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    nullable: true,
  })
  avatar?: string;

  @BeforeInsert()
  generateSlug() {
    this.id = generateEntityId();
  }

  @AfterLoad()
  castIdToInt() {
    this.id = Number(this.id);
  }
}
