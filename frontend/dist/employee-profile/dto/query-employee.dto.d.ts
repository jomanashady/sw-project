import { EmployeeStatus } from '../enums/employee-profile.enums';
export declare class QueryEmployeeDto {
    search?: string;
    departmentId?: string;
    positionId?: string;
    status?: EmployeeStatus;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
