/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';

// Schemas
import {
  AppraisalTemplate,
  AppraisalTemplateSchema,
} from './schemas/appraisal-template.schema';

import {
  AppraisalCycle,
  AppraisalCycleSchema,
} from './schemas/appraisal-cycle.schema';

import {
  AppraisalRecord,
  AppraisalRecordSchema,
} from './schemas/appraisal-record.schema';

import {
  AppraisalAssignment,
  AppraisalAssignmentSchema,
} from './schemas/appraisal-assignment.schema';

import { Dispute, DisputeSchema } from './schemas/dispute.schemas';

// Modules
import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';
import { OrganizationStructureModule } from '../organization-structure/organization-structure.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AppraisalTemplate.name, schema: AppraisalTemplateSchema },
      { name: AppraisalCycle.name, schema: AppraisalCycleSchema },
      { name: AppraisalRecord.name, schema: AppraisalRecordSchema },
      { name: Dispute.name, schema: DisputeSchema },
      { name: AppraisalAssignment.name, schema: AppraisalAssignmentSchema },
    ]),

    forwardRef(() => EmployeeProfileModule), // circular dependency fixed
    OrganizationStructureModule, // direct import OK
  ],
  controllers: [PerformanceController],
  providers: [PerformanceService],
  exports: [PerformanceService],
})
export class PerformanceModule {}
