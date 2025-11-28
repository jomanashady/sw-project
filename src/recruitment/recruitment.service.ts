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
}
