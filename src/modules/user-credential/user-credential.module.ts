import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCredential } from 'src/modules/user-credential/entities/user-credential.entity';
import { UserCredentialService } from 'src/modules/user-credential/user-credential.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserCredential])],
  controllers: [],
  providers: [UserCredentialService],
  exports: [UserCredentialService],
})
export class UserCredentialModule {}
