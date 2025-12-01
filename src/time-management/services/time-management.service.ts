import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// Import schemas
import { AttendanceRecord } from '../models/attendance-record.schema';
import { AttendanceCorrectionRequest } from '../models/attendance-correction-request.schema';
import { TimeException } from '../models/time-exception.schema';
import { ShiftAssignment } from '../models/shift-assignment.schema';
// Import enums
import {
  TimeExceptionStatus,
  TimeExceptionType,
  PunchType,
  CorrectionRequestStatus,
} from '../models/enums';
import {
  ApplyAttendanceRoundingDto,
  EnforcePunchPolicyDto,
  EnforceShiftPunchPolicyDto,
  MonitorRepeatedLatenessDto,
  RecordPunchWithMetadataDto,
  TriggerLatenessDisciplinaryDto,
} from '../DTOs/time-permission.dtos';
import {
  GenerateOvertimeReportDto,
  GenerateLatenessReportDto,
  GenerateExceptionReportDto,
  ExportReportDto,
} from '../DTOs/reporting.dtos';

@Injectable()
export class TimeManagementService {
  private readonly auditLogs: Array<{
    entity: string;
    changeSet: Record<string, unknown>;
    actorId?: string;
    timestamp: Date;
  }> = [];

  constructor(
    @InjectModel(AttendanceRecord.name)
    private attendanceRecordModel: Model<AttendanceRecord>,
    @InjectModel(AttendanceCorrectionRequest.name)
    private correctionRequestModel: Model<AttendanceCorrectionRequest>,
    @InjectModel(TimeException.name)
    private timeExceptionModel: Model<TimeException>,
    @InjectModel(ShiftAssignment.name)
    private shiftAssignmentModel: Model<ShiftAssignment>,
  ) {}

  // ===== US5: CLOCK-IN/OUT ATTENDANCE SERVICE METHODS =====
  // BR-TM-06: Time-in/out captured via Biometric, Web Login, Mobile App, or Manual Input (with audit trail)
  // BR-TM-07: Attendance data must follow HR rounding rules
  // BR-TM-11: Allow multiple punches per day, or first in/last out
  // BR-TM-12: Clock-ins must be tagged with location, terminal ID, or device

  /**
   * Clock in with employee ID
   * BR-TM-06: Creates audit trail for clock-in
   * BR-TM-12: Tags with source type (defaults to manual)
   */
  async clockInWithID(employeeId: string, currentUserId: string) {
    const now = new Date();

    // Create new attendance record with clock-in punch
    const attendanceRecord = new this.attendanceRecordModel({
      employeeId,
      punches: [
        {
          type: PunchType.IN,
          time: now,
        },
      ],
      totalWorkMinutes: 0,
      hasMissedPunch: false,
      finalisedForPayroll: false,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });

    const saved = await attendanceRecord.save();
    
    // BR-TM-06: Log audit trail
    await this.logAttendanceChange(
      employeeId,
      'CLOCK_IN',
      {
        attendanceRecordId: saved._id,
        source: 'ID_CARD',
        timestamp: now.toISOString(),
      },
      currentUserId,
    );

    return saved;
  }

  /**
   * Clock out with employee ID
   * BR-TM-06: Creates audit trail for clock-out
   * BR-TM-07: Calculates total work minutes
   */
  async clockOutWithID(employeeId: string, currentUserId: string) {
    const now = new Date();

    // Find the most recent attendance record for this employee
    // Query all records and find the one with an IN punch that hasn't been clocked out
    const attendanceRecords = await this.attendanceRecordModel
      .find({
        employeeId,
      })
      .sort({ createdAt: -1 })
      .exec();

    if (!attendanceRecords || attendanceRecords.length === 0) {
      throw new Error('No attendance record found. Please clock in first.');
    }

    // Find the most recent record where the last punch is IN (not OUT)
    let attendanceRecord: any = null;
    for (const record of attendanceRecords) {
      if (record.punches && record.punches.length > 0) {
        const lastPunch = record.punches[record.punches.length - 1];
        if (lastPunch.type === PunchType.IN) {
          attendanceRecord = record;
          break;
        }
      }
    }

    if (!attendanceRecord) {
      throw new Error('No active clock-in found. Please clock in first.');
    }

    // Add clock-out punch
    attendanceRecord.punches.push({
      type: PunchType.OUT,
      time: now,
    });

    // BR-TM-07: Calculate total work minutes
    let totalMinutes = 0;
    for (let i = 0; i < attendanceRecord.punches.length; i += 2) {
      if (i + 1 < attendanceRecord.punches.length) {
        const inTime = attendanceRecord.punches[i].time.getTime();
        const outTime = attendanceRecord.punches[i + 1].time.getTime();
        totalMinutes += (outTime - inTime) / 60000;
      }
    }
    attendanceRecord.totalWorkMinutes = totalMinutes;
    attendanceRecord.updatedBy = currentUserId;

    const saved = await attendanceRecord.save();

    // BR-TM-06: Log audit trail
    await this.logAttendanceChange(
      employeeId,
      'CLOCK_OUT',
      {
        attendanceRecordId: saved._id,
        source: 'ID_CARD',
        totalWorkMinutes: totalMinutes,
        timestamp: now.toISOString(),
      },
      currentUserId,
    );

    return saved;
  }

