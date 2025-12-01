import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// Import schemas
import { NotificationLog } from '../models/notification-log.schema';
import { AttendanceRecord } from '../models/attendance-record.schema';
import { TimeException } from '../models/time-exception.schema';
// Import enums
import { TimeExceptionType } from '../models/enums';
// Import DTOs
import {
  SendNotificationDto,
  GetNotificationLogsByEmployeeDto,
  SyncAttendanceWithPayrollDto,
  SyncLeaveWithPayrollDto,
  SynchronizeAttendanceAndPayrollDto,
} from '../dtos/notification-and-sync.dtos';

@Injectable()
export class NotificationService {
  private readonly auditLogs: Array<{
    entity: string;
    changeSet: Record<string, unknown>;
    actorId?: string;
    timestamp: Date;
  }> = [];

  constructor(
    @InjectModel(NotificationLog.name)
    private notificationLogModel: Model<NotificationLog>,
    @InjectModel(AttendanceRecord.name)
    private attendanceRecordModel: Model<AttendanceRecord>,
    @InjectModel(TimeException.name)
    private timeExceptionModel: Model<TimeException>,
  ) {}

  // ===== NOTIFICATIONS =====

  async sendNotification(
    sendNotificationDto: SendNotificationDto,
    currentUserId: string,
  ) {
    const notification = new this.notificationLogModel({
      to: sendNotificationDto.to,
      type: sendNotificationDto.type,
      message: sendNotificationDto.message ?? '',
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    await notification.save();
    await this.logTimeManagementChange(
      'NOTIFICATION_SENT',
      {
        to: sendNotificationDto.to,
        type: sendNotificationDto.type,
      },
      currentUserId,
    );
    return notification;
  }

  async getNotificationLogsByEmployee(
    getNotificationLogsByEmployeeDto: GetNotificationLogsByEmployeeDto,
    currentUserId: string,
  ) {
    return this.notificationLogModel
      .find({ to: getNotificationLogsByEmployeeDto.employeeId })
      .exec();
  }

  // ===== PAYROLL SYNCHRONIZATION =====
  // These methods return actual data for Payroll/Leaves subsystems to consume

  async syncAttendanceWithPayroll(
    syncAttendanceWithPayrollDto: SyncAttendanceWithPayrollDto,
    currentUserId: string,
  ) {
    const { employeeId, startDate, endDate } = syncAttendanceWithPayrollDto;
    const query: any = { employeeId };

    if (startDate && endDate) {
      // Convert DTO dates to UTC for proper comparison with MongoDB's UTC createdAt
      const startDateUTC = this.convertDateToUTCStart(startDate);
      const endDateUTC = this.convertDateToUTCEnd(endDate);
      query.createdAt = { $gte: startDateUTC, $lte: endDateUTC };
    }

    const attendance = await this.attendanceRecordModel
      .find(query)
      .populate('employeeId', 'name email employeeId')
      .exec();

    await this.logTimeManagementChange(
      'PAYROLL_SYNC_ATTENDANCE',
      {
        employeeId,
        records: attendance.length,
        startDate,
        endDate,
      },
      currentUserId,
    );

    // Return actual data formatted for Payroll consumption
    return {
      employeeId,
      startDate,
      endDate,
      records: attendance.map((record: any) => ({
        attendanceRecordId: record._id,
        employeeId: record.employeeId?._id || record.employeeId,
        date: record.createdAt || record.date,
        punches: record.punches,
        totalWorkMinutes: record.totalWorkMinutes,
        totalWorkHours: Math.round((record.totalWorkMinutes / 60) * 100) / 100,
        hasMissedPunch: record.hasMissedPunch,
        finalisedForPayroll: record.finalisedForPayroll,
      })),
      summary: {
        totalRecords: attendance.length,
        totalWorkMinutes: attendance.reduce(
          (sum, r) => sum + (r.totalWorkMinutes || 0),
          0,
        ),
        totalWorkHours:
          Math.round(
            (attendance.reduce((sum, r) => sum + (r.totalWorkMinutes || 0), 0) /
              60) *
              100,
          ) / 100,
      },
    };
  }

  async syncLeaveWithPayroll(
    syncLeaveWithPayrollDto: SyncLeaveWithPayrollDto,
    currentUserId: string,
  ) {
    const { employeeId, startDate, endDate } = syncLeaveWithPayrollDto;

    // This is a placeholder - actual leave data should come from Leaves subsystem
    // Time Management only provides attendance data that might be related to leaves
    await this.logTimeManagementChange(
      'PAYROLL_SYNC_LEAVE',
      {
        employeeId,
        startDate,
        endDate,
      },
      currentUserId,
    );

    return {
      employeeId,
      startDate,
      endDate,
      message:
        'Leave data should be retrieved from Leaves subsystem. This endpoint provides attendance context only.',
      attendanceContext: {
        // Return attendance records that might overlap with leave periods
        note: 'Use attendance records to validate leave periods',
      },
    };
  }

  async synchronizeAttendanceAndPayroll(
    synchronizeAttendanceAndPayrollDto: SynchronizeAttendanceAndPayrollDto,
    currentUserId: string,
  ) {
    const { employeeId, startDate, endDate } =
      synchronizeAttendanceAndPayrollDto;
    const query: any = { employeeId };

    if (startDate && endDate) {
      // Convert DTO dates to UTC for proper comparison with MongoDB's UTC createdAt
      const startDateUTC = this.convertDateToUTCStart(startDate);
      const endDateUTC = this.convertDateToUTCEnd(endDate);
      query.createdAt = { $gte: startDateUTC, $lte: endDateUTC };
    }

    const attendance = await this.attendanceRecordModel
      .find(query)
      .populate('employeeId', 'name email employeeId')
      .exec();

    await this.logTimeManagementChange(
      'PAYROLL_SYNC_FULL',
      {
        employeeId,
        attendanceCount: attendance.length,
        startDate,
        endDate,
      },
      currentUserId,
    );

    // Return combined data for Payroll consumption
    return {
      employeeId,
      startDate,
      endDate,
      attendance: {
        records: attendance.map((record: any) => ({
          attendanceRecordId: record._id,
          employeeId: record.employeeId?._id || record.employeeId,
          date: record.createdAt || record.date,
          punches: record.punches,
          totalWorkMinutes: record.totalWorkMinutes,
          totalWorkHours:
            Math.round((record.totalWorkMinutes / 60) * 100) / 100,
          hasMissedPunch: record.hasMissedPunch,
          finalisedForPayroll: record.finalisedForPayroll,
        })),
        summary: {
          totalRecords: attendance.length,
          totalWorkMinutes: attendance.reduce(
            (sum, r) => sum + (r.totalWorkMinutes || 0),
            0,
          ),
          totalWorkHours:
            Math.round(
              (attendance.reduce(
                (sum, r) => sum + (r.totalWorkMinutes || 0),
                0,
              ) /
                60) *
                100,
            ) / 100,
        },
      },
      leave: {
        message: 'Leave data should be retrieved from Leaves subsystem',
        note: 'Use Leaves API to get leave records for this employee',
      },
    };
  }

  // GET endpoints for Payroll/Leaves to consume data
  async getAttendanceDataForSync(
    employeeId: string,
    startDate?: Date,
    endDate?: Date,
    currentUserId?: string,
  ) {
    const query: any = { employeeId };

    if (startDate && endDate) {
      // Convert DTO dates to UTC for proper comparison with MongoDB's UTC createdAt
      const startDateUTC = this.convertDateToUTCStart(startDate);
      const endDateUTC = this.convertDateToUTCEnd(endDate);
      query.createdAt = { $gte: startDateUTC, $lte: endDateUTC };
    }

    const attendance = await this.attendanceRecordModel
      .find(query)
      .populate('employeeId', 'name email employeeId')
      .exec();

    return {
      employeeId,
      startDate,
      endDate,
      records: attendance.map((record: any) => ({
        attendanceRecordId: record._id,
        employeeId: record.employeeId?._id || record.employeeId,
        date: record.createdAt || record.date,
        punches: record.punches,
        totalWorkMinutes: record.totalWorkMinutes,
        totalWorkHours: Math.round((record.totalWorkMinutes / 60) * 100) / 100,
        hasMissedPunch: record.hasMissedPunch,
        finalisedForPayroll: record.finalisedForPayroll,
      })),
      summary: {
        totalRecords: attendance.length,
        totalWorkMinutes: attendance.reduce(
          (sum, r) => sum + (r.totalWorkMinutes || 0),
          0,
        ),
        totalWorkHours:
          Math.round(
            (attendance.reduce((sum, r) => sum + (r.totalWorkMinutes || 0), 0) /
              60) *
              100,
          ) / 100,
      },
    };
  }

  async getOvertimeDataForSync(
    employeeId: string,
    startDate?: Date,
    endDate?: Date,
    currentUserId?: string,
  ) {
    const query: any = {
      employeeId,
      type: TimeExceptionType.OVERTIME_REQUEST,
    };

    if (startDate && endDate) {
      // Convert DTO dates to UTC for proper comparison with MongoDB's UTC createdAt
      const startDateUTC = this.convertDateToUTCStart(startDate);
      const endDateUTC = this.convertDateToUTCEnd(endDate);
      query.createdAt = { $gte: startDateUTC, $lte: endDateUTC };
    }

    const overtimeExceptions = await this.timeExceptionModel
      .find(query)
      .populate('employeeId', 'name email employeeId')
      .populate('attendanceRecordId')
      .exec();

    // Calculate overtime hours from attendance records
    const overtimeData = overtimeExceptions.map((exception: any) => {
      const record = exception.attendanceRecordId as any;
      const standardMinutes = 480; // 8 hours
      const overtimeMinutes =
        record && record.totalWorkMinutes
          ? Math.max(0, record.totalWorkMinutes - standardMinutes)
          : 0;

      return {
        exceptionId: exception._id,
        employeeId: exception.employeeId?._id || exception.employeeId,
        attendanceRecordId:
          exception.attendanceRecordId?._id || exception.attendanceRecordId,
        date: exception.createdAt || record?.createdAt,
        overtimeMinutes,
        overtimeHours: Math.round((overtimeMinutes / 60) * 100) / 100,
        status: exception.status,
        reason: exception.reason,
      };
    });

    return {
      employeeId,
      startDate,
      endDate,
      records: overtimeData,
      summary: {
        totalRecords: overtimeData.length,
        totalOvertimeMinutes: overtimeData.reduce(
          (sum, r) => sum + r.overtimeMinutes,
          0,
        ),
        totalOvertimeHours:
          Math.round(
            (overtimeData.reduce((sum, r) => sum + r.overtimeMinutes, 0) / 60) *
              100,
          ) / 100,
      },
    };
  }

  // ===== US9: ATTENDANCE-TO-PAYROLL SYNC =====
  // BR-TM-22: All time management data must sync daily with payroll, benefits, and leave modules

  /**
   * Run daily batch sync for all employees
   * BR-TM-22: Sync all time management data daily
   */
  async runDailyPayrollSync(
    syncDate: Date,
    currentUserId: string,
  ) {
    const startOfDay = this.convertDateToUTCStart(syncDate);
    const endOfDay = this.convertDateToUTCEnd(syncDate);
    
    // Get all attendance records for the day that are not yet finalized
    const unfinalizedRecords = await this.attendanceRecordModel
      .find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        finalisedForPayroll: { $ne: true },
      })
      .populate('employeeId', 'firstName lastName email employeeNumber')
      .exec();
    
    // Get all approved overtime exceptions for the day
    const overtimeExceptions = await this.timeExceptionModel
      .find({
        type: TimeExceptionType.OVERTIME_REQUEST,
        status: 'APPROVED',
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      })
      .populate('employeeId', 'firstName lastName email')
      .populate('attendanceRecordId')
      .exec();
    
    // Get all other exceptions (lateness, early leave, etc.)
    const otherExceptions = await this.timeExceptionModel
      .find({
        type: { $ne: TimeExceptionType.OVERTIME_REQUEST },
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      })
      .populate('employeeId', 'firstName lastName email')
      .exec();
    
    await this.logTimeManagementChange(
      'DAILY_PAYROLL_SYNC_RUN',
      {
        syncDate,
        attendanceRecords: unfinalizedRecords.length,
        overtimeExceptions: overtimeExceptions.length,
        otherExceptions: otherExceptions.length,
      },
      currentUserId,
    );
    
    return {
      syncDate,
      syncedAt: new Date(),
      attendance: {
        count: unfinalizedRecords.length,
        records: unfinalizedRecords.map((r: any) => ({
          recordId: r._id,
          employeeId: r.employeeId?._id || r.employeeId,
          employeeName: r.employeeId ? `${r.employeeId.firstName || ''} ${r.employeeId.lastName || ''}`.trim() : 'Unknown',
          date: r.createdAt,
          totalWorkMinutes: r.totalWorkMinutes,
          totalWorkHours: Math.round((r.totalWorkMinutes / 60) * 100) / 100,
          hasMissedPunch: r.hasMissedPunch,
          finalisedForPayroll: r.finalisedForPayroll,
        })),
      },
      overtime: {
        count: overtimeExceptions.length,
        records: overtimeExceptions.map((e: any) => ({
          exceptionId: e._id,
          employeeId: e.employeeId?._id || e.employeeId,
          status: e.status,
          attendanceRecordId: e.attendanceRecordId?._id || e.attendanceRecordId,
        })),
      },
      exceptions: {
        count: otherExceptions.length,
        byType: this.groupExceptionsByType(otherExceptions),
      },
      summary: {
        totalAttendanceMinutes: unfinalizedRecords.reduce((sum, r) => sum + (r.totalWorkMinutes || 0), 0),
        totalAttendanceHours: Math.round((unfinalizedRecords.reduce((sum, r) => sum + (r.totalWorkMinutes || 0), 0) / 60) * 100) / 100,
        employeesWithMissedPunches: unfinalizedRecords.filter((r: any) => r.hasMissedPunch).length,
      },
    };
  }

