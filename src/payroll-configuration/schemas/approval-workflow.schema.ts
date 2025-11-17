// src/modules/approval-workflow/schemas/approval-workflow.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type ApprovalWorkflowDocument = ApprovalWorkflow & Document;

@Schema({ timestamps: true })
export class ApprovalWorkflow {
  @Prop({ required: true })
  entityType: string; // 'PayGrade', 'TaxRule', 'Insurance', etc.

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  entityId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  currentApprover: string; // Role: Payroll Manager, HR Manager, etc.

  @Prop({ required: true, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  status: string;

  @Prop()
  comments: string;

  @Prop()
  approvedBy: string;

  @Prop()
  approvedAt: Date;

  @Prop()
  createdBy: string;
}

export const ApprovalWorkflowSchema = SchemaFactory.createForClass(ApprovalWorkflow);