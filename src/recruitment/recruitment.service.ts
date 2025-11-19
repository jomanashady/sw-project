// src/recruitment/recruitment.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Candidate,
  CandidateDocument,
} from './rec/schemas/candidate.schema';

import { Job, JobDocument } from './rec/schemas/job.schema';

import {
  Application,
  ApplicationDocument,
} from './rec/schemas/application.schema';

// 🔹 Onboarding schemas
import {
  OnboardingProcess,
  OnboardingProcessDocument,
} from './onboarding/schemas/onboarding-process.schema';

import {
  OnboardingChecklist,
  OnboardingChecklistDocument,
} from './onboarding/schemas/onboarding-checklist.schema';

import {
  OnboardingDocument,
  OnboardingDocumentDocument,
} from './onboarding/schemas/onboarding-document.schema';

import {
  OnboardingNotification,
  OnboardingNotificationDocument,
} from './onboarding/schemas/onboarding-notification.schema';

import {
  EquipmentAssignment,
  EquipmentAssignmentDocument,
  EquipmentItem,
} from './onboarding/schemas/equipment-assignment.schema';

// 🔹 Offboarding schemas
import {
  OffboardingRequest,
  OffboardingRequestDocument,
} from './offboarding/schemas/offboarding-request.schema';

import {
  OffboardingInstance,
  OffboardingInstanceDocument,
} from './offboarding/schemas/offboarding-instance.schema';

import {
  OffboardingTask,
  OffboardingTaskDocument,
} from './offboarding/schemas/offboarding-task.schema';

import {
  OffboardingChecklistTemplate,
  OffboardingChecklistTemplateDocument,
} from './offboarding/schemas/OffboardingChecklistTemplate.schema';

@Injectable()
export class RecruitmentService {
  constructor(
    // ===== Recruitment (rec) models =====
    @InjectModel(Candidate.name)
    private candidateModel: Model<CandidateDocument>,

    @InjectModel(Job.name)
    private jobModel: Model<JobDocument>,

    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,

    // ===== Onboarding models =====
    @InjectModel(OnboardingProcess.name)
    private onboardingProcessModel: Model<OnboardingProcessDocument>,

    @InjectModel(OnboardingChecklist.name)
    private onboardingChecklistModel: Model<OnboardingChecklistDocument>,

    @InjectModel(OnboardingDocument.name)
    private onboardingDocumentModel: Model<OnboardingDocumentDocument>,

    @InjectModel(OnboardingNotification.name)
    private onboardingNotificationModel: Model<OnboardingNotificationDocument>,

    @InjectModel(EquipmentAssignment.name)
    private equipmentAssignmentModel: Model<EquipmentAssignmentDocument>,

    // ===== Offboarding models =====
    @InjectModel(OffboardingRequest.name)
    private offboardingRequestModel: Model<OffboardingRequestDocument>,

    @InjectModel(OffboardingInstance.name)
    private offboardingInstanceModel: Model<OffboardingInstanceDocument>,

    @InjectModel(OffboardingTask.name)
    private offboardingTaskModel: Model<OffboardingTaskDocument>,

    @InjectModel(OffboardingChecklistTemplate.name)
    private offboardingChecklistTemplateModel: Model<OffboardingChecklistTemplateDocument>,
  ) {}

  // =====================================================
  // ✅ CANDIDATE METHODS
  // =====================================================

  async createCandidate(
    data: Partial<Candidate>,
  ): Promise<CandidateDocument> {
    console.log(
      `[RECRUITMENT SERVICE] Creating candidate: ${data.firstName} ${data.lastName}`,
    );

    const candidate = new this.candidateModel({
      ...data,
      // defaults handled by schema
    });

    return candidate.save();
  }

  async findAllCandidates(): Promise<CandidateDocument[]> {
    console.log('[RECRUITMENT SERVICE] Finding all candidates');
    return this.candidateModel.find().exec();
  }

  async findCandidateByEmail(
    email: string,
  ): Promise<CandidateDocument | null> {
    console.log(`[RECRUITMENT SERVICE] Finding candidate by email: ${email}`);
    return this.candidateModel.findOne({ email }).exec();
  }

  // =====================================================
  // ✅ JOB METHODS
  // =====================================================

