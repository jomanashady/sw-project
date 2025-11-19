import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PayrollPeriod, PayrollPeriodDocument } from './schemas/payroll-period.schema';
import { PayrollRun, PayrollRunDocument } from './schemas/payroll-run.schema';
import { PayrollRunItem, PayrollRunItemDocument } from './schemas/payroll-run-item.schema';
import { Payslip, PayslipDocument } from './schemas/payslip.schema';
import { EmployeeBankInfo, EmployeeBankInfoDocument } from './schemas/employee-bank-info.schema';
import { Employee, EmployeeDocument } from '../employee-profile/schemas/employee.schema';
import { PayGrade, PayGradeDocument } from '../payroll-configuration/schemas/pay-grade.schema';
import { Allowance, AllowanceDocument } from '../payroll-configuration/schemas/allowance.schema';
import { Deduction, DeductionDocument } from '../payroll-configuration/schemas/deduction.schema';

@Injectable()
export class PayrollProcessingAndExecutionService {
  constructor(
    @InjectModel('PayrollPeriod') private payrollPeriodModel: Model<PayrollPeriodDocument>,
    @InjectModel('PayrollRun') private payrollRunModel: Model<PayrollRunDocument>,
    @InjectModel('PayrollRunItem') private payrollRunItemModel: Model<PayrollRunItemDocument>,
    @InjectModel('Payslip') private payslipModel: Model<PayslipDocument>,
    @InjectModel('EmployeeBankInfo') private employeeBankInfoModel: Model<EmployeeBankInfoDocument>,
    @InjectModel('Employee') private employeeModel: Model<EmployeeDocument>,   
    @InjectModel('PayGrade') private payGradeModel: Model<PayGradeDocument>,
    @InjectModel('Allowance') private allowanceModel: Model<AllowanceDocument>,
    @InjectModel('Deduction') private deductionModel: Model<DeductionDocument>,
  ) {}

  // Payroll Period Methods
  async createPayrollPeriod(periodData: Partial<PayrollPeriod>): Promise<PayrollPeriodDocument> {
    try {
      const newPeriod = new this.payrollPeriodModel(periodData);
      return await newPeriod.save();
    } catch (error) {
      throw new Error('Error creating payroll period: ' + error.message);
    }
  }

  async getPayrollPeriodByCode(code: string): Promise<PayrollPeriodDocument | null> {
    try {
      return await this.payrollPeriodModel.findOne({ code }).exec();
    } catch (error) {
      throw new Error('Error fetching payroll period: ' + error.message);
    }
  }

  // Payroll Run Methods
  async createPayrollRun(runData: Partial<PayrollRun>): Promise<PayrollRunDocument> {
    try {
      const newRun = new this.payrollRunModel(runData);
      return await newRun.save();
    } catch (error) {
      throw new Error('Error creating payroll run: ' + error.message);
    }
  }

  async getPayrollRunById(runId: string): Promise<PayrollRunDocument | null> {
    try {
      return await this.payrollRunModel.findById(runId).exec();
    } catch (error) {
      throw new Error('Error fetching payroll run: ' + error.message);
    }
  }

  // Payroll Run Item Methods
  async createPayrollRunItem(itemData: Partial<PayrollRunItem>): Promise<PayrollRunItemDocument> {
    try {
      const newItem = new this.payrollRunItemModel(itemData);
      return await newItem.save();
    } catch (error) {
      throw new Error('Error creating payroll run item: ' + error.message);
    }
  }

  async getPayrollRunItems(runId: string): Promise<PayrollRunItemDocument[]> {
    try {
      return await this.payrollRunItemModel.find({ payrollRunId: runId }).exec();
    } catch (error) {
      throw new Error('Error fetching payroll run items: ' + error.message);
    }
  }

  // Payslip Methods
  async createPayslip(payslipData: Partial<Payslip>): Promise<PayslipDocument> {
    try {
      const newPayslip = new this.payslipModel(payslipData);
      return await newPayslip.save();
    } catch (error) {
      throw new Error('Error creating payslip: ' + error.message);
    }
  }

  async getPayslipByEmployee(employeeId: string): Promise<PayslipDocument[]> {
    try {
      return await this.payslipModel.find({ employeeId }).exec();
    } catch (error) {
      throw new Error('Error fetching payslip: ' + error.message);
    }
  }

  // Optional Pagination for Payslips (if needed)
  async getPayslipsPaginated(employeeId: string, page: number, pageSize: number): Promise<PayslipDocument[]> {
    try {
      return await this.payslipModel.find({ employeeId })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec();
    } catch (error) {
      throw new Error('Error fetching paginated payslips: ' + error.message);
    }
  }

  // Update Methods
  async updatePayslip(payslipId: string, payslipData: Partial<Payslip>): Promise<PayslipDocument | null> {
    try {
      return await this.payslipModel.findByIdAndUpdate(payslipId, payslipData, { new: true }).exec();
    } catch (error) {
      throw new Error('Error updating payslip: ' + error.message);
    }
  }

  async updatePayrollRun(runId: string, runData: Partial<PayrollRun>): Promise<PayrollRunDocument | null> {
    try {
      return await this.payrollRunModel.findByIdAndUpdate(runId, runData, { new: true }).exec();
    } catch (error) {
      throw new Error('Error updating payroll run: ' + error.message);
    }
  }

  // Delete Methods
  async deletePayrollRun(runId: string): Promise<void> {
    try {
      await this.payrollRunModel.findByIdAndDelete(runId).exec();
    } catch (error) {
      throw new Error('Error deleting payroll run: ' + error.message);
    }
  }

  async deletePayslip(payslipId: string): Promise<void> {
    try {
      await this.payslipModel.findByIdAndDelete(payslipId).exec();
    } catch (error) {
      throw new Error('Error deleting payslip: ' + error.message);
    }
  }
}
