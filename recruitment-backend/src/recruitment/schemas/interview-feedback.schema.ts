import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InterviewFeedbackDocument = InterviewFeedback & Document;

@Schema({ timestamps: true })
export class InterviewFeedback {

  //internal reference le Interview
  @Prop({ type: Types.ObjectId, ref: 'Interview', required: true })
  interviewId: Types.ObjectId;

  //internal reference le Application
  @Prop({ type: Types.ObjectId, ref: 'Application', required: true })
  applicationId: Types.ObjectId;

  // Interviewer = employee ID from Employee subsystem
  @Prop({ required: true })
  interviewerId: string;

  // Overall score
  @Prop()
  overallScore?: number;

  // Recommendation: StrongHire, Hire, NoHire...
  @Prop()
  recommendation?: string;

  // Free-text feedback
  @Prop()
  comments?: string;

  // Optional structured criteria
  @Prop({ type: Array, default: [] })
  criteriaScores: {
    criteriaKey: string;
    score: number;
    comment?: string;
  }[];
}

export const InterviewFeedbackSchema =
  SchemaFactory.createForClass(InterviewFeedback);
