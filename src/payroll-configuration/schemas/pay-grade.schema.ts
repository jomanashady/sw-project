import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
// TEMPORARY: Import placeholder types until integration with Organization Structure Module
// TODO: Replace with: import { Position, PositionDocument } from '@org-structure-module/schemas/position.schema'
import { EmployeeDocument } from '../../employee-profile/schemas/employee.schema'
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
  // TEMPORARY: Using ObjectId reference with placeholder type
  // TODO: When merging, replace import with actual Position schema from Organization Structure Module
  // Integration method: 
  // 1. Replace import: import { Position } from '@org-structure-module/schemas/position.schema'
  // 2. Update ref name to match Position collection name: ref: 'Position'
  // 3. Use PositionService.getPositionByCode() to validate position exists
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Position', required: true })
  position: mongoose.Types.ObjectId | EmployeeDocument;

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