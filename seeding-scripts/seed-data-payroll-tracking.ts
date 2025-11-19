import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PayrollTrackingService } from '../src/payroll-tracking/payroll-tracking.service';
import {
  PayrollReport,
  PayrollReportDocument,
} from '../src/payroll-tracking/schemas/payroll-report.schema';
import {
  PayrollDispute,
  PayrollDisputeDocument,
} from '../src/payroll-tracking/schemas/payroll-dispute.schema';
import {
  ReimbursementClaim,
  ReimbursementClaimDocument,
} from '../src/payroll-tracking/schemas/reimbursement-claim.schema';

async function seedDatabase() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const payrollReportModel = app.get<Model<PayrollReportDocument>>(
    getModelToken(PayrollReport.name),
  );
  const payrollDisputeModel = app.get<Model<PayrollDisputeDocument>>(
    getModelToken(PayrollDispute.name),
  );
  const reimbursementClaimModel = app.get<Model<ReimbursementClaimDocument>>(
    getModelToken(ReimbursementClaim.name),
  );

  // Seeding Payroll Reports
  const payrollReports = [
    {
      payrollRunId: '603d9dcd1512e9001f7b7b0a', // Example ObjectId, replace with actual valid ID
      periodCode: '2025-10',
      reportType: 'department_summary',
      scope: 'company',
      rawDataSnapshot: { totalGross: 100000, totalDeductions: 25000 },
    },
    {
      payrollRunId: '603d9dcd1512e9001f7b7b0b',
      periodCode: '2025-11',
      reportType: 'tax_summary',
      scope: 'department',
      rawDataSnapshot: { totalTax: 8000, netAmount: 92000 },
    },
  ];

  await payrollReportModel.insertMany(payrollReports);
  console.log('Seeded Payroll Reports');

  // Seeding Payroll Disputes
  const payrollDisputes = [
    {
      employeeId: '603d9dcd1512e9001f7b7b0c', // Example Employee ObjectId
      employeeName: 'John Doe',
      payslipId: '603d9dcd1512e9001f7b7b0d', // Example Payslip ObjectId
      payrollPeriodCode: '2025-10',
      disputeType: 'salary_calculation',
      description: 'Discrepancy in basic salary calculation.',
      status: 'submitted',
      isRefundRequired: true,
    },
    {
      employeeId: '603d9dcd1512e9001f7b7b0e',
      employeeName: 'Jane Smith',
      payslipId: '603d9dcd1512e9001f7b7b0f', // Example Payslip ObjectId
      payrollPeriodCode: '2025-11',
      disputeType: 'deduction_error',
      description: 'Over deduction in tax amount.',
      status: 'under_review',
      isRefundRequired: false,
    },
  ];

  await payrollDisputeModel.insertMany(payrollDisputes);
  console.log('Seeded Payroll Disputes');

  // Seeding Reimbursement Claims
  const reimbursementClaims = [
    {
      employeeId: '603d9dcd1512e9001f7b7b0c',
      employeeName: 'John Doe',
      claimType: 'travel',
      amount: 1500,
      description: 'Travel reimbursement for business trip.',
      status: 'submitted',
      isRefundProcessed: false,
    },
    {
      employeeId: '603d9dcd1512e9001f7b7b0e',
      employeeName: 'Jane Smith',
      claimType: 'medical',
      amount: 500,
      description: 'Medical reimbursement for hospital visit.',
      status: 'approved',
      isRefundProcessed: true,
      refundProcessedAt: new Date(),
    },
  ];

  await reimbursementClaimModel.insertMany(reimbursementClaims);
  console.log('Seeded Reimbursement Claims');

  await app.close();
}

seedDatabase().catch((err) => {
  console.error(err);
  process.exit(1);
});
