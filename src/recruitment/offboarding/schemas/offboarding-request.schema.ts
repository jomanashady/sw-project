import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OffboardingRequestDocument = OffboardingRequest & Document;

@Schema({ timestamps: true })

export class OffboardingRequest {

  // DEPENDENCY: Employee Profile subsystem (employee ID) bas no reference
  @Prop({ required: true })
  employeeId: string;

  // Who initiated the offboarding? Employee | HR | Manager
  @Prop({ required: true })
  initiatedBy: string;

  // Resignation or Termination
  @Prop({ required: true })
  type: string; // 'Resignation' | 'Termination'

  // Standardized reason code
  @Prop()
  reasonCode?: string;

  // Free text reason
  @Prop()
  reasonDescription?: string;

  // Last working day / termination date
  @Prop({ required: true })
  effectiveDate: Date;

  // Workflow: Requested → UnderReview → Approved → Completed
  @Prop({ default: 'Requested' })
  status: string;

  // DEPENDENCY: Performance subsystem bas no reference
  //Performance subsystem (external) – performance record ID as string
  @Prop()
  performanceRecordId?: string;
}

export const OffboardingRequestSchema =
  SchemaFactory.createForClass(OffboardingRequest);
