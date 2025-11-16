// recruitment-backend/src/offboarding/schemas/offboarding-task.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OffboardingTaskDocument = OffboardingTask & Document;

@Schema({ timestamps: true })

export class OffboardingTask {
  /**
   * DEPENDENCY: OffboardingInstance (same DB)
   * - Every task belongs to one offboarding process
   */
  //internal reference le OffboardingInstance 
  @Prop({
    type: Types.ObjectId,
    ref: 'OffboardingInstance',
    required: true,
  })
  offboardingId: Types.ObjectId;
  

  /**
   * Which department/role is responsible for this task:
   * - 'IT', 'Finance', 'Facilities', 'LineManager', 'HR'
   * These map to departments in Organization Structure / Employee Profile
   */
  @Prop({ required: true })
  departmentRole: string;

  @Prop({ required: true })
  title: string; // e.g. "Revoke VPN access", "Collect laptop", "Finalize payroll settlement"

  @Prop()
  description?: string;

  /**
   * Status of this individual task:
   * - 'Pending', 'InProgress', 'Approved', 'Rejected', 'Completed'
   */
  @Prop({
    default: 'Pending',
    enum: ['Pending', 'InProgress', 'Approved', 'Rejected', 'Completed'],
  })
  status: string;

  /**
   * DEPENDENCY: Employee Profile / User subsystem
   * - _id of the user/employee actually responsible for this specific task
   */
  // external reference le Employee Module
  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  assignedToUserId?: Types.ObjectId;

  /**
   * Who approved/completed this task (user id from Employee/User subsystem)
   */
  // external reference le Employee Module
  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  approvedBy?: Types.ObjectId;

  @Prop()
  approvedAt?: Date;

  @Prop()
  notes?: string;

   // IT / Access systems integration
  @Prop()
  revocationType?: string;

  @Prop()
  externalTicketId?: string;

  /**
   * DEPENDENCY: Payroll + Leaves modules bas msh ba reference
   * - includesFinalSettlement: task that triggers final pay & benefits settlement
   * - leavesBalanceDays: value fetched from Leaves module (unused leave days)
   * - encashmentAmount: amount calculated in Payroll based on balance & policy
   */
  @Prop({ default: false })
  includesFinalSettlement?: boolean;

  @Prop()
  leavesBalanceDays?: number;

  @Prop()
  encashmentAmount?: number;
}

export const OffboardingTaskSchema =
  SchemaFactory.createForClass(OffboardingTask);
