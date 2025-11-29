import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsBoolean,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HolidayType } from '../models/enums';  // Importing existing enums

// ===== OVERTIME RULE DTOs =====

// DTO for creating an overtime rule
export class CreateOvertimeRuleDto {
  @IsNotEmpty()
  @IsString()
  name: string;  // Name of the overtime rule

  @IsOptional()
  @IsString()
  description?: string;  // Optional description of the rule

  @IsOptional()
  @IsBoolean()
  active?: boolean;  // Whether the rule is active (default true)

  @IsOptional()
  @IsBoolean()
  approved?: boolean;  // Whether the rule is approved (default false)
}

// DTO for updating an overtime rule
export class UpdateOvertimeRuleDto {
  @IsOptional()
  @IsString()
  name?: string;  // Name of the overtime rule

  @IsOptional()
  @IsString()
  description?: string;  // Description of the rule

  @IsOptional()
  @IsBoolean()
  active?: boolean;  // Whether the rule is active

  @IsOptional()
  @IsBoolean()
  approved?: boolean;  // Whether the rule is approved
}

// ===== LATENESS RULE DTOs =====

// DTO for creating a lateness rule
export class CreateLatenessRuleDto {
  @IsNotEmpty()
  @IsString()
  name: string;  // Name of the lateness rule

  @IsOptional()
  @IsString()
  description?: string;  // Optional description of the rule

  @IsOptional()
  @IsNumber()
  gracePeriodMinutes?: number;  // Grace period in minutes before lateness is counted

  @IsOptional()
  @IsNumber()
  deductionForEachMinute?: number;  // Deduction amount per minute late

  @IsOptional()
  @IsBoolean()
  active?: boolean;  // Whether the rule is active (default true)
}

// DTO for updating a lateness rule
export class UpdateLatenessRuleDto {
  @IsOptional()
  @IsString()
  name?: string;  // Name of the lateness rule

  @IsOptional()
  @IsString()
  description?: string;  // Description of the rule

  @IsOptional()
  @IsNumber()
  gracePeriodMinutes?: number;  // Grace period in minutes

  @IsOptional()
  @IsNumber()
  deductionForEachMinute?: number;  // Deduction amount per minute

  @IsOptional()
  @IsBoolean()
  active?: boolean;  // Whether the rule is active
}

// ===== HOLIDAY DTOs =====

// DTO for creating a holiday
export class CreateHolidayDto {
  @IsEnum(HolidayType)
  @IsNotEmpty()
  type: HolidayType;  // Type of holiday (NATIONAL, ORGANIZATIONAL, WEEKLY_REST)

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;  // Start date of the holiday

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;  // End date of the holiday (if multi-day)

  @IsOptional()
  @IsString()
  name?: string;  // Name of the holiday (e.g., "Christmas", "Eid")

  @IsOptional()
  @IsBoolean()
  active?: boolean;  // Whether the holiday is active (default true)
}

// DTO for updating a holiday
export class UpdateHolidayDto {
  @IsOptional()
  @IsEnum(HolidayType)
  type?: HolidayType;  // Type of holiday

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;  // Start date of the holiday

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;  // End date of the holiday

  @IsOptional()
  @IsString()
  name?: string;  // Name of the holiday

  @IsOptional()
  @IsBoolean()
  active?: boolean;  // Whether the holiday is active
}

// DTO for getting holidays with filters
export class GetHolidaysDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;  // Filter: Start date range

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;  // Filter: End date range

  @IsOptional()
  @IsEnum(HolidayType)
  type?: HolidayType;  // Filter: Type of holiday

  @IsOptional()
  @IsBoolean()
  active?: boolean;  // Filter: Active holidays only
}

// ===== GENERAL POLICY FILTER DTOs =====

// DTO for getting policies with filters
export class GetPoliciesDto {
  @IsOptional()
  @IsBoolean()
  active?: boolean;  // Filter: Active policies only

  @IsOptional()
  @IsBoolean()
  approved?: boolean;  // Filter: Approved policies only
}

// DTO for checking if a date is a holiday
export class CheckHolidayDto {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;  // Date to check for holiday
}

// DTO for validating attendance against holiday
export class ValidateAttendanceHolidayDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;  // Employee ID

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;  // Date to validate

  @IsOptional()
  @IsBoolean()
  suppressPenalty?: boolean;  // Whether to suppress penalty if holiday
}
