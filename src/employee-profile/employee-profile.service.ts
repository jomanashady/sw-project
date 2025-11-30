// src/employee-profile/employee-profile.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from './models/employee-profile.schema';
import { EmployeeProfileChangeRequest } from './models/ep-change-request.schema';
import { Candidate, CandidateDocument } from './models/candidate.schema';
import { EmployeeSystemRole } from './models/employee-system-role.schema';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  UpdateEmployeeSelfServiceDto,
  QueryEmployeeDto,
} from './dto';
import { EmployeeStatus, SystemRole } from './enums/employee-profile.enums';

@Injectable()
export class EmployeeProfileService {
  constructor(
    @InjectModel(EmployeeProfile.name)
    private employeeModel: Model<EmployeeProfileDocument>,
    @InjectModel(Candidate.name)
    private candidateModel: Model<CandidateDocument>,
    @InjectModel(EmployeeProfileChangeRequest.name)
    private changeRequestModel: Model<EmployeeProfileChangeRequest>,
    @InjectModel(EmployeeSystemRole.name)
    private systemRoleModel: Model<EmployeeSystemRole>,
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
