
// Internal:
// - TimeExceptionRequest (permissionRuleId ref)
// No direct external refs.
// ============================


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PermissionRuleDocument = PermissionRule & Document;

@Schema({ timestamps: true })
export class PermissionRule {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    enum: ['early_leave', 'late_arrival', 'out_of_office', 'other'],
  })
  permissionType: 'early_leave' | 'late_arrival' | 'out_of_office' | 'other';

  @Prop({ required: true })
  maxDurationMinutes: number;

  @Prop({ default: false })
  countsAsPaidTime: boolean;

  @Prop({ default: false })
  impactsOvertimeCalculation: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const PermissionRuleSchema =
  SchemaFactory.createForClass(PermissionRule);
