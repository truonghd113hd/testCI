import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { Strategy } from 'passport-local';
import { UserResponseDto } from 'src/modules/users/dtos/user-response.dto';
import { AuthService } from '../auth.service';
import { UserStatus } from '../../users/users.constants';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'user_local') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(email: string, password: string): Promise<UserResponseDto> {
    const user = await this.authService.validateUserWithUsernameAndPassword(email, password);

    if (!user) {
      throw new BadRequestException(`Email or password are incorrect`);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException(`User is not active`);
    }

    return plainToInstance(UserResponseDto, user);
  }
}
