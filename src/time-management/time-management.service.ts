import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AttendanceCorrectionRequest, AttendanceCorrectionRequestDocument } from './schemas/attendance-correction-request.schema';
import { AttendanceRecord, AttendanceRecordDocument } from './schemas/attendance-record.schema';
import { IntegrationSyncLog, IntegrationSyncLogDocument } from './schemas/integration-sync-log.schema';
import { OvertimeRule, OvertimeRuleDocument } from './schemas/overtime-rule.schema';
import { PermissionRule, PermissionRuleDocument } from './schemas/permission-rule.schema';
import { RestDayConfig, RestDayConfigDocument } from './schemas/rest-day-config.schema';
import { SchedulingRule, SchedulingRuleDocument } from './schemas/scheduling-rule.schema';
import { ShiftAssignment, ShiftAssignmentDocument } from './schemas/shift-assignment.schema';
import { ShiftType, ShiftTypeDocument } from './schemas/shift-type.schema';
import { TimeExceptionRequest, TimeExceptionRequestDocument } from './schemas/time-exception-request.schema';

@Injectable()
export class TimeManagementService {
  constructor(
    @InjectModel(AttendanceCorrectionRequest.name) private attendanceCorrectionRequestModel: Model<AttendanceCorrectionRequestDocument>,
    @InjectModel(AttendanceRecord.name) private attendanceRecordModel: Model<AttendanceRecordDocument>,
    @InjectModel(IntegrationSyncLog.name) private integrationSyncLogModel: Model<IntegrationSyncLogDocument>,
    @InjectModel(OvertimeRule.name) private overtimeRuleModel: Model<OvertimeRuleDocument>,
    @InjectModel(PermissionRule.name) private permissionRuleModel: Model<PermissionRuleDocument>,
    @InjectModel(RestDayConfig.name) private restDayConfigModel: Model<RestDayConfigDocument>,
    @InjectModel(SchedulingRule.name) private schedulingRuleModel: Model<SchedulingRuleDocument>,
    @InjectModel(ShiftAssignment.name) private shiftAssignmentModel: Model<ShiftAssignmentDocument>,
    @InjectModel(ShiftType.name) private shiftTypeModel: Model<ShiftTypeDocument>,
    @InjectModel(TimeExceptionRequest.name) private timeExceptionRequestModel: Model<TimeExceptionRequestDocument>
  ) {}

  // ==========================
  // Create Attendance Record
  // ==========================
  async createAttendanceRecord(createDto: any): Promise<AttendanceRecord> {
    const createdRecord = new this.attendanceRecordModel(createDto);
    return createdRecord.save();
  }

  // ==========================
  // Find Attendance Records by Employee
  // ==========================
  async findAttendanceRecordsByEmployee(employeeId: string): Promise<AttendanceRecord[]> {
    return this.attendanceRecordModel.find({ employeeId }).exec();
  }

  // ==========================
  // Create Attendance Correction Request
  // ==========================
  async createAttendanceCorrectionRequest(createDto: any): Promise<AttendanceCorrectionRequest> {
    const createdRequest = new this.attendanceCorrectionRequestModel(createDto);
    return createdRequest.save();
  }

  // ==========================
  // Update Attendance Correction Request
  // ==========================
  async updateAttendanceCorrectionRequest(id: string, updateDto: any): Promise<AttendanceCorrectionRequest> {
    const updatedRequest = await this.attendanceCorrectionRequestModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!updatedRequest) {
      throw new NotFoundException('Attendance Correction Request not found');
    }
    return updatedRequest;
  }

  // ==========================
  // Sync Log Creation (e.g., for successful or failed sync to other subsystems)
  // ==========================
  async createIntegrationSyncLog(createDto: any): Promise<IntegrationSyncLog> {
    const createdLog = new this.integrationSyncLogModel(createDto);
    return createdLog.save();
  }

  // ==========================
  // Find Sync Logs
  // ==========================
  async findIntegrationSyncLogs(): Promise<IntegrationSyncLog[]> {
    return this.integrationSyncLogModel.find().exec();
  }

  // ==========================
  // Create Time Exception Request (Overtime/Permission)
  // ==========================
  async createTimeExceptionRequest(createDto: any): Promise<TimeExceptionRequest> {
    const createdRequest = new this.timeExceptionRequestModel(createDto);
    return createdRequest.save();
  }

  // ==========================
  // Find Time Exception Requests
  // ==========================
  async findTimeExceptionRequestsByEmployee(employeeId: string): Promise<TimeExceptionRequest[]> {
    return this.timeExceptionRequestModel.find({ employeeId }).exec();
  }

  // ==========================
  // Create Overtime Rule
  // ==========================
  async createOvertimeRule(createDto: any): Promise<OvertimeRule> {
    const createdRule = new this.overtimeRuleModel(createDto);
    return createdRule.save();
  }

  // ==========================
  // Update Overtime Rule
  // ==========================
  async updateOvertimeRule(id: string, updateDto: any): Promise<OvertimeRule> {
    const updatedRule = await this.overtimeRuleModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!updatedRule) {
      throw new NotFoundException('Overtime Rule not found');
    }
    return updatedRule;
  }
  

  // ==========================
  // Find Rest Day Config for Employee
  // ==========================
  async findRestDayConfigForEmployee(employeeId: string): Promise<RestDayConfig | null> {
    return this.restDayConfigModel.findOne({ employeeId }).exec();
  }

  // ==========================
  // Create Shift Assignment
  // ==========================
  async createShiftAssignment(createDto: any): Promise<ShiftAssignment> {
    const createdAssignment = new this.shiftAssignmentModel(createDto);
    return createdAssignment.save();
  }

  // ==========================
  // Update Shift Assignment
  // ==========================
  async updateShiftAssignment(id: string, updateDto: any): Promise<ShiftAssignment> {
    const updatedAssignment = await this.shiftAssignmentModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!updatedAssignment) {
      throw new NotFoundException('Shift Assignment not found');
    }
    return updatedAssignment;
  }
  
}
