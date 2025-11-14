import { Module } from '@nestjs/common';
import { PayrollConfigurationService } from './payroll-configuration.service';
import { PayrollConfigurationController } from './payroll-configuration.controller';

@Module({
  providers: [PayrollConfigurationService],
  controllers: [PayrollConfigurationController]
})
export class PayrollConfigurationModule {}
