// src/performance/schemas/dispute.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DisputeDocument = Dispute & Document;

/**
 * Adjusted Rating Structure
 * Modified criterion scores after dispute resolution
 */
class AdjustedRating {
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
 * Dispute Schema
 * Handles employee objections or appeals to their performance evaluation
 *
 * Business Rules:
 * - BR-PERF-19: Dispute must be submitted within dispute window (cycle.disputeWindowDays)
 * - BR-PERF-20: Can only dispute appraisals with status = 'Published'
 * - BR-PERF-21: One dispute per appraisal record
 * - BR-PERF-22: Dispute reason must be at least 50 characters
 * - BR-PERF-23: Only HR Managers can review and resolve disputes
 * - BR-PERF-24: If finalDecision = 'Adjusted', adjustedScore and adjustedRating are required
 * - BR-PERF-25: When resolved, original AppraisalRecord status changes to 'Finalized'
 * - BR-PERF-26: If adjusted, updated scores sync back to AppraisalRecord
 */
@Schema({ timestamps: true })
export class Dispute {
  @Prop({ required: true, unique: true })
  disputeId: string;

  @Prop({ type: Types.ObjectId, ref: 'AppraisalRecord', required: true })
  appraisalId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true, minlength: 50 })
  disputeReason: string;

  @Prop({ type: [String] })
  supportingDocuments: string[];

  @Prop({ required: true, default: Date.now })
  submissionDate: Date;

  @Prop({
    required: true,
    enum: ['Pending', 'UnderReview', 'Resolved'],
    default: 'Pending',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  reviewedBy: Types.ObjectId;

  @Prop()
  reviewNotes: string;

  @Prop()
  resolutionDate: Date;

  @Prop({ enum: ['Upheld', 'Adjusted'] })
  finalDecision: string;

  @Prop()
  adjustedScore: number;

  @Prop()
  adjustedRating: string;

  @Prop({ type: [AdjustedRating] })
  adjustedRatings: AdjustedRating[];

  createdAt: Date;
  updatedAt: Date;
}

export const DisputeSchema = SchemaFactory.createForClass(Dispute);

// Indexes for performance optimization
DisputeSchema.index({ appraisalId: 1 }, { unique: true });
DisputeSchema.index({ employeeId: 1 });
DisputeSchema.index({ status: 1 });
DisputeSchema.index({ submissionDate: 1 });
