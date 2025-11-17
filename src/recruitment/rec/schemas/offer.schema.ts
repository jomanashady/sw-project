import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OfferDocument = Offer & Document;

@Schema({ timestamps: true })
export class Offer {

  //internal reference le Application
  @Prop({ type: Types.ObjectId, ref: 'Application', required: true })
  applicationId: Types.ObjectId;

  //internal reference le Candidate
  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true })
  candidateId: Types.ObjectId;

  //internal reference le Job
  @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
  jobId: Types.ObjectId;

  @Prop({ default: 'Draft' })
  status: string; // Draft, PendingApproval, SentToCandidate, Accepted, Rejected, Expired

  @Prop()
  offerTemplateKey?: string;

  @Prop()
  baseSalary?: number;

  @Prop()
  currency?: string;

  @Prop()
  payGradeId?: string; // from Payroll subsystem

  @Prop()
  signingBonusAmount?: number;

  @Prop()
  benefitsSummary?: string;

  @Prop()
  contractStartDate?: Date;

  @Prop()
  contractEndDate?: Date;

  @Prop()
  sentAt?: Date;

  @Prop()
  acceptedAt?: Date;

  @Prop()
  rejectedAt?: Date;

  @Prop()
  signedOfferUrl?: string;

  @Prop()
  candidateSignatureData?: string;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
