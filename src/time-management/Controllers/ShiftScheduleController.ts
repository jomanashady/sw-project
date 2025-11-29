import { Controller, Post, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ShiftScheduleService } from '../Services/ShiftScheduleService';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SelfAccessGuard } from '../auth/guards/self-access.guard';
import { Roles } from '../auth/decorators/roles.decorator';
// Import DTOs from DTOs folder
import {
  CreateShiftTypeDto,
  CreateShiftDto,
  AssignShiftToEmployeeDto,
  UpdateShiftTypeDto,
  UpdateShiftAssignmentDto,
  UpdateShiftDto,
  GetShiftsByTypeDto,
  GetScheduleRulesDto,
  CreateScheduleRuleDto,
  AssignScheduleRuleToEmployeeDto,
  DefineFlexibleSchedulingRulesDto,
} from '../DTOs/shift.dtos';

// ===== SHIFT AND SCHEDULE CONTROLLER =====
// Combines ShiftController and ScheduleController
// @UseGuards(AuthGuard, RolesGuard) // COMMENTED OUT FOR TESTING
@Controller('shift-schedule')
export class ShiftAndScheduleController {
  constructor(private readonly shiftScheduleService: ShiftScheduleService) {}

  // ===== Shift Management =====

  // 1. Create a new shift type
  // @Roles('HrManager', 'SystemAdmin') // COMMENTED OUT FOR TESTING
  @Post('shift/type')
  async createShiftType(@Body() createShiftTypeDto: CreateShiftTypeDto) {
    return this.shiftScheduleService.createShiftType(createShiftTypeDto);
  }

  // // 2. Update an existing shift type //not needed by user stories 
  // @Roles('HrManager', 'SystemAdmin')
  // @Put('shift/type/:id')
  // async updateShiftType(
  //   @Param('id') id: string,
  //   @Body() updateShiftTypeDto: UpdateShiftTypeDto
  // ) {
  //   return this.shiftScheduleService.updateShiftType(id, updateShiftTypeDto);
  // }

  // // 3. Get all shift types //not needed by user stories
  // @Roles('SystemAdmin', 'HrManager', 'HrAdmin', 'LineManager', 'PayrollOfficer')
  // @Get('shift/types')
  // async getShiftTypes() {
  //   return this.shiftScheduleService.getShiftTypes();
  // }

  // 4. Create a new shift
  // @Roles('HrManager', 'SystemAdmin') // COMMENTED OUT FOR TESTING
  @Post('shift')
  async createShift(@Body() createShiftDto: CreateShiftDto) {
    return this.shiftScheduleService.createShift(createShiftDto);
  }

  // 5. Update an existing shift
  // @Roles('HrManager', 'SystemAdmin') // COMMENTED OUT FOR TESTING
  @Put('shift/:id')
  async updateShift(
    @Param('id') id: string,
    @Body() updateShiftDto: UpdateShiftDto
  ) {
    return this.shiftScheduleService.updateShift(id, updateShiftDto);
  }

  // // 6. Get shifts by type (e.g., Normal, Rotational) //not needed by user stories
  // @Roles('SystemAdmin', 'HrManager', 'HrAdmin', 'LineManager')
  // @Get('shift/by-type')
  // async getShiftsByType(@Body() getShiftsByTypeDto: GetShiftsByTypeDto) {
  //   return this.shiftScheduleService.getShiftsByType(getShiftsByTypeDto.shiftType);
  // }

  // 7. Assign a shift to an employee
  // @Roles('SystemAdmin', 'HrAdmin') // COMMENTED OUT FOR TESTING
  @Post('shift/assign')
  async assignShiftToEmployee(@Body() assignShiftToEmployeeDto: AssignShiftToEmployeeDto) {
    return this.shiftScheduleService.assignShiftToEmployee(assignShiftToEmployeeDto);
  }

  // // 8. Update a shift assignment for an employee //not needed by user stories
  // @Roles('SystemAdmin', 'HrAdmin')
  // @Put('shift/assign/:id')
  // async updateShiftAssignment(
  //   @Param('id') id: string,
  //   @Body() updateShiftAssignmentDto: UpdateShiftAssignmentDto
  // ) {
  //   return this.shiftScheduleService.updateShiftAssignment(id, updateShiftAssignmentDto);
  // }

  // // 9. Get all shift assignments for an employee //not needed by user stories
  // @Roles('employee', 'LineManager', 'HrManager', 'HrAdmin', 'SystemAdmin')
  // @UseGuards(SelfAccessGuard)
  // @Get('shift/assignments/employee/:id')
  // async getEmployeeShiftAssignments(
  //   @Param('id') employeeId: string
  // ) {
  //   return this.shiftScheduleService.getEmployeeShiftAssignments(employeeId);
  // }

  // // 10. Get the status of a shift assignment //not needed by user stories
  // @Roles('SystemAdmin', 'HrAdmin', 'HrManager', 'LineManager')
  // @Get('shift/assignments/status/:id')
  // async getShiftAssignmentStatus(
  //   @Param('id') shiftAssignmentId: string
  // ) {
  //   return this.shiftScheduleService.getShiftAssignmentStatus(shiftAssignmentId);
  // }

  // ===== Scheduling Rules =====

  // 11. Create a new schedule rule
  // @Roles('HrManager', 'SystemAdmin') // COMMENTED OUT FOR TESTING
  @Post('schedule')
  async createScheduleRule(@Body() createScheduleRuleDto: CreateScheduleRuleDto) {
    return this.shiftScheduleService.createScheduleRule(createScheduleRuleDto);
  }

  // // 12. Get all schedule rules //not needed by user stories
  // @Roles('SystemAdmin', 'HrManager', 'HrAdmin', 'LineManager')
  // @Get('schedule')
  // async getScheduleRules(@Body() getScheduleRulesDto: GetScheduleRulesDto) {
  //   return this.shiftScheduleService.getScheduleRules(getScheduleRulesDto);
  // }

  // // 13. Assign a schedule rule to an employee //not needed by user stories
  // @Roles('HrManager', 'SystemAdmin')
  // @Post('schedule/assign')
  // async assignScheduleRuleToEmployee(@Body() assignScheduleRuleToEmployeeDto: AssignScheduleRuleToEmployeeDto) {
  //   return this.shiftScheduleService.assignScheduleRuleToEmployee(assignScheduleRuleToEmployeeDto);
  // }

  // 14. Define flexible scheduling rules
  // @Roles('HrManager', 'SystemAdmin') // COMMENTED OUT FOR TESTING
  @Post('schedule/flexible')
  async defineFlexibleSchedulingRules(@Body() defineFlexibleSchedulingRulesDto: DefineFlexibleSchedulingRulesDto) {
    return this.shiftScheduleService.defineFlexibleSchedulingRules(defineFlexibleSchedulingRulesDto);
  }
}

