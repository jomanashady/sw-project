import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OffboardingChecklistTemplateDocument =
  OffboardingChecklistTemplate & Document;

@Schema({ timestamps: true })
export class OffboardingChecklistTemplate {
  // Name of the template, e.g. "Standard Office Offboarding"
  @Prop({ required: true })
  name: string;

  // Optional description of when this template is used
  @Prop()
  description?: string;

  // Optional: which department / employee type this template is for
  // e.g. "Engineering", "Sales", "All"
  @Prop()
  applicableFor?: string;

  // Is this template active and can be used?
  @Prop({ default: true })
  isActive: boolean;
}

export const OffboardingChecklistTemplateSchema =
  SchemaFactory.createForClass(OffboardingChecklistTemplate);
