import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ShiftScheduleService } from '../services/shift-schedule.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';
// Import DTOs from DTOs folder
import {
  CreateShiftTypeDto,
  CreateShiftDto,
  AssignShiftToEmployeeDto,
  UpdateShiftDto,
  CreateScheduleRuleDto,
  DefineFlexibleSchedulingRulesDto,
} from '../DTOs/shift.dtos';

@Controller('shift-schedule')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftAndScheduleController {
  constructor(private readonly shiftScheduleService: ShiftScheduleService) {}

  // ===== Shift Management =====
  @Post('shift/type')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async createShiftType(
    @Body() createShiftTypeDto: CreateShiftTypeDto,
    @CurrentUser() user: any,
  ) {
    return this.shiftScheduleService.createShiftType(
      createShiftTypeDto,
      user.userId,
    );
  }

  @Post('shift')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async createShift(
    @Body() createShiftDto: CreateShiftDto,
    @CurrentUser() user: any,
  ) {
    return this.shiftScheduleService.createShift(createShiftDto, user.userId);
  }

  @Put('shift/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async updateShift(
    @Param('id') id: string,
    @Body() updateShiftDto: UpdateShiftDto,
    @CurrentUser() user: any,
  ) {
    return this.shiftScheduleService.updateShift(
      id,
      updateShiftDto,
      user.userId,
    );
  }

  @Post('shift/assign')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_ADMIN)
  async assignShiftToEmployee(
    @Body() assignShiftToEmployeeDto: AssignShiftToEmployeeDto,
    @CurrentUser() user: any,
  ) {
    return this.shiftScheduleService.assignShiftToEmployee(
      assignShiftToEmployeeDto,
      user.userId,
    );
  }

  // ===== Scheduling Rules =====
  @Post('schedule')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async createScheduleRule(
    @Body() createScheduleRuleDto: CreateScheduleRuleDto,
    @CurrentUser() user: any,
  ) {
    return this.shiftScheduleService.createScheduleRule(
      createScheduleRuleDto,
      user.userId,
    );
  }

  @Post('schedule/flexible')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async defineFlexibleSchedulingRules(
    @Body() defineFlexibleSchedulingRulesDto: DefineFlexibleSchedulingRulesDto,
    @CurrentUser() user: any,
  ) {
    return this.shiftScheduleService.defineFlexibleSchedulingRules(
      defineFlexibleSchedulingRulesDto,
      user.userId,
    );
  }
}
