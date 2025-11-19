//2 attributes ba homa el me7tageen yetzawedo fi el file da 3ala repo el payroll

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PayrollPeriodDocument = PayrollPeriod & Document;

@Schema({ timestamps: true })
export class PayrollPeriod {
  @Prop({ required: true, unique: true })
  code: string; // e.g. "2025-10"

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

 
//sala7to
  @Prop({ required: true, enum: ['draft', 'open', 'under_review', 'closed'] })
  status: string;

  @Prop()
  description?: string;

// el line da kaman me7tag yetzawed fi el schema (makansh ma7toot aslun)
  @Prop({ default: false })
  isLocked: boolean; // once payroll is finally closed
}

export const PayrollPeriodSchema =
  SchemaFactory.createForClass(PayrollPeriod);