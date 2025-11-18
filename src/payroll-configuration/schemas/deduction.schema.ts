import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import {
  PayrollPolicy,
  PayrollPolicyDocument,
} from './payroll-policy.schema';
import { PayGrade, PayGradeDocument } from './pay-grade.schema';
import {
  LatenessRule,
  LatenessRuleDocument,
} from '../../time-management/schemas/lateness-rule.schema';
import { LeaveType } from '../../leaves-management/schemas/leave-type.schema';

export type DeductionDocument = Deduction & Document;

@Schema({ timestamps: true })
export class Deduction {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop()
  description: string;

  @Prop({ type: String, required: true })
  type: 'fixed' | 'percentage' | 'variable';

  @Prop({ type: Number })
  amount: number;

  @Prop({ type: Number })
  percentage: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: LatenessRule.name,
  })
  sourceLatenessRule?: mongoose.Types.ObjectId | LatenessRuleDocument;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: LeaveType.name,
  })
  linkedLeaveType?: mongoose.Types.ObjectId | LeaveType;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: PayrollPolicy.name,
  })
  payrollPolicy?: mongoose.Types.ObjectId | PayrollPolicyDocument;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: PayGrade.name,
    default: [],
  })
  applicablePayGrades?: (
    | mongoose.Types.ObjectId
    | PayGradeDocument
  )[];
}

export const DeductionSchema = SchemaFactory.createForClass(Deduction);