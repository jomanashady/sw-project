import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ApplicationDocument = Application & Document;

@Schema({ timestamps: true })

export class Application {

//reference (internal)
  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true })
  candidateId: Types.ObjectId;

  //reference (internal)
  @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
  jobId: Types.ObjectId;

  @Prop({ default: 'Screening' })
  currentStage: string; // Screening, Interview, Offer, etc.

  @Prop({ default: 'InProgress' })
  status: string; // InProgress, Rejected, OfferSent, Hired, Withdrawn

  @Prop({ default: false })
  referralFlag: boolean;

  @Prop()
  referralSource?: string;

  @Prop()
  rejectionReason?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  appliedAt?: Date;

  @Prop()
  hiredAt?: Date;

  @Prop()
  rejectedAt?: Date;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
