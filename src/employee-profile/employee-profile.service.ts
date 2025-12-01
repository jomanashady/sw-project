// src/employee-profile/employee-profile.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from './models/employee-profile.schema';
import {
  EmployeeProfileChangeRequest, // Use base class only
} from './models/ep-change-request.schema';
import { Candidate, CandidateDocument } from './models/candidate.schema';
import { EmployeeSystemRole } from './models/employee-system-role.schema';
import { EmployeeQualification } from './models/qualification.schema'; // Use base class only
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  UpdateEmployeeSelfServiceDto,
  QueryEmployeeDto,
  CreateCandidateDto,
  UpdateCandidateDto,
  CreateProfileChangeRequestDto,
  ProcessProfileChangeRequestDto,
} from './dto';
import {
  EmployeeStatus,
  SystemRole,
  CandidateStatus,
  ProfileChangeStatus,
  GraduationType,
} from './enums/employee-profile.enums';

@Injectable()
export class EmployeeProfileService {
  constructor(
    @InjectModel(EmployeeProfile.name)
    private employeeModel: Model<EmployeeProfileDocument>,
    @InjectModel(Candidate.name)
    private candidateModel: Model<CandidateDocument>,
    @InjectModel(EmployeeProfileChangeRequest.name)
    private changeRequestModel: Model<EmployeeProfileChangeRequest>, // Remove Document suffix
    @InjectModel(EmployeeSystemRole.name)
    private systemRoleModel: Model<EmployeeSystemRole>,
    @InjectModel(EmployeeQualification.name)
    private qualificationModel: Model<EmployeeQualification>, // Remove Document suffix
  ) {}

  // ==================== EMPLOYEE CRUD ====================

