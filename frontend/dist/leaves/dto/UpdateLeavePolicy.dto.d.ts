import { AccrualMethod } from '../enums/accrual-method.enum';
import { RoundingRule } from '../enums/rounding-rule.enum';
export declare class UpdateLeavePolicyDto {
    leaveTypeId?: string;
    accrualMethod?: AccrualMethod;
    monthlyRate?: number;
    yearlyRate?: number;
    roundingRule?: RoundingRule;
    maxCarryForward?: number;
    minNoticeDays?: number;
    maxConsecutiveDays?: number;
    eligibility?: Record<string, any>;
}
