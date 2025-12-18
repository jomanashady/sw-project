import { Gender } from '../enums/employee-profile.enums';
export declare class CreateCandidateDto {
    firstName: string;
    middleName?: string;
    lastName: string;
    nationalId: string;
    gender?: Gender;
    dateOfBirth?: Date;
    personalEmail?: string;
    mobilePhone?: string;
    departmentId?: string;
    positionId?: string;
    resumeUrl?: string;
    notes?: string;
}
declare const UpdateCandidateDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateCandidateDto, "nationalId">>>;
export declare class UpdateCandidateDto extends UpdateCandidateDto_base {
}
export {};
