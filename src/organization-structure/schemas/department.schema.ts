// src/organization-structure/schemas/department.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true })
export class Department {
  @Prop({ required: true, unique: true, trim: true })
  departmentId: string; // ✅ CRITICAL: Must match what Employee references

  @Prop({ required: true, unique: true, trim: true })
  departmentCode: string;

  @Prop({ required: true, unique: true, trim: true })
  departmentName: string;

  @Prop({ type: String, trim: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Department', default: null })
  parentDepartmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  headOfDepartment: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date, default: null })
  deactivationDate: Date;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);

// Indexes
DepartmentSchema.index({ isActive: 1 });
DepartmentSchema.index({ parentDepartmentId: 1 });
