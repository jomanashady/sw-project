
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
import { CreateEmployeeFromContractDto } from './dto/create-employee-from-contract.dto';

@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly service: RecruitmentService) {}

  // ------------------------------------------
  // JOB REQUISITION
  // ------------------------------------------

  @Post('job')
  createJob(@Body() dto: CreateJobRequisitionDto) {
    return this.service.createJobRequisition(dto);
  }

  @Get('job')
  getJobs() {
    return this.service.getAllJobRequisitions();
  }

  // ------------------------------------------
  // APPLICATIONS
  // ------------------------------------------
  @Post('application')
  apply(@Body() dto: CreateApplicationDto) {
    return this.service.apply(dto);
  }

  @Patch('application/:id/status')
  updateAppStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.service.updateApplicationStatus(id, dto);
  }

  // ------------------------------------------
  // INTERVIEWS
  // ------------------------------------------
  @Post('interview')
  scheduleInterview(@Body() dto: ScheduleInterviewDto) {
    return this.service.scheduleInterview(dto);
  }

  @Patch('interview/:id/status')
  updateInterviewStatus(
    @Param('id') id: string,
    @Body() dto: UpdateInterviewStatusDto,
  ) {
    return this.service.updateInterviewStatus(id, dto);
  }

  // ------------------------------------------
  // OFFERS
  // ------------------------------------------
  @Post('offer')
  createOffer(@Body() dto: CreateOfferDto) {
    return this.service.createOffer(dto);
  }

  @Patch('offer/:id/respond')
  respond(
    @Param('id') id: string,
    @Body() dto: RespondToOfferDto,
  ) {
    return this.service.respondToOffer(id, dto);
  }

  @Patch('offer/:id/finalize')
  finalize(
    @Param('id') id: string,
    @Body() dto: FinalizeOfferDto,
  ) {
    return this.service.finalizeOffer(id, dto);
  }

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
   * POST /recruitment/onboarding
   * Create onboarding checklist (ONB-001)
   */
  @Post('onboarding')
  async createOnboarding(@Body() createOnboardingDto: CreateOnboardingDto) {
    return this.service.createOnboarding(createOnboardingDto);
  }

  /**
   * GET /recruitment/onboarding
   * Get all onboarding records (HR Manager view)
   */
  @Get('onboarding')
  async getAllOnboardings() {
    return this.service.getAllOnboardings();
  }

  /**
   * GET /recruitment/onboarding/stats
   * Get onboarding statistics
   */
  @Get('onboarding/stats')
  async getOnboardingStats() {
    return this.service.getOnboardingStats();
  }

  /**
   * GET /recruitment/onboarding/:id
   * Get onboarding by ID
   */
  @Get('onboarding/:id')
  async getOnboardingById(@Param('id') id: string) {
    return this.service.getOnboardingById(id);
  }

  /**
   * GET /recruitment/onboarding/employee/:employeeId
   * Get onboarding by employee ID (ONB-004)
   */
  @Get('onboarding/employee/:employeeId')
  async getOnboardingByEmployeeId(@Param('employeeId') employeeId: string) {
    return this.service.getOnboardingByEmployeeId(employeeId);
  }

  /**
   * PUT /recruitment/onboarding/:id
   * Update entire onboarding checklist
   */
  @Put('onboarding/:id')
  async updateOnboarding(
    @Param('id') id: string,
    @Body() updateOnboardingDto: UpdateOnboardingDto,
  ) {
    return this.service.updateOnboarding(id, updateOnboardingDto);
  }

  /**
   * PATCH /recruitment/onboarding/:id/task/:taskIndex
   * Update a specific task in onboarding
   */
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
   * POST /recruitment/onboarding/:id/task
   * Add a new task to onboarding
   */
  @Post('onboarding/:id/task')
  async addTaskToOnboarding(
    @Param('id') id: string,
    @Body() taskDto: any,
  ) {
    return this.service.addTaskToOnboarding(id, taskDto);
  }

  /**
   * DELETE /recruitment/onboarding/:id/task/:taskIndex
   * Remove a task from onboarding
   */
  @Delete('onboarding/:id/task/:taskIndex')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTaskFromOnboarding(
    @Param('id') id: string,
    @Param('taskIndex') taskIndex: string,
  ) {
    return this.service.removeTaskFromOnboarding(id, parseInt(taskIndex, 10));
  }

  /**
   * DELETE /recruitment/onboarding/:id
   * Delete onboarding checklist
   */
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

}


