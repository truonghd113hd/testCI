import { Global, Module } from '@nestjs/common';
import { AppDataSource } from 'src/modules/typeorm/datasource';
@Global()
@Module({
  providers: [AppDataSource],
  exports: [AppDataSource],
})
export class TypeormModule {}
