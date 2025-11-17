// External subsystems:
// - Employee Profile: 'Employee' (employeeId)
// - Organizational Structure: 'Department' (departmentId)
// Internal:
// - Used by AttendanceRecord calculations and Scheduling
// ============================

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RestDayConfigDocument = RestDayConfig & Document;

@Schema({ timestamps: true })
export class RestDayConfig {
  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  employeeId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId?: Types.ObjectId;

  @Prop({ default: 'company' })
  level: 'company' | 'department' | 'employee';

  @Prop({ type: [Number], default: [] })
  restDaysOfWeek: number[]; // 0–6

  @Prop({ default: true })
  isActive: boolean;
}

export const RestDayConfigSchema =
  SchemaFactory.createForClass(RestDayConfig);
