import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SchedulePatternDocument = SchedulePattern & Document;

@Schema({ timestamps: true })
export class SchedulePattern {
  @Prop({ required: true })
  name: string; // e.g. "4on3off"

  @Prop({
    required: true,
    enum: ['ROTATIONAL', 'COMPRESSED', 'FLEX', 'CUSTOM'],
  })
  patternType: string;

  @Prop({ type: Object, required: true })
  patternData: Record<string, any>; // e.g. { days: [...] }
}

export const SchedulePatternSchema =
  SchemaFactory.createForClass(SchedulePattern);