  /**
   * Helper to group exceptions by type
   */
  private groupExceptionsByType(exceptions: any[]) {
    const grouped: Record<string, any[]> = {};
    exceptions.forEach((e: any) => {
      const type = e.type || 'UNKNOWN';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push({
        exceptionId: e._id,
        employeeId: e.employeeId?._id || e.employeeId,
        status: e.status,
      });
    });
    return grouped;
  }

  /**
   * Get all pending attendance data ready for payroll sync
   * BR-TM-22: Batch retrieval for payroll processing
   */
  async getPendingPayrollSyncData(
    filters: { startDate?: Date; endDate?: Date; departmentId?: string },
    currentUserId: string,
  ) {
    const query: any = {
      finalisedForPayroll: { $ne: true },
    };
    
    if (filters.startDate && filters.endDate) {
      query.createdAt = {
        $gte: this.convertDateToUTCStart(filters.startDate),
        $lte: this.convertDateToUTCEnd(filters.endDate),
      };
    }
    
    const pendingRecords = await this.attendanceRecordModel
      .find(query)
      .populate('employeeId', 'firstName lastName email employeeNumber departmentId')
      .sort({ createdAt: -1 })
      .exec();
    
    // Filter by department if specified
    let filteredRecords = pendingRecords;
    if (filters.departmentId) {
      filteredRecords = pendingRecords.filter((r: any) => 
        r.employeeId?.departmentId?.toString() === filters.departmentId
      );
    }
    
    return {
      filters,
      count: filteredRecords.length,
      records: filteredRecords.map((r: any) => ({
        recordId: r._id,
        employeeId: r.employeeId?._id || r.employeeId,
        employeeName: r.employeeId ? `${r.employeeId.firstName || ''} ${r.employeeId.lastName || ''}`.trim() : 'Unknown',
        date: r.createdAt,
        totalWorkMinutes: r.totalWorkMinutes,
        totalWorkHours: Math.round((r.totalWorkMinutes / 60) * 100) / 100,
        hasMissedPunch: r.hasMissedPunch,
        punchCount: r.punches?.length || 0,
      })),
      summary: {
        totalMinutes: filteredRecords.reduce((sum, r) => sum + (r.totalWorkMinutes || 0), 0),
        totalHours: Math.round((filteredRecords.reduce((sum, r) => sum + (r.totalWorkMinutes || 0), 0) / 60) * 100) / 100,
        recordsWithMissedPunches: filteredRecords.filter((r: any) => r.hasMissedPunch).length,
      },
    };
  }

