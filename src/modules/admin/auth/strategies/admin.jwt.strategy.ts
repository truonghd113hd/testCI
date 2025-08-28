import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from 'src/modules/core/config.service';
import { AdminService } from '../../admin/admin.service';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin_jwt') {
  constructor(
    readonly configService: ConfigService,
    private readonly adminService: AdminService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getAuthConfiguration().jwt.secretKey,
    });
  }

  async validate(payload: any) {
    const { id } = payload;
    return this.adminService.findById(id);
  }
}
