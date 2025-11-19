import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PayrollDispute,
  PayrollDisputeSchema,
} from './schemas/payroll-dispute.schema';
import {
  ReimbursementClaim,
  ReimbursementClaimSchema,
} from './schemas/reimbursement-claim.schema';
import {
  PayrollReport,
  PayrollReportSchema,
} from './schemas/payroll-report.schema';
import { PayrollTrackingService } from './payroll-tracking.service';
import { PayrollTrackingController } from './payroll-tracking.controller';

@Module({
  imports: [
    // Register Mongoose models with NestJS
    MongooseModule.forFeature([
      { name: PayrollDispute.name, schema: PayrollDisputeSchema },  // Register PayrollDispute schema
      { name: ReimbursementClaim.name, schema: ReimbursementClaimSchema },  // Register ReimbursementClaim schema
      { name: PayrollReport.name, schema: PayrollReportSchema },  // Register PayrollReport schema
    ]),
  ],
  controllers: [PayrollTrackingController],  // Controller that handles the routes
  providers: [PayrollTrackingService],  // Service that provides the business logic
  exports: [PayrollTrackingService],  // Export the service so it can be used elsewhere
})
export class PayrollTrackingModule {}