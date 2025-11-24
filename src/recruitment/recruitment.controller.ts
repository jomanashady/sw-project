import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Patch,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { UpdateOnboardingTaskDto } from './dto/update-task.dto';

@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // ============= ONBOARDING ENDPOINTS =============

  /**
   * POST /recruitment/onboarding
   * Create onboarding checklist (ONB-001)
   */
  @Post('onboarding')
  async createOnboarding(@Body() createOnboardingDto: CreateOnboardingDto) {
    return this.recruitmentService.createOnboarding(createOnboardingDto);
  }

  /**
   * GET /recruitment/onboarding
   * Get all onboarding records (HR Manager view)
   */
  @Get('onboarding')
  async getAllOnboardings() {
    return this.recruitmentService.getAllOnboardings();
  }

  /**
   * GET /recruitment/onboarding/stats
   * Get onboarding statistics
   */
  @Get('onboarding/stats')
  async getOnboardingStats() {
    return this.recruitmentService.getOnboardingStats();
  }

  /**
   * GET /recruitment/onboarding/:id
   * Get onboarding by ID
   */
  @Get('onboarding/:id')
  async getOnboardingById(@Param('id') id: string) {
    return this.recruitmentService.getOnboardingById(id);
  }

  /**
   * GET /recruitment/onboarding/employee/:employeeId
   * Get onboarding by employee ID (ONB-004)
   */
  @Get('onboarding/employee/:employeeId')
  async getOnboardingByEmployeeId(@Param('employeeId') employeeId: string) {
    return this.recruitmentService.getOnboardingByEmployeeId(employeeId);
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
    return this.recruitmentService.updateOnboarding(id, updateOnboardingDto);
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
    return this.recruitmentService.updateOnboardingTask(
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
    return this.recruitmentService.addTaskToOnboarding(id, taskDto);
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
    return this.recruitmentService.removeTaskFromOnboarding(id, parseInt(taskIndex));
  }

  /**
   * DELETE /recruitment/onboarding/:id
   * Delete onboarding checklist
   */
  @Delete('onboarding/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOnboarding(@Param('id') id: string) {
    return this.recruitmentService.deleteOnboarding(id);
  }
}