import { LeaveStatus } from '../enums/leave-status.enum';
export declare class FilterTeamLeaveDataDto {
    managerId: string;
    departmentId?: string;
    leaveTypeId?: string;
    fromDate?: Date;
    toDate?: Date;
    status?: LeaveStatus;
    sortByDate?: 'asc' | 'desc';
    sortByStatus?: 'asc' | 'desc';
    sortByDepartment?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}