  /**
   * Mark attendance records as finalized for payroll
   * BR-TM-22: Track which records have been synced
   */
  async finalizeRecordsForPayroll(
    recordIds: string[],
    currentUserId: string,
  ) {
    const updateResult = await this.attendanceRecordModel.updateMany(
      { _id: { $in: recordIds } },
      {
        finalisedForPayroll: true,
        updatedBy: currentUserId,
      },
    );
    
    await this.logTimeManagementChange(
      'RECORDS_FINALIZED_FOR_PAYROLL',
      {
        recordIds,
        modifiedCount: updateResult.modifiedCount,
      },
      currentUserId,
    );
    
    return {
      success: true,
      recordsFinalized: updateResult.modifiedCount,
      recordIds,
      finalizedAt: new Date(),
    };
  }

  /**
   * Validate data before payroll sync
   * BR-TM-22: Ensure data consistency
   */
  async validateDataForPayrollSync(
    filters: { startDate: Date; endDate: Date },
    currentUserId: string,
  ) {
    const startDateUTC = this.convertDateToUTCStart(filters.startDate);
    const endDateUTC = this.convertDateToUTCEnd(filters.endDate);
    
    // Get all records in the date range
    const allRecords = await this.attendanceRecordModel
      .find({
        createdAt: { $gte: startDateUTC, $lte: endDateUTC },
      })
      .populate('employeeId', 'firstName lastName email')
      .exec();
    
    // Find records with issues
    const recordsWithMissedPunches = allRecords.filter((r: any) => r.hasMissedPunch);
    const recordsWithZeroMinutes = allRecords.filter((r: any) => !r.totalWorkMinutes || r.totalWorkMinutes === 0);
    const recordsWithOddPunches = allRecords.filter((r: any) => r.punches && r.punches.length % 2 !== 0);
    
    // Get pending exceptions in the date range
    const pendingExceptions = await this.timeExceptionModel
      .find({
        createdAt: { $gte: startDateUTC, $lte: endDateUTC },
        status: { $in: ['OPEN', 'PENDING'] },
      })
      .populate('employeeId', 'firstName lastName email')
      .exec();
    
    // Get pending correction requests
    const pendingCorrections = await this.attendanceRecordModel.db
      .collection('attendancecorrectionrequests')
      .find({
        createdAt: { $gte: startDateUTC, $lte: endDateUTC },
        status: { $in: ['SUBMITTED', 'IN_REVIEW'] },
      })
      .toArray();
    
    const validationIssues: any[] = [];
    
    if (recordsWithMissedPunches.length > 0) {
      validationIssues.push({
        type: 'MISSED_PUNCHES',
        severity: 'WARNING',
        count: recordsWithMissedPunches.length,
        message: `${recordsWithMissedPunches.length} record(s) have missed punches`,
        recordIds: recordsWithMissedPunches.map((r: any) => r._id),
      });
    }
    
    if (recordsWithZeroMinutes.length > 0) {
      validationIssues.push({
        type: 'ZERO_WORK_MINUTES',
        severity: 'WARNING',
        count: recordsWithZeroMinutes.length,
        message: `${recordsWithZeroMinutes.length} record(s) have zero work minutes`,
        recordIds: recordsWithZeroMinutes.map((r: any) => r._id),
      });
    }
    
    if (pendingExceptions.length > 0) {
      validationIssues.push({
        type: 'PENDING_EXCEPTIONS',
        severity: 'ERROR',
        count: pendingExceptions.length,
        message: `${pendingExceptions.length} unresolved exception(s) need attention before sync`,
        exceptionIds: pendingExceptions.map((e: any) => e._id),
      });
    }
    
    if (pendingCorrections.length > 0) {
      validationIssues.push({
        type: 'PENDING_CORRECTIONS',
        severity: 'ERROR',
        count: pendingCorrections.length,
        message: `${pendingCorrections.length} pending correction request(s) need resolution`,
        correctionIds: pendingCorrections.map((c: any) => c._id),
      });
    }
    
    const isValid = validationIssues.filter(i => i.severity === 'ERROR').length === 0;
    
    await this.logTimeManagementChange(
      'PAYROLL_SYNC_VALIDATION',
      {
        startDate: filters.startDate,
        endDate: filters.endDate,
        isValid,
        issuesCount: validationIssues.length,
      },
      currentUserId,
    );
    
    return {
      startDate: filters.startDate,
      endDate: filters.endDate,
      isValid,
      validatedAt: new Date(),
      totalRecords: allRecords.length,
      issues: validationIssues,
      summary: {
        errorCount: validationIssues.filter(i => i.severity === 'ERROR').length,
        warningCount: validationIssues.filter(i => i.severity === 'WARNING').length,
        canProceedWithSync: isValid,
      },
    };
  }

