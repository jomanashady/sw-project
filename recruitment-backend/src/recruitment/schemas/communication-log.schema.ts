import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommunicationLogDocument = CommunicationLog & Document;

@Schema({ timestamps: true })

export class CommunicationLog {

    // Which application this communication belongs to
    //internal reference
  @Prop({ type: Types.ObjectId, ref: 'Application', required: true })
  applicationId: Types.ObjectId;

  // Which candidate this communication was sent to
  //internal reference
  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true })
  candidateId: Types.ObjectId;

  @Prop({ required: true })
  type: string; // StatusUpdate, Rejection, Offer, Reminder...

  @Prop({ required: true })
  channel: string; // Email, SMS, Portal

  @Prop()
  templateKey?: string; // which email/SMS template

  @Prop()
  subject?: string;

  @Prop()
  bodyPreview?: string;

  @Prop({ default: 'Sent' })
  status: string; // Queued, Sent, Failed

  @Prop()
  sentAt?: Date;

  @Prop()
  errorMessage?: string;

  @Prop()
  externalMessageId?: string; // id from email/SMS provider
}

export const CommunicationLogSchema =
  SchemaFactory.createForClass(CommunicationLog);
