// src/modules/system-settings/schemas/system-settings.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';

// TEMPORARY: Import placeholder types until integration with Time Management Module
// TODO: Replace with: import { TimeSettings } from '@time-management-module/schemas/time-settings.schema'
//import { TimeSettings } from '../../time-management/schemas/integration-sync-log.schema';

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

  // INTEGRATION: May need to sync with Time Management Module
  // Timezone should align with Time Management shift configurations
  // Integration method:
  // 1. When timezone changes here, notify Time Management module to update shift schedules
  // 2. Or read timezone from Time Management if it's the source of truth
  // 3. Use TimeManagementService.syncTimezone(timezone) when updating
  @Prop()
  timezone: string; // e.g., 'America/New_York' // TODO: Sync with Time Management Module if needed

  @Prop()
  currency: string; // e.g., 'USD', 'EUR'

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