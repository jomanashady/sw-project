import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
// INTEGRATION: Signing bonus eligibility ties into
// - Recruitment subsystem (offer → acceptance events) to trigger new records.
// - Onboarding tasks to ensure payout once employee status becomes Active.
// - Employee Profile to confirm the employee's position/grade still matches the eligible positions.
import { EmployeeDocument } from '../../employee-profile/schemas/employee.schema';
import {
  Position,
  PositionDocument,
} from '../../organization-structure/schemas/position.schema';

export type SigningBonusDocument = SigningBonus & Document;

@Schema({ timestamps: true })
export class SigningBonus {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop()
  description: string;

  @Prop({ type: String })
  eligibility: 'all' | 'specific_roles';

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: Position.name,
    default: [],
  })
  eligibleRoles: (
    | mongoose.Types.ObjectId
    | PositionDocument
  )[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true, enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'], default: 'DRAFT' })
  status: string;

  @Prop({ required: true, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' })
  approvalStatus: string;

  @Prop()
  approvedBy: string; // Payroll Manager

  @Prop()
  createdBy: string; // System Admin
}

export const SigningBonusSchema = SchemaFactory.createForClass(SigningBonus);