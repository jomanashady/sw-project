import { Model, Types } from 'mongoose';
import { EmployeeProfileChangeRequest } from '../models/ep-change-request.schema';
import { CreateProfileChangeRequestDto, ProcessProfileChangeRequestDto } from '../dto';
import { ProfileChangeStatus } from '../enums/employee-profile.enums';
export declare class ProfileChangeRequestService {
    private changeRequestModel;
    constructor(changeRequestModel: Model<EmployeeProfileChangeRequest>);
    create(employeeId: string, createDto: CreateProfileChangeRequestDto): Promise<EmployeeProfileChangeRequest>;
    findAll(query: {
        status?: ProfileChangeStatus;
        employeeId?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, EmployeeProfileChangeRequest, {}, {}> & EmployeeProfileChangeRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<EmployeeProfileChangeRequest>;
    process(id: string, processDto: ProcessProfileChangeRequestDto): Promise<EmployeeProfileChangeRequest>;
    cancel(id: string, employeeId: string): Promise<EmployeeProfileChangeRequest>;
    private generateRequestId;
}
