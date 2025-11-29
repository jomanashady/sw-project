import { Controller, Post, Get, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PolicyConfigService } from '../Services/PolicyConfigService';
// Import DTOs
import {
  CreateOvertimeRuleDto,
  UpdateOvertimeRuleDto,
  CreateLatenessRuleDto,
  UpdateLatenessRuleDto,
  CreateHolidayDto,
  UpdateHolidayDto,
  GetHolidaysDto,
  GetPoliciesDto,
  CheckHolidayDto,
  ValidateAttendanceHolidayDto,
} from '../DTOs/policy-config.dtos';

// ===== POLICY CONFIGURATION CONTROLLER =====
// Handles Overtime Rules, Lateness Rules, and Holidays
// Auth guards commented out for standalone testing
// @UseGuards(AuthGuard, RolesGuard)
@Controller('policy-config')
export class PolicyConfigController {
  constructor(private readonly policyConfigService: PolicyConfigService) {}

  // ===== OVERTIME RULES =====

  // Create a new overtime rule
  // @Roles('HrManager', 'SystemAdmin')
  @Post('overtime')
  async createOvertimeRule(@Body() createOvertimeRuleDto: CreateOvertimeRuleDto) {
    return this.policyConfigService.createOvertimeRule(createOvertimeRuleDto);
  }

  // Get all overtime rules with optional filters
  // @Roles('HrManager', 'HrAdmin', 'SystemAdmin', 'PayrollOfficer')
  @Get('overtime')
  async getOvertimeRules(@Query() getPoliciesDto: GetPoliciesDto) {
    return this.policyConfigService.getOvertimeRules(getPoliciesDto);
  }

  // Get a single overtime rule by ID
  // @Roles('HrManager', 'HrAdmin', 'SystemAdmin', 'PayrollOfficer')
  @Get('overtime/:id')
  async getOvertimeRuleById(@Param('id') id: string) {
    return this.policyConfigService.getOvertimeRuleById(id);
  }

  // Update an overtime rule
  // @Roles('HrManager', 'SystemAdmin')
  @Put('overtime/:id')
  async updateOvertimeRule(
    @Param('id') id: string,
    @Body() updateOvertimeRuleDto: UpdateOvertimeRuleDto,
  ) {
    return this.policyConfigService.updateOvertimeRule(id, updateOvertimeRuleDto);
  }

  // Delete an overtime rule
  // @Roles('HrManager', 'SystemAdmin')
  @Delete('overtime/:id')
  async deleteOvertimeRule(@Param('id') id: string) {
    return this.policyConfigService.deleteOvertimeRule(id);
  }

  // ===== LATENESS RULES =====

  // Create a new lateness rule
  // @Roles('HrManager', 'SystemAdmin')
  @Post('lateness')
  async createLatenessRule(@Body() createLatenessRuleDto: CreateLatenessRuleDto) {
    return this.policyConfigService.createLatenessRule(createLatenessRuleDto);
  }

  // Get all lateness rules with optional filters
  // @Roles('HrManager', 'HrAdmin', 'SystemAdmin', 'PayrollOfficer', 'LineManager')
  @Get('lateness')
  async getLatenessRules(@Query() getPoliciesDto: GetPoliciesDto) {
    return this.policyConfigService.getLatenessRules(getPoliciesDto);
  }

  // Get a single lateness rule by ID
  // @Roles('HrManager', 'HrAdmin', 'SystemAdmin', 'PayrollOfficer', 'LineManager')
  @Get('lateness/:id')
  async getLatenessRuleById(@Param('id') id: string) {
    return this.policyConfigService.getLatenessRuleById(id);
  }

  // Update a lateness rule
  // @Roles('HrManager', 'SystemAdmin')
  @Put('lateness/:id')
  async updateLatenessRule(
    @Param('id') id: string,
    @Body() updateLatenessRuleDto: UpdateLatenessRuleDto,
  ) {
    return this.policyConfigService.updateLatenessRule(id, updateLatenessRuleDto);
  }

  // Delete a lateness rule
  // @Roles('HrManager', 'SystemAdmin')
  @Delete('lateness/:id')
  async deleteLatenessRule(@Param('id') id: string) {
    return this.policyConfigService.deleteLatenessRule(id);
  }

  // ===== HOLIDAYS =====

  // Create a new holiday
  // @Roles('HrManager', 'HrAdmin', 'SystemAdmin')
  @Post('holiday')
  async createHoliday(@Body() createHolidayDto: CreateHolidayDto) {
    return this.policyConfigService.createHoliday(createHolidayDto);
  }

  // Get all holidays with optional filters
  // @Roles('employee', 'HrManager', 'HrAdmin', 'SystemAdmin', 'LineManager', 'PayrollOfficer')
  @Get('holiday')
  async getHolidays(@Query() getHolidaysDto: GetHolidaysDto) {
    return this.policyConfigService.getHolidays(getHolidaysDto);
  }

  // Get upcoming holidays (next N days, default 30)
  // @Roles('employee', 'HrManager', 'HrAdmin', 'SystemAdmin', 'LineManager', 'PayrollOfficer')
  @Get('holiday/upcoming')
  async getUpcomingHolidays(@Query('days') days?: number) {
    return this.policyConfigService.getUpcomingHolidays(days || 30);
  }

  // Get a single holiday by ID
  // @Roles('HrManager', 'HrAdmin', 'SystemAdmin')
  @Get('holiday/:id')
  async getHolidayById(@Param('id') id: string) {
    return this.policyConfigService.getHolidayById(id);
  }

  // Update a holiday
  // @Roles('HrManager', 'HrAdmin', 'SystemAdmin')
  @Put('holiday/:id')
  async updateHoliday(
    @Param('id') id: string,
    @Body() updateHolidayDto: UpdateHolidayDto,
  ) {
    return this.policyConfigService.updateHoliday(id, updateHolidayDto);
  }

  // Delete a holiday
  // @Roles('HrManager', 'HrAdmin', 'SystemAdmin')
  @Delete('holiday/:id')
  async deleteHoliday(@Param('id') id: string) {
    return this.policyConfigService.deleteHoliday(id);
  }

  // ===== HOLIDAY VALIDATION =====

  // Check if a specific date is a holiday
  // @Roles('employee', 'HrManager', 'HrAdmin', 'SystemAdmin', 'LineManager', 'PayrollOfficer')
  @Post('holiday/check')
  async checkHoliday(@Body() checkHolidayDto: CheckHolidayDto) {
    return this.policyConfigService.checkHoliday(checkHolidayDto);
  }

  // Validate attendance against holidays (suppress penalty if holiday)
  // @Roles('HrManager', 'HrAdmin', 'SystemAdmin', 'LineManager', 'PayrollOfficer')
  @Post('holiday/validate-attendance')
  async validateAttendanceHoliday(@Body() validateAttendanceHolidayDto: ValidateAttendanceHolidayDto) {
    return this.policyConfigService.validateAttendanceHoliday(validateAttendanceHolidayDto);
  }
}
