import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { EmployeeDocument } from '../../employee-profile/schemas/employee.schema';
import {
  OffboardingRequest,
  OffboardingRequestDocument,
} from '../../recruitment/offboarding/schemas/offboarding-request.schema';
import {
  OffboardingInstance,
  OffboardingInstanceDocument,
} from '../../recruitment/offboarding/schemas/offboarding-instance.schema';
import { LeaveBalance } from '../../leaves-management/schemas/leave-balance.schema';

export type TerminationBenefitDocument = TerminationBenefit & Document;

@Schema({ timestamps: true })
export class TerminationBenefit {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true })
  employeeId: mongoose.Types.ObjectId | EmployeeDocument;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: OffboardingRequest.name,
    required: true,
  })
  offboardingRequest:
    | mongoose.Types.ObjectId
    | OffboardingRequestDocument;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: OffboardingInstance.name,
  })
  offboardingInstance?:
    | mongoose.Types.ObjectId
    | OffboardingInstanceDocument;

  @Prop({ required: true, enum: ['RESIGNATION', 'TERMINATION'] })
  separationType: string; // Mirror OffboardingRequest.type


  @Prop({ required: true })
  finalWorkingDate: Date; // Sourced from OffboardingRequest.effectiveDate

  @Prop({ required: true })
  benefitAmount: number;
  
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: LeaveBalance.name,
  })
  leaveBalanceSnapshot?: mongoose.Types.ObjectId | LeaveBalance;

  @Prop()
  unpaidLeaveDays: number;

  @Prop()
  encashmentAmount: number;

  @Prop({ required: true, enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'], default: 'DRAFT' })
  status: string;

  @Prop({ required: true, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' })
  approvalStatus: string;

  @Prop()
  approvedBy: string; // Payroll Manager or HR Manager

  @Prop()
  processedInPayroll: boolean;

  @Prop()
  createdBy: string; // System Admin
}

export const TerminationBenefitSchema = SchemaFactory.createForClass(TerminationBenefit);