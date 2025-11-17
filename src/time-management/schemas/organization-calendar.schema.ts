// External subsystems:
// - Leaves: uses these days to suppress deductions
// - Payroll: uses isPaidHoliday for pay logic
// Internal:
// - RestDayConfig / Scheduling logic in Time Management
// No direct Mongoose refs.
// ============================

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrganizationCalendarDayDocument =
  OrganizationCalendarDay & Document;

@Schema({ timestamps: true })
export class OrganizationCalendarDay {
  @Prop({ required: true })
  date: Date;

  @Prop({
    required: true,
    enum: ['national_holiday', 'company_holiday', 'blocked_period'],
  })
  type: 'national_holiday' | 'company_holiday' | 'blocked_period';

  @Prop()
  description?: string;

  @Prop({ default: true })
  isPaidHoliday: boolean;

  @Prop({ default: false })
  isLeaveBlocked: boolean;
}

export const OrganizationCalendarDaySchema =
  SchemaFactory.createForClass(OrganizationCalendarDay);