  /**
   * Get exception data for payroll sync
   * BR-TM-22: Include exception/penalty data in sync
   */
  async getExceptionDataForPayrollSync(
    filters: { startDate?: Date; endDate?: Date; employeeId?: string },
    currentUserId: string,
  ) {
    const query: any = {};
    
    if (filters.employeeId) {
      query.employeeId = filters.employeeId;
    }
    
    if (filters.startDate && filters.endDate) {
      query.createdAt = {
        $gte: this.convertDateToUTCStart(filters.startDate),
        $lte: this.convertDateToUTCEnd(filters.endDate),
      };
    }
    
    const exceptions = await this.timeExceptionModel
      .find(query)
      .populate('employeeId', 'firstName lastName email employeeNumber')
      .populate('attendanceRecordId')
      .sort({ createdAt: -1 })
      .exec();
    
    // Group by type
    const byType: Record<string, any[]> = {};
    exceptions.forEach((e: any) => {
      const type = e.type || 'UNKNOWN';
      if (!byType[type]) byType[type] = [];
      byType[type].push({
        exceptionId: e._id,
        employeeId: e.employeeId?._id || e.employeeId,
        employeeName: e.employeeId ? `${e.employeeId.firstName || ''} ${e.employeeId.lastName || ''}`.trim() : 'Unknown',
        type: e.type,
        status: e.status,
        reason: e.reason,
        date: e.createdAt,
        attendanceRecordId: e.attendanceRecordId?._id || e.attendanceRecordId,
      });
    });
    
    // Group by status
    const byStatus: Record<string, number> = {
      OPEN: 0,
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      ESCALATED: 0,
      RESOLVED: 0,
    };
    exceptions.forEach((e: any) => {
      const status = e.status || 'OPEN';
      if (byStatus.hasOwnProperty(status)) {
        byStatus[status]++;
      }
    });
    
    return {
      filters,
      totalCount: exceptions.length,
      byType: Object.entries(byType).map(([type, records]) => ({
        type,
        count: records.length,
        records,
      })),
      byStatus,
      payrollRelevant: {
        approvedOvertime: (byType['OVERTIME_REQUEST'] || []).filter((e: any) => e.status === 'APPROVED'),
        latenessRecords: byType['LATE'] || [],
        earlyLeaveRecords: byType['EARLY_LEAVE'] || [],
      },
    };
  }

