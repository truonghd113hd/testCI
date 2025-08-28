import { Injectable } from '@nestjs/common';

import { AdminEntity } from './entities/admin.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
  ) {}

  async findByEmail(email: string): Promise<AdminEntity> {
    return this.adminRepository.findOne({
      where: { email },
    });
  }

  async findById(id: number): Promise<AdminEntity> {
    return this.adminRepository.findOne({
      where: { id },
    });
  }

  async updatePassword(admin: AdminEntity, newPassword: string) {
    return this.adminRepository.save({ ...admin, password: newPassword });
  }
}
