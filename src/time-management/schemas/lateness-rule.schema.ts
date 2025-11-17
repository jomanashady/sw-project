// External subsystems:
// - Payroll (uses results of this rule but does not require direct ref)
// Internal (Time Management subsystem):
// - AttendanceRecord / calculations can reference LatenessRule by id
// No direct Mongoose refs in this schema.
// ============================
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LatenessRuleDocument = LatenessRule & Document;

@Schema({ timestamps: true })
export class LatenessRule {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: 0 })
  gracePeriodMinutes: number;

  @Prop({ default: 0 })
  warningThresholdMinutes: number;

  @Prop({ default: 0 })
  penaltyThresholdMinutes: number;

  @Prop()
  penaltyFormula?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const LatenessRuleSchema =
  SchemaFactory.createForClass(LatenessRule);