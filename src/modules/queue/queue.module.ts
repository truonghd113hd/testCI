import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { QueueName } from './queue.constant';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueName.Email,
      defaultJobOptions: {
        backoff: 1,
        attempts: 1,
      },
    }),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