  /**
   * Enhanced clock-in with full metadata
   * BR-TM-06: Captures source type (BIOMETRIC, WEB, MOBILE, MANUAL)
   * BR-TM-12: Tags with location, terminal ID, device
   */
  async clockInWithMetadata(
    employeeId: string,
    metadata: {
      source: 'BIOMETRIC' | 'WEB' | 'MOBILE' | 'MANUAL';
      deviceId?: string;
      terminalId?: string;
      location?: string;
      gpsCoordinates?: { lat: number; lng: number };
      ipAddress?: string;
    },
    currentUserId: string,
  ) {
    const now = new Date();

    // Create attendance record with metadata
    const attendanceRecord = new this.attendanceRecordModel({
      employeeId,
      punches: [
        {
          type: PunchType.IN,
          time: now,
        },
      ],
      totalWorkMinutes: 0,
      hasMissedPunch: false,
      finalisedForPayroll: false,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });

    const saved = await attendanceRecord.save();

    // BR-TM-06 & BR-TM-12: Log comprehensive audit trail
    await this.logAttendanceChange(
      employeeId,
      'CLOCK_IN_WITH_METADATA',
      {
        attendanceRecordId: saved._id,
        source: metadata.source,
        deviceId: metadata.deviceId,
        terminalId: metadata.terminalId,
        location: metadata.location,
        gpsCoordinates: metadata.gpsCoordinates,
        ipAddress: metadata.ipAddress,
        timestamp: now.toISOString(),
      },
      currentUserId,
    );

    return {
      attendanceRecord: saved,
      metadata: {
        source: metadata.source,
        deviceId: metadata.deviceId,
        terminalId: metadata.terminalId,
        location: metadata.location,
        capturedAt: now,
      },
    };
  }

  /**
   * Enhanced clock-out with full metadata
   * BR-TM-06: Captures source type with audit trail
   * BR-TM-12: Tags with location, terminal ID, device
   */
  async clockOutWithMetadata(
    employeeId: string,
    metadata: {
      source: 'BIOMETRIC' | 'WEB' | 'MOBILE' | 'MANUAL';
      deviceId?: string;
      terminalId?: string;
      location?: string;
      gpsCoordinates?: { lat: number; lng: number };
      ipAddress?: string;
    },
    currentUserId: string,
  ) {
    const now = new Date();

    // Find active clock-in
    const attendanceRecords = await this.attendanceRecordModel
      .find({ employeeId })
      .sort({ createdAt: -1 })
      .exec();

    if (!attendanceRecords || attendanceRecords.length === 0) {
      throw new Error('No attendance record found. Please clock in first.');
    }

    let attendanceRecord: any = null;
    for (const record of attendanceRecords) {
      if (record.punches && record.punches.length > 0) {
        const lastPunch = record.punches[record.punches.length - 1];
        if (lastPunch.type === PunchType.IN) {
          attendanceRecord = record;
          break;
        }
      }
    }

    if (!attendanceRecord) {
      throw new Error('No active clock-in found. Please clock in first.');
    }

    // Add clock-out punch
    attendanceRecord.punches.push({
      type: PunchType.OUT,
      time: now,
    });

    // Calculate total work minutes
    let totalMinutes = 0;
    for (let i = 0; i < attendanceRecord.punches.length; i += 2) {
      if (i + 1 < attendanceRecord.punches.length) {
        const inTime = attendanceRecord.punches[i].time.getTime();
        const outTime = attendanceRecord.punches[i + 1].time.getTime();
        totalMinutes += (outTime - inTime) / 60000;
      }
    }
    attendanceRecord.totalWorkMinutes = totalMinutes;
    attendanceRecord.updatedBy = currentUserId;

    const saved = await attendanceRecord.save();

    // BR-TM-06 & BR-TM-12: Log comprehensive audit trail
    await this.logAttendanceChange(
      employeeId,
      'CLOCK_OUT_WITH_METADATA',
      {
        attendanceRecordId: saved._id,
        source: metadata.source,
        deviceId: metadata.deviceId,
        terminalId: metadata.terminalId,
        location: metadata.location,
        gpsCoordinates: metadata.gpsCoordinates,
        ipAddress: metadata.ipAddress,
        totalWorkMinutes: totalMinutes,
        timestamp: now.toISOString(),
      },
      currentUserId,
    );

    return {
      attendanceRecord: saved,
      metadata: {
        source: metadata.source,
        deviceId: metadata.deviceId,
        terminalId: metadata.terminalId,
        location: metadata.location,
        capturedAt: now,
      },
      totalWorkMinutes: totalMinutes,
      totalWorkHours: Math.round((totalMinutes / 60) * 100) / 100,
    };
  }

  /**
   * Validate clock-in against assigned shift and rest days
   * US5 Flow: Clocks in/out using ID validating against assigned shifts and rest days
   */
  async validateClockInAgainstShift(
    employeeId: string,
    currentUserId: string,
  ) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Find active shift assignments for this employee
    const shiftAssignments = await this.shiftAssignmentModel
      .find({
        employeeId,
        status: 'APPROVED',
        startDate: { $lte: today },
        $or: [
          { endDate: { $gte: today } },
          { endDate: null }, // Ongoing assignments
        ],
      })
      .populate('shiftId')
      .exec();

    if (shiftAssignments.length === 0) {
      return {
        isValid: false,
        message: 'No active shift assignment found for today',
        allowClockIn: true, // Still allow, but flag it
        warning: 'Employee has no assigned shift for today',
      };
    }

    const assignment = shiftAssignments[0] as any;
    const shift = assignment.shiftId;

    if (!shift) {
      return {
        isValid: false,
        message: 'Shift details not found',
        allowClockIn: true,
        warning: 'Shift information is missing',
      };
    }

