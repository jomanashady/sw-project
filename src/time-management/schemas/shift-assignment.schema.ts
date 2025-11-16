import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ShiftType } from './shift-type.schema';
import { SchedulingRule } from './scheduling-rule.schema';

export type ShiftAssignmentDocument = ShiftAssignment & Document;

@Schema({ timestamps: true })
export class ShiftAssignment {
  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  employeeId?: Types.ObjectId; // from Employee Profile

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId?: Types.ObjectId; // from Org Structure

  @Prop({ type: Types.ObjectId, ref: 'Position' })
  positionId?: Types.ObjectId; // from Org Structure

  @Prop({ required: true, enum: ['employee', 'department', 'position'] })
  assignmentLevel: 'employee' | 'department' | 'position';

  @Prop({ type: Types.ObjectId, ref: ShiftType.name, required: true })
  shiftTypeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: SchedulingRule.name })
  schedulingRuleId?: Types.ObjectId;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({
    required: true,
    enum: ['draft', 'submitted', 'approved', 'rejected', 'cancelled', 'expired'],
    default: 'draft',
  })
  status:
    | 'draft'
    | 'submitted'
    | 'approved'
    | 'rejected'
    | 'cancelled'
    | 'expired';

  @Prop({ default: false })
  isPrimaryForPeriod: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdById?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  lastUpdatedById?: Types.ObjectId;
}

export const ShiftAssignmentSchema =
  SchemaFactory.createForClass(ShiftAssignment);