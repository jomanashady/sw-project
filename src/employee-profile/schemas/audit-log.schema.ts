// src/employee-profile/schemas/audit-log.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose'; // ✅ Import Schema as MongooseSchema

export type AuditLogDocument = AuditLog & Document; //hassan

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ required: true })
  entityType: string;

  @Prop({ type: Types.ObjectId, required: true })
  entityId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['Create', 'Update', 'Delete', 'View'],
  })
  action: string;

  @Prop({
    type: [
      {
        field: String,
        oldValue: MongooseSchema.Types.Mixed, // ✅ Now works
        newValue: MongooseSchema.Types.Mixed, // ✅ Now works
      },
    ],
  })
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  performedBy: Types.ObjectId;

  @Prop()
  ipAddress: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ performedBy: 1 });
AuditLogSchema.index({ timestamp: -1 });
