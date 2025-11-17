import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShiftTypeDocument = ShiftType & Document;

export type ShiftTypeCategory =
  | 'normal'
  | 'split'
  | 'overnight'
  | 'rotational'
  | 'mission';

@Schema({ timestamps: true })
export class ShiftType {
  @Prop({ required: true, unique: true })
  code: string; // e.g. "SHIFT_NORMAL_DAY"

  @Prop({ required: true })
  name: string; // e.g. "Normal Working Hours"

  @Prop()
  description?: string;

  @Prop({
    required: true,
    enum: ['normal', 'split', 'overnight', 'rotational', 'mission'],
  })
  category: ShiftTypeCategory;

  @Prop()
  standardStartTime?: string; // "09:00" HH:mm

  @Prop()
  standardEndTime?: string; // "17:00"

  @Prop({ default: false })
  isOvernight: boolean;

  @Prop({
    type: [
      {
        startTime: { type: String, required: true }, // "09:00"
        endTime: { type: String, required: true },   // "13:00"
      },
    ],
    default: [],
  })
  splitSegments: { startTime: string; endTime: string }[];

  @Prop({ default: 0 })
  gracePeriodMinutes: number;

  @Prop({ enum: ['MULTIPLE', 'FIRST_LAST'], default: 'FIRST_LAST' })
  punchMode: 'MULTIPLE' | 'FIRST_LAST';

  @Prop({ default: true })
  isActive: boolean;
}

export const ShiftTypeSchema = SchemaFactory.createForClass(ShiftType);