  async createJob(data: Partial<Job>): Promise<JobDocument> {
    console.log(
      `[RECRUITMENT SERVICE] Creating job: ${data.title} in department ${data.departmentId}`,
    );

    const job = new this.jobModel({
      ...data,
      status: data.status ?? 'Draft', // default from schema
    });

    return job.save();
  }

  async findAllJobs(): Promise<JobDocument[]> {
    console.log('[RECRUITMENT SERVICE] Finding all jobs');
    return this.jobModel.find().exec();
  }

  async findOpenJobs(): Promise<JobDocument[]> {
    console.log('[RECRUITMENT SERVICE] Finding open/posted jobs');
    return this.jobModel
      .find({
        status: { $in: ['Approved', 'Posted'] },
      })
      .exec();
  }

  // =====================================================
  // ✅ APPLICATION METHODS
  // =====================================================

  /**
   * Creates an application linking a candidate and a job.
   * You can pass either documents or ObjectIds/strings.
   */
  async createApplication(params: {
    candidate: CandidateDocument | Types.ObjectId | string;
    job: JobDocument | Types.ObjectId | string;
    currentStage?: string;
    status?: string;
    tags?: string[];
  }): Promise<ApplicationDocument> {
    const { candidate, job, currentStage, status, tags } = params;

    console.log('[RECRUITMENT SERVICE] Creating application');

    const candidateId =
      candidate instanceof Types.ObjectId || typeof candidate === 'string'
        ? candidate
        : candidate._id;

    const jobId =
      job instanceof Types.ObjectId || typeof job === 'string'
        ? job
        : job._id;

    const application = new this.applicationModel({
      candidateId,
      jobId,
      currentStage: currentStage ?? 'Screening',
      status: status ?? 'InProgress',
      tags: tags ?? [],
      appliedAt: new Date(),
    });

    return application.save();
  }

  async findApplicationsByCandidate(
    candidateId: Types.ObjectId | string,
  ): Promise<ApplicationDocument[]> {
    console.log(
      `[RECRUITMENT SERVICE] Finding applications for candidate: ${candidateId}`,
    );

    return this.applicationModel
      .find({ candidateId })
      .populate('jobId')
      .exec();
  }

  async findApplicationsByJob(
    jobId: Types.ObjectId | string,
  ): Promise<ApplicationDocument[]> {
    console.log(
      `[RECRUITMENT SERVICE] Finding applications for job: ${jobId}`,
    );

    return this.applicationModel
      .find({ jobId })
      .populate('candidateId')
      .exec();
  }

  /**
   * Update application status/stage (useful for marking as Hired, Rejected, etc.)
   */
  async updateApplicationStatus(
    applicationId: Types.ObjectId | string,
    updates: Partial<Application>,
  ): Promise<ApplicationDocument | null> {
    console.log(
      `[RECRUITMENT SERVICE] Updating application ${applicationId} with`,
      updates,
    );

    return this.applicationModel
      .findByIdAndUpdate(applicationId, updates, { new: true })
      .exec();
  }

  // =====================================================
  // ✅ ONBOARDING METHODS
  // =====================================================

  /**
   * Create an onboarding checklist (template of tasks for a department).
   */
  async createOnboardingChecklist(
    data: Partial<OnboardingChecklist>,
  ): Promise<OnboardingChecklistDocument> {
    console.log(
      `[RECRUITMENT SERVICE] Creating onboarding checklist: ${data.checklistName}`,
    );

    const checklist = new this.onboardingChecklistModel({
      ...data,
      isActive: data.isActive ?? true,
    });

    return checklist.save();
  }

  /**
   * Create an onboarding process for a hired candidate based on a checklist.
   */
  async createOnboardingProcess(params: {
    candidate: CandidateDocument | Types.ObjectId | string;
    checklist: OnboardingChecklistDocument | Types.ObjectId | string;
    startDate?: Date;
    assignedHREmployeeId?: string; // external employeeId string
  }): Promise<OnboardingProcessDocument> {
    const { candidate, checklist, startDate, assignedHREmployeeId } = params;

    console.log('[RECRUITMENT SERVICE] Creating onboarding process');

    const candidateId =
      candidate instanceof Types.ObjectId || typeof candidate === 'string'
        ? candidate
        : candidate._id;

    const checklistId =
      checklist instanceof Types.ObjectId || typeof checklist === 'string'
        ? checklist
        : checklist._id;

    const process = new this.onboardingProcessModel({
      candidateId,
      checklistId,
      startDate: startDate ?? new Date(),
      // schema defaults:
      // overallStatus: 'not_started'
      // completionPercentage: 0
      assignedHREmployeeId,
    });

    return process.save();
  }

