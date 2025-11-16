import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type IntegrationSyncLogDocument = IntegrationSyncLog & Document;

@Schema({ timestamps: true })
export class IntegrationSyncLog {
  @Prop({
    required: true,
    enum: ['attendance', 'time_exception'],
  })
  sourceType: 'attendance' | 'time_exception';

  @Prop({ type: Types.ObjectId, required: true })
  sourceRecordId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['payroll', 'leaves'],
  })
  targetSystem: 'payroll' | 'leaves';

  @Prop({
    required: true,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  })
  status: 'pending' | 'success' | 'failed';

  @Prop()
  lastErrorMessage?: string;

  @Prop({ default: 0 })
  retryCount: number;
}

export const IntegrationSyncLogSchema =
  SchemaFactory.createForClass(IntegrationSyncLog);