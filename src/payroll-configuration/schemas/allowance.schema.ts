import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

  @Prop({ required: true, enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'], default: 'DRAFT' })
  status: string;

  @Prop({ required: true, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' })
  approvalStatus: string;

  @Prop()
  approvedBy: string; // Payroll Manager

  @Prop()
  createdBy: string; // System Admin
}

export const AllowanceSchema = SchemaFactory.createForClass(Allowance);