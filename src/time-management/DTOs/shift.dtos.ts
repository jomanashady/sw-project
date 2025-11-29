import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsOptional,
  IsDate,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PunchPolicy, ShiftAssignmentStatus } from '../models/enums';  // Importing existing enums

// DTO for creating a shift type (no ShiftType enum used)
export class CreateShiftTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;  // Name of the shift type (e.g., Normal, Rotational)

  @IsOptional()
  @IsString()
  description?: string;  // Optional description of the shift type
}

// DTO for updating a shift type
export class UpdateShiftTypeDto {
  @IsOptional()
  @IsString()
  name?: string;  // Name of the shift type

  @IsOptional()
  @IsString()
  description?: string;  // Description of the shift type
}

// DTO for getting shift types (no parameters needed)
export class GetShiftTypesDto {}

// DTO for creating a shift
export class CreateShiftDto {
  @IsNotEmpty()
  @IsString()
  name: string;  // Name of the shift (e.g., Morning, Evening)

  @IsEnum(PunchPolicy)
  @IsNotEmpty()
  punchPolicy: PunchPolicy;  // Punch policy (MULTIPLE, FIRST_LAST, etc.)

  @IsNotEmpty()
  @IsString()
  startTime: string;  // Shift start time (e.g., 09:00 AM)

  @IsNotEmpty()
  @IsString()
  endTime: string;  // Shift end time (e.g., 05:00 PM)

  @IsOptional()
  @IsNumber()
  graceInMinutes?: number;  // Grace time for punch-in (e.g., 15 minutes)

  @IsOptional()
  @IsNumber()
  graceOutMinutes?: number;  // Grace time for punch-out (e.g., 15 minutes)

  @IsOptional()
  @IsBoolean()
  requiresApprovalForOvertime?: boolean;  // Whether overtime requires approval
}

// DTO for updating a shift
export class UpdateShiftDto {
  @IsOptional()
  @IsString()
  name?: string;  // Shift name (e.g., Morning Shift)

  @IsOptional()
  @IsEnum(PunchPolicy)
  punchPolicy?: PunchPolicy;  // Shift punch policy

  @IsOptional()
  @IsString()
  startTime?: string;  // Shift start time (e.g., 09:00 AM)

  @IsOptional()
  @IsString()
  endTime?: string;  // Shift end time (e.g., 05:00 PM)

  @IsOptional()
  @IsNumber()
  graceInMinutes?: number;  // Grace time for punch-in

  @IsOptional()
  @IsNumber()
  graceOutMinutes?: number;  // Grace time for punch-out
}

// DTO for getting shifts by type (without using ShiftType enum)
export class GetShiftsByTypeDto {
  @IsNotEmpty()
  @IsString()
  shiftType: string;  // Shift type as string (Normal, Rotational, etc.)
}

// DTO for assigning a shift to an employee
export class AssignShiftToEmployeeDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;  // Employee ID to assign the shift to

  @IsNotEmpty()
  @IsString()
  shiftId: string;  // Shift ID to assign to the employee

  @IsEnum(ShiftAssignmentStatus)
  @IsNotEmpty()
  status: ShiftAssignmentStatus;  // Status of the shift assignment (Pending, Approved, etc.)

  @IsOptional()
  @IsDate()
  startDate?: Date;  // Start date for the shift assignment

  @IsOptional()
  @IsDate()
  endDate?: Date;  // End date for the shift assignment (if it's ongoing)
}

export class AssignShiftToDepartmentDto {
  @IsNotEmpty()
  @IsString()
  departmentId: string;

  @IsNotEmpty()
  @IsString()
  shiftId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includePositions?: string[];

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}

export class AssignShiftToPositionDto {
  @IsNotEmpty()
  @IsString()
  positionId: string;

  @IsNotEmpty()
  @IsString()
  shiftId: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}

// DTO for updating a shift assignment
export class UpdateShiftAssignmentDto {
  @IsEnum(ShiftAssignmentStatus)
  @IsNotEmpty()
  status: ShiftAssignmentStatus;  // Status of the shift assignment (Pending, Approved, etc.)

  @IsOptional()
  @IsDate()
  startDate?: Date;  // Optional: Start date for the shift assignment

  @IsOptional()
  @IsDate()
  endDate?: Date;  // Optional: End date for the shift assignment
}

export class RenewShiftAssignmentDto {
  @IsNotEmpty()
  @IsString()
  assignmentId: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  newEndDate?: Date;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CancelShiftAssignmentDto {
  @IsNotEmpty()
  @IsString()
  assignmentId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class PostponeShiftAssignmentDto {
  @IsNotEmpty()
  @IsString()
  assignmentId: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  postponeUntil: Date;
}

// DTO for getting all shift assignments for an employee
export class GetEmployeeShiftAssignmentsDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;  // Employee ID to retrieve shift assignments
}

// DTO for getting the status of a shift assignment
export class GetShiftAssignmentStatusDto {
  @IsNotEmpty()
  @IsString()
  shiftAssignmentId: string;  // Shift assignment ID to check status
}
export class CreateScheduleRuleDto {
  @IsNotEmpty()
  @IsString()
  name: string;  // Name of the schedule rule (e.g., Rotational, Flexible)

  @IsNotEmpty()
  @IsString()
  pattern: string;  // Pattern of the schedule rule (e.g., 4 days on, 3 days off)

  @IsOptional()
  @IsBoolean()
  active?: boolean;  // Whether the schedule rule is active or not
}

// DTO for getting all schedule rules
export class GetScheduleRulesDto {
  @IsOptional()
  @IsBoolean()
  active?: boolean;  // Optional: Filter by active/inactive status
}

// DTO for assigning a schedule rule to an employee
export class AssignScheduleRuleToEmployeeDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;  // Employee ID to assign the schedule rule to

  @IsNotEmpty()
  @IsString()
  scheduleRuleId: string;  // Schedule rule ID to assign to the employee

  @IsOptional()
  @IsDate()
  startDate?: Date;  // Start date for the schedule assignment

  @IsOptional()
  @IsDate()
  endDate?: Date;  // End date for the schedule assignment (if it's ongoing)
}

// DTO for defining flexible scheduling rules
export class DefineFlexibleSchedulingRulesDto {
  @IsNotEmpty()
  @IsString()
  name: string;  // Name of the flexible scheduling rule

  @IsNotEmpty()
  @IsString()
  pattern: string;  // Pattern for flexible scheduling (e.g., flex-in/flex-out hours)

  @IsOptional()
  @IsBoolean()
  active?: boolean;  // Whether the flexible schedule is active
}

export class CreateShiftTypeWithDatesDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  effectiveStart: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveEnd?: Date;
}

export class ValidateScheduleRuleDto {
  @IsNotEmpty()
  @IsString()
  scheduleRuleId: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  assignmentDate?: Date;
}

export class ApplyFlexibleScheduleRulesDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  targetDate?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scheduleRuleIds?: string[];
}

export class LinkShiftToVacationAndHolidaysDto {
  @IsNotEmpty()
  @IsString()
  shiftId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  holidayIds?: string[];

  @IsOptional()
  @IsString()
  vacationPackageId?: string;
}

export class ValidateHolidayBeforeShiftAssignmentDto {
  @IsNotEmpty()
  @IsString()
  shiftId: string;

  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  assignmentDate: Date;
}

export class LinkVacationPackageToScheduleDto {
  @IsNotEmpty()
  @IsString()
  scheduleRuleId: string;

  @IsNotEmpty()
  @IsString()
  vacationPackageId: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveStart?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveEnd?: Date;
}