import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { AllowanceDocument } from '../schemas/allowance.schema';

export type TaxRuleDocument = TaxRule & Document;

@Schema({ timestamps: true })
export class TaxRule {
  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  state: string;

  @Prop({ type: [Object] })
  taxBrackets: {
    minIncome: number;
    maxIncome: number;
    rate: number;
  }[];

  @Prop({ type: Number })
  standardDeduction: number;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Allowance', default: [] })
  exemptedAllowances: mongoose.Types.ObjectId[] | AllowanceDocument[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true, enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'], default: 'DRAFT' })
  status: string;

  @Prop({ required: true, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' })
  approvalStatus: string;

  @Prop()
  approvedBy: string; // Payroll Manager or HR Manager

  @Prop()
  createdBy: string; // System Admin

  @Prop()
  lastUpdatedBy: string; // For legal rules updates
}

export const TaxRuleSchema = SchemaFactory.createForClass(TaxRule);