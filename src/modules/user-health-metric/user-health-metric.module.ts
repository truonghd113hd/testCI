import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserHealthMetric } from './entities/user-health-metric.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserHealthMetric])],
  providers: [],
  exports: [],
})
export class UserHealthMetricModule {}
