// recruitment-backend/src/onboarding/schemas/onboarding-checklist.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
//import { Employee } from '../../employee-profile/schemas/employee.schema';

export type OnboardingChecklistDocument = OnboardingChecklist & Document;

@Schema()
export class OnboardingTask {
  @Prop({ required: true })
  taskName: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, enum: ['hr', 'new_hire', 'system_admin'], required: true })
  assignedTo: string;

  @Prop({ type: Number, required: true })
  dueOffset: number;

  @Prop({ type: Boolean, default: false })
  requiresDocument: boolean;

  @Prop({ type: Boolean, default: false })
  isMandatory: boolean;

  @Prop({ type: Number, default: 0 })
  order: number;
}

@Schema({ timestamps: true })
export class OnboardingChecklist {

  @Prop({ required: true })
  checklistName: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  department: string;

  @Prop({ type: [OnboardingTask], default: [] })
  tasks: OnboardingTask[];

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  //external reference le Employee mn employee profile folder
  //el mfrood f ref akteb ref:Employee.name w asheel el quotes
  @Prop({ type: Types.ObjectId, ref: 'Employee.name', required: true })
  createdBy: Types.ObjectId;
}

export const OnboardingChecklistSchema = SchemaFactory.createForClass(OnboardingChecklist);
