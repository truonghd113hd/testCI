import { Module } from '@nestjs/common';
import { CoreModule } from './modules/core/core.module';
import { QueuesModule } from './modules/queue/queue.module';
import { modules } from './app.module';
import { TypeormModule } from './modules/typeorm/typeorm.module';
@Module({
  imports: [CoreModule.register(), TypeormModule, QueuesModule, ...modules],
})
export class WorkerModule {}
