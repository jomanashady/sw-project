import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  ReimbursementClaim,
  ReimbursementClaimDocument,
} from './schemas/reimbursement-claim.schema';
import {
  PayrollReport,
  PayrollReportDocument,
} from './schemas/payroll-report.schema';
import {
  PayrollDispute,
  PayrollDisputeDocument,
} from './schemas/payroll-dispute.schema';

@Injectable()
export class PayrollTrackingService {
  constructor(
    @InjectModel(PayrollReport.name)
    private readonly payrollReportModel: Model<PayrollReportDocument>,

    @InjectModel(PayrollDispute.name)
    private readonly payrollDisputeModel: Model<PayrollDisputeDocument>,

    @InjectModel(ReimbursementClaim.name)
    private readonly reimbursementClaimModel: Model<ReimbursementClaimDocument>, // Inject ReimbursementClaim model
  ) {}

  // =======================
  // REPORTS (Operational / Transparency)
  // =======================

  async createReport(data: any): Promise<PayrollReportDocument> {
    const created = new this.payrollReportModel(data);
    return created.save();
  }

  async getReports(filters: {
    employeeId?: string;
    payrollRunId?: string;
    periodCode?: string;
    reportType?: string;
  }): Promise<PayrollReportDocument[]> {
    const query: any = {};

    if (filters.employeeId) query.employeeId = filters.employeeId;
    if (filters.payrollRunId) query.payrollRunId = filters.payrollRunId;
    if (filters.periodCode) query.periodCode = filters.periodCode;
    if (filters.reportType) query.reportType = filters.reportType;

    return this.payrollReportModel.find(query).exec();
  }

  async getReportById(id: string): Promise<PayrollReportDocument> {
    const report = await this.payrollReportModel.findById(id).exec();
    if (!report) {
      throw new NotFoundException(`PayrollReport with id ${id} not found`);
    }
    return report;
  }

  async getReportsForEmployee(
    employeeId: string,
  ): Promise<PayrollReportDocument[]> {
    return this.payrollReportModel.find({ employeeId }).exec();
  }

  async getReportsForRun(
    payrollRunId: string,
  ): Promise<PayrollReportDocument[]> {
    return this.payrollReportModel.find({ payrollRunId }).exec();
  }

  async updateReport(
    id: string,
    data: any,
  ): Promise<PayrollReportDocument> {
    const updated = await this.payrollReportModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`PayrollReport with id ${id} not found`);
    }

    return updated;
  }

  async deleteReport(id: string): Promise<void> {
    const res = await this.payrollReportModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException(`PayrollReport with id ${id} not found`);
    }
  }

  // =======================
  // DISPUTES / CLAIMS (Employee Self-Service, Refund Flow)
  // =======================

  async createDispute(data: any): Promise<PayrollDisputeDocument> {
    const created = new this.payrollDisputeModel({
      ...data,
      status: data.status || 'submitted', // default for new dispute
    });
    return created.save();
  }

  async getDisputes(filters: {
    employeeId?: string;
    payrollRunId?: string;
    status?: string;
  }): Promise<PayrollDisputeDocument[]> {
    const query: any = {};

    if (filters.employeeId) query.employeeId = filters.employeeId;
    if (filters.payrollRunId) query.payrollRunId = filters.payrollRunId;
    if (filters.status) query.status = filters.status;

    return this.payrollDisputeModel.find(query).exec();
  }

  async getDisputeById(id: string): Promise<PayrollDisputeDocument> {
    const dispute = await this.payrollDisputeModel.findById(id).exec();
    if (!dispute) {
      throw new NotFoundException(`PayrollDispute with id ${id} not found`);
    }
    return dispute;
  }

  async getDisputesForEmployee(
    employeeId: string,
  ): Promise<PayrollDisputeDocument[]> {
    return this.payrollDisputeModel.find({ employeeId }).exec();
  }

  async updateDispute(
    id: string,
    data: any,
  ): Promise<PayrollDisputeDocument> {
    const updated = await this.payrollDisputeModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`PayrollDispute with id ${id} not found`);
    }

    return updated;
  }

  // For Phase 3: approve/reject disputes & claims
  async updateDisputeStatus(
    id: string,
    status: 'submitted' | 'under_review' | 'approved' | 'rejected',
    reviewerId?: string, // optional User id (later from Auth subsystem)
  ): Promise<PayrollDisputeDocument> {
    const update: any = { status };
    if (reviewerId) {
      update.reviewedBy = reviewerId;
      update.reviewedAt = new Date();
    }

    const updated = await this.payrollDisputeModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`PayrollDispute with id ${id} not found`);
    }

    return updated;
  }

  async deleteDispute(id: string): Promise<void> {
    const res = await this.payrollDisputeModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException(`PayrollDispute with id ${id} not found`);
    }
  }

  async createReimbursementClaim(data: any): Promise<ReimbursementClaimDocument> {
    const createdClaim = new this.reimbursementClaimModel(data); // Create a new reimbursement claim
    return createdClaim.save(); // Save and return the created claim
  }
}
