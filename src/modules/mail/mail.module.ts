import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { join } from 'path';
import { MailService } from 'src/modules/mail/mail.service';
import { ConfigService } from '../core/config.service';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const smtpConfig = configService.getSMTPConfiguration();
        return {
          transport: {
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: false,
            auth: {
              user: smtpConfig.username,
              pass: smtpConfig.password,
            },
          },
          defaults: {
            from: smtpConfig.from,
          },
          template: {
            dir: join(__dirname, '/templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
