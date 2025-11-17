import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


//no reference internal 
//Employee subsystem references the Candidate

export type CandidateDocument = Candidate & Document;

@Schema({ timestamps: true })

export class Candidate {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  cvUrl?: string; // link to uploaded CV

  @Prop({ default: 'Website' })
  source: string; // Website, Referral, etc.

  @Prop({ default: false })
  referralFlag: boolean;

  @Prop()
  referralSource?: string;

  @Prop({ default: false })
  consentGiven: boolean;

  @Prop()
  consentTimestamp?: Date;

  @Prop({ default: false })
  blacklisted: boolean;

  // Link to Employee Profile subsystem when hired howa el by3mely reference msh ana
  @Prop()
  employeeProfileId?: string;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);
