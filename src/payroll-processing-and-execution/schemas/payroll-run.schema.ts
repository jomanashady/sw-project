/*What I recommend you do

Keep your current PayrollRun schema exactly as it is.
It’s good and aligned with the PDF.

If you like, you can later add some optional totals (not mandatory for Milestone 1):

@Prop({ default: 0 })
totalEmployees: number;

@Prop({ default: 0 })
totalGrossAmount: number;

@Prop({ default: 0 })
totalNetAmount: number;
*/

// SubSystem: Payroll Processing & Execution
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

import { PayrollPeriodDocument } from './payroll-period.schema';
// import { UserDocument } from '../../auth/schemas/user.schema'; // if you have it

export type PayrollRunDocument = PayrollRun & Document;

@Schema({ timestamps: true })
export class PayrollRun {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayrollPeriod',
    required: true,
  })
  periodId:
    | mongoose.Types.ObjectId
    | PayrollPeriodDocument; // Payroll Processing & Execution subSystem

  @Prop({
    required: true,
    enum: [
      'initiated',
      'under_review',
      'published',
      'waiting_finance',
      'approved',
      'paid',
      'locked',
    ],
  })
  status:
    | 'initiated'
    | 'under_review'
    | 'published'
    | 'waiting_finance'
    | 'approved'
    | 'paid'
    | 'locked';

  @Prop({ default: false })
  isSimulation: boolean; // draft vs real

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  initiatedBy?:
    | mongoose.Types.ObjectId
    | any; // UserDocument (HR/Payroll user)

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  payrollManagerApprovedBy?:
    | mongoose.Types.ObjectId
    | any; // UserDocument

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  financeApprovedBy?:
    | mongoose.Types.ObjectId
    | any; // UserDocument

  @Prop()
  rejectionReason?: string;

  @Prop({ default: false })
  isUnfrozen: boolean;

  @Prop()
  unfreezeJustification?: string;
}

export const PayrollRunSchema = SchemaFactory.createForClass(PayrollRun);