export declare class CreateLeaveEntitlementDto {
    employeeId: string;
    leaveTypeId: string;
    yearlyEntitlement: number;
    accruedActual: number;
    accruedRounded: number;
    carryForward: number;
    taken: number;
    pending: number;
    remaining: number;
    lastAccrualDate?: Date;
    nextResetDate?: Date;
}