    // Parse shift times
    const shiftStartMinutes = this.timeStringToMinutes(shift.startTime);
    const shiftEndMinutes = this.timeStringToMinutes(shift.endTime);
    const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

    // Check if within grace period (allow early/late based on shift config)
    const graceIn = shift.graceInMinutes || 0;
    const graceOut = shift.graceOutMinutes || 0;

    const isWithinStartWindow = 
      currentMinutes >= (shiftStartMinutes - 30) && // 30 min early allowed
      currentMinutes <= (shiftStartMinutes + graceIn);

    const isLate = currentMinutes > (shiftStartMinutes + graceIn);

    return {
      isValid: true,
      shiftName: shift.name,
      shiftStart: shift.startTime,
      shiftEnd: shift.endTime,
      currentTime: `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`,
      isWithinStartWindow,
      isLate,
      lateByMinutes: isLate ? currentMinutes - shiftStartMinutes - graceIn : 0,
      graceInMinutes: graceIn,
      graceOutMinutes: graceOut,
      allowClockIn: true,
      message: isLate 
        ? `Late clock-in. You are ${currentMinutes - shiftStartMinutes - graceIn} minutes late.`
        : 'Clock-in validated successfully',
    };
  }

  /**
   * Get employee's attendance status for today
   * Returns current clock-in/out status and work summary
   */
  async getEmployeeAttendanceStatus(employeeId: string, currentUserId: string) {
    const now = new Date();
    const todayStart = this.convertDateToUTCStart(now);
    const todayEnd = this.convertDateToUTCEnd(now);

    // Find today's attendance records
    const todayRecords = await this.attendanceRecordModel
      .find({
        employeeId,
        createdAt: { $gte: todayStart, $lte: todayEnd },
      })
      .sort({ createdAt: -1 })
      .exec();

    if (todayRecords.length === 0) {
      return {
        status: 'NOT_CLOCKED_IN',
        message: 'No attendance record for today',
        records: [],
      };
    }

    const latestRecord = todayRecords[0];
    const lastPunch = latestRecord.punches[latestRecord.punches.length - 1];
    const isClockedIn = lastPunch?.type === PunchType.IN;

    // Calculate total work time today
    let totalMinutesToday = 0;
    for (const record of todayRecords) {
      totalMinutesToday += record.totalWorkMinutes || 0;
    }

    // If currently clocked in, add time since last punch
    if (isClockedIn && lastPunch) {
      const minutesSinceLastPunch = (now.getTime() - lastPunch.time.getTime()) / 60000;
      totalMinutesToday += minutesSinceLastPunch;
    }

    return {
      status: isClockedIn ? 'CLOCKED_IN' : 'CLOCKED_OUT',
      lastPunchTime: lastPunch?.time,
      lastPunchType: lastPunch?.type,
      totalMinutesToday: Math.round(totalMinutesToday),
      totalHoursToday: Math.round((totalMinutesToday / 60) * 100) / 100,
      recordCount: todayRecords.length,
      punchCount: todayRecords.reduce((sum, r) => sum + r.punches.length, 0),
      records: todayRecords.map(r => ({
        id: r._id,
        punches: r.punches,
        totalWorkMinutes: r.totalWorkMinutes,
        hasMissedPunch: r.hasMissedPunch,
      })),
    };
  }

  // 2. Create a new attendance record
  async createAttendanceRecord(
    createAttendanceRecordDto: any,
    currentUserId: string,
  ) {
    const newAttendanceRecord = new this.attendanceRecordModel({
      ...createAttendanceRecordDto,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return newAttendanceRecord.save();
  }

  // // 3. Get attendance record by employee (optional filter by date)
  // async getAttendanceRecordByEmployee(employeeId: string, getAttendanceRecordDto: any, currentUserId: string) {
  //   const { startDate, endDate } = getAttendanceRecordDto;
  //   const query: any = { employeeId };

  //   if (startDate && endDate) {
  //     query.date = { $gte: startDate, $lte: endDate };
  //   }

  //   return this.attendanceRecordModel.find(query).exec();
  // }

  // 4. Update an attendance record (add missed punches or corrections)
  async updateAttendanceRecord(
    id: string,
    updateAttendanceRecordDto: any,
    currentUserId: string,
  ) {
    return this.attendanceRecordModel.findByIdAndUpdate(
      id,
      {
        ...updateAttendanceRecordDto,
        updatedBy: currentUserId,
      },
      { new: true },
    );
  }

  // 5. Submit a correction request for an attendance record
  async submitAttendanceCorrectionRequest(
    submitCorrectionRequestDto: any,
    currentUserId: string,
  ) {
    const newCorrectionRequest = new this.correctionRequestModel({
      employeeId: submitCorrectionRequestDto.employeeId,
      attendanceRecord: submitCorrectionRequestDto.attendanceRecord,
      reason: submitCorrectionRequestDto.reason,
      status:
        submitCorrectionRequestDto.status || CorrectionRequestStatus.SUBMITTED,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return newCorrectionRequest.save();
  }

  // // 6. Get all correction requests by employee (filter by status if needed)
  // async getAttendanceCorrectionRequestsByEmployee(employeeId: string, getCorrectionsDto: any, currentUserId: string) {
  //   const { status } = getCorrectionsDto;
  //   const query: any = { employeeId };

  //   if (status) {
  //     query.status = status;
  //   }

  //   return this.correctionRequestModel.find(query).exec();
  // }

  // 7. Get all correction requests (for review by managers/admins)
  async getAllCorrectionRequests(
    getAllCorrectionsDto: any,
    currentUserId: string,
  ) {
    const { status, employeeId } = getAllCorrectionsDto;
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (employeeId) {
      query.employeeId = employeeId;
    }

    return this.correctionRequestModel
      .find(query)
      .populate('attendanceRecord')
      .populate('employeeId')
      .exec();
  }

  // 8. Approve a correction request
  async approveCorrectionRequest(
    approveCorrectionRequestDto: any,
    currentUserId: string,
  ) {
    const { correctionRequestId, reason } = approveCorrectionRequestDto;
    const correctionRequest = await this.correctionRequestModel
      .findByIdAndUpdate(
        correctionRequestId,
        {
          status: CorrectionRequestStatus.APPROVED,
          ...(reason && { reason }),
          updatedBy: currentUserId,
        },
        { new: true },
      )
      .exec();

    if (!correctionRequest) {
      throw new Error('Correction request not found');
    }

    return correctionRequest;
  }

  // 9. Reject a correction request
  async rejectCorrectionRequest(
    rejectCorrectionRequestDto: any,
    currentUserId: string,
  ) {
    const { correctionRequestId, reason } = rejectCorrectionRequestDto;
    const correctionRequest = await this.correctionRequestModel
      .findByIdAndUpdate(
        correctionRequestId,
        {
          status: CorrectionRequestStatus.REJECTED,
          ...(reason && { reason }),
          updatedBy: currentUserId,
        },
        { new: true },
      )
      .exec();

    if (!correctionRequest) {
      throw new Error('Correction request not found');
    }

    return correctionRequest;
  }

  // ===== TIME EXCEPTION SERVICE METHODS =====

  // 10. Create a new time exception (e.g., missed punch, overtime)
  async createTimeException(
    createTimeExceptionDto: any,
    currentUserId: string,
  ) {
    const newTimeException = new this.timeExceptionModel({
      ...createTimeExceptionDto,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return newTimeException.save();
  }

  // 11. Update a time exception status (approve, reject, etc.)
  async updateTimeException(
    id: string,
    updateTimeExceptionDto: any,
    currentUserId: string,
  ) {
    return this.timeExceptionModel.findByIdAndUpdate(
      id,
      {
        ...updateTimeExceptionDto,
        updatedBy: currentUserId,
      },
      { new: true },
    );
  }

  // 12. Get all time exceptions by employee (optional filter by status)
  async getTimeExceptionsByEmployee(
    employeeId: string,
    getTimeExceptionsDto: any,
    currentUserId: string,
  ) {
    const { status } = getTimeExceptionsDto;
    const query: any = { employeeId };

    if (status) {
      query.status = status;
    }

    return this.timeExceptionModel.find(query).exec();
  }

  // 13. Approve a time exception
  async approveTimeException(
    approveTimeExceptionDto: any,
    currentUserId: string,
  ) {
    const { timeExceptionId } = approveTimeExceptionDto;
    return this.timeExceptionModel.findByIdAndUpdate(
      timeExceptionId,
      {
        status: 'APPROVED',
        updatedBy: currentUserId,
      },
      { new: true },
    );
  }

  // 14. Reject a time exception
  async rejectTimeException(
    rejectTimeExceptionDto: any,
    currentUserId: string,
  ) {
    const { timeExceptionId } = rejectTimeExceptionDto;
    return this.timeExceptionModel.findByIdAndUpdate(
      timeExceptionId,
      {
        status: 'REJECTED',
        updatedBy: currentUserId,
      },
      { new: true },
    );
  }

  // 15. Escalate a time exception
  async escalateTimeException(
    escalateTimeExceptionDto: any,
    currentUserId: string,
  ) {
    const { timeExceptionId } = escalateTimeExceptionDto;
    return this.timeExceptionModel.findByIdAndUpdate(
      timeExceptionId,
      {
        status: 'ESCALATED',
        updatedBy: currentUserId,
      },
      { new: true },
    );
  }

  // ===== TIME PERMISSION & ATTENDANCE ENHANCEMENTS =====

  async recordPunchWithMetadata(
    recordPunchWithMetadataDto: RecordPunchWithMetadataDto,
    currentUserId: string,
  ) {
    // Convert string dates to Date objects if they come as strings (when ValidationPipe is not configured)
    const punchesWithDates = recordPunchWithMetadataDto.punches.map(
      (punch) => ({
        type: punch.type as PunchType,
        time: punch.time instanceof Date ? punch.time : new Date(punch.time),
      }),
    );

    const attendanceRecord = new this.attendanceRecordModel({
      employeeId: recordPunchWithMetadataDto.employeeId,
      punches: punchesWithDates,
      totalWorkMinutes: this.calculateWorkMinutesFromPunches(punchesWithDates),
      hasMissedPunch: recordPunchWithMetadataDto.punches.length % 2 !== 0,
      finalisedForPayroll: false,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });

    await attendanceRecord.save();
    await this.logAttendanceChange(
      recordPunchWithMetadataDto.employeeId,
      'PUNCH_RECORDED',
      {
        attendanceRecordId: attendanceRecord._id,
        deviceId: recordPunchWithMetadataDto.deviceId,
        location: recordPunchWithMetadataDto.location,
        source: recordPunchWithMetadataDto.source ?? 'manual',
      },
      currentUserId,
    );

    return attendanceRecord;
  }

  async recordPunchFromDevice(
    recordPunchWithMetadataDto: RecordPunchWithMetadataDto,
    currentUserId: string,
  ) {
    return this.recordPunchWithMetadata(
      {
        ...recordPunchWithMetadataDto,
        source: recordPunchWithMetadataDto.source ?? 'device',
      },
      currentUserId,
    );
  }

  async enforcePunchPolicy(
    enforcePunchPolicyDto: EnforcePunchPolicyDto,
    currentUserId: string,
  ) {
    if (
      enforcePunchPolicyDto.policy === 'FIRST_LAST' &&
      enforcePunchPolicyDto.punches.length > 2
    ) {
      throw new Error('First/Last policy allows only two punches per period.');
    }

    const alternatingTypes = enforcePunchPolicyDto.punches.every(
      (punch, index, arr) => {
        if (index === 0) {
          return true;
        }
        return arr[index - 1].type !== punch.type;
      },
    );

    if (!alternatingTypes) {
      throw new Error('Punch sequence must alternate between IN and OUT.');
    }

    return { valid: true, policy: enforcePunchPolicyDto.policy };
  }

  async applyAttendanceRounding(
    applyAttendanceRoundingDto: ApplyAttendanceRoundingDto,
    currentUserId: string,
  ) {
    const attendanceRecord = await this.attendanceRecordModel.findById(
      applyAttendanceRoundingDto.attendanceRecordId,
    );
    if (!attendanceRecord) {
      throw new Error('Attendance record not found');
    }

    const roundedMinutes = this.roundMinutes(
      attendanceRecord.totalWorkMinutes,
      applyAttendanceRoundingDto.intervalMinutes,
      applyAttendanceRoundingDto.strategy,
    );
    attendanceRecord.totalWorkMinutes = roundedMinutes;
    (attendanceRecord as any).updatedBy = currentUserId;
    await attendanceRecord.save();
    await this.logAttendanceChange(
      attendanceRecord.employeeId.toString(),
      'ATTENDANCE_ROUNDED',
      {
        strategy: applyAttendanceRoundingDto.strategy,
        interval: applyAttendanceRoundingDto.intervalMinutes,
      },
      currentUserId,
    );

    return attendanceRecord;
  }

  async enforceShiftPunchPolicy(
    enforceShiftPunchPolicyDto: EnforceShiftPunchPolicyDto,
    currentUserId: string,
  ) {
    // Convert shift times to minutes (treating them as UTC times)
    const startMinutes = this.timeStringToMinutes(
      enforceShiftPunchPolicyDto.shiftStart,
    );
    const endMinutes = this.timeStringToMinutes(
      enforceShiftPunchPolicyDto.shiftEnd,
    );
    const allowEarly = enforceShiftPunchPolicyDto.allowEarlyMinutes ?? 0;
    const allowLate = enforceShiftPunchPolicyDto.allowLateMinutes ?? 0;

    enforceShiftPunchPolicyDto.punches.forEach((punch) => {
      // Convert string date to Date object if needed
      const punchTime =
        punch.time instanceof Date ? punch.time : new Date(punch.time);
      // Extract UTC hours and minutes for consistent timezone comparison
      const punchMinutes = this.dateToMinutesUTC(punchTime);
      if (punchMinutes < startMinutes - allowEarly) {
        throw new Error('Punch occurs before the allowed start window.');
      }
      if (punchMinutes > endMinutes + allowLate) {
        throw new Error('Punch occurs after the allowed end window.');
      }
    });

    return { valid: true };
  }

  async monitorRepeatedLateness(
    monitorRepeatedLatenessDto: MonitorRepeatedLatenessDto,
    currentUserId: string,
  ) {
    const latenessCount = await this.timeExceptionModel.countDocuments({
      employeeId: monitorRepeatedLatenessDto.employeeId,
      type: TimeExceptionType.LATE,
    });
    const exceeded = latenessCount >= monitorRepeatedLatenessDto.threshold;

    if (exceeded) {
      await this.triggerLatenessDisciplinary(
        {
          employeeId: monitorRepeatedLatenessDto.employeeId,
          action: 'AUTO_ESCALATION',
        },
        currentUserId,
      );
    }

    return {
      employeeId: monitorRepeatedLatenessDto.employeeId,
      count: latenessCount,
      threshold: monitorRepeatedLatenessDto.threshold,
      exceeded,
    };
  }

  async triggerLatenessDisciplinary(
    triggerLatenessDisciplinaryDto: TriggerLatenessDisciplinaryDto,
    currentUserId: string,
  ) {
    await this.logTimeManagementChange(
      'LATENESS_DISCIPLINARY',
      {
        employeeId: triggerLatenessDisciplinaryDto.employeeId,
        action: triggerLatenessDisciplinaryDto.action ?? 'MANUAL_TRIGGER',
      },
      currentUserId,
    );

    return { message: 'Disciplinary action logged.' };
  }

  async scheduleTimeDataBackup(currentUserId: string) {
    await this.logTimeManagementChange(
      'BACKUP',
      { action: 'SCHEDULED' },
      currentUserId,
    );
    return { message: 'Time management backup scheduled.' };
  }

  // ===== US4: AUTOMATIC DETECTION METHODS FOR SHIFT EXPIRY =====
  // BR-TM-05: Shift schedules must be assignable by Department, Position, or Individual

  /**
   * Check for expiring shift assignments and return detailed info for notifications
   * This method is used by HR Admins to identify shifts needing renewal or reassignment
   */
  async checkExpiringShiftAssignments(
    daysBeforeExpiry: number = 7,
    currentUserId: string,
  ) {
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setUTCDate(expiryDate.getUTCDate() + daysBeforeExpiry);
    // Convert to UTC end of day for proper comparison
    const expiryDateUTC = this.convertDateToUTCEnd(expiryDate);
    const nowUTC = this.convertDateToUTCStart(now);

    const expiringAssignments = await this.shiftAssignmentModel
      .find({
        endDate: { $lte: expiryDateUTC, $gte: nowUTC },
        status: 'APPROVED',
      })
      .populate('employeeId', 'firstName lastName email employeeNumber')
      .populate('shiftId', 'name startTime endTime')
      .populate('departmentId', 'name')
      .populate('positionId', 'name')
      .exec();

    // Calculate days remaining for each assignment
    const expiring = expiringAssignments.map((assignment: any) => {
      const endDate = assignment.endDate ? new Date(assignment.endDate) : null;
      const daysRemaining = endDate 
        ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      return {
        assignmentId: assignment._id?.toString() || '',
        employeeId: assignment.employeeId?._id?.toString() || '',
        employeeName: assignment.employeeId 
          ? `${assignment.employeeId.firstName || ''} ${assignment.employeeId.lastName || ''}`.trim()
          : 'Unknown',
        employeeEmail: assignment.employeeId?.email || '',
        employeeNumber: assignment.employeeId?.employeeNumber || '',
        shiftId: assignment.shiftId?._id?.toString() || '',
        shiftName: assignment.shiftId?.name || 'Unknown Shift',
        shiftTimes: assignment.shiftId 
          ? `${assignment.shiftId.startTime} - ${assignment.shiftId.endTime}`
          : '',
        departmentId: assignment.departmentId?._id?.toString() || '',
        departmentName: assignment.departmentId?.name || '',
        positionId: assignment.positionId?._id?.toString() || '',
        positionName: assignment.positionId?.name || '',
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        daysRemaining,
        status: assignment.status,
        urgency: daysRemaining <= 3 ? 'HIGH' : daysRemaining <= 5 ? 'MEDIUM' : 'LOW',
      };
    });

    // Sort by days remaining (most urgent first)
    expiring.sort((a, b) => a.daysRemaining - b.daysRemaining);

    await this.logTimeManagementChange(
      'SHIFT_EXPIRY_SCAN',
      { 
        count: expiring.length,
        daysBeforeExpiry,
        urgentCount: expiring.filter(e => e.urgency === 'HIGH').length,
      },
      currentUserId,
    );

    return { 
      count: expiring.length, 
      daysBeforeExpiry,
      summary: {
        highUrgency: expiring.filter(e => e.urgency === 'HIGH').length,
        mediumUrgency: expiring.filter(e => e.urgency === 'MEDIUM').length,
        lowUrgency: expiring.filter(e => e.urgency === 'LOW').length,
      },
      assignments: expiring,
    };
  }

  /**
   * Get assignments that have already expired but not yet archived
   * BR-TM-05: Helps HR identify assignments that need immediate attention
   */
  async getExpiredUnprocessedAssignments(currentUserId: string) {
    const now = new Date();
    const nowUTC = this.convertDateToUTCStart(now);

    const expiredAssignments = await this.shiftAssignmentModel
      .find({
        endDate: { $lt: nowUTC },
        status: 'APPROVED', // Still approved but past end date
      })
      .populate('employeeId', 'firstName lastName email employeeNumber')
      .populate('shiftId', 'name')
      .exec();

    const expired = expiredAssignments.map((assignment: any) => {
      const endDate = assignment.endDate ? new Date(assignment.endDate) : null;
      const daysOverdue = endDate 
        ? Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      return {
        assignmentId: assignment._id?.toString() || '',
        employeeId: assignment.employeeId?._id?.toString() || '',
        employeeName: assignment.employeeId 
          ? `${assignment.employeeId.firstName || ''} ${assignment.employeeId.lastName || ''}`.trim()
          : 'Unknown',
        shiftName: assignment.shiftId?.name || 'Unknown Shift',
        endDate: assignment.endDate,
        daysOverdue,
      };
    });

    await this.logTimeManagementChange(
      'EXPIRED_UNPROCESSED_SCAN',
      { count: expired.length },
      currentUserId,
    );

    return {
      count: expired.length,
      assignments: expired,
    };
  }

  // Detect missed punches and send alerts
  async detectMissedPunches(currentUserId: string) {
    const now = new Date();
    // Use UTC for date range to match MongoDB's UTC createdAt field
    const todayUTC = this.convertDateToUTCStart(now);
    const tomorrowUTC = new Date(todayUTC);
    tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);

    // Find attendance records for today
    const attendanceRecords = await this.attendanceRecordModel
      .find({
        createdAt: { $gte: todayUTC, $lt: tomorrowUTC },
      })
      .exec();

    const missedPunchRecords: any[] = [];
    for (const record of attendanceRecords) {
      // Check if there's an odd number of punches (missing clock-out)
      // or if there are no punches at all
      if (record.punches.length === 0 || record.punches.length % 2 !== 0) {
        record.hasMissedPunch = true;
        (record as any).updatedBy = currentUserId;
        await record.save();

        missedPunchRecords.push(record);
      }
    }

    return { count: missedPunchRecords.length, records: missedPunchRecords };
  }

  // Escalate unresolved requests before payroll cut-off
  async escalateUnresolvedRequestsBeforePayroll(
    payrollCutOffDate: Date,
    currentUserId: string,
  ) {
    const now = new Date();
    if (now >= payrollCutOffDate) {
      // Find all pending correction requests
      const pendingCorrections = await this.correctionRequestModel
        .find({
          status: { $in: ['SUBMITTED', 'IN_REVIEW'] },
        })
        .exec();

      // Find all pending time exceptions
      const pendingExceptions = await this.timeExceptionModel
        .find({
          status: { $in: ['PENDING', 'OPEN'] },
        })
        .exec();

      const escalated: Array<{ type: string; id: any }> = [];

      // Escalate correction requests
      for (const correction of pendingCorrections) {
        await this.correctionRequestModel.findByIdAndUpdate(correction._id, {
          status: CorrectionRequestStatus.ESCALATED,
          updatedBy: currentUserId,
        });
        escalated.push({ type: 'CORRECTION_REQUEST', id: correction._id });
      }

      // Escalate time exceptions
      for (const exception of pendingExceptions) {
        await this.timeExceptionModel.findByIdAndUpdate(exception._id, {
          status: 'ESCALATED',
          updatedBy: currentUserId,
        });
        escalated.push({ type: 'TIME_EXCEPTION', id: exception._id });
      }

      return { count: escalated.length, escalated };
    }

    return { count: 0, escalated: [] };
  }

  // ===== REPORTING METHODS =====

  // Generate overtime report
  async generateOvertimeReport(
    generateOvertimeReportDto: GenerateOvertimeReportDto,
    currentUserId: string,
  ) {
    const { employeeId, startDate, endDate } = generateOvertimeReportDto;
    const query: any = {
      type: TimeExceptionType.OVERTIME_REQUEST,
    };

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (startDate && endDate) {
      // Convert DTO dates to UTC for proper comparison with MongoDB's UTC createdAt
      const startDateUTC = this.convertDateToUTCStart(startDate);
      const endDateUTC = this.convertDateToUTCEnd(endDate);
      query.createdAt = { $gte: startDateUTC, $lte: endDateUTC };
    }

    const overtimeExceptions = await this.timeExceptionModel
      .find(query)
      .populate('employeeId', 'name email')
      .populate('attendanceRecordId')
      .exec();

    // Calculate total overtime hours
    const totalOvertimeMinutes = overtimeExceptions.reduce(
      (total, exception) => {
        const record = exception.attendanceRecordId as any;
        if (record && record.totalWorkMinutes) {
          // Assuming standard work day is 8 hours (480 minutes)
          const standardMinutes = 480;
          const overtime = Math.max(
            0,
            record.totalWorkMinutes - standardMinutes,
          );
          return total + overtime;
        }
        return total;
      },
      0,
    );

    await this.logTimeManagementChange(
      'OVERTIME_REPORT_GENERATED',
      {
        employeeId,
        startDate,
        endDate,
        count: overtimeExceptions.length,
        totalOvertimeMinutes,
      },
      currentUserId,
    );

    return {
      employeeId,
      startDate,
      endDate,
      records: overtimeExceptions,
      summary: {
        totalRecords: overtimeExceptions.length,
        totalOvertimeMinutes,
        totalOvertimeHours: Math.round((totalOvertimeMinutes / 60) * 100) / 100,
      },
    };
  }

  // Generate lateness report
  async generateLatenessReport(
    generateLatenessReportDto: GenerateLatenessReportDto,
    currentUserId: string,
  ) {
    const { employeeId, startDate, endDate } = generateLatenessReportDto;
    const query: any = {
      type: TimeExceptionType.LATE,
    };

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (startDate && endDate) {
      // Convert DTO dates to UTC for proper comparison with MongoDB's UTC createdAt
      const startDateUTC = this.convertDateToUTCStart(startDate);
      const endDateUTC = this.convertDateToUTCEnd(endDate);
      query.createdAt = { $gte: startDateUTC, $lte: endDateUTC };
    }

    const latenessExceptions = await this.timeExceptionModel
      .find(query)
      .populate('employeeId', 'name email')
      .populate('attendanceRecordId')
      .exec();

    await this.logTimeManagementChange(
      'LATENESS_REPORT_GENERATED',
      {
        employeeId,
        startDate,
        endDate,
        count: latenessExceptions.length,
      },
      currentUserId,
    );

    return {
      employeeId,
      startDate,
      endDate,
      records: latenessExceptions,
      summary: {
        totalRecords: latenessExceptions.length,
        employees: [
          ...new Set(
            latenessExceptions.map((e: any) => e.employeeId?._id?.toString()),
          ),
        ].length,
      },
    };
  }

  // Generate exception attendance report
  async generateExceptionReport(
    generateExceptionReportDto: GenerateExceptionReportDto,
    currentUserId: string,
  ) {
    const { employeeId, startDate, endDate } = generateExceptionReportDto;
    const query: any = {};

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (startDate && endDate) {
      // Convert DTO dates to UTC for proper comparison with MongoDB's UTC createdAt
      const startDateUTC = this.convertDateToUTCStart(startDate);
      const endDateUTC = this.convertDateToUTCEnd(endDate);
      query.createdAt = { $gte: startDateUTC, $lte: endDateUTC };
    }

    const exceptions = await this.timeExceptionModel
      .find(query)
      .populate('employeeId', 'name email')
      .populate('attendanceRecordId')
      .exec();

    // Group by type
    const byType: Record<string, any[]> = {};
    exceptions.forEach((exception: any) => {
      const type = exception.type;
      if (!byType[type]) {
        byType[type] = [];
      }
      byType[type].push(exception);
    });

    await this.logTimeManagementChange(
      'EXCEPTION_REPORT_GENERATED',
      {
        employeeId,
        startDate,
        endDate,
        count: exceptions.length,
      },
      currentUserId,
    );

    return {
      employeeId,
      startDate,
      endDate,
      records: exceptions,
      summary: {
        totalRecords: exceptions.length,
        byType: Object.keys(byType).map((type) => ({
          type,
          count: byType[type].length,
        })),
      },
    };
  }

  // Export report in specified format
  async exportReport(exportReportDto: ExportReportDto, currentUserId: string) {
    let reportData: any;

    // Generate the appropriate report
    if (exportReportDto.reportType === 'overtime') {
      reportData = await this.generateOvertimeReport(
        {
          employeeId: exportReportDto.employeeId,
          startDate: exportReportDto.startDate,
          endDate: exportReportDto.endDate,
        },
        currentUserId,
      );
    } else if (exportReportDto.reportType === 'lateness') {
      reportData = await this.generateLatenessReport(
        {
          employeeId: exportReportDto.employeeId,
          startDate: exportReportDto.startDate,
          endDate: exportReportDto.endDate,
        },
        currentUserId,
      );
    } else if (exportReportDto.reportType === 'exception') {
      reportData = await this.generateExceptionReport(
        {
          employeeId: exportReportDto.employeeId,
          startDate: exportReportDto.startDate,
          endDate: exportReportDto.endDate,
        },
        currentUserId,
      );
    } else {
      throw new Error('Invalid report type');
    }

    // Format based on export format
    let formattedData: string;
    if (exportReportDto.format === 'csv') {
      formattedData = this.formatAsCSV(reportData);
    } else if (exportReportDto.format === 'text') {
      formattedData = this.formatAsText(reportData);
    } else {
      // Excel format - return JSON structure that can be converted to Excel
      formattedData = JSON.stringify(reportData, null, 2);
    }

    await this.logTimeManagementChange(
      'REPORT_EXPORTED',
      {
        reportType: exportReportDto.reportType,
        format: exportReportDto.format,
        employeeId: exportReportDto.employeeId,
      },
      currentUserId,
    );

    return {
      format: exportReportDto.format,
      data: formattedData,
      reportType: exportReportDto.reportType,
      generatedAt: new Date(),
    };
  }

  // ===== PRIVATE HELPER METHODS =====

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

  private async logAttendanceChange(
    employeeId: string,
    action: string,
    payload: Record<string, unknown>,
    actorId?: string,
  ) {
    await this.logTimeManagementChange(
      'ATTENDANCE',
      { employeeId, action, ...payload },
      actorId,
    );
  }

  private calculateWorkMinutesFromPunches(punches: { time: Date }[]) {
    let totalMinutes = 0;
    for (let i = 0; i < punches.length; i += 2) {
      const inPunch = punches[i];
      const outPunch = punches[i + 1];
      if (inPunch && outPunch) {
        totalMinutes +=
          (outPunch.time.getTime() - inPunch.time.getTime()) / 60000;
      }
    }
    return totalMinutes;
  }

  private roundMinutes(
    value: number,
    interval: number,
    strategy: 'NEAREST' | 'CEILING' | 'FLOOR',
  ) {
    if (interval <= 0) {
      return value;
    }
    if (strategy === 'NEAREST') {
      return Math.round(value / interval) * interval;
    }
    if (strategy === 'CEILING') {
      return Math.ceil(value / interval) * interval;
    }
    return Math.floor(value / interval) * interval;
  }

  private timeStringToMinutes(time: string) {
    const [hours, minutes] = time
      .split(':')
      .map((value) => parseInt(value, 10));
    return hours * 60 + minutes;
  }

  private dateToMinutes(date: Date) {
    return date.getHours() * 60 + date.getMinutes();
  }

  private dateToMinutesUTC(date: Date) {
    return date.getUTCHours() * 60 + date.getUTCMinutes();
  }

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

  private formatAsCSV(data: any): string {
    const lines: string[] = [];

    // Add summary
    if (data.summary) {
      lines.push('Summary');
      Object.keys(data.summary).forEach((key) => {
        lines.push(`${key},${data.summary[key]}`);
      });
      lines.push('');
    }

    // Add records header
    if (data.records && data.records.length > 0) {
      lines.push('Records');
      const firstRecord = data.records[0];
      const headers = Object.keys(firstRecord).join(',');
      lines.push(headers);

      // Add record rows
      data.records.forEach((record: any) => {
        const values = Object.values(record).map((v: any) => {
          if (v && typeof v === 'object') {
            return JSON.stringify(v);
          }
          return v || '';
        });
        lines.push(values.join(','));
      });
    }

    return lines.join('\n');
  }

  private formatAsText(data: any): string {
    const lines: string[] = [];

    lines.push(`Report Type: ${data.reportType || 'N/A'}`);
    lines.push(`Generated: ${new Date().toISOString()}`);
    if (data.startDate) lines.push(`Start Date: ${data.startDate}`);
    if (data.endDate) lines.push(`End Date: ${data.endDate}`);
    lines.push('');

    if (data.summary) {
      lines.push('Summary:');
      Object.keys(data.summary).forEach((key) => {
        lines.push(`  ${key}: ${data.summary[key]}`);
      });
      lines.push('');
    }

    if (data.records && data.records.length > 0) {
      lines.push(`Records (${data.records.length}):`);
      data.records.forEach((record: any, index: number) => {
        lines.push(`  Record ${index + 1}:`);
        Object.keys(record).forEach((key) => {
          const value = record[key];
          if (value && typeof value === 'object') {
            lines.push(`    ${key}: ${JSON.stringify(value)}`);
          } else {
            lines.push(`    ${key}: ${value || 'N/A'}`);
          }
        });
        lines.push('');
      });
    }

    return lines.join('\n');
  }
}
