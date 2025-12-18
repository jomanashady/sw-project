import { LeaveStatus } from '../enums/leave-status.enum';
export declare class FilterLeaveHistoryDto {
    employeeId: string;
    leaveTypeId?: string;
    fromDate?: Date;
    toDate?: Date;
    status?: LeaveStatus;
    sortByDate?: 'asc' | 'desc';
    sortByStatus?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}
