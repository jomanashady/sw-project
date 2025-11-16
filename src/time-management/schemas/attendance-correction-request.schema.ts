import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AttendanceRecord } from './attendance-record.schema';

export type AttendanceCorrectionRequestDocument =
  AttendanceCorrectionRequest & Document;

@Schema({ timestamps: true })
export class AttendanceCorrectionRequest {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: AttendanceRecord.name, required: true })
  attendanceRecordId: Types.ObjectId;

  @Prop({ required: true })
  requestedDate: Date;

  @Prop()
  originalClockIn?: Date;

  @Prop()
  originalClockOut?: Date;

  @Prop()
  requestedClockIn?: Date;

  @Prop()
  requestedClockOut?: Date;

  @Prop({ required: true })
  reason: string;

  @Prop({
    required: true,
    enum: [
      'pending_manager',
      'pending_hr',
      'approved',
      'rejected',
      'cancelled',
    ],
    default: 'pending_manager',
  })
  status:
    | 'pending_manager'
    | 'pending_hr'
    | 'approved'
    | 'rejected'
    | 'cancelled';

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  managerId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  hrReviewerId?: Types.ObjectId;

  @Prop({ default: false })
  escalated: boolean;

  @Prop()
  escalationLevel?: string;

  @Prop()
  managerDecisionNote?: string;

  @Prop()
  hrDecisionNote?: string;
}

export const AttendanceCorrectionRequestSchema =
  SchemaFactory.createForClass(AttendanceCorrectionRequest);