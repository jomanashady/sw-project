import { Module } from '@nestjs/common';
import { PayrollTrackingService } from './payroll-tracking.service';
import { PayrollTrackingController } from './payroll-tracking.controller';

@Module({
  providers: [PayrollTrackingService],
  controllers: [PayrollTrackingController]
})
export class PayrollTrackingModule {}
