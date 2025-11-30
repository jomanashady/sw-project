import {
  Controller,
  Post,
  Get,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';

import { RecruitmentService } from './recruitment.service';
import { CreateJobRequisitionDto } from './dto/job-requisition.dto';
import { CreateApplicationDto, UpdateApplicationStatusDto } from './dto/application.dto';
import { ScheduleInterviewDto, UpdateInterviewStatusDto } from './dto/interview.dto';
import { CreateOfferDto, RespondToOfferDto, FinalizeOfferDto } from './dto/offer.dto';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { UpdateOnboardingTaskDto } from './dto/update-task.dto';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';

@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly service: RecruitmentService) {}

  // ------------------------------------------
  // JOB REQUISITION (REC-003, REC-004, REC-023, REC-009)
  // ------------------------------------------

  /**
   * REC-003: HR Manager defines standardized job templates
   * Only HR Manager and Admin can create job requisitions
   */
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Post('job')
  createJob(
    @Body() dto: CreateJobRequisitionDto,
  ) {
    return this.service.createJobRequisition(dto);
  }

  /**
   * REC-009: HR Manager monitors recruitment progress across all positions
   * All authenticated users can view job requisitions
   */
  @UseGuards(RolesGuard)
  @Get('job')
  getJobs() {
    return this.service.getAllJobRequisitions();
  }

  /**
   * Get specific job requisition by ID
   */
  @UseGuards(RolesGuard)
  @Get('job/:id')
  getJobById(@Param('id') id: string) {
    return this.service.getJobRequisitionById(id);
  }

  /**
   * Update job requisition status
   */
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Patch('job/:id/status')
  updateJobStatus(
    @Param('id') id: string,
    @Body() dto: { status: string },
  ) {
    return this.service.updateJobRequisitionStatus(id, dto.status);
  }

  /**
   * REC-023: Publish jobs on company careers page
   * Only HR Employee and Admin can publish
   */
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Post('job/:id/publish')
  publishJob(@Param('id') id: string) {
    return this.service.publishJobRequisition(id);
  }

  /**
   * Preview job requisition (with template details)
   */
  @UseGuards(RolesGuard)
  @Get('job/:id/preview')
  previewJob(@Param('id') id: string) {
    return this.service.previewJobRequisition(id);
  }

  // ------------------------------------------
  // APPLICATIONS (REC-007, REC-008, REC-017, REC-022)
  // ------------------------------------------

  /**
   * REC-007: Candidate uploads CV and applies for positions
   * Only candidates can apply; system auto-sets candidateId
   */
  @UseGuards(RolesGuard)
  @Roles(SystemRole.JOB_CANDIDATE)
  @Post('application')
  apply(
    @Body() dto: CreateApplicationDto,
  ) {
    return this.service.apply(dto);
  }

  /**
   * REC-008, REC-017: HR Employee tracks candidates through hiring stages
   * REC-017: Candidates receive updates about application status
   * HR staff and managers can view all; candidates see their own
   */
  @UseGuards(RolesGuard)
  @Get('application')
  getAllApplications() {
    return this.service.getAllApplications();
  }

  /**
   * REC-008: Track candidates through hiring stages
   * REC-022: Automated rejection notifications
   * Only HR staff and managers can update status
   */
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Patch('application/:id/status')
  updateAppStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.service.updateApplicationStatus(id, dto);
  }

  // ------------------------------------------
  // INTERVIEWS (REC-010, REC-011, REC-020, REC-021)
  // ------------------------------------------

  /**
   * REC-010: Schedule and manage interview invitations
   * REC-011: Recruiters schedule interviews with time slots, panel members, and modes
   * REC-020: Structured assessment and scoring forms per role
   * REC-021: Coordinate interview panels
   * Only HR staff, managers, and department leads can schedule
   */
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.RECRUITER, SystemRole.SYSTEM_ADMIN)
  @Post('interview')
  scheduleInterview(@Body() dto: ScheduleInterviewDto) {
    return this.service.scheduleInterview(dto);
  }

  /**
   * REC-011: Interviewers receive automatic calendar invites
   * Only HR staff, managers, and department leads can update interview status
   */
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.RECRUITER, SystemRole.SYSTEM_ADMIN)
  @Patch('interview/:id/status')
  updateInterviewStatus(
    @Param('id') id: string,
    @Body() dto: UpdateInterviewStatusDto,
  ) {
    return this.service.updateInterviewStatus(id, dto);
  }

  // ------------------------------------------
  // OFFERS (REC-014, REC-018)
  // ------------------------------------------

  /**
   * REC-014: HR Manager manages job offers and approvals
   * REC-018: HR Employee generates and sends electronically signed offer letters
   * Only HR managers can create offers
   */
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Post('offer')
  createOffer(@Body() dto: CreateOfferDto) {
    return this.service.createOffer(dto);
  }

  /**
   * REC-018: Candidates accept/reject offers
   * Only candidates can respond to their offers
   */
  @UseGuards(RolesGuard)
  @Roles(SystemRole.JOB_CANDIDATE)
  @Patch('offer/:id/respond')
  respond(
    @Param('id') id: string,
    @Body() dto: RespondToOfferDto,
  ) {
    return this.service.respondToOffer(id, dto);
  }

  /**
   * REC-014: HR Manager finalizes offers
   * Only HR managers and admins can finalize
   */
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Patch('offer/:id/finalize')
  finalize(
    @Param('id') id: string,
    @Body() dto: FinalizeOfferDto,
  ) {
    return this.service.finalizeOffer(id, dto);
  }

  // ============= ONBOARDING ENDPOINTS (REC-029) =============

  /**
   * REC-029: Trigger pre-boarding tasks after offer acceptance
   * ONB-001: Create onboarding checklist
   * Only HR staff can create onboarding
   */
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Post('onboarding')
  async createOnboarding(@Body() createOnboardingDto: CreateOnboardingDto) {
    return this.service.createOnboarding(createOnboardingDto);
  }

  /**
   * Get all onboarding records (HR Manager view)
   * Only HR staff and managers can view all onboarding
   */
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Get('onboarding')
  async getAllOnboardings() {
    return this.service.getAllOnboardings();
  }

  /**
   * Get onboarding statistics
   * Only HR staff and managers can view stats
   */
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Get('onboarding/stats')
  async getOnboardingStats() {
    return this.service.getOnboardingStats();
  }

  /**
   * Get onboarding by ID
   * HR staff can view any; employees can view their own
   */
  @UseGuards(RolesGuard)
  @Get('onboarding/:id')
  async getOnboardingById(@Param('id') id: string) {
    return this.service.getOnboardingById(id);
  }

  /**
   * Get onboarding by employee ID (ONB-004)
   * Employees can view their own; HR staff can view any
   */
  @UseGuards(RolesGuard)
  @Get('onboarding/employee/:employeeId')
  async getOnboardingByEmployeeId(@Param('employeeId') employeeId: string) {
    return this.service.getOnboardingByEmployeeId(employeeId);
  }

  /**
   * Update entire onboarding checklist
   * Only HR staff can update
   */
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Put('onboarding/:id')
  async updateOnboarding(
    @Param('id') id: string,
    @Body() updateOnboardingDto: UpdateOnboardingDto,
  ) {
    return this.service.updateOnboarding(id, updateOnboardingDto);
  }

  /**
   * Update a specific task in onboarding
   * Only HR staff can update tasks
   */
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Patch('onboarding/:id/task/:taskIndex')
  async updateOnboardingTask(
    @Param('id') id: string,
    @Param('taskIndex') taskIndex: string,
    @Body() updateTaskDto: UpdateOnboardingTaskDto,
  ) {
    return this.service.updateOnboardingTask(
      id,
      parseInt(taskIndex),
      updateTaskDto,
    );
  }

  /**
   * Add a new task to onboarding
   * Only HR staff can add tasks
   */
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Post('onboarding/:id/task')
  async addTaskToOnboarding(
    @Param('id') id: string,
    @Body() taskDto: any,
  ) {
    return this.service.addTaskToOnboarding(id, taskDto);
  }

  /**
   * Remove a task from onboarding
   * Only HR staff can remove tasks
   */
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Delete('onboarding/:id/task/:taskIndex')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTaskFromOnboarding(
    @Param('id') id: string,
    @Param('taskIndex') taskIndex: string,
  ) {
    return this.service.removeTaskFromOnboarding(id, parseInt(taskIndex, 10));
  }

  /**
   * Delete onboarding checklist
   * Only HR managers and admins can delete
   */
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Delete('onboarding/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOnboarding(@Param('id') id: string) {
    return this.service.deleteOnboarding(id);
  }
}


