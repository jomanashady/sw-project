// External subsystems:
// - Payroll: uses the multiplier and contextType when calculating overtime
// Internal:
// - TimeExceptionRequest (overtimeRuleId ref)
// No direct external refs here.
// ============================

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OvertimeRuleDocument = OvertimeRule & Document;

@Schema({ timestamps: true })
export class OvertimeRule {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({
    required: true,
    enum: ['normal_day', 'rest_day', 'public_holiday'],
  })
  contextType: 'normal_day' | 'rest_day' | 'public_holiday';

  @Prop({ required: true })
  multiplier: number; // e.g. 1.25, 1.5

  @Prop({ default: false })
  requiresPreApproval: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const OvertimeRuleSchema =
  SchemaFactory.createForClass(OvertimeRule);
