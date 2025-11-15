import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmployeeShiftAssignmentDocument = EmployeeShiftAssignment & Document;

@Schema({ timestamps: true })
export class EmployeeShiftAssignment {
  @Prop({ type: Types.ObjectId, required: true })
  employeeId: Types.ObjectId; // reference to Employee

  @Prop({ type: Types.ObjectId, required: true })
  shiftTemplateId: Types.ObjectId; // reference to ShiftTemplate

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({
    required: true,
    enum: ['APPROVED', 'SUBMITTED', 'REJECTED', 'CANCELLED', 'EXPIRED'],
    default: 'APPROVED',
  })
  status: string;
}

export const EmployeeShiftAssignmentSchema =
  SchemaFactory.createForClass(EmployeeShiftAssignment);
