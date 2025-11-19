import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Allowance,
  AllowanceDocument,
} from '../src/payroll-configuration/schemas/allowance.schema';
import {
  ApprovalWorkflow,
  ApprovalWorkflowDocument,
} from '../src/payroll-configuration/schemas/approval-workflow.schema';
import {
  Deduction,
  DeductionDocument,
} from '../src/payroll-configuration/schemas/deduction.schema';
import {
  Insurance,
  InsuranceDocument,
} from '../src/payroll-configuration/schemas/insurance.schema';
import {
  PayGrade,
  PayGradeDocument,
} from '../src/payroll-configuration/schemas/pay-grade.schema';
import {
  PayrollPolicy,
  PayrollPolicyDocument,
} from '../src/payroll-configuration/schemas/payroll-policy.schema';
import {
  SigningBonus,
  SigningBonusDocument,
} from '../src/payroll-configuration/schemas/signing-bonus.schema';
import {
  SystemSettings,
  SystemSettingsDocument,
} from '../src/payroll-configuration/schemas/system-settings.schema';
import {
  TaxRule,
  TaxRuleDocument,
} from '../src/payroll-configuration/schemas/tax-rule.schema';
import {
  TerminationBenefit,
  TerminationBenefitDocument,
} from '../src/payroll-configuration/schemas/termination-benefit.schema';

