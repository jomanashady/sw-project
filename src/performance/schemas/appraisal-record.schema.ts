// src/performance/schemas/appraisal-record.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppraisalRecordDocument = AppraisalRecord & Document;

/**
 * Rating Structure
 * Individual criterion score with its weight
 */
class Rating {
  @Prop({ required: true })
  criteriaId: string;

  @Prop({ required: true })
  criteriaName: string;

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  weight: number;
}

/**
 * Appraisal Record Schema
 * Stores the actual performance evaluation for an employee in a specific cycle
 *
 * Business Rules:
 * - BR-PERF-12: One appraisal record per employee per cycle
 * - BR-PERF-13: Overall score = Σ(rating score × weight) / 100
 * - BR-PERF-14: Reviewer must be employee's direct manager (managerId)
 * - BR-PERF-15: Cannot edit after status = 'Finalized'
 * - BR-PERF-16: Status must be 'Submitted' before HR can publish
 * - BR-PERF-17: Attendance/punctuality scores fetched from Time Management module
 * - BR-PERF-18: Overall rating mapped from overall score based on template's rating scale
 */
@Schema({ timestamps: true })
export class AppraisalRecord {
  @Prop({ required: true, unique: true })
  appraisalId: string;

  @Prop({ type: Types.ObjectId, ref: 'AppraisalCycle', required: true })
  cycleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  reviewerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AppraisalTemplate', required: true })
  templateId: Types.ObjectId;

  @Prop({ type: [Rating], required: true })
  ratings: Rating[];

  @Prop({ required: true })
  overallScore: number;

  @Prop({ required: true })
  overallRating: string;

  @Prop()
  qualitativeComments: string;

  @Prop()
  developmentRecommendations: string;

  @Prop({ type: [String] })
  strengths: string[];

  @Prop({ type: [String] })
  areasForImprovement: string[];

  @Prop({ min: 0, max: 100 })
  attendanceScore: number;

  @Prop({ min: 0, max: 100 })
  punctualityScore: number;

  @Prop({
    required: true,
    enum: ['Draft', 'Submitted', 'Published', 'Disputed', 'Finalized'],
    default: 'Draft',
  })
  status: string;

  @Prop()
  evaluationDate: Date;

  @Prop()
  publishedDate: Date;

  @Prop()
  finalizedDate: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const AppraisalRecordSchema =
  SchemaFactory.createForClass(AppraisalRecord);

// Indexes for performance optimization

AppraisalRecordSchema.index({ employeeId: 1, cycleId: 1 });
AppraisalRecordSchema.index({ reviewerId: 1 });
AppraisalRecordSchema.index({ status: 1 });
