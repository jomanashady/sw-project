// src/employee-profile/employee-profile.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { EmployeeProfileService } from './employee-profile.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  UpdateEmployeeSelfServiceDto,
  QueryEmployeeDto,
  AssignSystemRoleDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SystemRole } from './enums/employee-profile.enums';

@Controller('employee-profile')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeProfileController {
  constructor(
    private readonly employeeProfileService: EmployeeProfileService,
  ) {}

  @Post()
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    const employee =
      await this.employeeProfileService.create(createEmployeeDto);
    return {
      message: 'Employee created successfully',
      data: employee,
    };
  }

  @Get()
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
  )
  async findAll(@Query() query: QueryEmployeeDto, @CurrentUser() user: any) {
    const result = await this.employeeProfileService.findAll(
      query,
      user.userId,
    );
    return {
      message: 'Employees retrieved successfully',
      ...result,
    };
  }

  @Get('me')
  async getMyProfile(@CurrentUser() user: any) {
    if (!user || !user.userId) {
      throw new UnauthorizedException('User information not found in token');
    }
    const employee = await this.employeeProfileService.findOne(user.userId);
    return {
      message: 'Profile retrieved successfully',
      data: employee,
    };
  }

  @Patch('me')
  async updateMyProfile(
    @CurrentUser() user: any,
    @Body() updateDto: UpdateEmployeeSelfServiceDto,
  ) {
    const employee = await this.employeeProfileService.updateSelfService(
      user.userId,
      updateDto,
    );
    return {
      message: 'Profile updated successfully',
      data: employee,
    };
  }

  @Get('stats')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER)
  async getStats() {
    const stats = await this.employeeProfileService.getEmployeeStats();
    return {
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('department/:departmentId')
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.DEPARTMENT_HEAD,
  )
  async findByDepartment(@Param('departmentId') departmentId: string) {
    const employees =
      await this.employeeProfileService.findByDepartment(departmentId);
    return {
      message: 'Department employees retrieved successfully',
      data: employees,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const employee = await this.employeeProfileService.findOne(id);
    return {
      message: 'Employee retrieved successfully',
      data: employee,
    };
  }

  @Patch(':id')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    const employee = await this.employeeProfileService.update(
      id,
      updateEmployeeDto,
    );
    return {
      message: 'Employee updated successfully',
      data: employee,
    };
  }

  @Delete(':id')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.employeeProfileService.remove(id);
    return {
      message: 'Employee deactivated successfully',
    };
  }

  @Post('assign-roles')
  @Roles(SystemRole.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.OK)
  async assignRoles(@Body() assignRoleDto: AssignSystemRoleDto) {
    const systemRole = await this.employeeProfileService.assignSystemRoles(
      assignRoleDto.employeeProfileId,
      assignRoleDto.roles,
      assignRoleDto.permissions,
    );
    return {
      message: 'Roles assigned successfully',
      data: systemRole,
    };
  }

  @Get(':id/roles')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER)
  async getEmployeeRoles(@Param('id') id: string) {
    const roles = await this.employeeProfileService.getSystemRoles(id);
    return {
      message: 'Employee roles retrieved successfully',
      data: roles,
    };
  }
}
