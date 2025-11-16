import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ShiftType } from './shift-type.schema';

export type SchedulingRuleDocument = SchedulingRule & Document;

@Schema({ timestamps: true })
export class SchedulingRule {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({
    required: true,
    enum: ['flex', 'compressed_week', 'rotational', 'custom_pattern'],
  })
  ruleType: 'flex' | 'compressed_week' | 'rotational' | 'custom_pattern';

  @Prop()
  maxWeeklyHours?: number;

  @Prop()
  minWeeklyHours?: number;

  @Prop()
  allowedFlexMinutesBefore?: number;

  @Prop()
  allowedFlexMinutesAfter?: number;

  @Prop({
    type: [
      {
        dayOfWeek: { type: Number, required: true }, // 0–6 (Sun–Sat)
        shiftTypeId: { type: Types.ObjectId, ref: ShiftType.name, required: true },
      },
    ],
    default: [],
  })
  weeklyPattern: { dayOfWeek: number; shiftTypeId: Types.ObjectId }[];

  @Prop({ default: true })
  isActive: boolean;
}

export const SchedulingRuleSchema =
  SchemaFactory.createForClass(SchedulingRule);