  /**
   * Create an onboarding document (e.g. contract, ID, etc.).
   */
  async createOnboardingDocument(params: {
    onboardingProcess: OnboardingProcessDocument | Types.ObjectId | string;
    candidate: CandidateDocument | Types.ObjectId | string;
    documentType: string;
    documentName: string;
    documentUrl: string;
    uploadedByEmployeeId: string; // external
  }): Promise<OnboardingDocumentDocument> {
    const {
      onboardingProcess,
      candidate,
      documentType,
      documentName,
      documentUrl,
      uploadedByEmployeeId,
    } = params;

    console.log('[RECRUITMENT SERVICE] Creating onboarding document');

    const onboardingProcessId =
      onboardingProcess instanceof Types.ObjectId ||
      typeof onboardingProcess === 'string'
        ? onboardingProcess
        : onboardingProcess._id;

    const candidateId =
      candidate instanceof Types.ObjectId || typeof candidate === 'string'
        ? candidate
        : candidate._id;

    const doc = new this.onboardingDocumentModel({
      onboardingProcessId,
      candidateId,
      documentType,
      documentName,
      documentUrl,
      uploadedByEmployeeId,
      verificationStatus: 'pending_review',
    });

    return doc.save();
  }

  /**
   * Create an onboarding notification (email/SMS/in-app).
   */
  async createOnboardingNotification(params: {
    onboardingProcess: OnboardingProcessDocument | Types.ObjectId | string;
    candidate: CandidateDocument | Types.ObjectId | string;
    notificationType: string;
    subject: string;
    message: string;
    channel: 'email' | 'sms' | 'in_app';
    scheduledFor?: Date;
  }): Promise<OnboardingNotificationDocument> {
    const {
      onboardingProcess,
      candidate,
      notificationType,
      subject,
      message,
      channel,
      scheduledFor,
    } = params;

    console.log('[RECRUITMENT SERVICE] Creating onboarding notification');

    const onboardingProcessId =
      onboardingProcess instanceof Types.ObjectId ||
      typeof onboardingProcess === 'string'
        ? onboardingProcess
        : onboardingProcess._id;

    const candidateId =
      candidate instanceof Types.ObjectId || typeof candidate === 'string'
        ? candidate
        : candidate._id;

    const notification = new this.onboardingNotificationModel({
      onboardingProcessId,
      candidateId,
      notificationType,
      subject,
      message,
      channel,
      status: 'pending',
      scheduledFor,
    });

    return notification.save();
  }

  /**
   * Create an equipment assignment record (laptop, badge, etc.).
   */
  async createEquipmentAssignment(params: {
    onboardingProcess: OnboardingProcessDocument | Types.ObjectId | string;
    candidate: CandidateDocument | Types.ObjectId | string;
    assignedByEmployeeId: string; // external
    items: EquipmentItem[];
    notes?: string;
  }): Promise<EquipmentAssignmentDocument> {
    const {
      onboardingProcess,
      candidate,
      assignedByEmployeeId,
      items,
      notes,
    } = params;

    console.log('[RECRUITMENT SERVICE] Creating equipment assignment');

    const onboardingProcessId =
      onboardingProcess instanceof Types.ObjectId ||
      typeof onboardingProcess === 'string'
        ? onboardingProcess
        : onboardingProcess._id;

    const candidateId =
      candidate instanceof Types.ObjectId || typeof candidate === 'string'
        ? candidate
        : candidate._id;

    const assignment = new this.equipmentAssignmentModel({
      onboardingProcessId,
      candidateId,
      items,
      assignedByEmployeeId,
      notes,
      allItemsDelivered: false,
    });

    return assignment.save();
  }

  // =====================================================
  // ✅ OFFBOARDING METHODS
  // =====================================================

  /**
   * Create a checklist template for offboarding (e.g. "Standard Office").
   */
  async createOffboardingChecklistTemplate(
    data: Partial<OffboardingChecklistTemplate>,
  ): Promise<OffboardingChecklistTemplateDocument> {
    console.log(
      `[RECRUITMENT SERVICE] Creating offboarding checklist template: ${data.name}`,
    );

    const template = new this.offboardingChecklistTemplateModel({
      ...data,
      isActive: data.isActive ?? true,
    });

    return template.save();
  }

