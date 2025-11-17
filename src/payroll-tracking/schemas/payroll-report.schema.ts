// SubSystem: Payroll Tracking, Transparency & Employee Self-Service

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

import { PayrollRunDocument } from '../../payroll-processing-and-execution/schemas/payroll-run.schema';
import { DepartmentDocument } from '../../organization-structure/schemas/department.schema';  // Organization Structure
import { EmployeeDocument } from '../../employee-profile/schemas/employee.schema';  // Employee Profile subsystem

export type PayrollReportDocument = PayrollReport & Document;

@Schema({ timestamps: true })
export class PayrollReport {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayrollRun',
    required: true,
  })
  payrollRunId:
    | mongoose.Types.ObjectId
    | PayrollRunDocument; // from Payroll Processing & Execution subSystem

  @Prop({ required: true })
  periodCode: string; // e.g. "2025-10" or "2025-Q4"

  @Prop()
  reportType:
    | 'department_summary'
    | 'tax_summary'
    | 'insurance_summary'
    | 'benefits_summary';

  @Prop()
  scope?: 'company' | 'department' | 'employee';
  // REQ-PY-29 company summaries, REQ-PY-38 department reports, REQ-PY-25 tax/insurance/benefits reports

  
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  })
  departmentId?:
    | mongoose.Types.ObjectId
    | DepartmentDocument; // Org Structure subsystem

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  })
  employeeId?:
    | mongoose.Types.ObjectId
    | EmployeeDocument; // Employee Profile subsystem
  

  // Flexible JSON snapshot (aggregated totals, charts, etc.)
  @Prop({ type: Object })
  rawDataSnapshot?: any;
}

export const PayrollReportSchema =
  SchemaFactory.createForClass(PayrollReport);