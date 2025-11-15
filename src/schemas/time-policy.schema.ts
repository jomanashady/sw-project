import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TimePolicyDocument = TimePolicy & Document;

@Schema({ timestamps: true })
export class TimePolicy {
  @Prop({ required: true })
  name: string; // e.g. "DefaultPolicy2025"

  @Prop({ default: 0 })
  latenessGraceMinutes: number; // minutes allowed before counting lateness

  @Prop({ default: 0 })
  latenessThresholdMinutes: number; // after this lateness penalties start

  @Prop({ default: 0 })
  repeatedLatenessThreshold: number; // times per month

  @Prop({ type: Object, default: {} })
  overtimeConfig: Record<string, any>; // weekend/holiday/night multipliers

  @Prop({ type: Object, default: {} })
  shortTimePenaltyConfig: Record<string, any>;

  @Prop({ type: Object, default: {} })
  additionalRules: Record<string, any>;
}

export const TimePolicySchema = SchemaFactory.createForClass(TimePolicy);
