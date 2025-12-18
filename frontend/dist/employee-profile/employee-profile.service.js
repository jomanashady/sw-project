"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeProfileService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const employee_profile_schema_1 = require("./models/employee-profile.schema");
const ep_change_request_schema_1 = require("./models/ep-change-request.schema");
const candidate_schema_1 = require("./models/candidate.schema");
const employee_system_role_schema_1 = require("./models/employee-system-role.schema");
const qualification_schema_1 = require("./models/qualification.schema");
const employee_profile_enums_1 = require("./enums/employee-profile.enums");
let EmployeeProfileService = class EmployeeProfileService {
    constructor(employeeModel, candidateModel, changeRequestModel, systemRoleModel, qualificationModel) {
        this.employeeModel = employeeModel;
        this.candidateModel = candidateModel;
        this.changeRequestModel = changeRequestModel;
        this.systemRoleModel = systemRoleModel;
        this.qualificationModel = qualificationModel;
    }
    async create(createEmployeeDto) {
        const existingEmployee = await this.employeeModel
            .findOne({ nationalId: createEmployeeDto.nationalId })
            .exec();
        if (existingEmployee) {
            throw new common_1.ConflictException('Employee with this National ID already exists');
        }
        const employeeNumber = await this.generateEmployeeNumber();
        let hashedPassword;
        if (createEmployeeDto.password) {
            hashedPassword = await bcrypt.hash(createEmployeeDto.password, 10);
        }
        const fullName = [
            createEmployeeDto.firstName,
            createEmployeeDto.middleName,
            createEmployeeDto.lastName,
        ]
            .filter(Boolean)
            .join(' ');
        const employee = new this.employeeModel({
            ...createEmployeeDto,
            employeeNumber,
            fullName,
            password: hashedPassword,
            status: createEmployeeDto.status || employee_profile_enums_1.EmployeeStatus.PROBATION,
            statusEffectiveFrom: new Date(),
        });
        const savedEmployee = await employee.save();
        await this.systemRoleModel.create({
            employeeProfileId: savedEmployee._id,
            roles: [employee_profile_enums_1.SystemRole.DEPARTMENT_EMPLOYEE],
            isActive: true,
        });
        return savedEmployee;
    }
    async findAll(query, currentUserId) {
        const { search, departmentId, positionId, status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const filter = {};
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { employeeNumber: { $regex: search, $options: 'i' } },
                { workEmail: { $regex: search, $options: 'i' } },
            ];
        }
        if (departmentId) {
            filter.primaryDepartmentId = new mongoose_2.Types.ObjectId(departmentId);
        }
        if (positionId) {
            filter.primaryPositionId = new mongoose_2.Types.ObjectId(positionId);
        }
        if (status) {
            filter.status = status;
        }
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const skip = (page - 1) * limit;
        const [employees, total] = await Promise.all([
            this.employeeModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('primaryDepartmentId', 'name code')
                .populate('primaryPositionId', 'title code')
                .populate('supervisorPositionId', 'title code')
                .populate('payGradeId', 'grade grossSalary')
                .select('-password')
                .lean()
                .exec(),
            this.employeeModel.countDocuments(filter).exec(),
        ]);
        return {
            data: employees,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid employee ID');
        }
        const employee = await this.employeeModel
            .findById(id)
            .populate('primaryDepartmentId', 'name code description')
            .populate('primaryPositionId', 'title code description')
            .populate('supervisorPositionId', 'title code')
            .populate('payGradeId', 'grade baseSalary grossSalary')
            .populate('lastAppraisalRecordId')
            .populate('accessProfileId')
            .select('-password')
            .exec();
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID ${id} not found`);
        }
        return employee;
    }
    async findByEmployeeNumber(employeeNumber) {
        const employee = await this.employeeModel
            .findOne({ employeeNumber })
            .select('-password')
            .exec();
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with number ${employeeNumber} not found`);
        }
        return employee;
    }
    async findByNationalId(nationalId) {
        const employee = await this.employeeModel
            .findOne({ nationalId })
            .select('-password')
            .exec();
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with national ID ${nationalId} not found`);
        }
        return employee;
    }
    async update(id, updateEmployeeDto) {
        const employee = await this.findOne(id);
        if (updateEmployeeDto.firstName ||
            updateEmployeeDto.middleName ||
            updateEmployeeDto.lastName) {
            const fullName = [
                updateEmployeeDto.firstName || employee.firstName,
                updateEmployeeDto.middleName || employee.middleName,
                updateEmployeeDto.lastName || employee.lastName,
            ]
                .filter(Boolean)
                .join(' ');
            updateEmployeeDto['fullName'] = fullName;
        }
        if (updateEmployeeDto.status &&
            updateEmployeeDto.status !== employee.status) {
            updateEmployeeDto['statusEffectiveFrom'] = new Date();
        }
        const updatedEmployee = await this.employeeModel
            .findByIdAndUpdate(id, { $set: updateEmployeeDto }, { new: true })
            .select('-password')
            .exec();
        return updatedEmployee;
    }
    async updateSelfService(id, updateDto) {
        await this.findOne(id);
        const updatedEmployee = await this.employeeModel
            .findByIdAndUpdate(id, { $set: updateDto }, { new: true })
            .select('-password')
            .exec();
        return updatedEmployee;
    }
    async remove(id) {
        const employee = await this.findOne(id);
        await this.employeeModel
            .findByIdAndUpdate(id, {
            $set: {
                status: employee_profile_enums_1.EmployeeStatus.TERMINATED,
                statusEffectiveFrom: new Date(),
            },
        }, { new: true })
            .exec();
    }
    async assignSystemRoles(employeeId, roles, permissions = []) {
        await this.findOne(employeeId);
        const existingRole = await this.systemRoleModel
            .findOne({ employeeProfileId: new mongoose_2.Types.ObjectId(employeeId) })
            .exec();
        if (existingRole) {
            existingRole.roles = roles;
            existingRole.permissions = permissions;
            return existingRole.save();
        }
        return this.systemRoleModel.create({
            employeeProfileId: new mongoose_2.Types.ObjectId(employeeId),
            roles,
            permissions,
            isActive: true,
        });
    }
    async getSystemRoles(employeeId) {
        return this.systemRoleModel
            .findOne({ employeeProfileId: new mongoose_2.Types.ObjectId(employeeId) })
            .exec();
    }
    async createCandidate(createCandidateDto) {
        const existingCandidate = await this.candidateModel
            .findOne({ nationalId: createCandidateDto.nationalId })
            .exec();
        if (existingCandidate) {
            throw new common_1.ConflictException('Candidate with this National ID already exists');
        }
        const candidateNumber = await this.generateCandidateNumber();
        const fullName = [
            createCandidateDto.firstName,
            createCandidateDto.middleName,
            createCandidateDto.lastName,
        ]
            .filter(Boolean)
            .join(' ');
        const candidate = new this.candidateModel({
            ...createCandidateDto,
            candidateNumber,
            fullName,
            status: employee_profile_enums_1.CandidateStatus.APPLIED,
            applicationDate: new Date(),
        });
        return candidate.save();
    }
    async findAllCandidates() {
        return this.candidateModel
            .find()
            .populate('departmentId', 'name code')
            .populate('positionId', 'title code')
            .exec();
    }
    async findCandidateById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid candidate ID');
        }
        const candidate = await this.candidateModel
            .findById(id)
            .populate('departmentId', 'name code')
            .populate('positionId', 'title code')
            .exec();
        if (!candidate) {
            throw new common_1.NotFoundException(`Candidate with ID ${id} not found`);
        }
        return candidate;
    }
    async findCandidatesByStatus(status) {
        return this.candidateModel
            .find({ status })
            .populate('departmentId', 'name code')
            .populate('positionId', 'title code')
            .exec();
    }
    async updateCandidate(id, updateCandidateDto) {
        const candidate = await this.findCandidateById(id);
        if (updateCandidateDto.firstName ||
            updateCandidateDto.middleName ||
            updateCandidateDto.lastName) {
            const fullName = [
                updateCandidateDto.firstName || candidate.firstName,
                updateCandidateDto.middleName || candidate.middleName,
                updateCandidateDto.lastName || candidate.lastName,
            ]
                .filter(Boolean)
                .join(' ');
            updateCandidateDto['fullName'] = fullName;
        }
        const updatedCandidate = await this.candidateModel
            .findByIdAndUpdate(id, { $set: updateCandidateDto }, { new: true })
            .exec();
        return updatedCandidate;
    }
    async removeCandidate(id) {
        const candidate = await this.findCandidateById(id);
        await this.candidateModel.findByIdAndDelete(id).exec();
    }
    async convertCandidateToEmployee(candidateId, employeeData) {
        const candidate = await this.findCandidateById(candidateId);
        const createEmployeeDto = {
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            middleName: candidate.middleName,
            nationalId: candidate.nationalId,
            gender: candidate.gender,
            dateOfBirth: candidate.dateOfBirth,
            personalEmail: candidate.personalEmail,
            mobilePhone: candidate.mobilePhone,
            workEmail: employeeData.workEmail,
            dateOfHire: employeeData.dateOfHire,
            contractType: employeeData.contractType,
            workType: employeeData.workType,
            status: employee_profile_enums_1.EmployeeStatus.PROBATION,
            primaryDepartmentId: employeeData.primaryDepartmentId || candidate.departmentId?.toString(),
            primaryPositionId: employeeData.primaryPositionId || candidate.positionId?.toString(),
            password: employeeData.password,
        };
        const employee = await this.create(createEmployeeDto);
        await this.candidateModel
            .findByIdAndUpdate(candidateId, {
            $set: {
                status: employee_profile_enums_1.CandidateStatus.HIRED,
            },
        })
            .exec();
        return employee;
    }
    async createProfileChangeRequest(employeeId, createRequestDto) {
        await this.findOne(employeeId);
        const requestId = await this.generateChangeRequestId();
        const changeRequest = new this.changeRequestModel({
            requestId,
            employeeProfileId: new mongoose_2.Types.ObjectId(employeeId),
            requestDescription: createRequestDto.requestDescription,
            reason: createRequestDto.reason,
            status: employee_profile_enums_1.ProfileChangeStatus.PENDING,
            submittedAt: new Date(),
        });
        return changeRequest.save();
    }
    async getProfileChangeRequestsByEmployee(employeeId) {
        return this.changeRequestModel
            .find({ employeeProfileId: new mongoose_2.Types.ObjectId(employeeId) })
            .sort({ submittedAt: -1 })
            .exec();
    }
    async getAllProfileChangeRequests(status) {
        const filter = {};
        if (status) {
            filter.status = status;
        }
        return this.changeRequestModel
            .find(filter)
            .populate('employeeProfileId', 'firstName lastName employeeNumber')
            .sort({ submittedAt: -1 })
            .exec();
    }
    async getProfileChangeRequestById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid change request ID');
        }
        const request = await this.changeRequestModel
            .findById(id)
            .populate('employeeProfileId', 'firstName lastName employeeNumber')
            .exec();
        if (!request) {
            throw new common_1.NotFoundException(`Change request with ID ${id} not found`);
        }
        return request;
    }
    async processProfileChangeRequest(id, processDto) {
        const request = await this.getProfileChangeRequestById(id);
        if (request.status !== employee_profile_enums_1.ProfileChangeStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending change requests can be processed');
        }
        const updatedRequest = await this.changeRequestModel
            .findByIdAndUpdate(id, {
            $set: {
                status: processDto.status,
                reason: processDto.reason,
                processedAt: new Date(),
            },
        }, { new: true })
            .populate('employeeProfileId', 'firstName lastName employeeNumber')
            .exec();
        if (!updatedRequest) {
            throw new common_1.NotFoundException('Change request not found after update');
        }
        return updatedRequest;
    }
    async addQualification(employeeId, qualificationData) {
        await this.findOne(employeeId);
        const qualification = new this.qualificationModel({
            employeeProfileId: new mongoose_2.Types.ObjectId(employeeId),
            establishmentName: qualificationData.establishmentName,
            graduationType: qualificationData.graduationType,
        });
        return qualification.save();
    }
    async getQualificationsByEmployee(employeeId) {
        return this.qualificationModel
            .find({ employeeProfileId: new mongoose_2.Types.ObjectId(employeeId) })
            .exec();
    }
    async removeQualification(qualificationId, employeeId) {
        const qualification = await this.qualificationModel.findById(qualificationId);
        if (!qualification) {
            throw new common_1.NotFoundException(`Qualification with ID ${qualificationId} not found`);
        }
        if (qualification.employeeProfileId.toString() !== employeeId.toString()) {
            throw new common_1.ForbiddenException('You are not authorized to delete this qualification');
        }
        await this.qualificationModel.findByIdAndDelete(qualificationId).exec();
    }
    async generateEmployeeNumber() {
        const year = new Date().getFullYear();
        const prefix = `EMP-${year}`;
        const lastEmployee = await this.employeeModel
            .findOne({ employeeNumber: { $regex: `^${prefix}` } })
            .sort({ employeeNumber: -1 })
            .exec();
        let sequence = 1;
        if (lastEmployee) {
            const lastSequence = parseInt(lastEmployee.employeeNumber.split('-')[2], 10);
            sequence = lastSequence + 1;
        }
        return `${prefix}-${sequence.toString().padStart(4, '0')}`;
    }
    async generateCandidateNumber() {
        const year = new Date().getFullYear();
        const prefix = `CAN-${year}`;
        const lastCandidate = await this.candidateModel
            .findOne({ candidateNumber: { $regex: `^${prefix}` } })
            .sort({ candidateNumber: -1 })
            .exec();
        let sequence = 1;
        if (lastCandidate) {
            const lastSequence = parseInt(lastCandidate.candidateNumber.split('-')[2], 10);
            sequence = lastSequence + 1;
        }
        return `${prefix}-${sequence.toString().padStart(4, '0')}`;
    }
    async generateChangeRequestId() {
        const year = new Date().getFullYear();
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const prefix = `CHR-${year}${month}`;
        const lastRequest = await this.changeRequestModel
            .findOne({ requestId: { $regex: `^${prefix}` } })
            .sort({ requestId: -1 })
            .exec();
        let sequence = 1;
        if (lastRequest) {
            const lastSequence = parseInt(lastRequest.requestId.split('-')[2], 10);
            sequence = lastSequence + 1;
        }
        return `${prefix}-${sequence.toString().padStart(4, '0')}`;
    }
    async updateLastAppraisal(employeeId, appraisalData) {
        await this.employeeModel
            .findByIdAndUpdate(employeeId, { $set: appraisalData })
            .exec();
    }
    async findByDepartment(departmentId) {
        if (!mongoose_2.Types.ObjectId.isValid(departmentId)) {
            throw new common_1.BadRequestException('Invalid department ID');
        }
        return this.employeeModel
            .find({ primaryDepartmentId: new mongoose_2.Types.ObjectId(departmentId) })
            .select('-password')
            .exec();
    }
    async findByPosition(positionId) {
        return this.employeeModel
            .find({ primaryPositionId: new mongoose_2.Types.ObjectId(positionId) })
            .select('-password')
            .exec();
    }
    async findBySupervisor(supervisorPositionId) {
        return this.employeeModel
            .find({ supervisorPositionId: new mongoose_2.Types.ObjectId(supervisorPositionId) })
            .select('-password')
            .exec();
    }
    async getEmployeeStats() {
        const stats = await this.employeeModel.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);
        const total = await this.employeeModel.countDocuments();
        return {
            total,
            byStatus: stats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {}),
        };
    }
};
exports.EmployeeProfileService = EmployeeProfileService;
exports.EmployeeProfileService = EmployeeProfileService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(employee_profile_schema_1.EmployeeProfile.name)),
    __param(1, (0, mongoose_1.InjectModel)(candidate_schema_1.Candidate.name)),
    __param(2, (0, mongoose_1.InjectModel)(ep_change_request_schema_1.EmployeeProfileChangeRequest.name)),
    __param(3, (0, mongoose_1.InjectModel)(employee_system_role_schema_1.EmployeeSystemRole.name)),
    __param(4, (0, mongoose_1.InjectModel)(qualification_schema_1.EmployeeQualification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], EmployeeProfileService);
//# sourceMappingURL=employee-profile.service.js.map