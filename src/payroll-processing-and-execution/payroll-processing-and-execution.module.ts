import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payslip, PayslipSchema } from './schemas/payslip.schema';
import { PayrollProcessingAndExecutionService } from './payroll-processing-and-execution.service';
//zawedt di
import {forwardRef } from '@nestjs/common';
import { PayrollConfigurationModule } from '../payroll-configuration/payroll-configuration.module'; // Import PayrollConfigurationModule

import {
  PayrollPeriod,
  PayrollPeriodSchema,
} from './schemas/payroll-period.schema';

import { PayrollRun, PayrollRunSchema } from './schemas/payroll-run.schema';
import {
  PayrollRunItem,
  PayrollRunItemSchema,
} from './schemas/payroll-run-item.schema';

import {
  EmployeeBankInfo,
  EmployeeBankInfoSchema,
} from './schemas/employee-bank-info.schema';

import { PayGrade, PayGradeSchema } from '../payroll-configuration/schemas/pay-grade.schema';

import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';

@Module({
  imports: [
    EmployeeProfileModule,PayrollConfigurationModule,
    MongooseModule.forFeature([
      { name: PayrollPeriod.name, schema: PayrollPeriodSchema },
      { name: PayrollRun.name, schema: PayrollRunSchema },
      { name: PayrollRunItem.name, schema: PayrollRunItemSchema },
      { name: EmployeeBankInfo.name, schema: EmployeeBankInfoSchema },
      { name: Payslip.name, schema: PayslipSchema }
    ]),
  ],
   providers: [PayrollProcessingAndExecutionService], // Ensure the service is in the providers array
  exports: [PayrollProcessingAndExecutionService], // Export the service if it needs to be used in other modules
  
})
export class PayrollProcessingAndExecutionModule {}