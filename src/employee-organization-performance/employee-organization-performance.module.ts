import { Module } from '@nestjs/common';
import { EmployeeOrganizationPerformanceService } from './employee-organization-performance.service';
import { EmployeeOrganizationPerformanceController } from './employee-organization-performance.controller';

@Module({
  providers: [EmployeeOrganizationPerformanceService],
  controllers: [EmployeeOrganizationPerformanceController]
})
export class EmployeeOrganizationPerformanceModule {}
