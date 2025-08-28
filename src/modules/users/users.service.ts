import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { UserCredential } from 'src/modules/user-credential/entities/user-credential.entity';
import { User } from 'src/modules/users/entities/users.entity';
import { DataSource, Repository } from 'typeorm';
import { hashString } from '../../shares/helpers/cryptography';
import { feetInchToCm, generateEntityId, isNullOrUndefined, poundsToKg } from '../../shares/helpers/utils';
import { errorLog } from '../../shares/logger/Logger';
import { UserGroupNameEnum } from '../admin/user-groups/user-group.const';
import { RegisterRequestDto } from '../auth/dtos/register-request.dto';
import { UserGroupsService } from '../user-groups/user-groups.service';
import { UpdateMeRequestDto } from './dtos/update-user-info-request.dto';
import { HeightUnit, UserStatus, WeightUnit } from './users.constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectDataSource() private dataSource: DataSource,
    private readonly userGroupsService: UserGroupsService,
  ) {}

  async addUserModules(registerRequestDto: RegisterRequestDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: registerRequestDto.email,
      },
    });
    if (!isNullOrUndefined(user)) {
      throw new BadRequestException(`${registerRequestDto.email} existed`);
    }

    const userGroup = await this.userGroupsService.findByName(UserGroupNameEnum.WALLET_WARMUP);

    const createdUser = await this.dataSource.manager.transaction(async (transactionalEntityManager) => {
      const _newUser = await transactionalEntityManager.save(User, {
        ...registerRequestDto,
        id: generateEntityId(),
        user_group_id: userGroup.id,
      });

      const transactions = [];

      const credential = new UserCredential();
      credential.user = _newUser;
      credential.password = registerRequestDto.password;
      credential.email = registerRequestDto.email;
      transactions.push(transactionalEntityManager.save(credential));
      await Promise.all(transactions);
      return _newUser;
    });

    return createdUser;
  }

  async addNewUser(registerRequestDto: RegisterRequestDto): Promise<User> {
    registerRequestDto.password = await hashString(registerRequestDto.password);

    try {
      return await this.addUserModules(registerRequestDto);
    } catch (error) {
      errorLog('messss', error, this.addNewUser.name);
      throw new BadRequestException(error.response.message);
    }
  }

  async getUserByEmail(email: string, throwException = false): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });
    if (isNullOrUndefined(user) && throwException === true) {
      throw new BadRequestException(`${email} is not found`);
    }

    return user;
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if (isNullOrUndefined(user)) {
      throw new BadRequestException(`${id} is not found`);
    }

    return user;
  }

  async getUserByUsername(username: string, throwException = false): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        username,
      },
    });
    if (isNullOrUndefined(user) && throwException === true) {
      throw new BadRequestException(`${username} is not found`);
    }

    return user;
  }

  async exist(userId: number): Promise<boolean> {
    return this.userRepository.exist({
      where: {
        id: userId,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateUserStatusByEmail(email: string, status: UserStatus): Promise<void> {
    await this.userRepository.update({ email }, { status });
  }

  async updateMe(userId: number, dto: UpdateMeRequestDto) {
    const user = await this.getUserById(userId);
    if (!user) throw new BadRequestException('User not found');

    if (dto.full_name !== undefined) user.full_name = dto.full_name;
    if (dto.gender !== undefined) user.gender = dto.gender;
    if (dto.date_of_birth !== undefined) {
      user.date_of_birth = dto.date_of_birth ? new Date(dto.date_of_birth) : null;
    }

    if (dto.height_unit === HeightUnit.CM && dto.height_cm) {
      user.height_cm = dto.height_cm;
    } else if (dto.height_unit === HeightUnit.FT_IN && dto.height_ft != null && dto.height_in != null) {
      user.height_cm = feetInchToCm(dto.height_ft, dto.height_in);
    }
    user.height_unit = dto.height_unit || user.height_unit;

    if (dto.weight_unit === WeightUnit.KG && dto.weight_kg) {
      user.weight_kg = dto.weight_kg;
    } else if (dto.weight_unit === WeightUnit.LB && dto.weight_lb) {
      user.weight_kg = poundsToKg(dto.weight_lb);
    }
    user.weight_unit = dto.weight_unit || user.weight_unit;

    await this.userRepository.save(user);
    return user;
  }
}
