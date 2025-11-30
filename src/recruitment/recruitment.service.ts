import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JobRequisition } from './models/job-requisition.schema';
import { Application } from './models/application.schema';
import { Interview } from './models/interview.schema';
import { Offer } from './models/offer.schema';
import { CreateJobRequisitionDto } from './dto/job-requisition.dto';
import { CreateApplicationDto, UpdateApplicationStatusDto } from './dto/application.dto';
import { ScheduleInterviewDto, UpdateInterviewStatusDto } from './dto/interview.dto';
import { CreateOfferDto, RespondToOfferDto, FinalizeOfferDto } from './dto/offer.dto';
import * as nodemailer from 'nodemailer';
import { Onboarding, OnboardingDocument } from './models/onboarding.schema';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { UpdateOnboardingTaskDto } from './dto/update-task.dto';
import { OnboardingTaskStatus } from './enums/onboarding-task-status.enum';
import { Document, DocumentDocument } from './models/document.schema';
import * as fs from 'fs-extra';
import { DocumentType } from './enums/document-type.enum';
import { Response } from 'express';
import { EmployeeProfileService } from '../employee-profile/employee-profile.service';
import { Contract, ContractDocument } from './models/contract.schema';
import { CreateEmployeeFromContractDto } from './dto/create-employee-from-contract.dto';
import { OfferResponseStatus } from './enums/offer-response-status.enum';
import { OfferFinalStatus } from './enums/offer-final-status.enum';
import { CreateEmployeeDto } from '../employee-profile/dto/create-employee.dto';
import { EmployeeStatus } from '../employee-profile/enums/employee-profile.enums';
import { Candidate, CandidateDocument } from '../employee-profile/models/candidate.schema';


@Injectable()
export class RecruitmentService {
 constructor(
  @InjectModel(JobRequisition.name)
  private jobModel: Model<JobRequisition>,

  @InjectModel(Application.name)
  private applicationModel: Model<Application>,

  @InjectModel(Interview.name)
  private interviewModel: Model<Interview>,

  @InjectModel(Offer.name)
  private offerModel: Model<Offer>,

  @InjectModel('JobTemplate') private jobTemplateModel: Model<any>,

  @InjectModel(Onboarding.name)
  private readonly onboardingModel: Model<OnboardingDocument>,

  @InjectModel(Document.name)
  private readonly documentModel: Model<DocumentDocument>,

  @InjectModel(Contract.name)
  private readonly contractModel: Model<ContractDocument>,

  @InjectModel(Candidate.name)
  private readonly candidateModel: Model<CandidateDocument>,

  private readonly employeeProfileService: EmployeeProfileService,
) {}

  // Utility function to calculate job requisition progress
  calculateProgress(status: string): number {
    const s = (status || '').toString().toLowerCase();
    const mapping: Record<string, number> = {
      'screening': 20,
      'shortlisting': 40,
      'department_interview': 50,
      'hr_interview': 60,
      'interview': 60,
      'offer': 80,
      'hired': 100,
      'submitted': 10,
      'in_process': 40,
    };
    return mapping[s] ?? 0;
  }

  // ---------------------------------------------------
  // JOB REQUISITIONS
  // ---------------------------------------------------
  async createJobRequisition(dto: CreateJobRequisitionDto): Promise<JobRequisition> {
    const requisitionId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const jobRequisition = new this.jobModel({
      requisitionId,
      templateId: dto.templateId,
      openings: dto.openings,
      location: dto.location,
      hiringManagerId: dto.hiringManagerId || null,
      publishStatus: 'draft',
    });
    return jobRequisition.save();
  }

  // JobTemplate CRUD
  async createJobTemplate(dto: any) {
    const tpl = new this.jobTemplateModel({
      title: dto.title,
      department: dto.department,
      qualifications: dto.qualifications || [],
      skills: dto.skills || [],
      description: dto.description || '',
    });
    return tpl.save();
  }

  async getAllJobTemplates() {
    return this.jobTemplateModel.find();
  }

  async getJobTemplateById(id: string) {
    return this.jobTemplateModel.findById(id);
  }

  async updateJobTemplate(id: string, dto: any) {
    return this.jobTemplateModel.findByIdAndUpdate(id, dto, { new: true });
  }

