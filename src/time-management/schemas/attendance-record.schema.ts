// ----------------------------
// External subsystems:
// - Employee Profile: 'Employee' (employeeId)
// - Leaves: 'LeaveRequest' (leaveRequestId)
// - Payroll Processing: 'PayrollPeriod' (payrollPeriodId)
// Internal (Time Management subsystem):
// - ShiftAssignment (from './shift-assignment.schema')
// - ShiftType (from './shift-type.schema')
// ============================

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ShiftAssignment } from './shift-assignment.schema';
import { ShiftType } from './shift-type.schema';

export type AttendanceRecordDocument = AttendanceRecord & Document;

@Schema({ timestamps: true })
export class AttendanceRecord {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  attendanceDate: Date;

  @Prop({ type: Types.ObjectId, ref: ShiftAssignment.name })
  shiftAssignmentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: ShiftType.name })
  plannedShiftTypeId?: Types.ObjectId;

  @Prop({
    type: [
      {
        at: { type: Date, required: true },
        source: {
          type: String,
          enum: ['biometric', 'web', 'mobile', 'manual'],
          required: true,
        },
      },
    ],
    default: [],
  })
  clockInEvents: {
    at: Date;
    source: 'biometric' | 'web' | 'mobile' | 'manual';
  }[];

  @Prop({
    type: [
      {
        at: { type: Date, required: true },
        source: {
          type: String,
          enum: ['biometric', 'web', 'mobile', 'manual'],
          required: true,
        },
      },
    ],
    default: [],
  })
  clockOutEvents: {
    at: Date;
    source: 'biometric' | 'web' | 'mobile' | 'manual';
  }[];

  @Prop({ default: 0 })
  totalWorkedMinutes: number;

  @Prop({ default: 0 })
  latenessMinutes: number;

  @Prop({ default: 0 })
  overtimeMinutes: number;

  @Prop({ default: 0 })
  shortTimeMinutes: number;

  @Prop({ default: false })
  isAbsent: boolean;

  @Prop({ default: false })
  isRestDay: boolean;

  @Prop({ default: false })
  isOnLeave: boolean;

  @Prop({ type: Types.ObjectId, ref: 'LeaveRequest' })
  leaveRequestId?: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['pending_validation', 'validated', 'requires_correction'],
    default: 'pending_validation',
  })
  validationStatus:
    | 'pending_validation'
    | 'validated'
    | 'requires_correction';

  @Prop({ default: false })
  hasMissedPunch: boolean;

  @Prop({ default: false })
  isLockedForPayroll: boolean;

  @Prop({ type: Types.ObjectId, ref: 'PayrollPeriod' })
  payrollPeriodId?: Types.ObjectId;
}

export const AttendanceRecordSchema =
  SchemaFactory.createForClass(AttendanceRecord);