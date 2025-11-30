// src/recruitment/recruitment.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { JobRequisition } from './models/job-requisition.schema';
import { Application } from './models/application.schema';

import { TerminationRequest } from './models/termination-request.schema';
import { ClearanceChecklist } from './models/clearance-checklist.schema';

import { TerminationStatus } from './enums/termination-status.enum';
import { TerminationInitiation } from './enums/termination-initiation.enum';
import { ApprovalStatus } from './enums/approval-status.enum';

import {
  CreateTerminationRequestDto,
  UpdateTerminationStatusDto,
  UpdateTerminationDetailsDto,
} from './dto/termination-request.dto';

import {
  CreateClearanceChecklistDto,
  UpdateClearanceItemStatusDto,
} from './dto/clearance-checklist.dto';

import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from '../employee-profile/models/employee-profile.schema';

// NEW – performance linkage
import {
  AppraisalRecord,
  AppraisalRecordDocument,
} from '../performance/models/appraisal-record.schema';

// System enums
import {
  EmployeeStatus,
  SystemRole,
} from '../employee-profile/enums/employee-profile.enums';

import { RevokeSystemAccessDto } from './dto/system-access.dto';

@Injectable()
export class RecruitmentService {
  constructor(
    @InjectModel(JobRequisition.name)
    private jobModel: Model<JobRequisition>,

    @InjectModel(Application.name)
    private applicationModel: Model<Application>,

    @InjectModel(TerminationRequest.name)
    private terminationModel: Model<TerminationRequest>,

    @InjectModel(ClearanceChecklist.name)
    private clearanceModel: Model<ClearanceChecklist>,
////NEW OFFBOARDING 

    @InjectModel(EmployeeProfile.name)
    private employeeModel: Model<EmployeeProfileDocument>,

    @InjectModel(AppraisalRecord.name)
    private appraisalRecordModel: Model<AppraisalRecordDocument>,
  ) {}

  // ================================== OFFBOARDING =======================================

  // 1) CREATE TERMINATION / RESIGNATION REQUEST
  async createTerminationRequest(
    dto: CreateTerminationRequestDto,
    user: any,
  ) {
    // Guard: user must be authenticated
    if (!user || !user.role) {
      throw new ForbiddenException('User role missing from token.');
    }

    // Find employee by employeeNumber (EMP-001, EMP-002, ...)
    const employee = await this.employeeModel
      .findOne({ employeeNumber: dto.employeeId })
      .exec();

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    // --- A) RESIGNATION: employee initiates their own request ---
    if (dto.initiator === TerminationInitiation.EMPLOYEE) {
      // Must be an EMPLOYEE in token
      if (user.role !== SystemRole.EMPLOYEE) {
        throw new ForbiddenException(
          'Only employees can initiate a resignation.',
        );
      }

      // Optional extra safety: make sure the employee is resigning themselves
      if (
        user.employeeNumber &&
        user.employeeNumber !== dto.employeeId
      ) {
        throw new ForbiddenException(
          'You can only submit a resignation for your own profile.',
        );
      }

      const termination = await this.terminationModel.create({
        employeeId: employee._id,
        initiator: dto.initiator, // 'employee'
        reason: dto.reason,
        employeeComments: dto.employeeComments,
        terminationDate: dto.terminationDate
          ? new Date(dto.terminationDate)
          : undefined,
        status: TerminationStatus.PENDING,
        // no separate contract entity → use employee._id as dummy ObjectId
        contractId: employee._id,
      });

      return termination;
    }

    // --- B) HR TERMINATION BASED ON PERFORMANCE ---
    if (
      dto.initiator === TerminationInitiation.HR ||
      dto.initiator === TerminationInitiation.MANAGER
    ) {
      // Only HR_MANAGER is allowed to do this
      if (user.role !== SystemRole.HR_MANAGER) {
        throw new ForbiddenException(
          'Only HR Manager can initiate termination based on performance.',
        );
      }

      // Get latest performance appraisal for this employee
      const latestRecord = await this.appraisalRecordModel
        .findOne({ employeeProfileId: employee._id })
        .sort({ createdAt: -1 })
        .exec();

      if (!latestRecord) {
        throw new ForbiddenException(
          'Cannot terminate: employee has no appraisal record.',
        );
      }

      if (
        latestRecord.totalScore === undefined ||
        latestRecord.totalScore === null
      ) {
        throw new ForbiddenException(
          'Cannot terminate: appraisal has no total score.',
        );
      }

      // Example rule: only allow termination if totalScore < 2.5
      if (latestRecord.totalScore >= 2.5) {
        throw new ForbiddenException(
          'Cannot terminate: performance score is not low enough for termination.',
        );
      }

      const termination = await this.terminationModel.create({
        employeeId: employee._id,
        initiator: dto.initiator, // 'hr' or 'manager'
        reason:
          dto.reason ||
          `Termination due to poor performance (score: ${latestRecord.totalScore})`,
        employeeComments: dto.employeeComments,
        terminationDate: dto.terminationDate
          ? new Date(dto.terminationDate)
          : undefined,
        status: TerminationStatus.PENDING,
        contractId: employee._id,
      });

      return termination;
    }

    // --- C) Any other initiator value ---
    throw new ForbiddenException('Unsupported termination initiator.');
  }