  // Publish/Preview
  async publishJobRequisition(id: string) {
    const update = { publishStatus: 'published', postingDate: new Date() } as any;
    const updated = await this.jobModel.findByIdAndUpdate(id, update, { new: true });
    if (!updated) throw new NotFoundException('Job Requisition not found');
    return updated;
  }

  async previewJobRequisition(id: string) {
    return this.jobModel.findById(id).populate('templateId');
  }

  async getAllJobRequisitions() {
    return this.jobModel.find();
  }

  async getJobRequisitionById(id: string) {
    return this.jobModel.findById(id);
  }

  async updateJobRequisitionStatus(id: string, newStatus: string) {
    const update: any = { status: newStatus, progress: this.calculateProgress(newStatus) };
    const updated = await this.jobModel.findByIdAndUpdate(id, update, { new: true });
    if (!updated) {
      throw new NotFoundException('Job Requisition not found');
    }
    return updated;
  }

  // ---------------------------------------------------
  // APPLICATIONS
  // ---------------------------------------------------
  async apply(dto: CreateApplicationDto): Promise<Application> {
    const application = new this.applicationModel({
      candidateId: dto.candidateId,
      requisitionId: dto.requisitionId,
      assignedHr: dto.assignedHr || undefined,
      currentStage: 'screening',
      status: 'submitted',
    });
    return application.save();
  }

  async getAllApplications() {
    return this.applicationModel.find();
  }

  async updateApplicationStatus(id: string, dto: UpdateApplicationStatusDto) {
    const application = await this.applicationModel.findByIdAndUpdate(
      id,
      { status: dto.status },
      { new: true }
    );

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Update related job requisition progress if possible
    try {
      const reqId = (application as any).requisitionId;
      if (reqId) {
        const progress = this.calculateProgress((application as any).currentStage || dto.status);
        await this.jobModel.findByIdAndUpdate(reqId, { progress });
      }
    } catch (e) {
      // non-critical
    }

    return application;
  }

  // ---------------------------------------------------
  // INTERVIEWS
  // ---------------------------------------------------
  async scheduleInterview(dto: ScheduleInterviewDto) {
    const interview = new this.interviewModel({
      applicationId: dto.applicationId,
      stage: dto.stage,
      scheduledDate: dto.scheduledDate,
      method: dto.method,
      panel: dto.panel || [],
      videoLink: dto.videoLink,
      status: 'scheduled',
    });
    const saved = await interview.save();

    try {
      await this.applicationModel.findByIdAndUpdate(dto.applicationId, { currentStage: dto.stage });
      const app = await this.applicationModel.findById(dto.applicationId);
      if (app?.requisitionId) {
        const progress = this.calculateProgress((app as any).currentStage || 'screening');
        await this.jobModel.findByIdAndUpdate((app as any).requisitionId, { progress });
      }
    } catch (e) {
      // non-critical
    }

    return saved;
  }

  async updateInterviewStatus(id: string, dto: UpdateInterviewStatusDto) {
    return this.interviewModel.findByIdAndUpdate(id, { status: dto.status }, { new: true });
  }

  // ---------------------------------------------------
  // OFFERS
  // ---------------------------------------------------
  async createOffer(dto: CreateOfferDto) {
    const offer = new this.offerModel({
      applicationId: dto.applicationId,
      candidateId: dto.candidateId,
      grossSalary: dto.grossSalary,
      signingBonus: dto.signingBonus,
      benefits: dto.benefits,
      conditions: dto.conditions,
      insurances: dto.insurances,
      content: dto.content,
      role: dto.role,
      deadline: dto.deadline,
      applicantResponse: 'pending',
      finalStatus: 'pending',
    });
    return offer.save();
  }

  async respondToOffer(id: string, dto: RespondToOfferDto) {
    return this.offerModel.findByIdAndUpdate(id, { applicantResponse: dto.applicantResponse }, { new: true });
  }

  async finalizeOffer(id: string, dto: FinalizeOfferDto) {
    return this.offerModel.findByIdAndUpdate(id, { finalStatus: dto.finalStatus }, { new: true });
  }

