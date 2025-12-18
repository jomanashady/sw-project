import { SystemRole } from '../enums/employee-profile.enums';
export declare class AssignSystemRoleDto {
    employeeProfileId: string;
    roles: SystemRole[];
    permissions?: string[];
}
