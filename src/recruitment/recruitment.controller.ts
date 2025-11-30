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
import { 
  UseInterceptors, 
  UploadedFile, 
  Res 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { multerConfig } from './multer.config';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { DocumentType } from './enums/document-type.enum';

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
import { CreateEmployeeFromContractDto } from './dto/create-employee-from-contract.dto';


import {
  CreateTerminationRequestDto,
  UpdateTerminationStatusDto,
  UpdateTerminationDetailsDto,
} from './dto/termination-request.dto';

import {
  CreateClearanceChecklistDto,
  UpdateClearanceItemStatusDto,
} from './dto/clearance-checklist.dto';

import { RevokeSystemAccessDto } from './dto/system-access.dto';

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
   * POST /recruitment/offer/:id/create-employee
   * Create employee profile from accepted offer and signed contract
   * HR Manager access signed contract details to create employee profile
   */
  @Post('offer/:id/create-employee')
  async createEmployeeFromContract(
    @Param('id') offerId: string,
    @Body() dto: CreateEmployeeFromContractDto,
  ) {
    return this.service.createEmployeeFromContract(offerId, dto);
  }

  // ============= ONBOARDING ENDPOINTS =============

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
// ============= DOCUMENT UPLOAD ENDPOINTS (ONB-007) =============

/**
 * POST /recruitment/onboarding/:id/task/:taskIndex/upload
 * Upload document for specific onboarding task
 */
@Post('onboarding/:id/task/:taskIndex/upload')
@UseInterceptors(FileInterceptor('file', multerConfig))
async uploadTaskDocument(
  @Param('id') onboardingId: string,
  @Param('taskIndex') taskIndex: string,
  @UploadedFile() file: Express.Multer.File,
  @Body('documentType') documentType: DocumentType,
) {
  return this.service.uploadTaskDocument(
    onboardingId,
    parseInt(taskIndex, 10),
    file,
    documentType,
  );
}

/**
 * GET /recruitment/document/:documentId/download
 * Download document by ID
 */
@Get('document/:documentId/download')
async downloadDocument(
  @Param('documentId') documentId: string,
  @Res() res: Response,
) {
  return this.service.downloadDocument(documentId, res);
}

/**
 * GET /recruitment/onboarding/:id/task/:taskIndex/document
 * Get document metadata for specific task
 */
@Get('onboarding/:id/task/:taskIndex/document')
async getTaskDocument(
  @Param('id') onboardingId: string,
  @Param('taskIndex') taskIndex: string,
) {
  return this.service.getTaskDocument(onboardingId, parseInt(taskIndex, 10));
}

/**
 * DELETE /recruitment/document/:documentId
 * Delete document (cleanup)
 */
@Delete('document/:documentId')
@HttpCode(HttpStatus.NO_CONTENT)
async deleteDocument(@Param('documentId') documentId: string) {
  return this.service.deleteDocument(documentId);
}

  
  
  @UseGuards(
  // JwtAuthGuard,   // uncomment when you plug the real auth guard
  RolesGuard,
)
export class RecruitmentController {
  constructor(private readonly service: RecruitmentService) {}

  // ============================= OFFBOARDING =============================

  // 1) Termination / Resignation
  //    - Employee can send their own resignation.
  //    - HR Manager can initiate termination.
  // No @Roles here -> any authenticated user can call,
  // then the service will branch based on user.role + initiator
  @Post('offboarding/termination')
  createTerminationRequest(
    @Body() dto: CreateTerminationRequestDto,
    @Req() req: any,
  ) {
    return this.service.createTerminationRequest(dto, req.user);
  }

  @Get('offboarding/termination/:id')
  @Roles(SystemRole.HR_MANAGER) // only HR can view details
  getTerminationRequest(@Param('id') id: string) {
    return this.service.getTerminationRequestById(id);
  }

  @Patch('offboarding/termination/:id/status')
  @Roles(SystemRole.HR_MANAGER)
  updateTerminationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTerminationStatusDto,
    @Req() req: any,
  ) {
    return this.service.updateTerminationStatus(id, dto, req.user);
  }

  @Patch('offboarding/termination/:id')
  @Roles(SystemRole.HR_MANAGER)
  updateTerminationDetails(
    @Param('id') id: string,
    @Body() dto: UpdateTerminationDetailsDto,
    @Req() req: any,
  ) {
    return this.service.updateTerminationDetails(id, dto, req.user);
  }

  // 2) Clearance checklist

  @Post('offboarding/clearance')
  @Roles(SystemRole.HR_MANAGER)
  createClearanceChecklist(
    @Body() dto: CreateClearanceChecklistDto,
    @Req() req: any,
  ) {
    return this.service.createClearanceChecklist(dto, req.user);
  }

  @Get('offboarding/clearance/employee/:employeeId')
  @Roles(SystemRole.HR_MANAGER)
  getChecklistByEmployee(@Param('employeeId') employeeId: string) {
    return this.service.getChecklistByEmployee(employeeId);
  }

  @Patch('offboarding/clearance/:id/item')
  @Roles(SystemRole.HR_MANAGER) // HR updates each dept status
  updateClearanceItem(
    @Param('id') checklistId: string,
    @Body() dto: UpdateClearanceItemStatusDto,
    @Req() req: any,
  ) {
    return this.service.updateClearanceItemStatus(checklistId, dto, req.user);
  }

  @Patch('offboarding/clearance/:id/complete')
  @Roles(SystemRole.HR_MANAGER)
  markChecklistCompleted(@Param('id') checklistId: string, @Req() req: any) {
    return this.service.markChecklistCompleted(checklistId, req.user);
  }

  // 3) Appraisal view for offboarding (latest appraisal of employee)
  @Get('offboarding/appraisal/:employeeId')
  @Roles(SystemRole.HR_MANAGER)
  getLatestAppraisal(@Param('employeeId') employeeId: string) {
    return this.service.getLatestAppraisalForEmployee(employeeId);
  }

  // 4) SYSTEM ACCESS REVOCATION
  @Patch('offboarding/system-revoke')
  @Roles(SystemRole.SYSTEM_ADMIN)
  revokeAccess(@Body() dto: RevokeSystemAccessDto, @Req() req: any) {
    return this.service.revokeSystemAccess(dto, req.user);
  }
}
}


