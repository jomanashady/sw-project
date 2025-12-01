import { CreateCalendarDto } from './dto/CreateCalendar.dto';
import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { CreateLeavePolicyDto } from './dto/CreateLeavePolicy.dto';
import { UpdateLeavePolicyDto } from './dto/UpdateLeavePolicy.dto';
import { CreateLeaveRequestDto } from './dto/CreateLeaveRequest.dto';
import { UpdateLeaveRequestDto } from './dto/UpdateLeaveRequest.dto';
import { CreateLeaveEntitlementDto } from './dto/CreateLeaveEntitlement.dto';
import { UpdateLeaveEntitlementDto } from './dto/UpdateLeaveEntitlement.dto';
import { CreateLeaveAdjustmentDto } from './dto/CreateLeaveAdjustment.dto';
import { CreateLeaveTypeDto } from './dto/CreateLeaveType.dto';
import { UpdateLeaveTypeDto } from './dto/UpdateLeaveType.dto';
import { CreateLeaveCategoryDto } from './dto/CreateLeaveCategory.dto';
import { ApproveLeaveRequestDto } from './dto/ApproveLeaveRequest.dto';
import { RejectLeaveRequestDto } from './dto/RejectLeaveRequest.dto';
import { FinalizeLeaveRequestDto } from './dto/FinalizeLeaveRequest.dto';
import { HrOverrideDecisionDto } from './dto/HrOverrideDecision.dto';
import { ProcessMultipleRequestsDto } from './dto/ProcessMultipleRequests.dto';
import { ViewLeaveBalanceDto } from './dto/ViewLeaveBalance.dto';
import { ViewPastLeaveRequestsDto } from './dto/ViewPastLeaveRequests.dto';
import { FilterLeaveHistoryDto } from './dto/FilterLeaveHistory.dto';
import { ViewTeamLeaveBalancesDto } from './dto/ViewTeamLeaveBalances.dto';
import { FilterTeamLeaveDataDto } from './dto/FilterTeamLeaveData.dto';
import { FlagIrregularPatternDto, IrregularPatternAnalysisDto } from './dto/FlagIrregularPattern.dto';
import { AutoAccrueLeaveDto, AccrueAllEmployeesDto } from './dto/AutoAccrueLeave.dto';
import { RunCarryForwardDto } from './dto/CarryForward.dto';
import { AccrualAdjustmentDto, AccrualSuspensionDto } from './dto/AccrualAdjustment.dto';
//import { DelegateApprovalDto } from './dto/DelegateApproval.dto';

import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
import { AccrualMethod } from './enums/accrual-method.enum';
import { CalculateAccrualDto } from './dto/CalculateAccrual.Dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leaves')
export class LeaveController {
    // Calendar Endpoints
    @Post('calendar')
    async createCalendar(@Body() dto: CreateCalendarDto, @CurrentUser() user: any) {
      return await this.leavesService.createCalendar(dto, user.userId);
    }

    @Get('calendar/:year')
    async getCalendar(@Param('year') year: string, @CurrentUser() user: any) {
      return await this.leavesService.getCalendarByYear(Number(year), user.userId);
    }

    @Put('calendar/:year')
    async updateCalendar(
      @Param('year') year: string,
      @Body() dto: CreateCalendarDto,
      @CurrentUser() user: any,
    ) {
      return await this.leavesService.updateCalendar(Number(year), dto, user.userId);
    }
  constructor(private readonly leavesService: LeavesService) {}
                       //leave policy Endpoints
  @Post('policy')
  //@UseGuards(RolesGuard) 
  //@Roles(SystemRole.HR_ADMIN, SystemRole.LEGAL_POLICY_ADMIN)
  async createLeavePolicy(
    @Body() createLeavePolicyDto: CreateLeavePolicyDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.createLeavePolicy(createLeavePolicyDto, user.userId);
  }

  @Get('policies')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async getLeavePolicies(@CurrentUser() user: any) {
    return await this.leavesService.getLeavePolicies(user.userId);
  }

