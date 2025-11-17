import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payslip, PayslipSchema } from './schemas/payslip.schema';

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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PayrollPeriod.name, schema: PayrollPeriodSchema },
      { name: PayrollRun.name, schema: PayrollRunSchema },
      { name: PayrollRunItem.name, schema: PayrollRunItemSchema },
      { name: EmployeeBankInfo.name, schema: EmployeeBankInfoSchema },
      { name: Payslip.name, schema: PayslipSchema }
    ]),
  ],
  exports: [MongooseModule],
})
export class PayrollProcessingAndExecutionModule {}