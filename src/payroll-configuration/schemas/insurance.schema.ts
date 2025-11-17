import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
}

export const InsuranceSchema = SchemaFactory.createForClass(Insurance);