  @Get('policy/:id')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async getLeavePolicyById(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.leavesService.getLeavePolicyById(id, user.userId);
  }

  @Put('policy/:id')
  @Roles(SystemRole.HR_ADMIN, SystemRole.LEGAL_POLICY_ADMIN)
  async updateLeavePolicy(
    @Param('id') id: string,
    @Body() updateLeavePolicyDto: UpdateLeavePolicyDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.updateLeavePolicy(id, updateLeavePolicyDto, user.userId);
  }

  @Delete('policy/:id')
  @Roles(SystemRole.HR_ADMIN, SystemRole.LEGAL_POLICY_ADMIN)
  async deleteLeavePolicy(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.leavesService.deleteLeavePolicy(id, user.userId);
  }

                          // Leave Request Endpoints

  @Post('request')
  //@UseGuards(RolesGuard)
  //@Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.DEPARTMENT_HEAD)
  async createLeaveRequest(
    @Body() createLeaveRequestDto: CreateLeaveRequestDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.createLeaveRequest(createLeaveRequestDto, user.userId);
  }

  @Get('request/:id')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER)
  async getLeaveRequestById(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.leavesService.getLeaveRequestById(id, user.userId);
  }

  @Put('request/:id')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.HR_ADMIN, SystemRole.DEPARTMENT_HEAD)
  async updateLeaveRequest(
    @Param('id') id: string,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.updateLeaveRequest(id, updateLeaveRequestDto, user.userId);
  }

  @Delete('request/:id')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.HR_ADMIN)
  async deleteLeaveRequest(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.leavesService.deleteLeaveRequest(id, user.userId);
  }

  // Leave Entitlement Endpoints
  @Post('entitlement')
  // @UseGuards(RolesGuard)
  // @Roles(SystemRole.HR_ADMIN)
  async createLeaveEntitlement(
    @Body() createLeaveEntitlementDto: CreateLeaveEntitlementDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.createLeaveEntitlement(createLeaveEntitlementDto, user.userId);
  }

  @Get('entitlement/:employeeId/:leaveTypeId')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  async getLeaveEntitlement(
    @Param('employeeId') employeeId: string,
    @Param('leaveTypeId') leaveTypeId: string,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.getLeaveEntitlement(employeeId, leaveTypeId, user.userId);
  }

  @Put('entitlement/:id')
  @Roles(SystemRole.HR_ADMIN)
  async updateLeaveEntitlement(
    @Param('id') id: string,
    @Body() updateLeaveEntitlementDto: UpdateLeaveEntitlementDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.updateLeaveEntitlement(id, updateLeaveEntitlementDto, user.userId);
  }

  // Leave Adjustment Endpoints
  @Post('adjustment')
  @Roles(SystemRole.HR_ADMIN)
  async createLeaveAdjustment(
    @Body() createLeaveAdjustmentDto: CreateLeaveAdjustmentDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.createLeaveAdjustment(createLeaveAdjustmentDto, user.userId);
  }

  @Get('adjustment/:employeeId')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  async getLeaveAdjustments(
    @Param('employeeId') employeeId: string,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.getLeaveAdjustments(employeeId, user.userId);
  }

  @Delete('adjustment/:id')
  @Roles(SystemRole.HR_ADMIN)
  async deleteLeaveAdjustment(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.leavesService.deleteLeaveAdjustment(id, user.userId);
  }

  // Leave Type Endpoints
  @Post('category')
  // @UseGuards(RolesGuard)
  // @Roles(SystemRole.HR_ADMIN, SystemRole.LEGAL_POLICY_ADMIN)
  async createLeaveCategory(
    @Body() createLeaveCategoryDto: CreateLeaveCategoryDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.createLeaveCategory(createLeaveCategoryDto, user.userId);
  }
  @Post('type')
  //@UseGuards(RolesGuard)
  //@Roles(SystemRole.HR_ADMIN, SystemRole.LEGAL_POLICY_ADMIN)
  async createLeaveType(
    @Body() createLeaveTypeDto: CreateLeaveTypeDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.createLeaveType(createLeaveTypeDto, user.userId);
  }

  @Put('type/:id')
  @Roles(SystemRole.HR_ADMIN, SystemRole.LEGAL_POLICY_ADMIN)
  async updateLeaveType(
    @Param('id') id: string,
    @Body() updateLeaveTypeDto: UpdateLeaveTypeDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.updateLeaveType(id, updateLeaveTypeDto, user.userId);
  }

  // Phase 2: Leave Request Approval Endpoints

  @Post('request/:id/approve')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN)
  async approveLeaveRequest(
    @Param('id') id: string,
    @Body() approveLeaveRequestDto: ApproveLeaveRequestDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.approveLeaveRequest(approveLeaveRequestDto, user, user.userId);
  }

  @Post('request/:id/reject')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN)
  async rejectLeaveRequest(
    @Param('id') id: string,
    @Body() rejectLeaveRequestDto: RejectLeaveRequestDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.rejectLeaveRequest(rejectLeaveRequestDto, user, user.userId);
  }

  // @Get('pending/:managerId')
  // @UseGuards(RolesGuard)
  // @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN)
  // async getPendingRequestsForManager(@Param('managerId') managerId: string) {
  //   return await this.leavesService.getPendingRequestsForManager(managerId);
  // }

  // Phase 2: HR Manager Endpoints

  @Post('request/finalize')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN)
  async finalizeLeaveRequest(
    @Body() finalizeDto: FinalizeLeaveRequestDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.finalizeLeaveRequest(
      finalizeDto.leaveRequestId,
      finalizeDto.hrUserId,
      user.userId,
    );
  }

  @Post('request/override')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN)
  async hrOverrideDecision(
    @Body() overrideDto: HrOverrideDecisionDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.hrOverrideDecision(
      overrideDto.leaveRequestId,
      overrideDto.hrUserId,
      overrideDto.overrideToApproved,
      overrideDto.overrideReason,
      user.userId,
    );
  }

  @Post('request/process-multiple')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN)
  async processMultipleLeaveRequests(
    @Body() processDto: ProcessMultipleRequestsDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.processMultipleLeaveRequests(
      processDto.leaveRequestIds,
      processDto.hrUserId,
      processDto.approved,
      user.userId,
    );
  }

  // Phase 2: Employee Endpoints

  @Get('balance/:employeeId')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN)
  async getEmployeeLeaveBalance(
    @Param('employeeId') employeeId: string,
    @Query('leaveTypeId') leaveTypeId: string | undefined,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.getEmployeeLeaveBalance(employeeId, leaveTypeId, user.userId);
  }

  @Post('request/:id/cancel')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.HR_ADMIN)
  async cancelLeaveRequest(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.leavesService.cancelLeaveRequest(id, user.userId);
  }

  // REQ-031: Get detailed leave balance
  @Get('balance-details/:employeeId')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN)
  async getLeaveBalanceDetails(
    @Param('employeeId') employeeId: string,
    @Query('leaveTypeId') leaveTypeId: string | undefined,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.getEmployeeLeaveBalance(employeeId, leaveTypeId, user.userId);
  }

  // REQ-032: Get past leave requests
  @Get('past-requests/:employeeId')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN)
  async getPastLeaveRequests(
    @Param('employeeId') employeeId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('status') status?: string,
    @Query('leaveTypeId') leaveTypeId?: string,
    @CurrentUser() user?: any,
  ) {
    return await this.leavesService.getPastLeaveRequests(employeeId, {
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
      status,
      leaveTypeId,
    }, user.userId);
  }

  // REQ-033: Filter leave history
  @Post('filter-history')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN)
  async filterLeaveHistory(
    @Body() filterDto: FilterLeaveHistoryDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.filterLeaveHistory(filterDto.employeeId, filterDto, user.userId);
  }

  // REQ-034: View team leave balances and upcoming leaves
  @Get('team-balances/:managerId')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN)
  async getTeamLeaveBalances(
    @Param('managerId') managerId: string,
    @Query('upcomingFromDate') upcomingFromDate?: string,
    @Query('upcomingToDate') upcomingToDate?: string,
    @Query('departmentId') departmentId?: string,
    @CurrentUser() user?: any,
  ) {
    return await this.leavesService.getTeamLeaveBalances(
      managerId,
      upcomingFromDate ? new Date(upcomingFromDate) : undefined,
      upcomingToDate ? new Date(upcomingToDate) : undefined,
      departmentId,
      user.userId,
    );
  }

  // REQ-035: Filter team leave data
  @Post('filter-team-data')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN)
  async filterTeamLeaveData(
    @Body() filterDto: FilterTeamLeaveDataDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.filterTeamLeaveData(filterDto.managerId, filterDto, user.userId);
  }

  // REQ-039: Flag irregular pattern
  @Post('flag-irregular-pattern')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_ADMIN)
  async flagIrregularPattern(
    @Body() flagDto: FlagIrregularPatternDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.flagIrregularPattern(
      flagDto.leaveRequestId,
      flagDto.managerId,
      flagDto.flagReason,
      flagDto.notes,
      user.userId,
    );
  }

  // REQ-040: Auto accrue leave for single employee
  @Post('auto-accrue')
  // @UseGuards(RolesGuard)
  // @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST)
  async autoAccrueLeave(
    @Body() accrueDto: AutoAccrueLeaveDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.autoAccrueLeave(
      accrueDto.employeeId,
      accrueDto.leaveTypeId,
      accrueDto.accrualAmount,
      accrueDto.accrualType,
      accrueDto.policyId,
      accrueDto.notes,
      user.userId,
    );
  }

  // REQ-040: Auto accrue leave for all employees
  @Post('auto-accrue-all')
  // @UseGuards(RolesGuard)
  // @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST)
  async autoAccrueAllEmployees(
    @Body() accrueAllDto: AccrueAllEmployeesDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.autoAccrueAllEmployees(
      accrueAllDto.leaveTypeId,
      accrueAllDto.accrualAmount,
      accrueAllDto.accrualType,
      accrueAllDto.departmentId,
      user.userId,
    );
  }

  // REQ-041: Run carry-forward
  @Post('carry-forward')
  // @UseGuards(RolesGuard)
  // @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST)
  async runCarryForward(
    @Body() carryForwardDto: RunCarryForwardDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.runCarryForward(
      carryForwardDto.leaveTypeId,
      carryForwardDto.employeeId,
      carryForwardDto.asOfDate,
      carryForwardDto.departmentId,
      user.userId,
    );
  }

  // REQ-042: Adjust accruals
  @Post('adjust-accrual')
  // @UseGuards(RolesGuard)
  // @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST)
  async adjustAccrual(
    @Body() adjustmentDto: AccrualAdjustmentDto,
    @CurrentUser() user: any,
  ) {
    return await this.leavesService.adjustAccrual(
      adjustmentDto.employeeId,
      adjustmentDto.leaveTypeId,
      adjustmentDto.adjustmentType,
      adjustmentDto.adjustmentAmount,
      adjustmentDto.fromDate,
      adjustmentDto.toDate,
      adjustmentDto.reason,
      adjustmentDto.notes,
      user.userId,
    );
  }

  @Post('calculate-accrual')
  async calculateAccrual(
    @Body() calculateAccrualDto: CalculateAccrualDto,
    @CurrentUser() user: any,
  ): Promise<void> {
    const { employeeId, leaveTypeId, accrualMethod } = calculateAccrualDto;
    // No need for type casting; the DTO should already be typed correctly
    await this.leavesService.calculateAccrual(employeeId, leaveTypeId, accrualMethod, user.userId);
  }
}

  // Phase 2: REQ-023 - Delegate approval authority
  // @Post('delegate')
  // @UseGuards(RolesGuard)
  // @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER)
  // async delegateApprovalAuthority(@Body() delegateDto: DelegateApprovalDto) {
  //   return await this.leavesService.delegateApprovalAuthority(
  //     delegateDto.managerId,
  //     delegateDto.delegateId,
  //     delegateDto.startDate,
  //     delegateDto.endDate
  //   );
  // }
