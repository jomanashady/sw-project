// src/employee-profile/employee-profile.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from './schemas/employee.schema';
import {
  ChangeRequest,
  ChangeRequestDocument,
} from './schemas/change-request.schema';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

@Injectable()
export class EmployeeProfileService {
  constructor(
    @InjectModel('Employee') private employeeModel: Model<EmployeeDocument>,
    @InjectModel('ChangeRequest')
    private changeRequestModel: Model<ChangeRequestDocument>,
    @InjectModel('AuditLog') private auditLogModel: Model<AuditLogDocument>,
  ) {}

  // ✅ Employee Methods
  async findById(employeeId: string): Promise<EmployeeDocument | null> {
    console.log(`[EMPLOYEE SERVICE] Finding employee: ${employeeId}`);
    return this.employeeModel
      .findOne({ employeeId })
      .populate('departmentId')
      .populate('positionId')
      .populate('managerId')
      .exec();
  }

  async findAll(): Promise<EmployeeDocument[]> {
    console.log(`[EMPLOYEE SERVICE] Finding all employees`);
    return this.employeeModel.find({ isActive: true }).exec();
  }

  async createEmployee(
    employeeData: Partial<Employee>,
  ): Promise<EmployeeDocument> {
    console.log(
      `[EMPLOYEE SERVICE] Creating employee: ${employeeData.firstName} ${employeeData.lastName}`,
    );
    const newEmployee = new this.employeeModel({
      ...employeeData,
      employeeId: employeeData.employeeId || `EMP-${Date.now()}`,
    });
    return newEmployee.save();
  }

  async updateEmployee(
    employeeId: string,
    updateData: Partial<Employee>,
  ): Promise<EmployeeDocument | null> {
    console.log(`[EMPLOYEE SERVICE] Updating employee: ${employeeId}`);
    return this.employeeModel
      .findOneAndUpdate({ employeeId }, { $set: updateData }, { new: true })
      .exec();
  }

  async deactivateEmployee(
    employeeId: string,
  ): Promise<EmployeeDocument | null> {
    console.log(`[EMPLOYEE SERVICE] Deactivating employee: ${employeeId}`);
    return this.employeeModel
      .findOneAndUpdate(
        { employeeId },
        { $set: { isActive: false } },
        { new: true },
      )
      .exec();
  }

  // ✅ Change Request Methods
  async createChangeRequest(
    requestData: Partial<ChangeRequest>,
  ): Promise<ChangeRequestDocument> {
    console.log(`[EMPLOYEE SERVICE] Creating change request`);
    const newRequest = new this.changeRequestModel({
      ...requestData,
      requestId: requestData.requestId || `CR-${Date.now()}`,
    });
    return newRequest.save();
  }

  async findChangeRequestsByEmployee(
    employeeId: string,
  ): Promise<ChangeRequestDocument[]> {
    console.log(
      `[EMPLOYEE SERVICE] Finding change requests for: ${employeeId}`,
    );
    return this.changeRequestModel
      .find({ employeeId })
      .populate('employeeId')
      .populate('requestedBy')
      .populate('reviewedBy')
      .exec();
  }

  // ✅ Audit Log Methods
  async createAuditLog(logData: Partial<AuditLog>): Promise<AuditLogDocument> {
    console.log(`[EMPLOYEE SERVICE] Creating audit log`);
    const newLog = new this.auditLogModel(logData);
    return newLog.save();
  }

  async findAuditLogsByEntity(
    entityType: string,
    entityId: string,
  ): Promise<AuditLogDocument[]> {
    console.log(
      `[EMPLOYEE SERVICE] Finding audit logs for: ${entityType}/${entityId}`,
    );
    return this.auditLogModel
      .find({ entityType, entityId })
      .sort({ timestamp: -1 })
      .exec();
  }
}
