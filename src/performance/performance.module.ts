/* eslint-disable @typescript-eslint/no-unused-vars */
// src/performance/performance.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // ✅ ADD THIS
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';

// ✅ ADD - Import schemas
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
import { Dispute, DisputeSchema } from './schemas/dispute.schemas';

// ✅ ADD - Import dependencies
import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';
import { OrganizationStructureModule } from '../organization-structure/organization-structure.module';

@Module({
  imports: [
    // ✅ ADD - Register schemas with MongoDB
    MongooseModule.forFeature([
      { name: 'AppraisalTemplate', schema: AppraisalTemplateSchema },
      { name: 'AppraisalCycle', schema: AppraisalCycleSchema },
      { name: 'AppraisalRecord', schema: AppraisalRecordSchema },
      { name: 'Dispute', schema: DisputeSchema },
    ]),

    // ✅ ADD - Import other modules for integration
    EmployeeProfileModule, // To get employee data
    OrganizationStructureModule, // To get department/position data
  ],
  controllers: [PerformanceController],
  providers: [PerformanceService],
  exports: [PerformanceService], // ✅ ADD - Other modules might need this
})
export class PerformanceModule {}
