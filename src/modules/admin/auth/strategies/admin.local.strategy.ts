import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { Strategy } from 'passport-local';
import { UserResponseDto } from 'src/modules/users/dtos/user-response.dto';
import { AuthAdminService } from '../auth.admin.service';

@Injectable()
export class AdminLocalStrategy extends PassportStrategy(Strategy, 'admin_local') {
  constructor(private readonly authAdminService: AuthAdminService) {
    super();
  }

  async validate(email: string, password: string): Promise<UserResponseDto> {
    const user = await this.authAdminService.validateUserWithUsernameAndPassword(email, password);

    if (!user) {
      throw new BadRequestException(`Email or password are incorrect`);
    }

    return plainToInstance(UserResponseDto, user);
  }
}
