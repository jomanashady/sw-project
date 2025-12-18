import { Model, Types } from 'mongoose';
import { EmployeeProfile, EmployeeProfileDocument } from './models/employee-profile.schema';
import { EmployeeProfileChangeRequest } from './models/ep-change-request.schema';
import { Candidate, CandidateDocument } from './models/candidate.schema';
import { EmployeeSystemRole } from './models/employee-system-role.schema';
import { EmployeeQualification } from './models/qualification.schema';
import { CreateEmployeeDto, UpdateEmployeeDto, UpdateEmployeeSelfServiceDto, QueryEmployeeDto, CreateCandidateDto, UpdateCandidateDto, CreateProfileChangeRequestDto, ProcessProfileChangeRequestDto } from './dto';
import { SystemRole } from './enums/employee-profile.enums';
export declare class EmployeeProfileService {
    private employeeModel;
    private candidateModel;
    private changeRequestModel;
    private systemRoleModel;
    private qualificationModel;
    constructor(employeeModel: Model<EmployeeProfileDocument>, candidateModel: Model<CandidateDocument>, changeRequestModel: Model<EmployeeProfileChangeRequest>, systemRoleModel: Model<EmployeeSystemRole>, qualificationModel: Model<EmployeeQualification>);
    create(createEmployeeDto: CreateEmployeeDto): Promise<EmployeeProfile>;
    findAll(query: QueryEmployeeDto, currentUserId?: string): Promise<{
        data: (import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, EmployeeProfile, {}, {}> & EmployeeProfile & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }> & Required<{
            _id: Types.ObjectId;
        }>)[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<EmployeeProfile>;
    findByEmployeeNumber(employeeNumber: string): Promise<EmployeeProfile>;
    findByNationalId(nationalId: string): Promise<EmployeeProfile>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<EmployeeProfile>;
    updateSelfService(id: string, updateDto: UpdateEmployeeSelfServiceDto): Promise<EmployeeProfile>;
    remove(id: string): Promise<void>;
    assignSystemRoles(employeeId: string, roles: SystemRole[], permissions?: string[]): Promise<EmployeeSystemRole>;
    getSystemRoles(employeeId: string): Promise<EmployeeSystemRole | null>;
    createCandidate(createCandidateDto: CreateCandidateDto): Promise<Candidate>;
    findAllCandidates(): Promise<Candidate[]>;
    findCandidateById(id: string): Promise<Candidate>;
    findCandidatesByStatus(status: string): Promise<Candidate[]>;
    updateCandidate(id: string, updateCandidateDto: UpdateCandidateDto): Promise<Candidate>;
    removeCandidate(id: string): Promise<void>;
    convertCandidateToEmployee(candidateId: string, employeeData: {
        workEmail: string;
        dateOfHire: Date;
        contractType: string;
        workType: string;
        password?: string;
        primaryDepartmentId?: string;
        primaryPositionId?: string;
    }): Promise<EmployeeProfile>;
    createProfileChangeRequest(employeeId: string, createRequestDto: CreateProfileChangeRequestDto): Promise<EmployeeProfileChangeRequest>;
    getProfileChangeRequestsByEmployee(employeeId: string): Promise<EmployeeProfileChangeRequest[]>;
    getAllProfileChangeRequests(status?: string): Promise<EmployeeProfileChangeRequest[]>;
    getProfileChangeRequestById(id: string): Promise<EmployeeProfileChangeRequest>;
    processProfileChangeRequest(id: string, processDto: ProcessProfileChangeRequestDto): Promise<EmployeeProfileChangeRequest>;
    addQualification(employeeId: string, qualificationData: {
        establishmentName: string;
        graduationType: string;
    }): Promise<EmployeeQualification>;
    getQualificationsByEmployee(employeeId: string): Promise<EmployeeQualification[]>;
    removeQualification(qualificationId: string, employeeId: string): Promise<void>;
    private generateEmployeeNumber;
    private generateCandidateNumber;
    private generateChangeRequestId;
    updateLastAppraisal(employeeId: string, appraisalData: {
        lastAppraisalRecordId?: Types.ObjectId;
        lastAppraisalCycleId?: Types.ObjectId;
        lastAppraisalTemplateId?: Types.ObjectId;
        lastAppraisalDate?: Date;
        lastAppraisalScore?: number;
        lastAppraisalRatingLabel?: string;
        lastAppraisalScaleType?: string;
        lastDevelopmentPlanSummary?: string;
    }): Promise<void>;
    findByDepartment(departmentId: string): Promise<EmployeeProfile[]>;
    findByPosition(positionId: string): Promise<EmployeeProfile[]>;
    findBySupervisor(supervisorPositionId: string): Promise<EmployeeProfile[]>;
    getEmployeeStats(): Promise<{
        total: number;
        byStatus: any;
    }>;
}
