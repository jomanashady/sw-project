import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })

export class Job {
  @Prop({ required: true })
  title: string; 

  @Prop()
  description?: string;

  // Department & position IDs from Org Structure subsystem
  @Prop({ required: true })
  departmentId: string;

  @Prop({ required: true })
  positionId: string;

  @Prop()
  location?: string;

  @Prop({ type: [String], default: [] })
  requiredSkills: string[];

  @Prop({ default: 1 })
  numberOfOpenings: number;

  // Template vs actual requisition
  @Prop({ default: false })
  isTemplate: boolean;

  // Status of this job posting
  @Prop({ default: 'Draft' })
  status: string; // Draft, Approved, Posted, Closed

  // Employee IDs from Employee subsystem (creator/approver)
  @Prop()
  createdBy?: string; // employee id

  @Prop()
  approvedBy?: string;

  @Prop()
  postedAt?: Date;

  @Prop()
  closedAt?: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);
