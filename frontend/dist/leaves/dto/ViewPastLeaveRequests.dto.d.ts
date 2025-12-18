import { LeaveStatus } from '../enums/leave-status.enum';
export declare class ViewPastLeaveRequestsDto {
    employeeId: string;
    fromDate?: Date;
    toDate?: Date;
    status?: LeaveStatus;
    leaveTypeId?: string;
}
