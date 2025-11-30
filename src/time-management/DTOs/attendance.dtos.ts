import { IsString, IsNotEmpty, IsArray, IsOptional, IsDate, IsBoolean, IsEnum } from 'class-validator';
import { CorrectionRequestStatus,TimeExceptionType, TimeExceptionStatus  } from '../models/enums';  // Importing enums from index.ts

// DTO for creating an attendance record
export class CreateAttendanceRecordDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;  // Employee ID referencing the employee

  @IsArray()
  punches: { type: string; time: Date }[];  // Array of punch records (clock-in, clock-out times)

  @IsOptional()
  @IsDate()
  @IsNotEmpty()
  date?: Date;  // Optional: Date of the attendance record

  @IsOptional()
  @IsBoolean()
  finalisedForPayroll?: boolean;  // Whether the record is finalised for payroll
}

// DTO for getting attendance records by employee
export class GetAttendanceRecordDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;  // Employee ID to fetch attendance records for

  @IsOptional()
  @IsDate()
  startDate?: Date;  // Optional: Start date for the attendance period

  @IsOptional()
  @IsDate()
  endDate?: Date;  // Optional: End date for the attendance period
}

// DTO for updating an attendance record
export class UpdateAttendanceRecordDto {
  @IsOptional()
  @IsArray()
  punches?: { type: string; time: Date }[];  // Array of updated punch records (clock-in, clock-out times)

  @IsOptional()
  @IsBoolean()
  finalisedForPayroll?: boolean;  // Whether the record is finalised for payroll

  @IsOptional()
  @IsDate()
  correctedDate?: Date;  // Optional: Date of correction for the attendance record
}

// DTO for validating an attendance record
export class ValidateAttendanceDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;  // Employee ID to validate their attendance

  @IsOptional()
  @IsDate()
  date?: Date;  // Optional: Specific date for validation (if not specified, it will check for today)

  @IsOptional()
  @IsString()
  shiftId?: string;  // Optional: If you want to validate against a specific shift
}

// DTO for calculating total work minutes for an attendance record
export class CalculateWorkMinutesDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;  // Employee ID to calculate work minutes for

  @IsOptional()
  @IsDate()
  startDate?: Date;  // Optional: Start date for calculating work minutes

  @IsOptional()
  @IsDate()
  endDate?: Date;  // Optional: End date for calculating work minutes
}

// DTO for submitting a correction request
export class SubmitCorrectionRequestDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;  // Employee ID requesting the correction

  @IsNotEmpty()
  @IsString()
  attendanceRecord: string;  // Attendance record ID that needs correction

  @IsEnum(CorrectionRequestStatus)
  @IsOptional()
  status?: CorrectionRequestStatus;  // Correction request status (default is 'SUBMITTED')

  @IsOptional()
  @IsString()
  reason?: string;  // Reason for the correction request (e.g., missed punch, incorrect time)
}

// DTO for getting all attendance correction requests by employee
export class GetCorrectionsDto {
  @IsOptional()
  @IsEnum(CorrectionRequestStatus)
  status?: CorrectionRequestStatus;  // Optional: Filter by status (pending, approved, rejected)

  @IsOptional()
  @IsString()
  employeeId?: string;  // Optional: Filter by employee ID
}

// DTO for getting all attendance correction requests (for HR/Admin)
export class GetAllCorrectionsDto {
  @IsOptional()
  @IsEnum(CorrectionRequestStatus)
  status?: CorrectionRequestStatus;  // Optional: Filter by status (pending, approved, rejected)

  @IsOptional()
  @IsString()
  employeeId?: string;  // Optional: Filter by employee ID
}

export class CreateTimeExceptionDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;  // Employee ID requesting the exception

  @IsEnum(TimeExceptionType)
  @IsNotEmpty()
  type: TimeExceptionType;  // Type of exception (Missed Punch, Late, Overtime, etc.)

  @IsNotEmpty()
  @IsString()
  attendanceRecordId: string;  // Attendance record associated with the exception

  @IsOptional()
  @IsString()
  reason?: string;  // Optional reason for the time exception (e.g., late arrival, overtime request)
}

// DTO for updating a time exception
export class UpdateTimeExceptionDto {
  @IsEnum(TimeExceptionStatus)
  @IsNotEmpty()
  status: TimeExceptionStatus;  // Status of the exception (e.g., Approved, Rejected)

  @IsOptional()
  @IsString()
  reason?: string;  // Optional reason for the status change (e.g., manager's comments)
}

// DTO for retrieving all time exceptions by employee
export class GetTimeExceptionsByEmployeeDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;  // Employee ID to fetch time exceptions for

  @IsOptional()
  @IsEnum(TimeExceptionStatus)
  status?: TimeExceptionStatus;  // Optional filter by exception status (e.g., open, approved, rejected)
}

// DTO for approving a time exception
export class ApproveTimeExceptionDto {
  @IsNotEmpty()
  @IsString()
  timeExceptionId: string;  // Time exception ID to approve
}

// DTO for rejecting a time exception
export class RejectTimeExceptionDto {
  @IsNotEmpty()
  @IsString()
  timeExceptionId: string;  // Time exception ID to reject
}

// DTO for escalating a time exception
export class EscalateTimeExceptionDto {
  @IsNotEmpty()
  @IsString()
  timeExceptionId: string;  // Time exception ID to escalate
}

// DTO for approving a correction request
export class ApproveCorrectionRequestDto {
  @IsNotEmpty()
  @IsString()
  correctionRequestId: string;  // Correction request ID to approve

  @IsOptional()
  @IsString()
  reason?: string;  // Optional reason for approval
}

// DTO for rejecting a correction request
export class RejectCorrectionRequestDto {
  @IsNotEmpty()
  @IsString()
  correctionRequestId: string;  // Correction request ID to reject

  @IsOptional()
  @IsString()
  reason?: string;  // Optional reason for rejection
}