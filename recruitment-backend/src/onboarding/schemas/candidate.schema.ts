// recruitment-backend/src/onboarding/schemas/candidate.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CandidateDocument = Candidate & Document;

@Schema({ timestamps: true })
export class Candidate {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
  jobId: Types.ObjectId;

  @Prop({ required: true })
  position: string;

  @Prop({ required: true })
  department: string;

  @Prop({ 
    type: String, 
    enum: ['pending', 'accepted', 'onboarding', 'active', 'rejected'],
    default: 'pending'
  })
  status: string;

  @Prop({ type: Date })
  offerAcceptedDate: Date;

  @Prop({ type: Date })
  expectedStartDate: Date;

  @Prop()
  signedContractUrl: string;

  @Prop({ type: Date })
  contractSignedDate: Date;

  @Prop({ type: Number, default: 0 })
  signingBonus: number;

  @Prop({ type: String, enum: ['pending', 'processed', 'paid'], default: 'pending' })
  signingBonusStatus: string;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);