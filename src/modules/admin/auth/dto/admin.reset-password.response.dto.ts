import { Exclude } from 'class-transformer';
import { AdminDto } from '../../admin/dto/admin.dto';

@Exclude()
export class AdminResetPasswordResponseDto extends AdminDto {}
