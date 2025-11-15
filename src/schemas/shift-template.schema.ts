import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShiftTemplateDocument = ShiftTemplate & Document;

@Schema({ timestamps: true })
export class ShiftTemplate {
  @Prop({ required: true })
  name: string; // e.g. "Morning Shift"

  @Prop({
    required: true,
    enum: ['NORMAL', 'SPLIT', 'OVERNIGHT', 'ROTATIONAL', 'MISSION', 'CUSTOM'],
  })
  type: string;

  @Prop({ required: true })
  startTime: string; // "09:00"

  @Prop({ required: true })
  endTime: string; // "17:00"

  @Prop({ type: [Number], default: [] })
  daysOfWeek: number[]; // 0-6 => Sun-Sat

  @Prop()
  description?: string;
}

export const ShiftTemplateSchema = SchemaFactory.createForClass(ShiftTemplate);
