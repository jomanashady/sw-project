import { CreateEmployeeDto } from './create-employee.dto';
declare const UpdateEmployeeDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateEmployeeDto, "nationalId" | "password">>>;
export declare class UpdateEmployeeDto extends UpdateEmployeeDto_base {
}
declare class AddressDto {
    city?: string;
    streetAddress?: string;
    country?: string;
}
export declare class UpdateEmployeeSelfServiceDto {
    personalEmail?: string;
    mobilePhone?: string;
    homePhone?: string;
    address?: AddressDto;
    profilePictureUrl?: string;
    biography?: string;
}
export {};
