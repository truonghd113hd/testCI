import { BaseSeeder } from './base.seeder';
import { UserGroupsEntity } from '../modules/admin/user-groups/entities/user-groups.entity';
import { UserGroupNameEnum } from 'src/modules/admin/user-groups/user-group.const';

export class UserGroupSeeder extends BaseSeeder {
  protected async seed() {
    this.logger.debug('UserGroupSeeder seed [START]');

    const userGroupData = [
      {
        name: UserGroupNameEnum.WALLET_WARMUP,
        require_point: 0,
      },
      {
        name: UserGroupNameEnum.TOKEN_TREKK,
        require_point: 700,
      },
      {
        name: UserGroupNameEnum.STAKE_STROLL,
        require_point: 3000,
      },
      {
        name: UserGroupNameEnum.WINNING_WALK,
        require_point: 6000,
      },
      {
        name: UserGroupNameEnum.REWARDING_RUN,
        require_point: 12000,
      },
      {
        name: UserGroupNameEnum.DIAMOND_DASH,
        require_point: 24000,
      },
      {
        name: UserGroupNameEnum.VIP,
        require_point: null,
      },
    ];

    for (const data of userGroupData) {
      const existingUserGroup = await this.queryRunner.manager.findOne(UserGroupsEntity, {
        where: { name: data.name },
      });

      if (!existingUserGroup) {
        const userGroup = this.queryRunner.manager.create(UserGroupsEntity, data);
        await this.queryRunner.manager.save(userGroup);
        this.logger.debug(`Created user group: ${data.name}`);
      } else {
        this.logger.debug(`User group already exists: ${data.name}`);
      }
    }

    this.logger.debug('UserGroupSeeder seed [DONE]');
  }

  protected async clear() {
    this.logger.debug('UserGroupSeeder clear [START]');

    // Xóa tất cả user groups
    await this.queryRunner.manager.delete(UserGroupsEntity, {});

    this.logger.debug('UserGroupSeeder clear [DONE]');
  }
}

export const seeder = new UserGroupSeeder();
