// recruitment-backend/src/onboarding/schemas/equipment-assignment.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Candidate } from '../../rec/schemas/candidate.schema';
//add import le employee 
//import { Employee } from '../../../employee-profile/schemas/employee.schema';

export type EquipmentAssignmentDocument = EquipmentAssignment & Document;

@Schema()
export class EquipmentItem {
  @Prop({ required: true })
  itemType: string;

  @Prop({ required: true })
  itemName: string;

  @Prop()
  serialNumber: string;

  @Prop({ type: Date, required: true })
  assignedDate: Date;

  @Prop({ type: String, enum: ['reserved', 'assigned', 'returned'], default: 'reserved' })
  status: string;
}

@Schema({ timestamps: true })
export class EquipmentAssignment {

  //internal reference le Candidate mn recruitment folder
  @Prop({ type: Types.ObjectId, ref: Candidate.name, required: true })
  candidateId: Types.ObjectId;

  //internal reference le OnboardingProcess
  @Prop({ type: Types.ObjectId, ref: 'OnboardingProcess', required: true })
  onboardingProcessId: Types.ObjectId;

//
  @Prop({ type: [EquipmentItem], default: [] })
  items: EquipmentItem[];

  //external reference le Employee mn employee profile folder
  @Prop({ required: true })
  assignedByEmployeeId: string;

  @Prop()
  notes: string;

  @Prop({ type: Boolean, default: false })
  allItemsDelivered: boolean;
}

export const EquipmentAssignmentSchema = SchemaFactory.createForClass(EquipmentAssignment);