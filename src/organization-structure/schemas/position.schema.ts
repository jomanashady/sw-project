import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PositionDocument = Position & Document;

@Schema({ timestamps: true })
export class Position {
  @Prop({ required: true, unique: true, trim: true })
  positionId: string;

  @Prop({ required: true, unique: true, trim: true })
  positionCode: string;

  @Prop({ required: true, trim: true })
  positionTitle: string;

  @Prop({ type: String, trim: true })
  jobDescription: string;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Position', default: null })
  reportsTo: Types.ObjectId;

  @Prop({ trim: true })
  payGrade: string;

  @Prop({ type: Number, min: 1, max: 10, default: 1 })
  jobLevel: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date, default: null })
  deactivationDate: Date;

  @Prop({ type: Number, min: 0, default: 1 })
  maxHeadcount: number;

  @Prop({ type: Number, min: 0, default: 0 })
  currentHeadcount: number;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const PositionSchema = SchemaFactory.createForClass(Position);

// Add indexes
PositionSchema.index({ departmentId: 1 });
PositionSchema.index({ isActive: 1 });
PositionSchema.index({ reportsTo: 1 });
