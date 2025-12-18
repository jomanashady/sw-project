import { AdjustmentType } from '../enums/adjustment-type.enum';
export declare class CreateLeaveAdjustmentDto {
    employeeId: string;
    leaveTypeId: string;
    adjustmentType: AdjustmentType;
    amount: number;
    reason: string;
    hrUserId: string;
}
