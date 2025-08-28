import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { UserOauthProvidersProvider } from '../types/user-oauth-provider.type';

@Entity({ name: 'user_oauth_providers' })
export class UserOAuthProvider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: UserOauthProvidersProvider,
    default: UserOauthProvidersProvider.GOOGLE,
  })
  provider: UserOauthProvidersProvider;

  @Column()
  provider_user_id: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true, type: 'text' })
  avatar: string;

  @Column({ nullable: true, type: 'text' })
  id_token: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
