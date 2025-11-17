// recruitment-backend/src/onboarding/onboarding.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';

// Import schemas
//import { Candidate, CandidateSchema } from './schemas/candidate.schema';
import { Candidate, CandidateSchema } from '../recruitment/schemas/candidate.schema';
import { OnboardingChecklist, OnboardingChecklistSchema } from './schemas/onboarding-checklist.schema';
import { OnboardingProcess, OnboardingProcessSchema } from './schemas/onboarding-process.schema';
import { OnboardingDocument, OnboardingDocumentSchema } from './schemas/onboarding-document.schema';
import { EquipmentAssignment, EquipmentAssignmentSchema } from './schemas/equipment-assignment.schema';
import { OnboardingNotification, OnboardingNotificationSchema } from './schemas/onboarding-notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
      { name: OnboardingChecklist.name, schema: OnboardingChecklistSchema },
      { name: OnboardingProcess.name, schema: OnboardingProcessSchema },
      { name: OnboardingDocument.name, schema: OnboardingDocumentSchema },
      { name: EquipmentAssignment.name, schema: EquipmentAssignmentSchema },
      { name: OnboardingNotification.name, schema: OnboardingNotificationSchema },
    ]),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}