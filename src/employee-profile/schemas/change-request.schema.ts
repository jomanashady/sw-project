// src/employee-profile/schemas/change-request.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose'; // ✅ Import Schema as MongooseSchema

export type ChangeRequestDocument = ChangeRequest & Document;

@Schema({ timestamps: true })
export class ChangeRequest {
  @Prop({ required: true, unique: true })
  requestId: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['ProfileUpdate', 'Correction'],
  })
  requestType: string;

  @Prop({ required: true })
  field: string;

  @Prop({ type: MongooseSchema.Types.Mixed }) // ✅ Now works
  oldValue: any;

  @Prop({ type: MongooseSchema.Types.Mixed }) // ✅ Now works
  newValue: any;

  @Prop()
  justification: string;

  @Prop({
    required: true,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  requestedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  reviewedBy: Types.ObjectId;

  @Prop()
  reviewNotes: string;

  @Prop()
  reviewedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const ChangeRequestSchema = SchemaFactory.createForClass(ChangeRequest);

ChangeRequestSchema.index({ employeeId: 1 });
ChangeRequestSchema.index({ status: 1 });
