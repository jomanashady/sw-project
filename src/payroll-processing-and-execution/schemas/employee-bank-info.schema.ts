// SubSystem: Payroll Processing & Execution (or Employee Profile)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EmployeeDocument } from '../../employee-profile/schemas/employee.schema';


export type EmployeeBankInfoDocument = EmployeeBankInfo & Document;

@Schema({ timestamps: true })
export class EmployeeBankInfo {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true, unique: true })
  employeeId: Types.ObjectId | EmployeeDocument;
  // from Employee Profile subsystem

  @Prop({ required: true })
  bankName: string;

  @Prop({ required: true })
  ibanOrAccountNumber: string;

  @Prop()
  swiftCode?: string;

  @Prop()
  branchName?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const EmployeeBankInfoSchema =
  SchemaFactory.createForClass(EmployeeBankInfo);