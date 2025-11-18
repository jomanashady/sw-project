import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import {
  PayrollPolicy,
  PayrollPolicyDocument,
} from './payroll-policy.schema';
// INTEGRATION: Insurance brackets depend on data from
// - Employee Profile (contract type, hire date) to determine eligibility and contribution percentages.
// - Organization Structure pay grades/salary ranges to keep salaryBrackets aligned.
// - Payroll Processing to fetch these configs when generating statutory deductions, and Payroll Tracking so employees see the breakdown.

export type InsuranceDocument = Insurance & Document;

@Schema({ timestamps: true })
export class Insurance {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop()
  description: string;

  @Prop({ type: Number, required: true })
  employeeContribution: number;

  @Prop({ type: Number, required: true })
  employerContribution: number;

  @Prop({ type: [Object], required: true })
  salaryBrackets: {
    minSalary: number;
    maxSalary: number;
    employeeContributionPercentage: number;
    employerContributionPercentage: number;
  }[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true, enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'], default: 'DRAFT' })
  status: string;

  @Prop({ required: true, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' })
  approvalStatus: string;

  @Prop()
  approvedBy: string; // HR Manager (different from other configs)

  @Prop()
  createdBy: string; // System Admin

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: PayrollPolicy.name,
    required: true,
  })
  payrollPolicy: mongoose.Types.ObjectId | PayrollPolicyDocument;
}

export const InsuranceSchema = SchemaFactory.createForClass(Insurance);