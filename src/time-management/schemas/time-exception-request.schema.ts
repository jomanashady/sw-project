import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AttendanceRecord } from './attendance-record.schema';
import { OvertimeRule } from './overtime-rule.schema';
import { PermissionRule } from './permission-rule.schema';

export type TimeExceptionRequestDocument =
  TimeExceptionRequest & Document;

@Schema({ timestamps: true })
export class TimeExceptionRequest {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['overtime', 'permission', 'other'],
  })
  exceptionType: 'overtime' | 'permission' | 'other';

  @Prop({ type: Types.ObjectId, ref: AttendanceRecord.name })
  attendanceRecordId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: OvertimeRule.name })
  overtimeRuleId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: PermissionRule.name })
  permissionRuleId?: Types.ObjectId;

  @Prop({ required: true })
  startDateTime: Date;

  @Prop({ required: true })
  endDateTime: Date;

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

export const TimeExceptionRequestSchema =
  SchemaFactory.createForClass(TimeExceptionRequest);