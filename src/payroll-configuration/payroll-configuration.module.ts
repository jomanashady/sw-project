import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Allowance, AllowanceSchema } from './schemas/allowance.schema';
import {
  ApprovalWorkflow,
  ApprovalWorkflowSchema,
} from './schemas/approval-workflow.schema';
import { Deduction, DeductionSchema } from './schemas/deduction.schema';
import { Insurance, InsuranceSchema } from './schemas/insurance.schema';
import { PayGrade, PayGradeSchema } from './schemas/pay-grade.schema';
import {
  PayrollPolicy,
  PayrollPolicySchema,
} from './schemas/payroll-policy.schema';
import {
  SigningBonus,
  SigningBonusSchema,
} from './schemas/signing-bonus.schema';
import {
  SystemSettings,
  SystemSettingsSchema,
} from './schemas/system-settings.schema';
import { TaxRule, TaxRuleSchema } from './schemas/tax-rule.schema';
import {
  TerminationBenefit,
  TerminationBenefitSchema,
} from './schemas/termination-benefit.schema';

import { PayrollConfigurationService } from './payroll-configuration.service';
import { PayrollConfigurationController } from './payroll-configuration.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Allowance.name, schema: AllowanceSchema },
      { name: ApprovalWorkflow.name, schema: ApprovalWorkflowSchema },
      { name: Deduction.name, schema: DeductionSchema },
      { name: Insurance.name, schema: InsuranceSchema },
      { name: PayGrade.name, schema: PayGradeSchema },
      { name: PayrollPolicy.name, schema: PayrollPolicySchema },
      { name: SigningBonus.name, schema: SigningBonusSchema },
      { name: SystemSettings.name, schema: SystemSettingsSchema },
      { name: TaxRule.name, schema: TaxRuleSchema },
      { name: TerminationBenefit.name, schema: TerminationBenefitSchema },
    ]),
  ],
  controllers: [PayrollConfigurationController],
  providers: [PayrollConfigurationService],
  exports: [PayrollConfigurationService, MongooseModule],
})
export class PayrollConfigurationModule {}
