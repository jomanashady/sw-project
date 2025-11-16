import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ChangeType {
  CREATE_DEPARTMENT = 'create_department',
  UPDATE_DEPARTMENT = 'update_department',
  CREATE_POSITION = 'create_position',
  UPDATE_POSITION = 'update_position',
  CHANGE_REPORTING_LINE = 'change_reporting_line',
  DEACTIVATE_DEPARTMENT = 'deactivate_department',
  DEACTIVATE_POSITION = 'deactivate_position',
}

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class StructureChangeRequest extends Document {
  @Prop({ 
    type: String, 
    enum: Object.values(ChangeType), 
    required: true 
  })
  changeType: ChangeType;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  requestedBy: Types.ObjectId;

  @Prop({ type: Object, required: true })
  changeDetails: Record<string, any>;

  @Prop({ type: String, required: true, trim: true })
  justification: string;

  @Prop({ 
    type: String, 
    enum: Object.values(RequestStatus), 
    default: RequestStatus.PENDING 
  })
  status: RequestStatus;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  reviewedBy: Types.ObjectId;

  @Prop({ type: Date, default: null })
  reviewDate: Date;

  @Prop({ type: String, trim: true })
  reviewComments: string;

  @Prop({ type: String, trim: true })
  rejectionReason: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const StructureChangeRequestSchema = SchemaFactory.createForClass(StructureChangeRequest);

// Add indexes
StructureChangeRequestSchema.index({ requestedBy: 1 });
StructureChangeRequestSchema.index({ status: 1 });
StructureChangeRequestSchema.index({ changeType: 1 });
StructureChangeRequestSchema.index({ createdAt: -1 });