  // 2) GET TERMINATION REQUEST
  async getTerminationRequestById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Termination request not found.');
    }

    const termination = await this.terminationModel.findById(id).exec();
    if (!termination) {
      throw new NotFoundException('Termination request not found.');
    }

    return termination;
  }

  // 3) HR UPDATES TERMINATION STATUS
  async updateTerminationStatus(
    id: string,
    dto: UpdateTerminationStatusDto,
    user: any,
  ) {
    // Only HR Manager
    if (!user || user.role !== SystemRole.HR_MANAGER) {
      throw new ForbiddenException(
        'Only HR Manager can update termination status.',
      );
    }

    const termination = await this.terminationModel.findById(id);
    if (!termination) {
      throw new NotFoundException('Termination request not found.');
    }

    termination.status = dto.status;

    if (dto.hrComments !== undefined) {
      termination.hrComments = dto.hrComments;
    }

    if (dto.terminationDate) {
      termination.terminationDate = new Date(dto.terminationDate);
    }

    const saved = await termination.save();

    // When approved → create clearance checklist
    if (dto.status === TerminationStatus.APPROVED) {
      await this.createClearanceChecklist(
        {
          terminationId: termination._id.toString(),
        } as CreateClearanceChecklistDto,
        user,
      );
    }

    return saved;
  }

  // 4) UPDATE TERMINATION DETAILS (reason/comments/date)
  async updateTerminationDetails(
    id: string,
    dto: UpdateTerminationDetailsDto,
    user: any,
  ) {
    // Reasonable to restrict to HR Manager
    if (!user || user.role !== SystemRole.HR_MANAGER) {
      throw new ForbiddenException(
        'Only HR Manager can edit termination details.',
      );
    }

    const update: any = {};

    if (dto.reason !== undefined) update.reason = dto.reason;
    if (dto.employeeComments !== undefined)
      update.employeeComments = dto.employeeComments;
    if (dto.terminationDate)
      update.terminationDate = new Date(dto.terminationDate);

    return this.terminationModel.findByIdAndUpdate(id, update, { new: true });
  }

  // 5) CREATE CLEARANCE CHECKLIST
  async createClearanceChecklist(
    dto: CreateClearanceChecklistDto,
    user: any,
  ) {
    // Only HR Manager
    if (!user || user.role !== SystemRole.HR_MANAGER) {
      throw new ForbiddenException(
        'Only HR Manager can create clearance checklist.',
      );
    }

    const checklist = new this.clearanceModel({
      terminationId: new Types.ObjectId(dto.terminationId),
      items: [
        { department: 'HR', status: ApprovalStatus.PENDING },
        { department: 'IT', status: ApprovalStatus.PENDING },
        { department: 'FINANCE', status: ApprovalStatus.PENDING },
        { department: 'FACILITIES', status: ApprovalStatus.PENDING },
        { department: 'ADMIN', status: ApprovalStatus.PENDING },
      ],
      equipmentList: [],
      cardReturned: false,
    });

    return checklist.save();
  }

  // 6) GET CHECKLIST BY EMPLOYEE (employeeNumber)
  async getChecklistByEmployee(employeeId: string) {
    const employee = await this.employeeModel
      .findOne({ employeeNumber: employeeId })
      .exec();

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    const termination = await this.terminationModel.findOne({
      employeeId: employee._id,
    });

    if (!termination) {
      throw new NotFoundException('No termination found.');
    }

    return this.clearanceModel.findOne({ terminationId: termination._id });
  }

  // 7) UPDATE CLEARANCE ITEM STATUS
  async updateClearanceItemStatus(
    checklistId: string,
    dto: UpdateClearanceItemStatusDto,
    user: any,
  ) {
    // For now: only HR Manager can perform department sign-offs
    if (!user || user.role !== SystemRole.HR_MANAGER) {
      throw new ForbiddenException('Unauthorized clearance update.');
    }

    await this.clearanceModel.updateOne(
      { _id: checklistId, 'items.department': dto.department },
      {
        $set: {
          'items.$.status': dto.status,
          'items.$.comments': dto.comments ?? null,
          'items.$.updatedBy': user.id ? new Types.ObjectId(user.id) : null,
          'items.$.updatedAt': new Date(),
        },
      },
    );

    const checklist = await this.clearanceModel.findById(checklistId);
    if (!checklist) {
      throw new NotFoundException('Checklist not found.');
    }

    const allApproved = checklist.items.every(
      (i: any) => i.status === ApprovalStatus.APPROVED,
    );

    if (allApproved) {
      checklist.cardReturned = true;
      await checklist.save();

      await this.terminationModel.findByIdAndUpdate(checklist.terminationId, {
        status: TerminationStatus.APPROVED,
      });
    }

    return { message: 'Clearance item updated.' };
  }

  // 8) MANUAL COMPLETE
  async markChecklistCompleted(checklistId: string, user: any) {
    if (!user || user.role !== SystemRole.HR_MANAGER) {
      throw new ForbiddenException(
        'Only HR Manager can manually complete checklist.',
      );
    }

    return this.clearanceModel.findByIdAndUpdate(
      checklistId,
      { cardReturned: true },
      { new: true },
    );
  }

  // 9) GET LATEST APPRAISAL FOR AN EMPLOYEE (by employeeNumber)
  async getLatestAppraisalForEmployee(employeeId: string) {
    const employee = await this.employeeModel
      .findOne({ employeeNumber: employeeId })
      .exec();

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    // If EmployeeProfile has lastAppraisalRecordId, prefer it
    if (employee.lastAppraisalRecordId) {
      const record = await this.appraisalRecordModel
        .findById(employee.lastAppraisalRecordId)
        .exec();

      if (!record) {
        throw new NotFoundException(
          'No appraisal record found for this employee.',
        );
      }

      return {
        employee: {
          id: employee._id,
          employeeNumber: employee.employeeNumber,
          status: employee.status,
          lastAppraisalDate: employee.lastAppraisalDate,
          lastAppraisalScore: employee.lastAppraisalScore,
          lastAppraisalRatingLabel: employee.lastAppraisalRatingLabel,
        },
        appraisal: record,
      };
    }

    // Fallback: latest by employeeProfileId
    const latestRecord = await this.appraisalRecordModel
      .findOne({ employeeProfileId: employee._id })
      .sort({ createdAt: -1 })
      .exec();

    if (!latestRecord) {
      throw new NotFoundException(
        'No appraisal record found for this employee.',
      );
    }

    return {
      employee: {
        id: employee._id,
        employeeNumber: employee.employeeNumber,
        status: employee.status,
        lastAppraisalDate: employee.lastAppraisalDate,
        lastAppraisalScore: employee.lastAppraisalScore,
        lastAppraisalRatingLabel: employee.lastAppraisalRatingLabel,
      },
      appraisal: latestRecord,
    };
  }

  // 10) FUNCTION TO MAKE EMPLOYEE INACTIVE (SYSTEM ADMIN)
  async revokeSystemAccess(dto: RevokeSystemAccessDto, user: any) {
    // Only SYSTEM_ADMIN can do this
    if (!user || user.role !== SystemRole.SYSTEM_ADMIN) {
      throw new ForbiddenException(
        'Only System Admin can revoke system access.',
      );
    }

    // Find employee by employeeNumber
    const employee = await this.employeeModel.findOne({
      employeeNumber: dto.employeeId,
    });

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    // Update status to INACTIVE
    employee.status = EmployeeStatus.INACTIVE;
    await employee.save();

    return {
      message: 'System access revoked. Employee made inactive.',
    };
  }
}
// ===================================END OFFBOARDING=========================================