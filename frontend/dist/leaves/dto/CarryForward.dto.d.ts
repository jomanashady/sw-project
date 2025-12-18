export declare class CarryForwardSettingsDto {
    leaveTypeId: string;
    maxCarryForwardDays: number;
    expiryDays?: number;
    carryForwardRule?: string;
    autoCarryForward?: boolean;
}
export declare class RunCarryForwardDto {
    leaveTypeId: string;
    employeeId?: string;
    asOfDate?: Date;
    departmentId?: string;
}
