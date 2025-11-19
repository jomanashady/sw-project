import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

import { PayGradeDocument } from '../../payroll-configuration/schemas/pay-grade.schema';
import { PayrollRunDocument } from './payroll-run.schema';
import { EmployeeDocument } from '../../employee-profile/schemas/employee.schema';
import { DepartmentDocument } from '../../organization-structure/schemas/department.schema';
import { PositionDocument } from '../../organization-structure/schemas/position.schema';

export type PayrollRunItemDocument = PayrollRunItem & Document;

@Schema({ timestamps: true })
export class PayrollRunItem {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayrollRun',
    required: true,
  })
  payrollRunId: mongoose.Types.ObjectId | PayrollRunDocument;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  })
  employeeId: mongoose.Types.ObjectId | EmployeeDocument;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayGrade',
    required: true,
  })
  payGradeId: mongoose.Types.ObjectId | PayGradeDocument;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  })
  departmentId: mongoose.Types.ObjectId | DepartmentDocument;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position',
  })
  positionId: mongoose.Types.ObjectId | PositionDocument;

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

  // ------- ARRAY OF PAY COMPONENTS -------
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
  lineItems: {
    code: string;
    name: string;
    type: string;
    amount: number;
  }[];

  // ------- OTHER EMBEDDED OBJECTS -------
  @Prop({
    type: {
      totalOvertimeHours: { type: Number, default: 0 },
      totalOvertimeAmount: { type: Number, default: 0 },
      totalLatePenalties: { type: Number, default: 0 },
      totalUnpaidLeaveDays: { type: Number, default: 0 },
      totalUnpaidLeaveAmount: { type: Number, default: 0 },
    },
  })
  timeAndLeaveSummary?: {
    totalOvertimeHours?: number;
    totalOvertimeAmount?: number;
    totalLatePenalties?: number;
    totalUnpaidLeaveDays?: number;
    totalUnpaidLeaveAmount?: number;
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
    isNewHire?: boolean;
    isResignation?: boolean;
    isTermination?: boolean;
    signingBonusAmount?: number;
    terminationBenefitAmount?: number;
    resignationBenefitAmount?: number;
  };

  @Prop({ default: false })
  hasAnomalies: boolean;

  @Prop({
    type: [
      {
        anomalyType: { type: String, required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  anomalyMessages: { anomalyType: string; message: string; timestamp: Date }[];
}

export const PayrollRunItemSchema = SchemaFactory.createForClass(PayrollRunItem);
