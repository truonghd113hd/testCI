import { BaseSeeder } from './base.seeder';
import { AdminEntity } from '../modules/admin/admin/entities/admin.entity';
import * as bcrypt from 'bcrypt';

export class AdminSeeder extends BaseSeeder {
  protected async seed() {
    this.logger.debug('AdminSeeder seed [START]');

    // Tạo admin mẫu
    const adminData = [
      {
        name: 'Super Admin',
        email: 'admin@vita-ring.com',
        password: await bcrypt.hash('admin123', 10),
        avatar: 'https://via.placeholder.com/150',
      },
      {
        name: 'Manager Admin',
        email: 'manager@vita-ring.com',
        password: await bcrypt.hash('manager123', 10),
        avatar: 'https://via.placeholder.com/150',
      },
      {
        name: 'Support Admin',
        email: 'support@vita-ring.com',
        password: await bcrypt.hash('support123', 10),
        avatar: 'https://via.placeholder.com/150',
      },
    ];

    for (const data of adminData) {
      const existingAdmin = await this.queryRunner.manager.findOne(AdminEntity, {
        where: { email: data.email },
      });

      if (!existingAdmin) {
        const admin = this.queryRunner.manager.create(AdminEntity, data);
        await this.queryRunner.manager.save(admin);
        this.logger.debug(`Created admin: ${data.email}`);
      } else {
        this.logger.debug(`Admin already exists: ${data.email}`);
      }
    }

    this.logger.debug('AdminSeeder seed [DONE]');
  }

  protected async clear() {
    this.logger.debug('AdminSeeder clear [START]');

    // Xóa tất cả admin
    await this.queryRunner.manager.delete(AdminEntity, {});

    this.logger.debug('AdminSeeder clear [DONE]');
  }
}

export const seeder = new AdminSeeder();
