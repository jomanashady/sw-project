import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeductionDocument = Deduction & Document;

@Schema({ timestamps: true })
export class Deduction {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop()
  description: string;

  @Prop({ type: String, required: true })
  type: 'fixed' | 'percentage' | 'variable';

  @Prop({ type: Number })
  amount: number;

  @Prop({ type: Number })
  percentage: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const DeductionSchema = SchemaFactory.createForClass(Deduction);