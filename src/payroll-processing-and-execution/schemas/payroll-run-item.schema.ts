/*From the project requirements, it’s nice (but not absolutely mandatory) to distinguish:

configured deductions (tax, insurance, social, etc.)

“penalties” (late, missing hours, unpaid leave)
/*  

/*@Prop({ default: 0 })
taxAmount: number;

@Prop({ default: 0 })
insuranceAmount: number;
*/

// src/payroll-processing/schemas/payroll-run-item.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

import { PayGradeDocument } from '../../payroll-configuration/schemas/pay-grade.schema';
import { PayrollRunDocument } from './payroll-run.schema';
// If you have EmployeeDocument / DepartmentDocument / PositionDocument in other modules:
import { EmployeeDocument } from '../../employee-profile/schemas/employee.schema';
import { DepartmentDocument } from '../../organization-structure/schemas/department.schema';
import { PositionDocument } from '../../organization-structure/schemas/position.schema';

export type PayrollRunItemDocument = PayrollRunItem & Document;

@Schema({ timestamps: true })
export class PayrollRunItem {
  // ------- REFERENCES AS ObjectId | Document -------

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayrollRun',
    required: true,
  })
  payrollRunId:
    | mongoose.Types.ObjectId
    | PayrollRunDocument; // Payroll Processing & Execution

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  })
  employeeId:
    | mongoose.Types.ObjectId
    | EmployeeDocument; // EmployeeDocument if you have it (from Employee Profile subsystem)

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayGrade',
    required: true,
  })
  payGradeId:
    | mongoose.Types.ObjectId
    | PayGradeDocument; // from Payroll Configuration & Policy Setup

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  })
  departmentId:
    | mongoose.Types.ObjectId
    | DepartmentDocument; // DepartmentDocument from Org Structure subsystem

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position',
  })
  positionId:
    | mongoose.Types.ObjectId
    | PositionDocument; // PositionDocument from Org Structure subsystem

  // ------- SNAPSHOTTED NUMBERS (not refs) -------

  @Prop({ required: true })
  grossSalary: number;

  @Prop({ required: true })
  totalAllowances: number;

  @Prop({ required: true })
  totalDeductions: number;

  @Prop({ required: true })
  netSalaryBeforePenalties: number;

  @Prop({ required: true })
  penaltiesAmount: number;

  @Prop({ required: true })
  finalNetSalary: number;

  // ------- ARRAY OF REFERENCES INSIDE SUBDOCUMENTS -------

  @Prop({
    type: [
      {
        componentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'PayComponentDefinition',
        },
        code: String,
        name: String,
        type: String,
        amount: Number,
      },
    ],
    default: [],
  })
  lineItems: {
    componentId:
      | mongoose.Types.ObjectId
      | any; // PayComponentDefinitionDocument if you import it

    code: string;
    name: string;
    type: string;
    amount: number;
  }[];

  // ------- OTHER EMBEDDED OBJECTS -------

  @Prop({
    type: {
      totalOvertimeHours: Number,
      totalOvertimeAmount: Number,
      totalLatePenalties: Number,
      totalUnpaidLeaveDays: Number,
      totalUnpaidLeaveAmount: Number,
    },
  })
  timeAndLeaveSummary?: {
    totalOvertimeHours: number;
    totalOvertimeAmount: number;
    totalLatePenalties: number;
    totalUnpaidLeaveDays: number;
    totalUnpaidLeaveAmount: number;
  };

  @Prop({
    type: {
      isNewHire: Boolean,
      isResignation: Boolean,
      isTermination: Boolean,
      signingBonusAmount: Number,
      terminationBenefitAmount: Number,
      resignationBenefitAmount: Number,
    },
  })
  hrEventSummary?: {
    isNewHire: boolean;
    isResignation: boolean;
    isTermination: boolean;
    signingBonusAmount: number;
    terminationBenefitAmount: number;
    resignationBenefitAmount: number;
  };

  @Prop({ default: false })
  hasAnomalies: boolean;

  @Prop({ type: [String], default: [] })
  anomalyMessages: string[];
}

export const PayrollRunItemSchema =
  SchemaFactory.createForClass(PayrollRunItem);
