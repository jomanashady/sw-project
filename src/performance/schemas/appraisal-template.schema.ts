// src/performance/schemas/appraisal-template.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppraisalTemplateDocument = AppraisalTemplate & Document;

/**
 * Rating Scale Structure
 * Defines how performance will be rated (numeric or descriptive)
 */
class RatingScale {
  @Prop({ required: true, enum: ['Numeric', 'Descriptive'] })
  type: string;

  @Prop({ required: true })
  min: number;

  @Prop({ required: true })
  max: number;

  @Prop({ type: [String], required: true })
  labels: string[];
}

/**
 * Evaluation Criteria Structure
 * Individual competencies or skills to be assessed
 */
class EvaluationCriteria {
  @Prop({ required: true })
  criteriaId: string;

  @Prop({ required: true })
  criteriaName: string;

  @Prop()
  description: string;

  @Prop({ required: true, min: 0, max: 100 })
  weight: number; // Percentage weight in overall score
}

/**
 * Appraisal Template Schema
 * Defines the structure and criteria for employee evaluations
 *
 * Business Rules:
 * - BR-PERF-01: Total weight of all evaluation criteria must equal 100%
 * - BR-PERF-02: Template name + version combination should be unique
 * - BR-PERF-03: At least 3 evaluation criteria required
 * - BR-PERF-04: Only HR Managers can create/modify templates
 * - BR-PERF-05: Templates cannot be deleted if used in any cycle (set isActive = false)
 */
@Schema({ timestamps: true })
export class AppraisalTemplate {
  @Prop({ required: true, unique: true })
  templateId: string;

  @Prop({ required: true })
  templateName: string;

  @Prop()
  templateVersion: string;

  @Prop()
  description: string;

  @Prop({
    required: true,
    enum: ['Annual', 'Probationary', 'Mid-Year', 'Project-Based'],
  })
  appraisalType: string;

  @Prop({ type: RatingScale, required: true })
  ratingScale: RatingScale;

  @Prop({ type: [EvaluationCriteria], required: true })
  evaluationCriteria: EvaluationCriteria[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Department' }] })
  assignedDepartments: Types.ObjectId[];

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  createdBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const AppraisalTemplateSchema =
  SchemaFactory.createForClass(AppraisalTemplate);

// Indexes for performance optimization
AppraisalTemplateSchema.index({ isActive: 1 });
AppraisalTemplateSchema.index({ assignedDepartments: 1 });
AppraisalTemplateSchema.index({ createdBy: 1 });
AppraisalTemplateSchema.index({ templateName: 1, templateVersion: 1 });