  /**
   * Create an offboarding request (resignation/termination).
   */
  async createOffboardingRequest(
    data: {
      employeeId: string;
      initiatedBy: string;
      type: string; // 'Resignation' | 'Termination'
      reasonCode?: string;
      reasonDescription?: string;
      effectiveDate: Date;
      performanceRecordId?: string;
    },
  ): Promise<OffboardingRequestDocument> {
    console.log(
      `[RECRUITMENT SERVICE] Creating offboarding request for employee ${data.employeeId}`,
    );

    const request = new this.offboardingRequestModel({
      ...data,
      status: 'Requested',
    });

    return request.save();
  }

  /**
   * Create an offboarding instance (actual process) linked to a request.
   */
  async createOffboardingInstance(params: {
    offboardingRequest:
      | OffboardingRequestDocument
      | Types.ObjectId
      | string;
    employeeId: string; // external
    checklistTemplate?:
      | OffboardingChecklistTemplateDocument
      | Types.ObjectId
      | string;
  }): Promise<OffboardingInstanceDocument> {
    const { offboardingRequest, employeeId, checklistTemplate } = params;

    console.log('[RECRUITMENT SERVICE] Creating offboarding instance');

    const offboardingRequestId =
      offboardingRequest instanceof Types.ObjectId ||
      typeof offboardingRequest === 'string'
        ? offboardingRequest
        : offboardingRequest._id;

    const checklistTemplateId =
      !checklistTemplate
        ? undefined
        : checklistTemplate instanceof Types.ObjectId ||
          typeof checklistTemplate === 'string'
        ? checklistTemplate
        : checklistTemplate._id;

    const instance = new this.offboardingInstanceModel({
      offboardingRequestId,
      employeeId,
      checklistTemplateId,
      status: 'NotStarted',
    });

    return instance.save();
  }

  /**
   * Create an offboarding task for an offboarding instance.
   */
  async createOffboardingTask(params: {
    offboardingInstance: OffboardingInstanceDocument | Types.ObjectId | string;
    departmentRole: string;
    title: string;
    description?: string;
    assignedToUserId?: string; // external user/employee
  }): Promise<OffboardingTaskDocument> {
    const {
      offboardingInstance,
      departmentRole,
      title,
      description,
      assignedToUserId,
    } = params;

    console.log('[RECRUITMENT SERVICE] Creating offboarding task');

    const offboardingId =
      offboardingInstance instanceof Types.ObjectId ||
      typeof offboardingInstance === 'string'
        ? offboardingInstance
        : offboardingInstance._id;

    const task = new this.offboardingTaskModel({
      offboardingId,
      departmentRole,
      title,
      description,
      assignedToUserId,
      status: 'Pending',
    });

    return task.save();
  }

  // =====================================================
  // ✅ CLEAR DATA (for seeding)
  // =====================================================

  /**
   * Clear all recruitment collections.
   */
  async clearAllRecruitmentData() {
    console.log('[RECRUITMENT SERVICE] Clearing all recruitment data...');
    await Promise.all([
      this.applicationModel.deleteMany({}),
      this.candidateModel.deleteMany({}),
      this.jobModel.deleteMany({}),
    ]);
    console.log('✅ Recruitment collections cleared');
  }

  /**
   * Clear all onboarding collections.
   */
  async clearAllOnboardingData() {
    console.log('[RECRUITMENT SERVICE] Clearing all onboarding data...');
    await Promise.all([
      this.onboardingProcessModel.deleteMany({}),
      this.onboardingChecklistModel.deleteMany({}),
      this.onboardingDocumentModel.deleteMany({}),
      this.onboardingNotificationModel.deleteMany({}),
      this.equipmentAssignmentModel.deleteMany({}),
    ]);
    console.log('✅ Onboarding collections cleared');
  }

  /**
   * Clear all offboarding collections.
   */
  async clearAllOffboardingData() {
    console.log('[RECRUITMENT SERVICE] Clearing all offboarding data...');
    await Promise.all([
      this.offboardingTaskModel.deleteMany({}),
      this.offboardingInstanceModel.deleteMany({}),
      this.offboardingRequestModel.deleteMany({}),
      this.offboardingChecklistTemplateModel.deleteMany({}),
    ]);
    console.log('✅ Offboarding collections cleared');
  }
}
