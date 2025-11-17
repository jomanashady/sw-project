import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
// TEMPORARY: Import placeholder types until integration with Organization Structure Module
// TODO: Replace with: import { Position, PositionDocument } from '@org-structure-module/schemas/position.schema'
import { EmployeeDocument } from '../../employee-profile/schemas/employee.schema';

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

  // INTEGRATION: From Organization Structure Module
  // These role codes should reference Position/Role entities from Org Structure
  // Integration method:
  // 1. When creating/editing: Validate roles exist via PositionService.validateRoles(roleCodes[])
  // 2. When processing signing bonus for employee: Check employee.position matches eligibleRoles
  // 3. Use EmployeeService.getEmployeePosition(employeeId) to check eligibility
  // 4. Or keep as string array and validate via API call to Org Structure service
  @Prop({ type: [String] })
  eligibleRoles: string[]; // TODO: Validate against Organization Structure Position/Role entities

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