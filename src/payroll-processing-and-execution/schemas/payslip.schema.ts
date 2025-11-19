// SubSystem: Payroll Tracking, Transparency & Employee Self-Service

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

import { PayrollRunDocument } from './payroll-run.schema';
import { PayrollRunItemDocument } from './payroll-run-item.schema';
import { EmployeeDocument } from '../../employee-profile/schemas/employee.schema';

export type PayslipDocument = Payslip & Document;

@Schema({ timestamps: true })
export class Payslip {
  // ------------------------------------------------------------
  // CROSS-SUBSYSTEM DEPENDENCIES (COMMENTED FOR NOW)
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
  // LINKS INSIDE PAYROLL SUBSYSTEMS
  // ------------------------------------------------------------

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayrollRun',
    required: true,
  })
  payrollRunId:
    | mongoose.Types.ObjectId
    | PayrollRunDocument; // Payroll Processing & Execution subSystem

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayrollRunItem',
    required: true,
  })
  payrollRunItemId:
    | mongoose.Types.ObjectId
    | PayrollRunItemDocument; // Payroll Processing & Execution subSystem

  // ------------------------------------------------------------
  // SNAPSHOT FIELDS (Stored permanently for history)
  // ------------------------------------------------------------

  @Prop({ required: true })
  periodCode: string; // e.g. "2025-10"

  @Prop({ required: true })
  baseSalary: number;
  // from PayGrade (Payroll Configuration & Policy Setup subSystem)

  @Prop({ required: true })
  grossSalary: number; // after allowances, before deductions

  @Prop({ required: true })
  totalAllowances: number; // total of all positive components

  @Prop({ required: true })
  totalDeductions: number; // total of all negative components (tax, insurance, penalties, etc.)

  @Prop({ required: true })
  finalNetSalary: number; // what the employee actually gets paid

  // Optional helper snapshots for transparency (still within Payroll responsibility):

  @Prop()
  taxAmount?: number; 
  // derived from tax components (uses tax rules from Payroll Configuration)

  @Prop()
  insuranceAmount?: number; 
  // derived from insurance components (uses insurance rules from Payroll Configuration)

  @Prop()
  leaveEncashmentAmount?: number; 
  // derived from components originating from Leaves subsystem

  @Prop()
  unpaidLeaveDeductionAmount?: number; 
  // derived from components originating from Leaves subsystem

  @Prop()
  misconductDeductionAmount?: number; 
  // derived from components originating from Time Management subsystem

  // ------------------------------------------------------------
  // ITEMIZED BREAKDOWN
  // ------------------------------------------------------------

  @Prop({
    type: [
      {
        code: String,
        name: String,
        type: String,
        amount: Number,
      },
    ],
    default: [],
  })
  itemizedComponents: {
    code: string;
    name: string;
    /**
     * e.g. "allowance", "deduction", "earning", "bonus", "benefit",
     * "leave_encashment", "unpaid_leave", "tax", "insurance", "penalty", etc.
     * Sources may be:
     * - Payroll Configuration & Policy Setup subSystem
     * - Leaves subSystem
     * - Time Management subSystem
     * - Payroll Processing & Execution subSystem
     */
    type: string;
    amount: number;
  }[];

  // ------------------------------------------------------------
  // VISIBILITY / STATUS
  // ------------------------------------------------------------

  @Prop({
    required: true,
    enum: ['generated', 'visible_to_employee', 'locked'],
  })
  visibilityStatus: string
    
}

export const PayslipSchema = SchemaFactory.createForClass(Payslip);