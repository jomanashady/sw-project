// src/employee-profile/schemas/employee.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true, unique: true })
  employeeId: string;

  // Personal Info
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone: string;

  @Prop()
  dateOfBirth: Date;

  @Prop()
  nationalId: string;

  @Prop()
  photo: string; // URL

  // Employment Info
  @Prop({ required: true })
  hireDate: Date;

  @Prop()
  workReceivingDate: Date;

  @Prop({
    required: true,
    enum: ['Permanent', 'Contract', 'Internship'],
  })
  contractType: string;

  @Prop({
    required: true,
    enum: ['Active', 'Suspended', 'Terminated'],
    default: 'Active',
  })
  employmentStatus: string;

  @Prop()
  probationEndDate: Date;

  // Organizational Info
  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Position' })
  positionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  managerId: Types.ObjectId;

  @Prop()
  payGrade: string;

  // Contact Info
  @Prop()
  address: string;

  @Prop({
    type: {
      name: String,
      relationship: String,
      phone: String,
    },
  })
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };

  // Bank Info
  @Prop()
  bankName: string;

  @Prop()
  accountNumber: string;

  @Prop()
  iban: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: [
      {
        cycleId: { type: Types.ObjectId, ref: 'AppraisalCycle' },
        templateId: { type: Types.ObjectId, ref: 'AppraisalTemplate' },
        score: Number,
        rating: String,
        appraisalDate: Date,
      },
    ],
  })
  appraisalHistory: {
    cycleId: Types.ObjectId;
    templateId: Types.ObjectId;
    score: number;
    rating: string;
    appraisalDate: Date;
  }[];

  // Timestamps (automatically added by { timestamps: true })
  createdAt: Date;
  updatedAt: Date;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

// Add indexes
EmployeeSchema.index({ departmentId: 1 });
