import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PayrollPolicyDocument = PayrollPolicy & Document;

@Schema({ timestamps: true })
export class PayrollPolicy {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop()
  description: string;

  @Prop({ type: Object })
  policyConfig: {
    overtimeRate: number;
    includesTaxDeductions: boolean;
    includesSocialSecurity: boolean;
    allowanceTypes: string[];
    workingHoursPerDay: number;
    workingDaysPerWeek: number;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true, enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'], default: 'DRAFT' })
  status: string;

  @Prop({ required: true, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' })
  approvalStatus: string;

  @Prop()
  approvedBy: string; // Payroll Manager

  @Prop()
  createdBy: string; // System Admin

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PayrollPolicySchema = SchemaFactory.createForClass(PayrollPolicy);