  /**
   * Get sync status/history
   * BR-TM-22: Track sync operations
   */
  async getPayrollSyncHistory(
    filters: { startDate?: Date; endDate?: Date; limit?: number },
    currentUserId: string,
  ) {
    // Get from audit logs (stored in memory for this implementation)
    const syncLogs = this.auditLogs.filter(log => 
      log.entity.includes('PAYROLL_SYNC') || 
      log.entity.includes('RECORDS_FINALIZED') ||
      log.entity.includes('DAILY_PAYROLL_SYNC')
    );
    
    // Filter by date if provided
    let filteredLogs = syncLogs;
    if (filters.startDate && filters.endDate) {
      const start = this.convertDateToUTCStart(filters.startDate);
      const end = this.convertDateToUTCEnd(filters.endDate);
      filteredLogs = syncLogs.filter(log => 
        log.timestamp >= start && log.timestamp <= end
      );
    }
    
    // Sort by most recent and limit
    const sortedLogs = filteredLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, filters.limit || 50);
    
    return {
      count: sortedLogs.length,
      syncHistory: sortedLogs.map(log => ({
        operation: log.entity,
        details: log.changeSet,
        performedBy: log.actorId,
        timestamp: log.timestamp,
      })),
    };
  }

  /**
   * Get comprehensive payroll data package
   * BR-TM-22: Single endpoint for all payroll-relevant data
   */
  async getComprehensivePayrollData(
    filters: { startDate: Date; endDate: Date; departmentId?: string },
    currentUserId: string,
  ) {
    const startDateUTC = this.convertDateToUTCStart(filters.startDate);
    const endDateUTC = this.convertDateToUTCEnd(filters.endDate);
    
    // Get attendance data
    const attendanceQuery: any = {
      createdAt: { $gte: startDateUTC, $lte: endDateUTC },
    };
    
    const attendanceRecords = await this.attendanceRecordModel
      .find(attendanceQuery)
      .populate('employeeId', 'firstName lastName email employeeNumber departmentId')
      .exec();
    
    // Filter by department if specified
    let filteredAttendance = attendanceRecords;
    if (filters.departmentId) {
      filteredAttendance = attendanceRecords.filter((r: any) => 
        r.employeeId?.departmentId?.toString() === filters.departmentId
      );
    }
    
    // Get overtime data
    const overtimeExceptions = await this.timeExceptionModel
      .find({
        type: TimeExceptionType.OVERTIME_REQUEST,
        status: 'APPROVED',
        createdAt: { $gte: startDateUTC, $lte: endDateUTC },
      })
      .populate('employeeId', 'firstName lastName departmentId')
      .populate('attendanceRecordId')
      .exec();
    
    // Get lateness data
    const latenessExceptions = await this.timeExceptionModel
      .find({
        type: 'LATE',
        createdAt: { $gte: startDateUTC, $lte: endDateUTC },
      })
      .populate('employeeId', 'firstName lastName departmentId')
      .exec();
    
    // Calculate summaries per employee
    const employeeSummaries: Record<string, any> = {};
    
    filteredAttendance.forEach((r: any) => {
      const empId = r.employeeId?._id?.toString() || r.employeeId?.toString() || 'unknown';
      if (!employeeSummaries[empId]) {
        employeeSummaries[empId] = {
          employeeId: empId,
          employeeName: r.employeeId ? `${r.employeeId.firstName || ''} ${r.employeeId.lastName || ''}`.trim() : 'Unknown',
          totalWorkMinutes: 0,
          totalWorkHours: 0,
          daysWorked: 0,
          missedPunches: 0,
          overtimeMinutes: 0,
          latenessCount: 0,
        };
      }
      employeeSummaries[empId].totalWorkMinutes += r.totalWorkMinutes || 0;
      employeeSummaries[empId].daysWorked++;
      if (r.hasMissedPunch) employeeSummaries[empId].missedPunches++;
    });
    
    // Add overtime data
    overtimeExceptions.forEach((e: any) => {
      const empId = e.employeeId?._id?.toString() || e.employeeId?.toString();
      if (empId && employeeSummaries[empId]) {
        const record = e.attendanceRecordId as any;
        const overtimeMinutes = record?.totalWorkMinutes ? Math.max(0, record.totalWorkMinutes - 480) : 0;
        employeeSummaries[empId].overtimeMinutes += overtimeMinutes;
      }
    });
    
    // Add lateness data
    latenessExceptions.forEach((e: any) => {
      const empId = e.employeeId?._id?.toString() || e.employeeId?.toString();
      if (empId && employeeSummaries[empId]) {
        employeeSummaries[empId].latenessCount++;
      }
    });
    
    // Convert minutes to hours
    Object.values(employeeSummaries).forEach((summary: any) => {
      summary.totalWorkHours = Math.round((summary.totalWorkMinutes / 60) * 100) / 100;
      summary.overtimeHours = Math.round((summary.overtimeMinutes / 60) * 100) / 100;
    });
    
    await this.logTimeManagementChange(
      'COMPREHENSIVE_PAYROLL_DATA_RETRIEVED',
      {
        startDate: filters.startDate,
        endDate: filters.endDate,
        departmentId: filters.departmentId,
        employeeCount: Object.keys(employeeSummaries).length,
        attendanceRecords: filteredAttendance.length,
      },
      currentUserId,
    );
    
    return {
      period: {
        startDate: filters.startDate,
        endDate: filters.endDate,
      },
      departmentId: filters.departmentId || 'ALL',
      generatedAt: new Date(),
      employeeSummaries: Object.values(employeeSummaries),
      totals: {
        totalEmployees: Object.keys(employeeSummaries).length,
        totalWorkMinutes: Object.values(employeeSummaries).reduce((sum: number, e: any) => sum + e.totalWorkMinutes, 0),
        totalWorkHours: Math.round((Object.values(employeeSummaries).reduce((sum: number, e: any) => sum + e.totalWorkMinutes, 0) / 60) * 100) / 100,
        totalOvertimeMinutes: Object.values(employeeSummaries).reduce((sum: number, e: any) => sum + e.overtimeMinutes, 0),
        totalOvertimeHours: Math.round((Object.values(employeeSummaries).reduce((sum: number, e: any) => sum + e.overtimeMinutes, 0) / 60) * 100) / 100,
        totalLatenessCount: Object.values(employeeSummaries).reduce((sum: number, e: any) => sum + e.latenessCount, 0),
        totalMissedPunches: Object.values(employeeSummaries).reduce((sum: number, e: any) => sum + e.missedPunches, 0),
      },
    };
  }

  // ===== US4: SHIFT EXPIRY NOTIFICATIONS =====
  // BR-TM-05: Shift schedules must be assignable by Department, Position, or Individual
  // This section handles notifications when shift assignments are nearing expiry

  /**
   * Send shift expiry notification to HR Admin
   * Triggered when a shift assignment is nearing its end date
   */
  async sendShiftExpiryNotification(
    recipientId: string,
    shiftAssignmentId: string,
    employeeId: string,
    endDate: Date,
    daysRemaining: number,
    currentUserId: string,
  ) {
    const message = `Shift assignment ${shiftAssignmentId} for employee ${employeeId} is expiring in ${daysRemaining} days (${endDate.toISOString().split('T')[0]}). Please renew or reassign.`;
    
    const notification = new this.notificationLogModel({
      to: recipientId,
      type: 'SHIFT_EXPIRY_ALERT',
      message,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    
    await notification.save();
    
    await this.logTimeManagementChange(
      'SHIFT_EXPIRY_NOTIFICATION_SENT',
      {
        recipientId,
        shiftAssignmentId,
        employeeId,
        endDate,
        daysRemaining,
      },
      currentUserId,
    );
    
    return notification;
  }

  /**
   * Send bulk shift expiry notifications to HR Admins
   * Used when running batch expiry checks
   */
  async sendBulkShiftExpiryNotifications(
    hrAdminIds: string[],
    expiringAssignments: Array<{
      assignmentId: string;
      employeeId: string;
      employeeName?: string;
      shiftName?: string;
      endDate: Date;
      daysRemaining: number;
    }>,
    currentUserId: string,
  ) {
    const notifications: any[] = [];
    
    for (const hrAdminId of hrAdminIds) {
      // Create summary message for HR Admin
      const message = `${expiringAssignments.length} shift assignment(s) expiring soon:\n` +
        expiringAssignments
          .map(a => `- ${a.employeeName || a.employeeId}: ${a.shiftName || 'Shift'} expires in ${a.daysRemaining} days`)
          .join('\n');
      
      const notification = new this.notificationLogModel({
        to: hrAdminId,
        type: 'SHIFT_EXPIRY_BULK_ALERT',
        message,
        createdBy: currentUserId,
        updatedBy: currentUserId,
      });
      
      await notification.save();
      notifications.push(notification);
    }
    
    await this.logTimeManagementChange(
      'SHIFT_EXPIRY_BULK_NOTIFICATIONS_SENT',
      {
        hrAdminCount: hrAdminIds.length,
        expiringCount: expiringAssignments.length,
        assignmentIds: expiringAssignments.map(a => a.assignmentId),
      },
      currentUserId,
    );
    
    return {
      notificationsSent: notifications.length,
      notifications,
    };
  }

  /**
   * Get shift expiry notifications for an HR Admin
   */
  async getShiftExpiryNotifications(hrAdminId: string, currentUserId: string) {
    const notifications = await this.notificationLogModel
      .find({
        to: hrAdminId,
        type: { $in: ['SHIFT_EXPIRY_ALERT', 'SHIFT_EXPIRY_BULK_ALERT'] },
      })
      .sort({ createdAt: -1 })
      .exec();
    
    return {
      count: notifications.length,
      notifications,
    };
  }

  /**
   * Send renewal confirmation notification
   * Sent when a shift assignment is successfully renewed
   */
  async sendShiftRenewalConfirmation(
    recipientId: string,
    shiftAssignmentId: string,
    newEndDate: Date,
    currentUserId: string,
  ) {
    const message = `Shift assignment ${shiftAssignmentId} has been renewed. New end date: ${newEndDate.toISOString().split('T')[0]}.`;
    
    const notification = new this.notificationLogModel({
      to: recipientId,
      type: 'SHIFT_RENEWAL_CONFIRMATION',
      message,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    
    await notification.save();
    
    await this.logTimeManagementChange(
      'SHIFT_RENEWAL_NOTIFICATION_SENT',
      {
        recipientId,
        shiftAssignmentId,
        newEndDate,
      },
      currentUserId,
    );
    
    return notification;
  }

  /**
   * Send archive notification
   * Sent when a shift assignment is archived/expired
   */
  async sendShiftArchiveNotification(
    recipientId: string,
    shiftAssignmentId: string,
    employeeId: string,
    currentUserId: string,
  ) {
    const message = `Shift assignment ${shiftAssignmentId} for employee ${employeeId} has been archived/expired. Consider creating a new assignment if needed.`;
    
    const notification = new this.notificationLogModel({
      to: recipientId,
      type: 'SHIFT_ARCHIVE_NOTIFICATION',
      message,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    
    await notification.save();
    
    await this.logTimeManagementChange(
      'SHIFT_ARCHIVE_NOTIFICATION_SENT',
      {
        recipientId,
        shiftAssignmentId,
        employeeId,
      },
      currentUserId,
    );
    
    return notification;
  }

  /**
   * Get all shift-related notifications (expiry, renewal, archive)
   */
  async getAllShiftNotifications(hrAdminId: string, currentUserId: string) {
    const notifications = await this.notificationLogModel
      .find({
        to: hrAdminId,
        type: {
          $in: [
            'SHIFT_EXPIRY_ALERT',
            'SHIFT_EXPIRY_BULK_ALERT',
            'SHIFT_RENEWAL_CONFIRMATION',
            'SHIFT_ARCHIVE_NOTIFICATION',
          ],
        },
      })
      .sort({ createdAt: -1 })
      .exec();
    
    // Group by type for better organization
    const grouped = {
      expiryAlerts: notifications.filter(n => 
        n.type === 'SHIFT_EXPIRY_ALERT' || n.type === 'SHIFT_EXPIRY_BULK_ALERT'
      ),
      renewalConfirmations: notifications.filter(n => 
        n.type === 'SHIFT_RENEWAL_CONFIRMATION'
      ),
      archiveNotifications: notifications.filter(n => 
        n.type === 'SHIFT_ARCHIVE_NOTIFICATION'
      ),
    };
    
    return {
      totalCount: notifications.length,
      grouped,
      all: notifications,
    };
  }

  // ===== US8: MISSED PUNCH MANAGEMENT & ALERTS =====
  // BR-TM-14: Missed punches/late sign-ins must be handled via auto-flagging, notifications, or payroll blocking

  /**
   * Send missed punch alert to employee
   * BR-TM-14: Notify employee when a missed punch is detected
   */
  async sendMissedPunchAlertToEmployee(
    employeeId: string,
    attendanceRecordId: string,
    missedPunchType: 'CLOCK_IN' | 'CLOCK_OUT',
    date: Date,
    currentUserId: string,
  ) {
    const message = `Missed ${missedPunchType === 'CLOCK_IN' ? 'clock-in' : 'clock-out'} detected on ${date.toISOString().split('T')[0]}. Please submit a correction request.`;
    
    const notification = new this.notificationLogModel({
      to: employeeId,
      type: 'MISSED_PUNCH_EMPLOYEE_ALERT',
      message,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    
    await notification.save();
    
    await this.logTimeManagementChange(
      'MISSED_PUNCH_EMPLOYEE_ALERT_SENT',
      {
        employeeId,
        attendanceRecordId,
        missedPunchType,
        date,
      },
      currentUserId,
    );
    
    return notification;
  }

  /**
   * Send missed punch alert to manager/line manager
   * BR-TM-14: Notify manager for correction review
   */
  async sendMissedPunchAlertToManager(
    managerId: string,
    employeeId: string,
    employeeName: string,
    attendanceRecordId: string,
    missedPunchType: 'CLOCK_IN' | 'CLOCK_OUT',
    date: Date,
    currentUserId: string,
  ) {
    const message = `Employee ${employeeName} (${employeeId}) has a missed ${missedPunchType === 'CLOCK_IN' ? 'clock-in' : 'clock-out'} on ${date.toISOString().split('T')[0]}. Pending correction review.`;
    
    const notification = new this.notificationLogModel({
      to: managerId,
      type: 'MISSED_PUNCH_MANAGER_ALERT',
      message,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    
    await notification.save();
    
    await this.logTimeManagementChange(
      'MISSED_PUNCH_MANAGER_ALERT_SENT',
      {
        managerId,
        employeeId,
        employeeName,
        attendanceRecordId,
        missedPunchType,
        date,
      },
      currentUserId,
    );
    
    return notification;
  }

  /**
   * Send bulk missed punch alerts
   * BR-TM-14: Efficiently notify multiple employees/managers
   */
  async sendBulkMissedPunchAlerts(
    alerts: Array<{
      employeeId: string;
      managerId?: string;
      employeeName?: string;
      attendanceRecordId: string;
      missedPunchType: 'CLOCK_IN' | 'CLOCK_OUT';
      date: Date;
    }>,
    currentUserId: string,
  ) {
    const notifications: any[] = [];
    
    for (const alert of alerts) {
      // Send to employee
      const employeeNotification = await this.sendMissedPunchAlertToEmployee(
        alert.employeeId,
        alert.attendanceRecordId,
        alert.missedPunchType,
        alert.date,
        currentUserId,
      );
      notifications.push({ type: 'employee', notification: employeeNotification });
      
      // Send to manager if provided
      if (alert.managerId) {
        const managerNotification = await this.sendMissedPunchAlertToManager(
          alert.managerId,
          alert.employeeId,
          alert.employeeName || 'Unknown Employee',
          alert.attendanceRecordId,
          alert.missedPunchType,
          alert.date,
          currentUserId,
        );
        notifications.push({ type: 'manager', notification: managerNotification });
      }
    }
    
    await this.logTimeManagementChange(
      'BULK_MISSED_PUNCH_ALERTS_SENT',
      {
        alertCount: alerts.length,
        notificationsSent: notifications.length,
      },
      currentUserId,
    );
    
    return {
      alertsProcessed: alerts.length,
      notificationsSent: notifications.length,
      notifications,
    };
  }

  /**
   * Get missed punch notifications for an employee
   * BR-TM-14: Employee can view their missed punch alerts
   */
  async getMissedPunchNotificationsByEmployee(employeeId: string, currentUserId: string) {
    const notifications = await this.notificationLogModel
      .find({
        to: employeeId,
        type: 'MISSED_PUNCH_EMPLOYEE_ALERT',
      })
      .sort({ createdAt: -1 })
      .exec();
    
    return {
      count: notifications.length,
      notifications,
    };
  }

  /**
   * Get missed punch notifications for a manager
   * BR-TM-14: Manager can view pending missed punch corrections
   */
  async getMissedPunchNotificationsByManager(managerId: string, currentUserId: string) {
    const notifications = await this.notificationLogModel
      .find({
        to: managerId,
        type: 'MISSED_PUNCH_MANAGER_ALERT',
      })
      .sort({ createdAt: -1 })
      .exec();
    
    return {
      count: notifications.length,
      notifications,
    };
  }

  /**
   * Get all missed punch notifications (for HR Admin)
   * BR-TM-14: HR Admin oversight of missed punch tracking
   */
  async getAllMissedPunchNotifications(
    filters: { startDate?: Date; endDate?: Date },
    currentUserId: string,
  ) {
    const query: any = {
      type: { $in: ['MISSED_PUNCH_EMPLOYEE_ALERT', 'MISSED_PUNCH_MANAGER_ALERT'] },
    };
    
    if (filters.startDate && filters.endDate) {
      query.createdAt = {
        $gte: this.convertDateToUTCStart(filters.startDate),
        $lte: this.convertDateToUTCEnd(filters.endDate),
      };
    }
    
    const notifications = await this.notificationLogModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
    
    // Group by type
    const employeeAlerts = notifications.filter(n => n.type === 'MISSED_PUNCH_EMPLOYEE_ALERT');
    const managerAlerts = notifications.filter(n => n.type === 'MISSED_PUNCH_MANAGER_ALERT');
    
    return {
      total: notifications.length,
      employeeAlerts: {
        count: employeeAlerts.length,
        notifications: employeeAlerts,
      },
      managerAlerts: {
        count: managerAlerts.length,
        notifications: managerAlerts,
      },
    };
  }

  /**
   * Flag missed punch and create time exception with notifications
   * BR-TM-14: Core method combining flagging and notification
   */
  async flagMissedPunchWithNotification(
    attendanceRecordId: string,
    employeeId: string,
    managerId: string,
    employeeName: string,
    missedPunchType: 'CLOCK_IN' | 'CLOCK_OUT',
    currentUserId: string,
  ) {
    // Update attendance record
    const attendanceRecord = await this.attendanceRecordModel.findByIdAndUpdate(
      attendanceRecordId,
      {
        hasMissedPunch: true,
        updatedBy: currentUserId,
      },
      { new: true },
    );
    
    if (!attendanceRecord) {
      throw new Error('Attendance record not found');
    }
    
    // Create time exception
    const timeException = new this.timeExceptionModel({
      employeeId,
      type: TimeExceptionType.MISSED_PUNCH,
      attendanceRecordId,
      assignedTo: managerId,
      status: 'OPEN',
      reason: `Auto-detected missed ${missedPunchType === 'CLOCK_IN' ? 'clock-in' : 'clock-out'}`,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    
    await timeException.save();
    
    // Send notifications
    const recordDate = (attendanceRecord as any).createdAt || new Date();
    const employeeNotification = await this.sendMissedPunchAlertToEmployee(
      employeeId,
      attendanceRecordId,
      missedPunchType,
      recordDate,
      currentUserId,
    );
    
    const managerNotification = await this.sendMissedPunchAlertToManager(
      managerId,
      employeeId,
      employeeName,
      attendanceRecordId,
      missedPunchType,
      recordDate,
      currentUserId,
    );
    
    await this.logTimeManagementChange(
      'MISSED_PUNCH_FLAGGED_WITH_NOTIFICATION',
      {
        attendanceRecordId,
        employeeId,
        managerId,
        missedPunchType,
        timeExceptionId: timeException._id,
      },
      currentUserId,
    );
    
    return {
      attendanceRecord,
      timeException,
      notifications: {
        employee: employeeNotification,
        manager: managerNotification,
      },
    };
  }

  /**
   * Get missed punch statistics/summary
   * BR-TM-14: Reporting on missed punch trends
   */
  async getMissedPunchStatistics(
    filters: { employeeId?: string; startDate?: Date; endDate?: Date },
    currentUserId: string,
  ) {
    const query: any = { hasMissedPunch: true };
    
    if (filters.employeeId) {
      query.employeeId = filters.employeeId;
    }
    
    if (filters.startDate && filters.endDate) {
      query.createdAt = {
        $gte: this.convertDateToUTCStart(filters.startDate),
        $lte: this.convertDateToUTCEnd(filters.endDate),
      };
    }
    
    const missedPunchRecords = await this.attendanceRecordModel
      .find(query)
      .populate('employeeId', 'firstName lastName email')
      .exec();
    
    // Group by employee
    const byEmployee: Record<string, { count: number; records: any[] }> = {};
    missedPunchRecords.forEach((record: any) => {
      const empId = record.employeeId?._id?.toString() || record.employeeId?.toString() || 'unknown';
      if (!byEmployee[empId]) {
        byEmployee[empId] = { count: 0, records: [] };
      }
      byEmployee[empId].count++;
      byEmployee[empId].records.push({
        recordId: record._id,
        date: record.createdAt,
        punchCount: record.punches?.length || 0,
      });
    });
    
    // Get related time exceptions
    const exceptionQuery: any = {
      type: TimeExceptionType.MISSED_PUNCH,
    };
    if (filters.startDate && filters.endDate) {
      exceptionQuery.createdAt = {
        $gte: this.convertDateToUTCStart(filters.startDate),
        $lte: this.convertDateToUTCEnd(filters.endDate),
      };
    }
    
    const missedPunchExceptions = await this.timeExceptionModel
      .find(exceptionQuery)
      .exec();
    
    const exceptionsByStatus = {
      open: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      escalated: 0,
      resolved: 0,
    };
    
    missedPunchExceptions.forEach((exc: any) => {
      const status = exc.status?.toLowerCase() || 'open';
      if (exceptionsByStatus.hasOwnProperty(status)) {
        exceptionsByStatus[status as keyof typeof exceptionsByStatus]++;
      }
    });
    
    return {
      period: { startDate: filters.startDate, endDate: filters.endDate },
      summary: {
        totalMissedPunchRecords: missedPunchRecords.length,
        totalExceptions: missedPunchExceptions.length,
        uniqueEmployees: Object.keys(byEmployee).length,
      },
      exceptionsByStatus,
      byEmployee: Object.entries(byEmployee).map(([empId, data]) => ({
        employeeId: empId,
        ...data,
      })),
    };
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Converts a date to UTC by setting it to midnight UTC of the same calendar date
   * This ensures date range queries work correctly with MongoDB's UTC createdAt fields
   * Handles both Date objects and date strings
   */
  private convertDateToUTCStart(date: Date | string): Date {
    // Convert string to Date if needed
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Date(
      Date.UTC(
        dateObj.getUTCFullYear(),
        dateObj.getUTCMonth(),
        dateObj.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
  }

  /**
   * Converts a date to UTC by setting it to end of day UTC of the same calendar date
   * This ensures date range queries work correctly with MongoDB's UTC createdAt fields
   * Handles both Date objects and date strings
   */
  private convertDateToUTCEnd(date: Date | string): Date {
    // Convert string to Date if needed
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Date(
      Date.UTC(
        dateObj.getUTCFullYear(),
        dateObj.getUTCMonth(),
        dateObj.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );
  }

  private async logTimeManagementChange(
    entity: string,
    changeSet: Record<string, unknown>,
    actorId?: string,
  ) {
    this.auditLogs.push({
      entity,
      changeSet,
      actorId,
      timestamp: new Date(),
    });
  }
}
