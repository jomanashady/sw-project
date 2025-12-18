export declare enum AccrualAdjustmentType {
    SUSPENSION = "suspension",
    REDUCTION = "reduction",
    ADJUSTMENT = "adjustment",
    RESTORATION = "restoration"
}
export declare class AccrualAdjustmentDto {
    employeeId: string;
    leaveTypeId: string;
    adjustmentType: AccrualAdjustmentType;
    adjustmentAmount: number;
    fromDate: Date;
    toDate?: Date;
    reason: string;
    notes?: string;
}
export declare class AccrualSuspensionDto {
    employeeId: string;
    leaveTypeId: string;
    suspensionFromDate: Date;
    suspensionToDate?: Date;
    suspensionReason: string;
    notes?: string;
}
