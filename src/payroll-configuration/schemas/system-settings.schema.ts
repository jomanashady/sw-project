import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import {
  ShiftType,
  ShiftTypeDocument,
} from '../../time-management/schemas/shift-type.schema';
import { HolidayCalendar } from '../../leaves-management/schemas/holiday-calendar.schema';

export type SystemSettingsDocument = SystemSettings & Document;

@Schema({ timestamps: true })
export class SystemSettings {
  @Prop({ required: true, unique: true })
  settingKey: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  settingValue: any; 

  @Prop()
  description: string;

  // Company-wide settings fields
  @Prop()
  payDates: string[]; // e.g., ['1', '15'] for bi-monthly

 
  timezone: string; // e.g., 'America/New_York' // TODO: Sync with Time Management Module if needed

  @Prop()
  currency: string; // e.g., 'USD', 'EUR'

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ShiftType.name,
  })
  defaultShiftType?: mongoose.Types.ObjectId | ShiftTypeDocument;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: HolidayCalendar.name,
  })
  holidayCalendar?: mongoose.Types.ObjectId | HolidayCalendar;

  @Prop({ required: true, enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'], default: 'DRAFT' })
  status: string;

  @Prop({ required: true, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' })
  approvalStatus: string;

  @Prop()
  approvedBy: string; // Payroll Manager

  @Prop()
  createdBy: string; // System Admin
}

export const SystemSettingsSchema = SchemaFactory.createForClass(SystemSettings);