// recruitment-backend/src/onboarding/schemas/equipment-assignment.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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
  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true })
  candidateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'OnboardingProcess', required: true })
  onboardingProcessId: Types.ObjectId;

  @Prop({ type: [EquipmentItem], default: [] })
  items: EquipmentItem[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  assignedBy: Types.ObjectId;

  @Prop()
  notes: string;

  @Prop({ type: Boolean, default: false })
  allItemsDelivered: boolean;
}

export const EquipmentAssignmentSchema = SchemaFactory.createForClass(EquipmentAssignment);