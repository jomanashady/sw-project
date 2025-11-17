// recruitment-backend/src/onboarding/onboarding.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Candidate, CandidateDocument } from '../recruitment/schemas/candidate.schema';
import { OnboardingChecklist, OnboardingChecklistDocument } from './schemas/onboarding-checklist.schema';
import { OnboardingProcess, OnboardingProcessDocument } from './schemas/onboarding-process.schema';
import { OnboardingDocument, OnboardingDocumentDocument } from './schemas/onboarding-document.schema';
import { EquipmentAssignment, EquipmentAssignmentDocument } from './schemas/equipment-assignment.schema';
import { OnboardingNotification, OnboardingNotificationDocument } from './schemas/onboarding-notification.schema';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel(Candidate.name)
    private candidateModel: Model<CandidateDocument>,
    
    @InjectModel(OnboardingChecklist.name)
    private checklistModel: Model<OnboardingChecklistDocument>,
    
    @InjectModel(OnboardingProcess.name)
    private processModel: Model<OnboardingProcessDocument>,
    
    @InjectModel(OnboardingDocument.name)
    private documentModel: Model<OnboardingDocumentDocument>,
    
    @InjectModel(EquipmentAssignment.name)
    private equipmentModel: Model<EquipmentAssignmentDocument>,
    
    @InjectModel(OnboardingNotification.name)
    private notificationModel: Model<OnboardingNotificationDocument>,
  ) {}

  // Service methods will be added here
}