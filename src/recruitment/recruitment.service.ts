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

    @InjectModel(EmployeeProfile.name)
    private employeeModel: Model<EmployeeProfileDocument>, // <-- use Document type
  ) {}

  // ===================== OFFBOARDING =====================

  // 1) CREATE TERMINATION / RESIGNATION REQUEST
  async createTerminationRequest(dto: CreateTerminationRequestDto) {
    // Rule: EMPLOYEE can only initiate as "employee"
    if (
      dto.actorRole === 'EMPLOYEE' &&
      dto.initiator !== TerminationInitiation.EMPLOYEE // 'employee'
    ) {
      throw new ForbiddenException(
        'Employees may only initiate requests as EMPLOYEE.',
      );
    }

    // dto.employeeId is actually the employeeNumber string (e.g. "EMP-001")
    const employee = await this.employeeModel
      .findOne({ employeeNumber: dto.employeeId })
      .exec();

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    // Create termination request
    const termination = await this.terminationModel.create({
      // store the REAL Mongo _id as the reference (schema expects ObjectId)
      employeeId: employee._id,

      initiator: dto.initiator, // 'employee' | 'hr' | 'manager'
      reason: dto.reason,
      employeeComments: dto.employeeComments,
      terminationDate: dto.terminationDate
        ? new Date(dto.terminationDate)
        : undefined,
      status: TerminationStatus.PENDING,

      // you don't actually have contracts → use employee._id as a dummy valid ObjectId
      contractId: employee._id,
    });

    return termination;
  }

  // 2) GET TERMINATION REQUEST
  async getTerminationRequestById(id: string) {
    return this.terminationModel.findById(id);
  }

  // 3) HR UPDATES TERMINATION STATUS
  async updateTerminationStatus(id: string, dto: UpdateTerminationStatusDto) {
    if (dto.actorRole !== 'HR_MANAGER') {
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
      await this.createClearanceChecklist({
        terminationId: termination._id.toString(),
        actorRole: 'HR_MANAGER',
      });
    }

    return saved;
  }

  // 4) UPDATE TERMINATION DETAILS (reason/comments/date)
  async updateTerminationDetails(id: string, dto: UpdateTerminationDetailsDto) {
    const update: any = {};

    if (dto.reason !== undefined) update.reason = dto.reason;
    if (dto.employeeComments !== undefined)
      update.employeeComments = dto.employeeComments;
    if (dto.terminationDate)
      update.terminationDate = new Date(dto.terminationDate);

    return this.terminationModel.findByIdAndUpdate(id, update, { new: true });
  }

  // 5) CREATE CLEARANCE CHECKLIST
  async createClearanceChecklist(dto: CreateClearanceChecklistDto) {
    if (dto.actorRole !== 'HR_MANAGER') {
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

  // 6) GET CHECKLIST BY EMPLOYEE
  // Here employeeId is actually the employeeNumber string (e.g. "EMP-001")
  async getChecklistByEmployee(employeeId: string) {
    // 1) Find employee by employeeNumber
    const employee = await this.employeeModel
      .findOne({ employeeNumber: employeeId })
      .exec();

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    // 2) Find termination for that employee _id
    const termination = await this.terminationModel.findOne({
      employeeId: employee._id,
    });

    if (!termination) {
      throw new NotFoundException('No termination found.');
    }

    // 3) Return checklist linked to that termination
    return this.clearanceModel.findOne({ terminationId: termination._id });
  }

  // 7) UPDATE CLEARANCE ITEM STATUS
  async updateClearanceItemStatus(
    checklistId: string,
    dto: UpdateClearanceItemStatusDto,
  ) {
    if (dto.actorRole !== 'HR_MANAGER' && dto.actorRole !== dto.department) {
      throw new ForbiddenException('Unauthorized clearance update.');
    }

    await this.clearanceModel.updateOne(
      { _id: checklistId, 'items.department': dto.department },
      {
        $set: {
          'items.$.status': dto.status,
          'items.$.comments': dto.comments ?? null,
          'items.$.updatedBy': new Types.ObjectId(dto.actorId),
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
  async markChecklistCompleted(checklistId: string) {
    return this.clearanceModel.findByIdAndUpdate(
      checklistId,
      { cardReturned: true },
      { new: true },
    );
  }
}
