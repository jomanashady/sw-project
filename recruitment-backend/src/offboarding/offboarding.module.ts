// recruitment-backend/src/offboarding/offboarding.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OffboardingController } from './offboarding.controller';
import { OffboardingService } from './offboarding.service';

import {
  OffboardingRequest,
  OffboardingRequestSchema,
} from './schemas/offboarding-request.schema';

import {
  OffboardingInstance,
  OffboardingInstanceSchema,
} from './schemas/offboarding-instance.schema';

import {
  OffboardingTask,
  OffboardingTaskSchema,
} from './schemas/offboarding-task.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OffboardingRequest.name, schema: OffboardingRequestSchema },
      { name: OffboardingInstance.name, schema: OffboardingInstanceSchema },
      { name: OffboardingTask.name, schema: OffboardingTaskSchema },
    ]),
  ],
  controllers: [OffboardingController],
  providers: [OffboardingService],
  exports: [OffboardingService],
})
export class OffboardingModule {}
