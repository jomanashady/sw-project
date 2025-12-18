import { Gender, MaritalStatus, ContractType, WorkType, EmployeeStatus } from '../enums/employee-profile.enums';
declare class AddressDto {
    city?: string;
    streetAddress?: string;
    country?: string;
}
export declare class CreateEmployeeDto {
    firstName: string;
    middleName?: string;
    lastName: string;
    nationalId: string;
    password?: string;
    gender?: Gender;
    maritalStatus?: MaritalStatus;
    dateOfBirth?: Date;
    personalEmail?: string;
    workEmail?: string;
    mobilePhone?: string;
    homePhone?: string;
    address?: AddressDto;
    profilePictureUrl?: string;
    dateOfHire: Date;
    biography?: string;
    contractStartDate?: Date;
    contractEndDate?: Date;
    contractType?: ContractType;
    workType?: WorkType;
    status?: EmployeeStatus;
    primaryPositionId?: string;
    primaryDepartmentId?: string;
    supervisorPositionId?: string;
    payGradeId?: string;
}
export {};
