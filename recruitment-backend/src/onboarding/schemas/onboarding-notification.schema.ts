// recruitment-backend/src/onboarding/schemas/onboarding-notification.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Candidate } from '../../recruitment/schemas/candidate.schema';

export type OnboardingNotificationDocument = OnboardingNotification & Document;

@Schema({ timestamps: true })
export class OnboardingNotification {
  //internal reference le OnboardingProcess
  @Prop({ type: Types.ObjectId, ref: 'OnboardingProcess', required: true })
  onboardingProcessId: Types.ObjectId;

  //internal reference le Candidate mn recruitment schemas folder
  @Prop({ type: Types.ObjectId, ref: Candidate.name, required: true })
  candidateId: Types.ObjectId;

  @Prop({ required: true })
  notificationType: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: String, enum: ['email', 'sms', 'in_app'], required: true })
  channel: string;

  @Prop({ type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' })
  status: string;

  @Prop({ type: Date })
  scheduledFor: Date;

  @Prop({ type: Date })
  sentAt: Date;

  @Prop()
  errorMessage: string;
}

export const OnboardingNotificationSchema = SchemaFactory.createForClass(OnboardingNotification);