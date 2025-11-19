// seeding-scripts/seed-payroll-processing.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  PayrollPeriod,
  PayrollPeriodDocument,
} from '../src/payroll-processing-and-execution/schemas/payroll-period.schema';
import {
  PayrollRun,
  PayrollRunDocument,
} from '../src/payroll-processing-and-execution/schemas/payroll-run.schema';
import {
  PayrollRunItem,
  PayrollRunItemDocument,
} from '../src/payroll-processing-and-execution/schemas/payroll-run-item.schema';
import { Payslip, PayslipDocument } from '../src/payroll-processing-and-execution/schemas/payslip.schema';
import {
  EmployeeBankInfo,
  EmployeeBankInfoDocument,
} from '../src/payroll-processing-and-execution/schemas/employee-bank-info.schema';

import { Employee, EmployeeDocument } from '../src/employee-profile/schemas/employee.schema';
import { PayGrade, PayGradeDocument } from '../src/payroll-configuration/schemas/pay-grade.schema';
import { Allowance, AllowanceDocument } from '../src/payroll-configuration/schemas/allowance.schema';
import { Deduction, DeductionDocument } from '../src/payroll-configuration/schemas/deduction.schema';

async function seedPayrollProcessing() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    console.log('🌱 Starting Payroll Processing seeding...\n');

    // Get models from Nest context
    const payrollPeriodModel = app.get<Model<PayrollPeriodDocument>>(
      getModelToken(PayrollPeriod.name),
    );
    const payrollRunModel = app.get<Model<PayrollRunDocument>>(
      getModelToken(PayrollRun.name),
    );
    const payrollRunItemModel = app.get<Model<PayrollRunItemDocument>>(
      getModelToken(PayrollRunItem.name),
    );
    const payslipModel = app.get<Model<PayslipDocument>>(
      getModelToken(Payslip.name),
    );
    const employeeBankInfoModel = app.get<Model<EmployeeBankInfoDocument>>(
      getModelToken(EmployeeBankInfo.name),
    );
    const employeeModel = app.get<Model<EmployeeDocument>>(
      getModelToken(Employee.name),
    );
    const payGradeModel = app.get<Model<PayGradeDocument>>(
      getModelToken(PayGrade.name),
    );
    const allowanceModel = app.get<Model<AllowanceDocument>>(
      getModelToken(Allowance.name),
    );
    const deductionModel = app.get<Model<DeductionDocument>>(
      getModelToken(Deduction.name),
    );

    // 1) Create Payroll Period
    const payrollPeriod = await payrollPeriodModel.create({
      code: '2025-10',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-10-31'),
      status: 'open',
      isLocked: false,
    });
    console.log('✅ Created Payroll Period');

    // 2) Create Payroll Run
    const payrollRun = await payrollRunModel.create({
      periodId: payrollPeriod._id,
      status: 'initiated',
      isSimulation: true,
    });
    console.log('✅ Created Payroll Run');

    // 3) Create Payroll Run Items (for multiple employees)
    const employees = await employeeModel.find().exec(); // Assuming employees exist
    const payGrade = await payGradeModel.findOne({}).exec(); // Assuming a paygrade exists
    const allowances = await allowanceModel.find().exec(); // Fetch allowances once

    const payrollRunItems = await payrollRunItemModel.insertMany(
      employees.map((employee) => ({
        payrollRunId: payrollRun._id,
        employeeId: employee._id,
        payGradeId: payGrade?._id,
        departmentId: employee.departmentId,
        positionId: employee.positionId,
        grossSalary: payGrade?.basePay || 0,
        totalAllowances: allowances.reduce((acc, allowance) => acc + allowance.amount, 0), // Sum of all allowances
        totalDeductions: 0, // Placeholder value, modify according to your logic
        netSalaryBeforePenalties: payGrade?.basePay || 0,
        penaltiesAmount: 0,
        finalNetSalary: payGrade?.basePay || 0,
        lineItems: allowances.map((allowance) => ({
          code: allowance.code,
          name: allowance.name,
          type: 'allowance',
          amount: allowance.amount,
        })),
        timeAndLeaveSummary: {
          totalOvertimeHours: 0,
          totalOvertimeAmount: 0,
          totalLatePenalties: 0,
          totalUnpaidLeaveDays: 0,
          totalUnpaidLeaveAmount: 0,
        },
        hasAnomalies: false,
        anomalyMessages: [],
      }))
    );
    console.log('✅ Created Payroll Run Items');

    // 4) Create Payslips (for employees)
    const payslips = await payslipModel.insertMany(
      employees.map((employee) => ({
        employeeId: employee._id,
        employeefirstName: employee.firstName,
        employeelastName: employee.lastName, // Fix: reference `employee.name`, not `Employee.name`
        payrollRunId: payrollRun._id,
        payrollRunItemId: payrollRunItems[0]._id, // Adjust for actual mapping
        periodCode: '2025-10',
        baseSalary: payGrade?.basePay || 0,
        grossSalary: payGrade?.basePay || 0,
        totalAllowances: allowances.reduce((acc, allowance) => acc + allowance.amount, 0),  // Sum of all allowances
        totalDeductions: 0,  // Placeholder value
        netSalaryBeforePenalties: payGrade?.basePay || 0,
        penaltiesAmount: 0,
        finalNetSalary: payGrade?.basePay || 0,
        itemizedComponents: allowances.map((allowance) => ({
          code: allowance.code,
          name: allowance.name,
          type: 'allowance',
          amount: allowance.amount,
        })),
        visibilityStatus: 'generated',
      }))
    );
    console.log('✅ Created Payslips');

    // 5) Create Employee Bank Info (for employees)
    await employeeBankInfoModel.insertMany(
      employees.map((employee) => ({
        employeeId: employee._id,
        bankName: 'Bank XYZ',
        ibanOrAccountNumber: `IBAN_${employee._id}`,
        isActive: true,
      }))
    );
    console.log('✅ Created Employee Bank Info');

    console.log('\n🎉 Payroll Processing seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding Payroll Processing:', error);
  } finally {
    await app.close();
  }
}

seedPayrollProcessing();
