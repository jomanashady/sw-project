// src/modules/termination-benefit/schemas/termination-benefit.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
// TEMPORARY: Import placeholder types until integration with other modules
// TODO: Replace with actual imports:
import { EmployeeDocument } from '../../employee-profile/schemas/employee.schema';
//   - import { OffboardingRecord } from '@offboarding-module/schemas/offboarding.schema'
//   - import { LeaveRecord } from '@leaves-module/schemas/leave.schema'
//import { Employee, EmployeeDocument, OffboardingRecord, LeaveRecord } from '../../../common/types/integration.types';

export type TerminationBenefitDocument = TerminationBenefit & Document;

@Schema({ timestamps: true })
export class TerminationBenefit {
  // INTEGRATION: From Employee Profile Module
  // TEMPORARY: Using placeholder EmployeeDocument type
  // TODO: When merging, replace import with actual Employee schema from Employee Profile Module
  // Integration method:
  // 1. Replace import: import { Employee, EmployeeDocument } from '@employee-profile-module/schemas/employee.schema'
  // 2. Update ref to match Employee collection name from Employee Profile module
  // 3. Use EmployeeService.getEmployeeById() to validate employee exists
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true })
  employeeId: mongoose.Types.ObjectId | EmployeeDocument;

  // INTEGRATION: From Offboarding Module
  // This field should be populated from Offboarding separation type
  // Integration method:
  // 1. When Offboarding module creates termination record, it should trigger creation here
  // 2. Use OffboardingService.getSeparationType(employeeId) to get this value
  // 3. Or receive via event/API call when offboarding process completes
  @Prop({ required: true, enum: ['RESIGNATION', 'TERMINATION'] })
  separationType: string; // TODO: Sync with Offboarding Module

  // INTEGRATION: From Offboarding Module
  // This is the employee's last working date from offboarding process
  // Integration method:
  // 1. Get from OffboardingService.getFinalWorkingDate(employeeId)
  // 2. Or receive via event when offboarding finalizes
  @Prop({ required: true })
  finalWorkingDate: Date; // TODO: Sync with Offboarding Module

  @Prop({ required: true })
  benefitAmount: number;

  // INTEGRATION: From Leaves Module
  // This should be calculated from unpaid leave days in Leaves module
  // Integration method:
  // 1. Call LeavesService.getUnpaidLeaveDays(employeeId, finalWorkingDate)
  // 2. Calculate: total unpaid leave days from leave records where type = 'UNPAID'
  // 3. This is used in encashment calculation: DailySalaryRate × UnusedLeaveDays
  @Prop()
  unpaidLeaveDays: number; // TODO: Calculate from Leaves Module - unpaid leave records

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