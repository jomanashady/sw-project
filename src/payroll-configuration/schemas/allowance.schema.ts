import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

// Missing imports:
import {
  PayrollPolicy,
  PayrollPolicyDocument,
} from './payroll-policy.schema';

import {
  PayGrade,
  PayGradeDocument
} from './pay-grade.schema';

export type AllowanceDocument = Allowance & Document;

@Schema({ timestamps: true })
export class Allowance {
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
  isTaxable: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    required: true,
    enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'],
    default: 'DRAFT'
  })
  status: string;

  @Prop({
    required: true,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  })
  approvalStatus: string;

  @Prop()
  approvedBy: string;

  @Prop()
  createdBy: string;

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

export const AllowanceSchema = SchemaFactory.createForClass(Allowance);
