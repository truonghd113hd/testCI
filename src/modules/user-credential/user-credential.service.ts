import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCredential } from 'src/modules/user-credential/entities/user-credential.entity';
import { UserUnauthenticatedException } from 'src/shares/exceptions/auth.exception';
import { hashString, isHashEqual } from 'src/shares/helpers/cryptography';
import { isNullOrUndefined } from 'src/shares/helpers/utils';
import { Repository } from 'typeorm';

@Injectable()
export class UserCredentialService {
  constructor(
    @InjectRepository(UserCredential) private readonly userCredentialRepository: Repository<UserCredential>,
  ) {}

  async getUserWithUsernameAndPassword(email: string, password: string, throwException = false) {
    const credential = await this.userCredentialRepository.findOne({
      where: [
        {
          email,
        },
      ],
      relations: ['user'],
    });

    if (isNullOrUndefined(credential)) {
      if (throwException) {
        throw new BadRequestException(`${email} is not found`);
      }
      return null;
    }

    const isPasswordMatched = await isHashEqual(password, credential.password);
    if (!isPasswordMatched) {
      if (throwException) {
        throw new UserUnauthenticatedException(`Email and password don't match`);
      }
      return null;
    }

    return credential.user;
  }

  async resetPassword(email: string, password: string): Promise<UserCredential> {
    const credential = await this.userCredentialRepository.findOne({
      where: [
        {
          email,
        },
      ],
      relations: ['user'],
    });

    if (isNullOrUndefined(credential)) {
      throw new BadRequestException(`${email} is not found`);
    }

    credential.password = await hashString(password);
    await this.userCredentialRepository.update({ user_id: credential.user_id }, { password: credential.password });
    return this.userCredentialRepository.findOne({ where: { user_id: credential.user_id }, relations: ['user'] });
  }
}
