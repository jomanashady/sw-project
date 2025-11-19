//payroll-configuration.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Allowance, AllowanceDocument } from './schemas/allowance.schema';
import { PayGrade, PayGradeDocument } from './schemas/pay-grade.schema';
import { Deduction, DeductionDocument } from './schemas/deduction.schema';
import { PayrollPolicy, PayrollPolicyDocument } from './schemas/payroll-policy.schema';
import { SigningBonus, SigningBonusDocument } from './schemas/signing-bonus.schema';
import { SystemSettings, SystemSettingsDocument } from './schemas/system-settings.schema';
import { TaxRule, TaxRuleDocument } from './schemas/tax-rule.schema';
import { TerminationBenefit, TerminationBenefitDocument } from './schemas/termination-benefit.schema';

@Injectable()
export class PayrollConfigurationService {
  constructor(
    @InjectModel(Allowance.name) private allowanceModel: Model<AllowanceDocument>,
    @InjectModel(PayGrade.name) private payGradeModel: Model<PayGradeDocument>,
    @InjectModel(Deduction.name) private deductionModel: Model<DeductionDocument>,
    @InjectModel(PayrollPolicy.name) private payrollPolicyModel: Model<PayrollPolicyDocument>,
    @InjectModel(SigningBonus.name) private signingBonusModel: Model<SigningBonusDocument>,
    @InjectModel(SystemSettings.name) private systemSettingsModel: Model<SystemSettingsDocument>,
    @InjectModel(TaxRule.name) private taxRuleModel: Model<TaxRuleDocument>,
    @InjectModel(TerminationBenefit.name) private terminationBenefitModel: Model<TerminationBenefitDocument>,
  ) {}

  // CRUD for Allowances
  async createAllowance(data: Partial<Allowance>): Promise<AllowanceDocument> {
    const newAllowance = new this.allowanceModel(data);
    return newAllowance.save();
  }

  async getAllAllowances(): Promise<AllowanceDocument[]> {
    return this.allowanceModel.find().exec();
  }

  async getAllowanceById(id: string): Promise<AllowanceDocument | null> {
    return this.allowanceModel.findById(id).exec();
  }

  async updateAllowance(id: string, data: Partial<Allowance>): Promise<AllowanceDocument | null> {
    return this.allowanceModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteAllowance(id: string): Promise<AllowanceDocument | null> {
    return this.allowanceModel.findByIdAndDelete(id).exec();
  }

  // CRUD for PayGrades
  async createPayGrade(data: Partial<PayGrade>): Promise<PayGradeDocument> {
    const newPayGrade = new this.payGradeModel(data);
    return newPayGrade.save();
  }

  async getAllPayGrades(): Promise<PayGradeDocument[]> {
    return this.payGradeModel.find().exec();
  }

  async getPayGradeById(id: string): Promise<PayGradeDocument | null> {
    return this.payGradeModel.findById(id).exec();
  }

  async updatePayGrade(id: string, data: Partial<PayGrade>): Promise<PayGradeDocument | null> {
    return this.payGradeModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deletePayGrade(id: string): Promise<PayGradeDocument | null> {
    return this.payGradeModel.findByIdAndDelete(id).exec();
  }

  // CRUD for Deductions
  async createDeduction(data: Partial<Deduction>): Promise<DeductionDocument> {
    const newDeduction = new this.deductionModel(data);
    return newDeduction.save();
  }

  async getAllDeductions(): Promise<DeductionDocument[]> {
    return this.deductionModel.find().exec();
  }

  async getDeductionById(id: string): Promise<DeductionDocument | null> {
    return this.deductionModel.findById(id).exec();
  }

  async updateDeduction(id: string, data: Partial<Deduction>): Promise<DeductionDocument | null> {
    return this.deductionModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteDeduction(id: string): Promise<DeductionDocument | null> {
    return this.deductionModel.findByIdAndDelete(id).exec();
  }

  // CRUD for Payroll Policy
  async createPayrollPolicy(data: Partial<PayrollPolicy>): Promise<PayrollPolicyDocument> {
    const newPolicy = new this.payrollPolicyModel(data);
    return newPolicy.save();
  }

  async getAllPayrollPolicies(): Promise<PayrollPolicyDocument[]> {
    return this.payrollPolicyModel.find().exec();
  }

  async getPayrollPolicyById(id: string): Promise<PayrollPolicyDocument | null> {
    return this.payrollPolicyModel.findById(id).exec();
  }

  async updatePayrollPolicy(id: string, data: Partial<PayrollPolicy>): Promise<PayrollPolicyDocument | null> {
    return this.payrollPolicyModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deletePayrollPolicy(id: string): Promise<PayrollPolicyDocument | null> {
    return this.payrollPolicyModel.findByIdAndDelete(id).exec();
  }

  // CRUD for Signing Bonus
  async createSigningBonus(data: Partial<SigningBonus>): Promise<SigningBonusDocument> {
    const newBonus = new this.signingBonusModel(data);
    return newBonus.save();
  }

  async getAllSigningBonuses(): Promise<SigningBonusDocument[]> {
    return this.signingBonusModel.find().exec();
  }

  async getSigningBonusById(id: string): Promise<SigningBonusDocument | null> {
    return this.signingBonusModel.findById(id).exec();
  }

  async updateSigningBonus(id: string, data: Partial<SigningBonus>): Promise<SigningBonusDocument | null> {
    return this.signingBonusModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteSigningBonus(id: string): Promise<SigningBonusDocument | null> {
    return this.signingBonusModel.findByIdAndDelete(id).exec();
  }

  // CRUD for System Settings
  async createSystemSettings(data: Partial<SystemSettings>): Promise<SystemSettingsDocument> {
    const newSettings = new this.systemSettingsModel(data);
    return newSettings.save();
  }

  async getSystemSettings(): Promise<SystemSettingsDocument[]> {
    return this.systemSettingsModel.find().exec();
  }

  async updateSystemSettings(id: string, data: Partial<SystemSettings>): Promise<SystemSettingsDocument | null> {
    return this.systemSettingsModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteSystemSettings(id: string): Promise<SystemSettingsDocument | null> {
    return this.systemSettingsModel.findByIdAndDelete(id).exec();
  }

  // CRUD for Tax Rule
  async createTaxRule(data: Partial<TaxRule>): Promise<TaxRuleDocument> {
    const newTaxRule = new this.taxRuleModel(data);
    return newTaxRule.save();
  }

  async getAllTaxRules(): Promise<TaxRuleDocument[]> {
    return this.taxRuleModel.find().exec();
  }

  async getTaxRuleById(id: string): Promise<TaxRuleDocument | null> {
    return this.taxRuleModel.findById(id).exec();
  }

  async updateTaxRule(id: string, data: Partial<TaxRule>): Promise<TaxRuleDocument | null> {
    return this.taxRuleModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteTaxRule(id: string): Promise<TaxRuleDocument | null> {
    return this.taxRuleModel.findByIdAndDelete(id).exec();
  }

  // CRUD for Termination Benefit
  async createTerminationBenefit(data: Partial<TerminationBenefit>): Promise<TerminationBenefitDocument> {
    const newBenefit = new this.terminationBenefitModel(data);
    return newBenefit.save();
  }

  async getAllTerminationBenefits(): Promise<TerminationBenefitDocument[]> {
    return this.terminationBenefitModel.find().exec();
  }

  async getTerminationBenefitById(id: string): Promise<TerminationBenefitDocument | null> {
    return this.terminationBenefitModel.findById(id).exec();
  } 
}