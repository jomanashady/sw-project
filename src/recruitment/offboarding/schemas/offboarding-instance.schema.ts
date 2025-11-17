// recruitment-backend/src/offboarding/schemas/offboarding-instance.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OffboardingInstanceDocument = OffboardingInstance & Document;

@Schema({ timestamps: true })
export class OffboardingInstance {
  /**
   * Link back to the original OffboardingRequest
   * - Same MongoDB database (shared between subsystems)
   * - `ref` must match OffboardingRequest model name
   */


   //internal reference le OffboardingRequest
  @Prop({
    type: Types.ObjectId,
    ref: 'OffboardingRequest',
    required: true,
  })
  offboardingRequestId: Types.ObjectId;

 
  //external reference le Employee
  @Prop({ required: true })
employeeId: string;


  //@Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  //employeeId: Types.ObjectId;



  /**
   * DEPENDENCY: Offboarding checklist configuration
   * - Points to a checklist/template describing standard tasks (IT, HR, Finance, Facilities...)
   * - When your team creates an OffboardingChecklistTemplate model, use its model name as `ref`
   */
  @Prop({ type: Types.ObjectId, ref: 'OffboardingChecklistTemplate' })
  checklistTemplateId?: Types.ObjectId;

  /**
   * Overall status of the offboarding process:
   * - 'NotStarted' : instance created, tasks not started
   * - 'InProgress' : at least one task started
   * - 'Completed'  : all mandatory tasks done, clearance & settlement finished
   */
  @Prop({
    default: 'NotStarted',
    enum: ['NotStarted', 'InProgress', 'Completed'],
  })
  status: string;

  /**
   * Timestamp when the whole offboarding process was completed
   * - Useful for reporting and SLA tracking
   */
  @Prop()
  completedAt?: Date;
}

export const OffboardingInstanceSchema =
  SchemaFactory.createForClass(OffboardingInstance);
