// src/performance/schemas/appraisal-assignment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppraisalAssignmentDocument = AppraisalAssignment & Document;

/**
 * Appraisal Assignment Schema
 * Tracks which managers are assigned to evaluate which employees in a cycle
 *
 * Business Rules:
 * - BR-PERF-27: One assignment per employee per cycle
 * - BR-PERF-28: Manager must be employee's direct supervisor
 * - BR-PERF-29: Assignment must be created before manager can start evaluation
 * - BR-PERF-30: Assignments can be bulk-created by HR
 */
@Schema({ timestamps: true })
export class AppraisalAssignment {
  @Prop({ required: true, unique: true })
  assignmentId: string;

  @Prop({ type: Types.ObjectId, ref: 'AppraisalCycle', required: true })
  cycleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  managerId: Types.ObjectId; // Line Manager/Head of Department

  @Prop({ type: Types.ObjectId, ref: 'AppraisalTemplate', required: true })
  templateId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['Pending', 'InProgress', 'Completed'],
    default: 'Pending',
  })
  status: string;

  @Prop()
  assignedDate: Date;

  @Prop()
  dueDate: Date;

  @Prop()
  completedDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  assignedBy: Types.ObjectId; // HR Employee who made the assignment

  createdAt: Date;
  updatedAt: Date;
}

export const AppraisalAssignmentSchema =
  SchemaFactory.createForClass(AppraisalAssignment);

// Indexes
AppraisalAssignmentSchema.index(
  { employeeId: 1, cycleId: 1 },
  { unique: true },
);
AppraisalAssignmentSchema.index({ managerId: 1 });
AppraisalAssignmentSchema.index({ cycleId: 1 });
AppraisalAssignmentSchema.index({ status: 1 });