  // ---------------------------------------------------
  // Email function to notify candidates
  // ---------------------------------------------------
  async sendEmail(recipient: string, subject: string, text: string) {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,  // Use environment variable
        pass: process.env.EMAIL_PASS,   // Use environment variable
      },
    });

    await transporter.sendMail({
      from: '"HR System" <your-email@gmail.com>',
      to: recipient,
      subject: subject,
      text: text,
    });
  }

  // ============= ONBOARDING METHODS =============

  async createOnboarding(createOnboardingDto: CreateOnboardingDto): Promise<any> {
    try {
      const existingOnboarding = await this.onboardingModel.findOne({ employeeId: createOnboardingDto.employeeId }).lean();
      if (existingOnboarding) {
        throw new BadRequestException('Onboarding checklist already exists for this employee');
      }

      const onboarding = new this.onboardingModel({ ...createOnboardingDto, completed: false });
      const saved = await onboarding.save();
      return saved.toObject();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create onboarding: ' + error.message);
    }
  }

  async getAllOnboardings(): Promise<any[]> {
    try {
      return await this.onboardingModel.find().select('-__v').lean().exec();
    } catch (error) {
      throw new BadRequestException('Failed to fetch onboarding records: ' + error.message);
    }
  }

  async getOnboardingByEmployeeId(employeeId: string): Promise<any> {
    try {
      const onboarding = await this.onboardingModel.findOne({
        $or: [
          { employeeId: employeeId },
          { employeeId: new Types.ObjectId(employeeId) },
        ]
      }).select('-__v').lean().exec();

      if (!onboarding) {
        throw new NotFoundException('Onboarding checklist not found for this employee');
      }

      return onboarding;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch onboarding: ' + error.message);
    }
  }

  async getOnboardingById(id: string): Promise<any> {
    try {
      const onboarding = await this.onboardingModel.findById(id).select('-__v').lean().exec();
      if (!onboarding) {
        throw new NotFoundException('Onboarding not found');
      }
      return onboarding;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch onboarding: ' + error.message);
    }
  }

  async updateOnboarding(id: string, updateOnboardingDto: UpdateOnboardingDto): Promise<any> {
    try {
      const onboarding = await this.onboardingModel.findByIdAndUpdate(id, { $set: updateOnboardingDto }, { new: true }).select('-__v').lean().exec();
      if (!onboarding) {
        throw new NotFoundException('Onboarding not found');
      }
      return onboarding;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update onboarding: ' + error.message);
    }
  }

  async updateOnboardingTask(onboardingId: string, taskIndex: number, updateTaskDto: UpdateOnboardingTaskDto): Promise<any> {
    try {
      const onboarding = await this.onboardingModel.findById(onboardingId);
      if (!onboarding) {
        throw new NotFoundException('Onboarding not found');
      }
      if (taskIndex < 0 || taskIndex >= onboarding.tasks.length) {
        throw new BadRequestException('Invalid task index');
      }
      Object.assign(onboarding.tasks[taskIndex], updateTaskDto);
      if (updateTaskDto.status) {
        onboarding.tasks[taskIndex].completedAt = new Date();
      }
      const allCompleted = onboarding.tasks.every((task) => task.status === OnboardingTaskStatus.COMPLETED);
      if (allCompleted) {
        onboarding.completed = true;
        onboarding.completedAt = new Date();
      }
      const saved = await onboarding.save();
      return saved.toObject();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update task: ' + error.message);
    }
  }

  async addTaskToOnboarding(onboardingId: string, taskDto: any): Promise<any> {
    try {
      const onboarding = await this.onboardingModel.findById(onboardingId);
      if (!onboarding) {
        throw new NotFoundException('Onboarding not found');
      }
      onboarding.tasks.push({ ...taskDto, status: taskDto.status || OnboardingTaskStatus.PENDING });
      const saved = await onboarding.save();
      return saved.toObject();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to add task: ' + error.message);
    }
  }

  async removeTaskFromOnboarding(onboardingId: string, taskIndex: number): Promise<any> {
    try {
      const onboarding = await this.onboardingModel.findById(onboardingId);
      if (!onboarding) {
        throw new NotFoundException('Onboarding not found');
      }
      if (taskIndex < 0 || taskIndex >= onboarding.tasks.length) {
        throw new BadRequestException('Invalid task index');
      }
      onboarding.tasks.splice(taskIndex, 1);
      const saved = await onboarding.save();
      return saved.toObject();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to remove task: ' + error.message);
    }
  }

  async deleteOnboarding(id: string): Promise<void> {
    try {
      const result = await this.onboardingModel.findByIdAndDelete(id);
      if (!result) {
        throw new NotFoundException('Onboarding not found');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete onboarding: ' + error.message);
    }
  }

  async getOnboardingStats() {
    try {
      const total = await this.onboardingModel.countDocuments();
      const completed = await this.onboardingModel.countDocuments({ completed: true });
      const inProgress = total - completed;
      return {
        total,
        completed,
        inProgress,
        completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) + '%' : '0%',
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch stats: ' + error.message);
    }
  }
  // ============= DOCUMENT UPLOAD METHODS (ONB-007) =============

/**
 * Upload document for onboarding task
 * ONB-007: Document upload for compliance
 */
/**
 * Upload document for onboarding task
 * ONB-007: Document upload for compliance
 */
async uploadTaskDocument(
  onboardingId: string,
  taskIndex: number,
  file: Express.Multer.File,
  documentType: DocumentType,
): Promise<any> {
  try {
    // 1. Validate onboarding exists
    const onboarding = await this.onboardingModel.findById(onboardingId);
    if (!onboarding) {
      throw new NotFoundException('Onboarding not found');
    }

    // 2. Validate task index
    if (taskIndex < 0 || taskIndex >= onboarding.tasks.length) {
      throw new BadRequestException('Invalid task index');
    }

    // 3. Validate file exists
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // 4. Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: jpg, jpeg, png, pdf, doc, docx',
      );
    }

    // 5. Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    // 6. Use the file path that Multer already saved
    // (Multer's diskStorage already saved the file for us)
    const filePath = file.path;

    // 7. Create Document record
    const document = new this.documentModel({
      ownerId: onboarding.employeeId,
      type: documentType,
      filePath: filePath,
      uploadedAt: new Date(),
    });

    const savedDocument = await document.save();

    // 8. Update task with documentId
    onboarding.tasks[taskIndex].documentId = savedDocument._id;

    // Auto-complete task if it was pending
    if (onboarding.tasks[taskIndex].status === OnboardingTaskStatus.PENDING) {
      onboarding.tasks[taskIndex].status = OnboardingTaskStatus.COMPLETED;
      onboarding.tasks[taskIndex].completedAt = new Date();
    }

    // 9. Check if all tasks completed
    const allCompleted = onboarding.tasks.every(
      (task) => task.status === OnboardingTaskStatus.COMPLETED,
    );

    if (allCompleted) {
      onboarding.completed = true;
      onboarding.completedAt = new Date();
    }

    // 10. Save onboarding
    const savedOnboarding = await onboarding.save();

    return {
      message: 'Document uploaded successfully',
      document: savedDocument.toObject(),
      onboarding: savedOnboarding.toObject(),
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

/**
 * Download document by ID
 */
async downloadDocument(documentId: string, res: Response): Promise<void> {
  try {
    // 1. Find document
    const document = await this.documentModel.findById(documentId).lean();
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // 2. Check file exists on disk
    const fileExists = await fs.pathExists(document.filePath);
    if (!fileExists) {
      throw new NotFoundException('File not found on server');
    }

    // 3. Send file
    res.download(document.filePath);
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
}

/**
 * Get document attached to specific task
 */
async getTaskDocument(onboardingId: string, taskIndex: number): Promise<any> {
  try {
    const onboarding = await this.onboardingModel.findById(onboardingId).lean();
    if (!onboarding) {
      throw new NotFoundException('Onboarding not found');
    }

    if (taskIndex < 0 || taskIndex >= onboarding.tasks.length) {
      throw new BadRequestException('Invalid task index');
    }

    const task = onboarding.tasks[taskIndex];
    if (!task.documentId) {
      throw new NotFoundException('No document attached to this task');
    }

    const document = await this.documentModel.findById(task.documentId).lean();
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  } catch (error) {
    console.error('Error getting task document:', error);
    throw error;
  }
}

/**
 * Delete document (optional - for cleanup)
 */
async deleteDocument(documentId: string): Promise<void> {
  try {
    const document = await this.documentModel.findById(documentId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Delete file from disk
    const fileExists = await fs.pathExists(document.filePath);
    if (fileExists) {
      await fs.remove(document.filePath);
    }

    // Delete document record
    await this.documentModel.findByIdAndDelete(documentId);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

// ============= EMPLOYEE CREATION FROM CONTRACT =============

/**
 * Create employee profile from accepted offer and signed contract
 * HR Manager can access signed contract details to create employee profile
 */
async createEmployeeFromContract(
  offerId: string,
  dto: CreateEmployeeFromContractDto,
): Promise<any> {
  try {
    // 1. Validate and get offer
    if (!Types.ObjectId.isValid(offerId)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerModel.findById(offerId).lean();
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // 2. Validate offer status - must be accepted by candidate AND approved
    if (offer.applicantResponse !== OfferResponseStatus.ACCEPTED) {
      throw new BadRequestException(
        'Offer must be accepted by candidate before creating employee profile',
      );
    }

    if (offer.finalStatus !== OfferFinalStatus.APPROVED) {
      throw new BadRequestException(
        'Offer must be approved before creating employee profile',
      );
    }

    // 3. Find contract for this offer
    let contract: any = null;
    if (dto.contractId) {
      contract = await this.contractModel.findById(dto.contractId).lean();
      if (!contract || contract.offerId.toString() !== offerId) {
        throw new NotFoundException('Contract not found or does not match offer');
      }
    } else {
      // Find contract by offerId
      contract = await this.contractModel.findOne({ offerId: new Types.ObjectId(offerId) }).lean();
    }

    // 4. Validate contract exists and has signed document
    if (!contract) {
      throw new NotFoundException(
        'No contract found for this offer. Please create and upload signed contract first.',
      );
    }

    if (!contract.documentId) {
      throw new BadRequestException(
        'Contract must have a signed document attached before creating employee profile',
      );
    }

    // 5. Verify the contract document exists
    const contractDocument = await this.documentModel.findById(contract.documentId).lean();
    if (!contractDocument) {
      throw new NotFoundException('Signed contract document not found');
    }

    // 6. Get candidate data
    const candidate = await this.candidateModel.findById(offer.candidateId).lean();
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // 7. Generate work email if not provided
    let workEmail = dto.workEmail;
    if (!workEmail) {
      const firstName = candidate.firstName?.toLowerCase().replace(/\s+/g, '') || '';
      const lastName = candidate.lastName?.toLowerCase().replace(/\s+/g, '') || '';
      workEmail = `${firstName}.${lastName}@company.com`;
    }

    // 8. Map data to CreateEmployeeDto
    const createEmployeeDto: CreateEmployeeDto = {
      // Personal info from candidate
      firstName: candidate.firstName,
      middleName: candidate.middleName,
      lastName: candidate.lastName,
      nationalId: candidate.nationalId,
      gender: candidate.gender,
      maritalStatus: candidate.maritalStatus,
      dateOfBirth: candidate.dateOfBirth,
      personalEmail: candidate.personalEmail,
      mobilePhone: candidate.mobilePhone,
      homePhone: candidate.homePhone,
      address: candidate.address,
      profilePictureUrl: candidate.profilePictureUrl,

      // Work info from offer/contract
      workEmail: workEmail,
      dateOfHire: contract.acceptanceDate || new Date(),
      contractStartDate: contract.acceptanceDate,
      contractEndDate: undefined, // Can be set manually by HR if needed
      contractType: dto.contractType,
      workType: dto.workType,
      status: EmployeeStatus.PROBATION, // Default to probation for new hires

      // Organizational assignment (from DTO or can be derived from offer)
      primaryDepartmentId: dto.primaryDepartmentId,
      supervisorPositionId: dto.supervisorPositionId,
      payGradeId: dto.payGradeId,

      // Position - can be mapped from offer.role if needed
      primaryPositionId: dto.primaryDepartmentId, // HR can assign this manually via DTO
    };

    // 9. Create employee profile
    const employee = await this.employeeProfileService.create(createEmployeeDto);

    // 10. Return success response with employee and contract details
    return {
      message: 'Employee profile created successfully from contract',
      employee: employee,
      contractDetails: {
        contractId: contract._id,
        offerId: offer._id,
        role: contract.role,
        grossSalary: contract.grossSalary,
        signingBonus: contract.signingBonus,
        benefits: contract.benefits,
        documentId: contract.documentId,
      },
    };
  } catch (error) {
    console.error('Error creating employee from contract:', error);
    throw error;
  }
}

}
