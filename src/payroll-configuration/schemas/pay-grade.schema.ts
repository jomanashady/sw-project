import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import {
  Position,
  PositionDocument,
} from '../../organization-structure/schemas/position.schema';
import { Allowance } from './allowance.schema';

export type PayGradeDocument = PayGrade & Document;

@Schema({ timestamps: true })
export class PayGrade {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop()
  description: string;

  // INTEGRATION: From Organization Structure Module
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Position.name,
    required: true,
  })
  position: mongoose.Types.ObjectId | PositionDocument;

  @Prop({ type: Number, required: true })
  basePay: number;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Allowance', default: [] })
  allowances: mongoose.Types.ObjectId[];

  @Prop({ type: Number })
  grossSalary: number; // Calculated: basePay + sum of allowances

  @Prop({ type: Number, required: true })
  minSalary: number;

  @Prop({ type: Number, required: true })
  maxSalary: number;

  @Prop({ type: [String] })
  benefits: string[];

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

export const PayGradeSchema = SchemaFactory.createForClass(PayGrade);