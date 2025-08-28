import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { IRegisterOtpEmail } from './mail.constants';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendRegisterOtpEmail(params: IRegisterOtpEmail) {
    await this.mailerService.sendMail({
      to: params.email,
      subject: `Metta-Verification Code Has Been Sent`,
      template: './register-otp-code',
      context: {
        code: params.code,
        expiryTime: params.expiryTime,
      },
    });
  }
}
