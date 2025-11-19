// recruitment-backend/src/offboarding/offboarding.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  OffboardingInstance,
  OffboardingInstanceSchema,
} from './schemas/offboarding-instance.schema';

import {
  OffboardingRequest,
  OffboardingRequestSchema,
} from './schemas/offboarding-request.schema';

import {
  OffboardingTask,
  OffboardingTaskSchema,
} from './schemas/offboarding-task.schema';

import {
  OffboardingChecklistTemplate,
  OffboardingChecklistTemplateSchema,
} from './schemas/OffboardingChecklistTemplate.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OffboardingInstance.name, schema: OffboardingInstanceSchema },
      { name: OffboardingRequest.name, schema: OffboardingRequestSchema },
      { name: OffboardingTask.name, schema: OffboardingTaskSchema },
      { name: OffboardingChecklistTemplate.name, schema: OffboardingChecklistTemplateSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class OffboardingModule {}
