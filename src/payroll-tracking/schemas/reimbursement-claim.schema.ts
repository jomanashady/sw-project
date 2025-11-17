// SubSystem: Payroll Tracking, Transparency & Employee Self-Service

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

import { PayrollRunDocument } from '../../payroll-processing-and-execution/schemas/payroll-run.schema';
import { EmployeeDocument } from '../../employee-profile/schemas/employee.schema';  // Employee Profile subsystem
// import { UserDocument } from '../../auth/schemas/user.schema';             // Auth / Users subsystem

export type ReimbursementClaimDocument = ReimbursementClaim & Document;

@Schema({ timestamps: true })
export class ReimbursementClaim {
  // ------------------------------------------------------------
  // EMPLOYEE (SELF-SERVICE) – DEPENDENCIES COMMENTED
  // ------------------------------------------------------------

  
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  })
  employeeId:
    | mongoose.Types.ObjectId
    | EmployeeDocument; // Employee Profile subsystem

  @Prop({ required: true })
  employeeName: string; // snapshot from Employee Profile
  

  // ------------------------------------------------------------
  // CLAIM INFO
  // ------------------------------------------------------------

  @Prop({ required: true })
  claimType: string;
  // e.g., "travel", "training", "medical"
  // Allowed values will be defined in Payroll Configuration & Policy Setup

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: [String],
    default: [],
  })
  attachments: string[];

  // ------------------------------------------------------------
  // WORKFLOW STATUS
  // ------------------------------------------------------------

  @Prop({
    required: true,
    enum: ['submitted', 'under_review', 'approved', 'rejected'],
    default: 'submitted',
  })
  status:
    | 'submitted'
    | 'under_review'
    | 'approved'
    | 'rejected';

  /*
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  reviewedBy?:
    | mongoose.Types.ObjectId
    | UserDocument; // Payroll Specialist / Manager / Finance
  */

  @Prop()
  reviewComment?: string;

  // ------------------------------------------------------------
  // REFUND PROCESSING INFO
  // ------------------------------------------------------------

  @Prop({ default: false })
  isRefundProcessed: boolean; // becomes true when refund is included in some payroll run

  @Prop()
  refundProcessedAt?: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayrollRun',
  })
  refundPayrollRunId?:
    | mongoose.Types.ObjectId
    | PayrollRunDocument; // Payroll Processing & Execution subSystem
}

export const ReimbursementClaimSchema =
  SchemaFactory.createForClass(ReimbursementClaim);