  async create(createEmployeeDto: CreateEmployeeDto): Promise<EmployeeProfile> {
    // Check for duplicate national ID
    const existingEmployee = await this.employeeModel
      .findOne({ nationalId: createEmployeeDto.nationalId })
      .exec();

    if (existingEmployee) {
      throw new ConflictException(
        'Employee with this National ID already exists',
      );
    }

    // Generate employee number
    const employeeNumber = await this.generateEmployeeNumber();

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (createEmployeeDto.password) {
      hashedPassword = await bcrypt.hash(createEmployeeDto.password, 10);
    }

    // Create full name
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
      status: createEmployeeDto.status || EmployeeStatus.PROBATION,
      statusEffectiveFrom: new Date(),
    });

    const savedEmployee = await employee.save();

    // Create default system role
    await this.systemRoleModel.create({
      employeeProfileId: savedEmployee._id,
      roles: [SystemRole.DEPARTMENT_EMPLOYEE],
      isActive: true,
    });

    return savedEmployee;
  }

  async findAll(query: QueryEmployeeDto, currentUserId?: string) {
    const {
      search,
      departmentId,
      positionId,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: any = {};

    // Search across multiple fields
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeNumber: { $regex: search, $options: 'i' } },
        { workEmail: { $regex: search, $options: 'i' } },
      ];
    }

    if (departmentId) {
      filter.primaryDepartmentId = new Types.ObjectId(departmentId);
    }

    if (positionId) {
      filter.primaryPositionId = new Types.ObjectId(positionId);
    }

    if (status) {
      filter.status = status;
    }

    const sort: any = {};
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

  async findOne(id: string): Promise<EmployeeProfile> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid employee ID');
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
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async findByEmployeeNumber(employeeNumber: string): Promise<EmployeeProfile> {
    const employee = await this.employeeModel
      .findOne({ employeeNumber })
      .select('-password')
      .exec();

    if (!employee) {
      throw new NotFoundException(
        `Employee with number ${employeeNumber} not found`,
      );
    }

    return employee;
  }

  async findByNationalId(nationalId: string): Promise<EmployeeProfile> {
    const employee = await this.employeeModel
      .findOne({ nationalId })
      .select('-password')
      .exec();

    if (!employee) {
      throw new NotFoundException(
        `Employee with national ID ${nationalId} not found`,
      );
    }

    return employee;
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<EmployeeProfile> {
    const employee = await this.findOne(id);

    // Update full name if name fields changed
    if (
      updateEmployeeDto.firstName ||
      updateEmployeeDto.middleName ||
      updateEmployeeDto.lastName
    ) {
      const fullName = [
        updateEmployeeDto.firstName || employee.firstName,
        updateEmployeeDto.middleName || employee.middleName,
        updateEmployeeDto.lastName || employee.lastName,
      ]
        .filter(Boolean)
        .join(' ');
      updateEmployeeDto['fullName'] = fullName;
    }

    // Update status effective date if status changed
    if (
      updateEmployeeDto.status &&
      updateEmployeeDto.status !== employee.status
    ) {
      updateEmployeeDto['statusEffectiveFrom'] = new Date();
    }

    const updatedEmployee = await this.employeeModel
      .findByIdAndUpdate(id, { $set: updateEmployeeDto }, { new: true })
      .select('-password')
      .exec();

    return updatedEmployee;
  }

  async updateSelfService(
    id: string,
    updateDto: UpdateEmployeeSelfServiceDto,
  ): Promise<EmployeeProfile> {
    await this.findOne(id);

    const updatedEmployee = await this.employeeModel
      .findByIdAndUpdate(id, { $set: updateDto }, { new: true })
      .select('-password')
      .exec();

    return updatedEmployee;
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);

    // Soft delete: change status to TERMINATED
    await this.employeeModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            status: EmployeeStatus.TERMINATED,
            statusEffectiveFrom: new Date(),
          },
        },
        { new: true },
      )
      .exec();
  }

  // ==================== SYSTEM ROLE MANAGEMENT ====================

  async assignSystemRoles(
    employeeId: string,
    roles: SystemRole[],
    permissions: string[] = [],
  ): Promise<EmployeeSystemRole> {
    await this.findOne(employeeId);

    const existingRole = await this.systemRoleModel
      .findOne({ employeeProfileId: new Types.ObjectId(employeeId) })
      .exec();

    if (existingRole) {
      existingRole.roles = roles;
      existingRole.permissions = permissions;
      return existingRole.save();
    }

    return this.systemRoleModel.create({
      employeeProfileId: new Types.ObjectId(employeeId),
      roles,
      permissions,
      isActive: true,
    });
  }

  async getSystemRoles(employeeId: string): Promise<EmployeeSystemRole | null> {
    return this.systemRoleModel
      .findOne({ employeeProfileId: new Types.ObjectId(employeeId) })
      .exec();
  }

  // ==================== CANDIDATE MANAGEMENT ====================

  async createCandidate(
    createCandidateDto: CreateCandidateDto,
  ): Promise<Candidate> {
    // Check for duplicate national ID
    const existingCandidate = await this.candidateModel
      .findOne({ nationalId: createCandidateDto.nationalId })
      .exec();

    if (existingCandidate) {
      throw new ConflictException(
        'Candidate with this National ID already exists',
      );
    }

    // Generate candidate number
    const candidateNumber = await this.generateCandidateNumber();

    // Create full name
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
      status: CandidateStatus.APPLIED,
      applicationDate: new Date(),
    });

    return candidate.save();
  }

  async findAllCandidates(): Promise<Candidate[]> {
    return this.candidateModel
      .find()
      .populate('departmentId', 'name code')
      .populate('positionId', 'title code')
      .exec();
  }

  async findCandidateById(id: string): Promise<Candidate> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid candidate ID');
    }

    const candidate = await this.candidateModel
      .findById(id)
      .populate('departmentId', 'name code')
      .populate('positionId', 'title code')
      .exec();

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }

    return candidate;
  }

  async findCandidatesByStatus(status: string): Promise<Candidate[]> {
    return this.candidateModel
      .find({ status })
      .populate('departmentId', 'name code')
      .populate('positionId', 'title code')
      .exec();
  }

  async updateCandidate(
    id: string,
    updateCandidateDto: UpdateCandidateDto,
  ): Promise<Candidate> {
    const candidate = await this.findCandidateById(id);

    // Update full name if name fields changed
    if (
      updateCandidateDto.firstName ||
      updateCandidateDto.middleName ||
      updateCandidateDto.lastName
    ) {
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

  async removeCandidate(id: string): Promise<void> {
    const candidate = await this.findCandidateById(id);
    await this.candidateModel.findByIdAndDelete(id).exec();
  }

  async convertCandidateToEmployee(
    candidateId: string,
    employeeData: {
      workEmail: string;
      dateOfHire: Date;
      contractType: string;
      workType: string;
      password?: string;
      primaryDepartmentId?: string;
      primaryPositionId?: string;
    },
  ): Promise<EmployeeProfile> {
    const candidate = await this.findCandidateById(candidateId);

    // Create employee from candidate data
    const createEmployeeDto: CreateEmployeeDto = {
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
      contractType: employeeData.contractType as any,
      workType: employeeData.workType as any,
      status: EmployeeStatus.PROBATION,
      primaryDepartmentId:
        employeeData.primaryDepartmentId || candidate.departmentId?.toString(),
      primaryPositionId:
        employeeData.primaryPositionId || candidate.positionId?.toString(),
      password: employeeData.password,
    };

    // Create employee
    const employee = await this.create(createEmployeeDto);

    // Update candidate status to HIRED
    await this.candidateModel
      .findByIdAndUpdate(candidateId, {
        $set: {
          status: CandidateStatus.HIRED,
        },
      })
      .exec();

    return employee;
  }

  // ==================== PROFILE CHANGE REQUEST MANAGEMENT ====================

  async createProfileChangeRequest(
    employeeId: string,
    createRequestDto: CreateProfileChangeRequestDto,
  ): Promise<EmployeeProfileChangeRequest> {
    await this.findOne(employeeId);

    // Generate request ID
    const requestId = await this.generateChangeRequestId();

    const changeRequest = new this.changeRequestModel({
      requestId,
      employeeProfileId: new Types.ObjectId(employeeId),
      requestDescription: createRequestDto.requestDescription,
      reason: createRequestDto.reason,
      status: ProfileChangeStatus.PENDING,
      submittedAt: new Date(),
    });

    return changeRequest.save();
  }

  async getProfileChangeRequestsByEmployee(
    employeeId: string,
  ): Promise<EmployeeProfileChangeRequest[]> {
    return this.changeRequestModel
      .find({ employeeProfileId: new Types.ObjectId(employeeId) })
      .sort({ submittedAt: -1 })
      .exec();
  }

  async getAllProfileChangeRequests(
    status?: string,
  ): Promise<EmployeeProfileChangeRequest[]> {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    return this.changeRequestModel
      .find(filter)
      .populate('employeeProfileId', 'firstName lastName employeeNumber')
      .sort({ submittedAt: -1 })
      .exec();
  }

  async getProfileChangeRequestById(
    id: string,
  ): Promise<EmployeeProfileChangeRequest> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid change request ID');
    }

    const request = await this.changeRequestModel
      .findById(id)
      .populate('employeeProfileId', 'firstName lastName employeeNumber')
      .exec();

    if (!request) {
      throw new NotFoundException(`Change request with ID ${id} not found`);
    }

    return request;
  }

  async processProfileChangeRequest(
    id: string,
    processDto: ProcessProfileChangeRequestDto,
  ): Promise<EmployeeProfileChangeRequest> {
    const request = await this.getProfileChangeRequestById(id);

    if (request.status !== ProfileChangeStatus.PENDING) {
      throw new BadRequestException(
        'Only pending change requests can be processed',
      );
    }

    const updatedRequest = await this.changeRequestModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            status: processDto.status as ProfileChangeStatus,
            reason: processDto.reason,
            processedAt: new Date(),
          },
        },
        { new: true },
      )
      .populate('employeeProfileId', 'firstName lastName employeeNumber')
      .exec();

    if (!updatedRequest) {
      throw new NotFoundException('Change request not found after update');
    }

    return updatedRequest;
  }

  // ==================== QUALIFICATION MANAGEMENT ====================

  async addQualification(
    employeeId: string,
    qualificationData: {
      establishmentName: string;
      graduationType: string;
    },
  ): Promise<EmployeeQualification> {
    await this.findOne(employeeId);

    const qualification = new this.qualificationModel({
      employeeProfileId: new Types.ObjectId(employeeId),
      establishmentName: qualificationData.establishmentName,
      graduationType: qualificationData.graduationType as GraduationType,
    });

    return qualification.save();
  }

  async getQualificationsByEmployee(
    employeeId: string,
  ): Promise<EmployeeQualification[]> {
    return this.qualificationModel
      .find({ employeeProfileId: new Types.ObjectId(employeeId) })
      .exec();
  }

  async removeQualification(
    qualificationId: string,
    employeeId: string,
  ): Promise<void> {
    const qualification =
      await this.qualificationModel.findById(qualificationId);

    if (!qualification) {
      throw new NotFoundException(
        `Qualification with ID ${qualificationId} not found`,
      );
    }

    // Check if the qualification belongs to the employee
    if (qualification.employeeProfileId.toString() !== employeeId.toString()) {
      throw new ForbiddenException(
        'You are not authorized to delete this qualification',
      );
    }

    await this.qualificationModel.findByIdAndDelete(qualificationId).exec();
  }

  // ==================== HELPER METHODS ====================

  private async generateEmployeeNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `EMP-${year}`;

    const lastEmployee = await this.employeeModel
      .findOne({ employeeNumber: { $regex: `^${prefix}` } })
      .sort({ employeeNumber: -1 })
      .exec();

    let sequence = 1;
    if (lastEmployee) {
      const lastSequence = parseInt(
        lastEmployee.employeeNumber.split('-')[2],
        10,
      );
      sequence = lastSequence + 1;
    }

    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }

  private async generateCandidateNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CAN-${year}`;

    const lastCandidate = await this.candidateModel
      .findOne({ candidateNumber: { $regex: `^${prefix}` } })
      .sort({ candidateNumber: -1 })
      .exec();

    let sequence = 1;
    if (lastCandidate) {
      const lastSequence = parseInt(
        lastCandidate.candidateNumber.split('-')[2],
        10,
      );
      sequence = lastSequence + 1;
    }

    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }

  private async generateChangeRequestId(): Promise<string> {
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

  async updateLastAppraisal(
    employeeId: string,
    appraisalData: {
      lastAppraisalRecordId?: Types.ObjectId;
      lastAppraisalCycleId?: Types.ObjectId;
      lastAppraisalTemplateId?: Types.ObjectId;
      lastAppraisalDate?: Date;
      lastAppraisalScore?: number;
      lastAppraisalRatingLabel?: string;
      lastAppraisalScaleType?: string;
      lastDevelopmentPlanSummary?: string;
    },
  ): Promise<void> {
    await this.employeeModel
      .findByIdAndUpdate(employeeId, { $set: appraisalData })
      .exec();
  }

  async findByDepartment(departmentId: string): Promise<EmployeeProfile[]> {
    if (!Types.ObjectId.isValid(departmentId)) {
      throw new BadRequestException('Invalid department ID');
    }
    return this.employeeModel
      .find({ primaryDepartmentId: new Types.ObjectId(departmentId) })
      .select('-password')
      .exec();
  }

  async findByPosition(positionId: string): Promise<EmployeeProfile[]> {
    return this.employeeModel
      .find({ primaryPositionId: new Types.ObjectId(positionId) })
      .select('-password')
      .exec();
  }

  async findBySupervisor(
    supervisorPositionId: string,
  ): Promise<EmployeeProfile[]> {
    return this.employeeModel
      .find({ supervisorPositionId: new Types.ObjectId(supervisorPositionId) })
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
}
