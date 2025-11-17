// recruitment-backend/src/onboarding/schemas/onboarding-process.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Candidate } from '../../recruitment/schemas/candidate.schema';
//import { Employee } from '../../employee-profile/schemas/employee.schema';

export type OnboardingProcessDocument = OnboardingProcess & Document;

@Schema()
export class TaskProgress {
  @Prop({ required: true })
  taskId: string;

  @Prop({ required: true })
  taskName: string;

  @Prop({ type: String, enum: ['pending', 'in_progress', 'completed', 'skipped'], default: 'pending' })
  status: string;

  @Prop({ type: Date })
  completedDate: Date;

  @Prop()
  notes: string;

  @Prop([String])
  uploadedDocuments: string[];
  
   //external reference le Employee mn employee profile folder
  //el mfrood f ref akteb ref:Employee.name w asheel el quotes
  @Prop({ type: Types.ObjectId, ref: 'Employee.name' })
  completedBy: Types.ObjectId;
}

@Schema({ timestamps: true })
export class OnboardingProcess {

  //internal reference le Candidate mn recruitment folder
  @Prop({ type: Types.ObjectId, ref: Candidate.name, required: true, unique: true })
  candidateId: Types.ObjectId;

  //internal reference le OnboardingChecklist
  @Prop({ type: Types.ObjectId, ref: 'OnboardingChecklist', required: true })
  checklistId: Types.ObjectId;

  @Prop({ type: String, enum: ['not_started', 'in_progress', 'completed', 'delayed'], default: 'not_started' })
  overallStatus: string;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date })
  completionDate: Date;

  @Prop({ type: [TaskProgress], default: [] })
  tasks: TaskProgress[];

  @Prop({ type: Number, default: 0 })
  completionPercentage: number;

  //external reference le Employee mn employee profile folder
  //el mfrood f ref akteb ref:Employee.name w asheel el quotes
  @Prop({ type: Types.ObjectId, ref: 'Employee.name' })
  assignedHR: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  payrollInitiated: boolean;

  @Prop({ type: Boolean, default: false })
  accessProvisioned: boolean;

  @Prop({ type: Boolean, default: false })
  equipmentAssigned: boolean;
}

export const OnboardingProcessSchema = SchemaFactory.createForClass(OnboardingProcess);
