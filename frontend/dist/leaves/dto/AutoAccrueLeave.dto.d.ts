export declare enum AccrualType {
    MONTHLY = "monthly",
    YEARLY = "yearly",
    QUARTERLY = "quarterly",
    SEMI_ANNUAL = "semi_annual"
}
export declare class AutoAccrueLeaveDto {
    employeeId: string;
    leaveTypeId: string;
    accrualAmount: number;
    accrualType: AccrualType;
    policyId?: string;
    accrualDate?: Date;
    notes?: string;
}
export declare class AccrueAllEmployeesDto {
    leaveTypeId: string;
    accrualAmount: number;
    accrualType: AccrualType;
    policyId?: string;
    departmentId?: string;
}
