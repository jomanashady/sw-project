import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PolicyConfigService } from '../services/policy-config.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';
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

@Controller('policy-config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PolicyConfigController {
  constructor(private readonly policyConfigService: PolicyConfigService) {}

  // ===== OVERTIME RULES =====
  @Post('overtime')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async createOvertimeRule(
    @Body() createOvertimeRuleDto: CreateOvertimeRuleDto,
    @CurrentUser() user: any,
  ) {
    return this.policyConfigService.createOvertimeRule(
      createOvertimeRuleDto,
      user.userId,
    );
  }

  @Get('overtime')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
  )
  async getOvertimeRules(
    @Query() getPoliciesDto: GetPoliciesDto,
    @CurrentUser() user: any,
  ) {
    return this.policyConfigService.getOvertimeRules(
      getPoliciesDto,
      user.userId,
    );
  }

  @Get('overtime/:id')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
  )
  async getOvertimeRuleById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.policyConfigService.getOvertimeRuleById(id, user.userId);
  }

  @Put('overtime/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async updateOvertimeRule(
    @Param('id') id: string,
    @Body() updateOvertimeRuleDto: UpdateOvertimeRuleDto,
    @CurrentUser() user: any,
  ) {
    return this.policyConfigService.updateOvertimeRule(
      id,
      updateOvertimeRuleDto,
      user.userId,
    );
  }

  @Delete('overtime/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async deleteOvertimeRule(@Param('id') id: string, @CurrentUser() user: any) {
    return this.policyConfigService.deleteOvertimeRule(id, user.userId);
  }

  // ===== LATENESS RULES =====
  @Post('lateness')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async createLatenessRule(
    @Body() createLatenessRuleDto: CreateLatenessRuleDto,
    @CurrentUser() user: any,
  ) {
    return this.policyConfigService.createLatenessRule(
      createLatenessRuleDto,
      user.userId,
    );
  }

  @Get('lateness')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.DEPARTMENT_HEAD,
  )
  async getLatenessRules(
    @Query() getPoliciesDto: GetPoliciesDto,
    @CurrentUser() user: any,
  ) {
    return this.policyConfigService.getLatenessRules(
      getPoliciesDto,
      user.userId,
    );
  }

  @Get('lateness/:id')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.DEPARTMENT_HEAD,
  )
  async getLatenessRuleById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.policyConfigService.getLatenessRuleById(id, user.userId);
  }

  @Put('lateness/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async updateLatenessRule(
    @Param('id') id: string,
    @Body() updateLatenessRuleDto: UpdateLatenessRuleDto,
    @CurrentUser() user: any,
  ) {
    return this.policyConfigService.updateLatenessRule(
      id,
      updateLatenessRuleDto,
      user.userId,
    );
  }

  @Delete('lateness/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async deleteLatenessRule(@Param('id') id: string, @CurrentUser() user: any) {
    return this.policyConfigService.deleteLatenessRule(id, user.userId);
  }

  // ===== HOLIDAYS =====
  @Post('holiday')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async createHoliday(
    @Body() createHolidayDto: CreateHolidayDto,
    @CurrentUser() user: any,
  ) {
    return this.policyConfigService.createHoliday(
      createHolidayDto,
      user.userId,
    );
  }

  @Get('holiday')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.PAYROLL_SPECIALIST,
  )
  async getHolidays(
    @Query() getHolidaysDto: GetHolidaysDto,
    @CurrentUser() user: any,
  ) {
    return this.policyConfigService.getHolidays(getHolidaysDto, user.userId);
  }

  @Get('holiday/upcoming')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.PAYROLL_SPECIALIST,
  )
  async getUpcomingHolidays(
    @Query('days') days?: number,
    @CurrentUser() user?: any,
  ) {
    return this.policyConfigService.getUpcomingHolidays(
      days || 30,
      user?.userId,
    );
  }

  @Get('holiday/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async getHolidayById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.policyConfigService.getHolidayById(id, user.userId);
  }

  @Put('holiday/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async updateHoliday(
    @Param('id') id: string,
    @Body() updateHolidayDto: UpdateHolidayDto,
    @CurrentUser() user: any,
  ) {
    return this.policyConfigService.updateHoliday(
      id,
      updateHolidayDto,
      user.userId,
    );
  }

  @Delete('holiday/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async deleteHoliday(@Param('id') id: string, @CurrentUser() user: any) {
    return this.policyConfigService.deleteHoliday(id, user.userId);
  }

  // ===== HOLIDAY VALIDATION =====
  @Post('holiday/check')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.PAYROLL_SPECIALIST,
  )
  async checkHoliday(
    @Body() checkHolidayDto: CheckHolidayDto,
    @CurrentUser() user: any,
  ) {
    return this.policyConfigService.checkHoliday(checkHolidayDto, user.userId);
  }

  @Post('holiday/validate-attendance')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.PAYROLL_SPECIALIST,
  )
  async validateAttendanceHoliday(
    @Body() validateAttendanceHolidayDto: ValidateAttendanceHolidayDto,
    @CurrentUser() user: any,
  ) {
    return this.policyConfigService.validateAttendanceHoliday(
      validateAttendanceHolidayDto,
      user.userId,
    );
  }
}
