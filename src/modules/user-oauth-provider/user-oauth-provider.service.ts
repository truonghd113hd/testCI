import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOAuthProvider } from './entities/user-oauth-provider.entity';
import { User } from '../users/entities/users.entity';
import { UserOauthProvidersProvider } from './types/user-oauth-provider.type';

@Injectable()
export class UserOauthProviderService {
  constructor(
    @InjectRepository(UserOAuthProvider) private readonly userOAuthProviderRepository: Repository<UserOAuthProvider>,
  ) {}

  async findByProviderUid(
    provider: UserOauthProvidersProvider,
    providerUserId: string,
  ): Promise<UserOAuthProvider | null> {
    return this.userOAuthProviderRepository.findOne({
      where: {
        provider,
        provider_user_id: providerUserId,
      },
      relations: ['user'],
    });
  }

  async findByUserId(userId: number): Promise<UserOAuthProvider[]> {
    return this.userOAuthProviderRepository.find({
      where: {
        user_id: userId,
      },
    });
  }

  async createOAuthRecord(params: {
    provider: UserOauthProvidersProvider;
    provider_user_id: string;
    email?: string;
    name?: string;
    avatar?: string;
    id_token?: string;
    user: User;
  }): Promise<UserOAuthProvider> {
    const oauth = this.userOAuthProviderRepository.create({
      provider: params.provider,
      provider_user_id: params.provider_user_id,
      email: params.email,
      name: params.name,
      avatar: params.avatar,
      id_token: params.id_token,
      user: params.user,
    });
    return this.userOAuthProviderRepository.save(oauth);
  }
}
