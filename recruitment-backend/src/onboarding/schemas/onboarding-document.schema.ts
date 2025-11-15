// recruitment-backend/src/onboarding/schemas/onboarding-document.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OnboardingDocumentDocument = OnboardingDocument & Document;

@Schema({ timestamps: true })
export class OnboardingDocument {
  @Prop({ type: Types.ObjectId, ref: 'OnboardingProcess', required: true })
  onboardingProcessId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true })
  candidateId: Types.ObjectId;

  @Prop({ required: true })
  documentType: string;

  @Prop({ required: true })
  documentName: string;

  @Prop({ required: true })
  documentUrl: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: Types.ObjectId;

  @Prop({ type: String, enum: ['pending_review', 'approved', 'rejected'], default: 'pending_review' })
  verificationStatus: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  verifiedBy: Types.ObjectId;

  @Prop({ type: Date })
  verifiedDate: Date;

  @Prop()
  rejectionReason: string;
}

export const OnboardingDocumentSchema = SchemaFactory.createForClass(OnboardingDocument);