import { Module } from '@nestjs/common';
import { PayrollProcessingAndExecutionService } from './payroll-processing-and-execution.service';
import { PayrollProcessingAndExecutionController } from './payroll-processing-and-execution.controller';

@Module({
  providers: [PayrollProcessingAndExecutionService],
  controllers: [PayrollProcessingAndExecutionController]
})
export class PayrollProcessingAndExecutionModule {}
