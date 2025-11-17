// SubSystem: Payroll Tracking, Transparency & Employee Self-Service

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

import { PayslipDocument } from '../../payroll-processing-and-execution/schemas/payslip.schema';
import { PayrollRunDocument } from '../../payroll-processing-and-execution/schemas/payroll-run.schema';
// import { UserDocument } from '../../auth/schemas/user.schema';              // Auth / Users subsystem
import { EmployeeDocument } from '../../employee-profile/schemas/employee.schema';  // Employee Profile subsystem

export type PayrollDisputeDocument = PayrollDispute & Document;

@Schema({ timestamps: true })
export class PayrollDispute {
  // ------------------------------------------------------------
  // CROSS-SUBSYSTEM FIELDS (COMMENTED FOR NOW)
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
  // REQUIRED REFERENCES
  // ------------------------------------------------------------

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payslip',
    required: true,
  })
  payslipId:
    | mongoose.Types.ObjectId
    | PayslipDocument; // from Payroll Tracking (Payslip)

  // ------------------------------------------------------------
  // SNAPSHOT DATA
  // ------------------------------------------------------------

  @Prop({ required: true })
  payrollPeriodCode: string; // e.g. "2025-10"

  // ------------------------------------------------------------
  // DISPUTE DETAILS
  // ------------------------------------------------------------

  @Prop({
    required: true,
    enum: [
      'salary_calculation',
      'deduction_error',
      'missing_allowance',
      'bonus_issue',
      'tax_insurance_issue',
      'other',
    ],
  })
  disputeType:
    | 'salary_calculation'
    | 'deduction_error'
    | 'missing_allowance'
    | 'bonus_issue'
    | 'tax_insurance_issue'
    | 'other';

  @Prop({ required: true })
  description: string;

  @Prop()
  expectedAmount?: number;

  @Prop()
  actualAmount?: number;

  @Prop()
  differenceAmount?: number;

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
    | UserDocument; // Payroll Specialist / Payroll Manager / Finance
  */

  @Prop()
  reviewComment?: string;

  // ------------------------------------------------------------
  // REFUND PROCESSING
  // ------------------------------------------------------------

  @Prop({ default: false })
  isRefundRequired: boolean; // if approved and needs correction in next run

  @Prop({ default: false })
  isRefundProcessed: boolean; // becomes true when included in some PayrollRun

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

export const PayrollDisputeSchema =
  SchemaFactory.createForClass(PayrollDispute);