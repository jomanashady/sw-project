// src/performance/schemas/-cycle.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppraisalCycleDocument = AppraisalCycle & Document;

/**
 *  Cycle Schema
 * Represents a performance review period with defined timeline and participants
 *
 * Business Rules:
 * - BR-PERF-06: End date must be after start date
 * - BR-PERF-07: Evaluation deadline must be between start and end date
 * - BR-PERF-08: Cannot have overlapping cycles for same department
 * - BR-PERF-09: Status transitions: Planning → Active → Evaluation → Published → Closed → Archived
 * - BR-PERF-10: Cannot modify assigned template after cycle becomes Active
 * - BR-PERF-11: Dispute window starts from publishedAt date
 */
@Schema({ timestamps: true })
export class AppraisalCycle {
  @Prop({ required: true, unique: true })
  cycleId: string;

  @Prop({ required: true })
  cycleName: string;

  @Prop({ required: true })
  fiscalYear: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  evaluationDeadline: Date;

  @Prop({
    required: true,
    enum: [
      'Planning',
      'Active',
      'Evaluation',
      'Published',
      'Closed',
      'Archived',
    ],
    default: 'Planning',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'AppraisalTemplate', required: true })
  templateId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Employee' }] })
  assignedManagers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Department' }] })
  assignedDepartments: Types.ObjectId[];

  @Prop({ required: true, default: 14 })
  disputeWindowDays: number;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  createdBy: Types.ObjectId;

  @Prop()
  publishedAt: Date;

  @Prop()
  closedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const AppraisalCycleSchema =
  SchemaFactory.createForClass(AppraisalCycle);

// Indexes for performance optimization
AppraisalCycleSchema.index({ status: 1 });
AppraisalCycleSchema.index({ fiscalYear: 1 });
AppraisalCycleSchema.index({ startDate: 1, endDate: 1 });
AppraisalCycleSchema.index({ templateId: 1 });
AppraisalCycleSchema.index({ assignedDepartments: 1 });
