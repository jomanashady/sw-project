import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TimeRequestApprovalDocument = TimeRequestApproval & Document;

@Schema({ timestamps: true })
export class TimeRequestApproval {
  @Prop({ type: Types.ObjectId, required: true })
  requestId: Types.ObjectId; // Permission or AttendanceCorrectionRequest

  @Prop({
    required: true,
    enum: ['PERMISSION', 'CORRECTION', 'OVERTIME'],
  })
  requestType: string;

  @Prop({ type: Types.ObjectId, required: true })
  currentApproverId: Types.ObjectId;

  @Prop({
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'ESCALATED'],
    default: 'PENDING',
  })
  status: string;

  @Prop({ type: Types.ObjectId })
  escalatedToId?: Types.ObjectId;

  @Prop()
  decisionComment?: string;
}

export const TimeRequestApprovalSchema =
  SchemaFactory.createForClass(TimeRequestApproval);