async function seedPayrollConfiguration() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    console.log('🌱 Starting Payroll Configuration seeding...\n');

    // Get Mongoose models from Nest context
    const allowanceModel = app.get<Model<AllowanceDocument>>(
      getModelToken(Allowance.name),
    );
    const approvalWorkflowModel = app.get<Model<ApprovalWorkflowDocument>>(
      getModelToken(ApprovalWorkflow.name),
    );
    const deductionModel = app.get<Model<DeductionDocument>>(
      getModelToken(Deduction.name),
    );
    const insuranceModel = app.get<Model<InsuranceDocument>>(
      getModelToken(Insurance.name),
    );
    const payGradeModel = app.get<Model<PayGradeDocument>>(
      getModelToken(PayGrade.name),
    );
    const payrollPolicyModel = app.get<Model<PayrollPolicyDocument>>(
      getModelToken(PayrollPolicy.name),
    );
    const signingBonusModel = app.get<Model<SigningBonusDocument>>(
      getModelToken(SigningBonus.name),
    );
    const systemSettingsModel = app.get<Model<SystemSettingsDocument>>(
      getModelToken(SystemSettings.name),
    );
    const taxRuleModel = app.get<Model<TaxRuleDocument>>(
      getModelToken(TaxRule.name),
    );
    const terminationBenefitModel = app.get<Model<TerminationBenefitDocument>>(
      getModelToken(TerminationBenefit.name),
    );

    // OPTIONAL: Clear existing data (uncomment if you want a clean reset)
    // await Promise.all([
    //   allowanceModel.deleteMany({}),
    //   approvalWorkflowModel.deleteMany({}),
    //   deductionModel.deleteMany({}),
    //   insuranceModel.deleteMany({}),
    //   payGradeModel.deleteMany({}),
    //   payrollPolicyModel.deleteMany({}),
    //   signingBonusModel.deleteMany({}),
    //   systemSettingsModel.deleteMany({}),
    //   taxRuleModel.deleteMany({}),
    //   terminationBenefitModel.deleteMany({}),
    // ]);

    //console.log('✅ Cleared existing Payroll Configuration data');

    // 1) Create Payroll Policies (base config for many things)
    const [standardPolicy, hourlyPolicy] = await payrollPolicyModel.insertMany([
      {
        name: 'Standard Monthly Payroll Policy',
        code: 'PAYPOL_STD',
        description: 'Standard monthly payroll policy for full-time employees.',
        policyConfig: {
          overtimeRate: 1.5,
          includesTaxDeductions: true,
          includesSocialSecurity: true,
          allowanceTypes: ['housing', 'transportation', 'mobile'],
          workingHoursPerDay: 8,
          workingDaysPerWeek: 5,
        },
        isActive: true,
        status: 'APPROVED',
        approvalStatus: 'APPROVED',
        approvedBy: 'Payroll Manager',
        createdBy: 'System Admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Hourly Payroll Policy',
        code: 'PAYPOL_HOURLY',
        description: 'Policy for hourly paid employees and interns.',
        policyConfig: {
          overtimeRate: 2.0,
          includesTaxDeductions: true,
          includesSocialSecurity: false,
          allowanceTypes: ['transportation'],
          workingHoursPerDay: 6,
          workingDaysPerWeek: 5,
        },
        isActive: true,
        status: 'APPROVED',
        approvalStatus: 'APPROVED',
        approvedBy: 'Payroll Manager',
        createdBy: 'System Admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    console.log('✅ Inserted Payroll Policies');

    // 2) System Settings
    await systemSettingsModel.insertMany([
      {
        settingKey: 'GLOBAL_PAYROLL_SETTINGS',
        settingValue: {
          defaultCountry: 'Egypt',
          defaultState: 'Cairo',
          defaultPaySchedule: 'MONTHLY',
        },
        description: 'Global payroll-related settings.',
        payDates: ['25'], // pay date on 25th of each month
        // timezone is missing @Prop, but we can still set it
        timezone: 'Africa/Cairo',
        currency: 'EGP',
        status: 'APPROVED',
        approvalStatus: 'APPROVED',
        approvedBy: 'Payroll Manager',
        createdBy: 'System Admin',
      },
    ]);

    console.log('✅ Inserted System Settings');

    // 3) Pay Grades (using placeholder position ObjectIds – replace later with real Position IDs if you want)
    const dummyPositionId1 = new Types.ObjectId();
    const dummyPositionId2 = new Types.ObjectId();

    const [juniorGrade, seniorGrade] = await payGradeModel.insertMany([
      {
        name: 'Junior Developer',
        code: 'PG_JUN_DEV',
        description: 'Entry-level developer grade.',
        position: dummyPositionId1,
        basePay: 12000,
        allowances: [], // will push after creating allowances
        grossSalary: 0, // will recompute later
        minSalary: 10000,
        maxSalary: 15000,
        benefits: ['Medical insurance', 'Annual leave', 'Training budget'],
        isActive: true,
        status: 'APPROVED',
        approvalStatus: 'APPROVED',
        approvedBy: 'Payroll Manager',
        createdBy: 'System Admin',
      },
      {
        name: 'Senior Developer',
        code: 'PG_SNR_DEV',
        description: 'Senior software developer grade.',
        position: dummyPositionId2,
        basePay: 25000,
        allowances: [],
        grossSalary: 0,
        minSalary: 22000,
        maxSalary: 30000,
        benefits: [
          'Medical insurance',
          'Annual leave',
          'Training budget',
          'Stock options',
        ],
        isActive: true,
        status: 'APPROVED',
        approvalStatus: 'APPROVED',
        approvedBy: 'Payroll Manager',
        createdBy: 'System Admin',
      },
    ]);

    console.log('✅ Inserted Pay Grades');

    // 4) Allowances
    const allowances = await allowanceModel.insertMany([
  {
    name: 'Housing Allowance',
    code: 'ALL_HOUSING', // Ensure this field is properly populated
    description: 'Monthly housing allowance.',
    type: 'fixed',
    amount: 3000,
    percentage: 0,
    isTaxable: true,
    isActive: true,
    status: 'APPROVED',
    approvalStatus: 'APPROVED',
    approvedBy: 'Payroll Manager',
    createdBy: 'System Admin',
  },
  {
    name: 'Transportation Allowance',
    code: 'ALL_TRANSPORT',
    description: 'Transportation allowance for commuting.',
    type: 'fixed',
    amount: 1000,
    percentage: 0,
    isTaxable: true,
    isActive: true,
    status: 'APPROVED',
    approvalStatus: 'APPROVED',
    approvedBy: 'Payroll Manager',
    createdBy: 'System Admin',
  },
]);

console.log('✅ Inserted Allowances');


    console.log('✅ Inserted Allowances');

    // Update PayGrades.grossSalary and allowances references
    const housing = allowances.find((a) => a.code === 'ALL_HOUSING');
    const transport = allowances.find((a) => a.code === 'ALL_TRANSPORT');
    const perfBonus = allowances.find((a) => a.code === 'ALL_PERF_BONUS');

    if (housing && transport) {
      const juniorGross =
        (juniorGrade.basePay || 0) +
        (housing.amount || 0) +
        (transport.amount || 0);

      await payGradeModel.findByIdAndUpdate(juniorGrade._id, {
        $set: {
          allowances: [housing._id, transport._id],
          grossSalary: juniorGross,
        },
      });
    }

    if (housing && transport && perfBonus) {
      const seniorGross =
        (seniorGrade.basePay || 0) +
        (housing.amount || 0) +
        (transport.amount || 0);
      await payGradeModel.findByIdAndUpdate(seniorGrade._id, {
        $set: {
          allowances: [housing._id, transport._id, perfBonus._id],
          grossSalary: seniorGross,
        },
      });
    }

    console.log('✅ Updated PayGrades with Allowances and Gross Salary');

    // 5) Deductions (simple, without linking lateness/leave now)
    const deductions = await deductionModel.insertMany([
      {
        name: 'Tax Deduction',
        code: 'DED_TAX',
        description: 'Standard tax deduction.',
        type: 'percentage',
        amount: 0,
        percentage: 10,
        isActive: true,
        payrollPolicy: standardPolicy._id,
        applicablePayGrades: [juniorGrade._id, seniorGrade._id],
      },
      {
        name: 'Social Insurance',
        code: 'DED_SI',
        description: 'Social insurance deduction.',
        type: 'percentage',
        amount: 0,
        percentage: 11,
        isActive: true,
        payrollPolicy: standardPolicy._id,
        applicablePayGrades: [juniorGrade._id, seniorGrade._id],
      },
    ]);

    console.log('✅ Inserted Deductions');

    // 6) Insurance (linked to policy)
    const [socialInsurance] = await insuranceModel.insertMany([
      {
        name: 'Social Insurance Scheme A',
        code: 'INS_SA',
        description: 'Standard social insurance scheme.',
        employeeContribution: 11,
        employerContribution: 18.75,
        salaryBrackets: [
          {
            minSalary: 0,
            maxSalary: 10000,
            employeeContributionPercentage: 10,
            employerContributionPercentage: 15,
          },
          {
            minSalary: 10001,
            maxSalary: 30000,
            employeeContributionPercentage: 11,
            employerContributionPercentage: 18.75,
          },
        ],
        isActive: true,
        status: 'APPROVED',
        approvalStatus: 'APPROVED',
        approvedBy: 'HR Manager',
        createdBy: 'System Admin',
        payrollPolicy: standardPolicy._id,
      },
    ]);

    console.log('✅ Inserted Insurance');

    // 7) Tax Rules (some brackets + exempted allowances)
    await taxRuleModel.insertMany([
      {
        country: 'Egypt',
        state: 'Cairo',
        taxBrackets: [
          {
            minIncome: 0,
            maxIncome: 15000,
            rate: 0,
          },
          {
            minIncome: 15001,
            maxIncome: 30000,
            rate: 10,
          },
          {
            minIncome: 30001,
            maxIncome: 60000,
            rate: 15,
          },
        ],
        standardDeduction: 5000,
        exemptedAllowances: housing ? [housing._id] : [],
        isActive: true,
        status: 'APPROVED',
        approvalStatus: 'APPROVED',
        approvedBy: 'Payroll Manager',
        createdBy: 'System Admin',
        lastUpdatedBy: 'Payroll Manager',
      },
    ]);

    console.log('✅ Inserted Tax Rules');

    // 8) Signing Bonuses
    await signingBonusModel.insertMany([
      {
        name: 'Junior Developer Signing Bonus',
        amount: 5000,
        description: 'Signing bonus for accepted Junior Developer offers.',
        eligibility: 'specific_roles',
        eligibleRoles: [dummyPositionId1],
        isActive: true,
        status: 'APPROVED',
        approvalStatus: 'APPROVED',
        approvedBy: 'Payroll Manager',
        createdBy: 'System Admin',
      },
      {
        name: 'Senior Developer Signing Bonus',
        amount: 10000,
        description: 'Signing bonus for accepted Senior Developer offers.',
        eligibility: 'specific_roles',
        eligibleRoles: [dummyPositionId2],
        isActive: true,
        status: 'APPROVED',
        approvalStatus: 'APPROVED',
        approvedBy: 'Payroll Manager',
        createdBy: 'System Admin',
      },
    ]);

    console.log('✅ Inserted Signing Bonuses');

    // 9) Approval Workflows (wire some entities to workflows)
    await approvalWorkflowModel.insertMany([
      {
        entityType: 'PayGrade',
        entityId: juniorGrade._id,
        currentApprover: 'Payroll Manager',
        status: 'APPROVED',
        comments: 'Seeded as approved for baseline testing.',
        approvedBy: 'Payroll Manager',
        approvedAt: new Date(),
        createdBy: 'System Admin',
      },
      {
        entityType: 'Insurance',
        entityId: socialInsurance._id,
        currentApprover: 'HR Manager',
        status: 'APPROVED',
        comments: 'Seeded as approved insurance scheme.',
        approvedBy: 'HR Manager',
        approvedAt: new Date(),
        createdBy: 'System Admin',
      },
    ]);

    console.log('✅ Inserted Approval Workflows');

    // 10) Termination Benefits (using placeholder ObjectIds for cross-module references)
    const dummyEmployeeId = new Types.ObjectId();
    const dummyOffboardingRequestId = new Types.ObjectId();
    const dummyOffboardingInstanceId = new Types.ObjectId();
    const dummyLeaveBalanceId = new Types.ObjectId();

    await terminationBenefitModel.insertMany([
      {
        employeeId: dummyEmployeeId,
        offboardingRequest: dummyOffboardingRequestId,
        offboardingInstance: dummyOffboardingInstanceId,
        separationType: 'RESIGNATION',
        finalWorkingDate: new Date('2025-01-31'),
        benefitAmount: 15000,
        leaveBalanceSnapshot: dummyLeaveBalanceId,
        unpaidLeaveDays: 2,
        encashmentAmount: 3000,
        status: 'APPROVED',
        approvalStatus: 'APPROVED',
        approvedBy: 'HR Manager',
        processedInPayroll: false,
        createdBy: 'System Admin',
      },
    ]);

    console.log('✅ Inserted Termination Benefits (with placeholder references)');

    console.log('\n🎉 Payroll Configuration seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding Payroll Configuration:', error);
  } finally {
    await app.close();
  }
}

seedPayrollConfiguration();
