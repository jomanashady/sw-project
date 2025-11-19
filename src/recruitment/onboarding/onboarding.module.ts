// recruitment-backend/src/onboarding/onboarding.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  OnboardingProcess,
  OnboardingProcessSchema,
} from './schemas/onboarding-process.schema';

import {
  OnboardingChecklist,
  OnboardingChecklistSchema,
} from './schemas/onboarding-checklist.schema';

import {
  OnboardingDocument,
  OnboardingDocumentSchema,
} from './schemas/onboarding-document.schema';

import {
  OnboardingNotification,
  OnboardingNotificationSchema,
} from './schemas/onboarding-notification.schema';

import {
  EquipmentAssignment,
  EquipmentAssignmentSchema,
} from './schemas/equipment-assignment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OnboardingProcess.name, schema: OnboardingProcessSchema },
      { name: OnboardingChecklist.name, schema: OnboardingChecklistSchema },
      { name: OnboardingDocument.name, schema: OnboardingDocumentSchema },
      { name: OnboardingNotification.name, schema: OnboardingNotificationSchema },
      { name: EquipmentAssignment.name, schema: EquipmentAssignmentSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class OnboardingModule {}
