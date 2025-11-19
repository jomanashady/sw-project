// recruitment-backend/src/onboarding/schemas/onboarding-document.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Candidate } from '../../rec/schemas/candidate.schema';
//import { Employee } from '../../../employee-profile/schemas/employee.schema';

export type OnboardingDocumentDocument = OnboardingDocument & Document;

@Schema({ timestamps: true })
export class OnboardingDocument {

  //internal reference le OnboardingProcess
  @Prop({ type: Types.ObjectId, ref: 'OnboardingProcess', required: true })
  onboardingProcessId: Types.ObjectId;

  //internal reference le Candidate mn recruitment schemas folder
  @Prop({ type: Types.ObjectId, ref: Candidate.name, required: true })
  candidateId: Types.ObjectId;

  @Prop({ required: true })
  documentType: string;

  @Prop({ required: true })
  documentName: string;

  @Prop({ required: true })
  documentUrl: string;

    //external reference le Employee mn employee profile folder
    @Prop({ required: true })
  uploadedByEmployeeId: string;

  @Prop({ type: String, enum: ['pending_review', 'approved', 'rejected'], default: 'pending_review' })
  verificationStatus: string;

  //external reference le Employee mn employee profile folder
    @Prop()
  verifiedByEmployeeId?: string;

  @Prop({ type: Date })
  verifiedDate: Date;

  @Prop()
  rejectionReason: string;
}

export const OnboardingDocumentSchema = SchemaFactory.createForClass(OnboardingDocument);