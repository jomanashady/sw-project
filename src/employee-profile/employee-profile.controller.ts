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
<<<<<<< HEAD
  UseGuards,
  Request,
=======
>>>>>>> karma
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
<<<<<<< HEAD
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SystemRole } from './enums/employee-profile.enums';

@Controller('employee-profile')
@UseGuards(JwtAuthGuard, RolesGuard)
=======
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { SystemRole } from './enums/employee-profile.enums';

@Controller('employee-profile')
>>>>>>> karma
export class EmployeeProfileController {
  constructor(
    private readonly employeeProfileService: EmployeeProfileService,
  ) {}

  @Post()
<<<<<<< HEAD
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
=======
>>>>>>> karma
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
<<<<<<< HEAD
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
=======
  async findAll(@Query() query: QueryEmployeeDto) {
    const result = await this.employeeProfileService.findAll(
      query,
      undefined,
>>>>>>> karma
    );
    return {
      message: 'Employees retrieved successfully',
      ...result,
    };
  }

  @Get('me')
<<<<<<< HEAD
  async getMyProfile(@CurrentUser() user: any) {
    if (!user || !user.userId) {
      throw new UnauthorizedException('User information not found in token');
    }
    const employee = await this.employeeProfileService.findOne(user.userId);
    return {
      message: 'Profile retrieved successfully',
      data: employee,
    };
=======
  async getMyProfile() {
    throw new UnauthorizedException('Authentication not configured');
>>>>>>> karma
  }

  @Patch('me')
  async updateMyProfile(
<<<<<<< HEAD
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
=======
    @Body() updateDto: UpdateEmployeeSelfServiceDto,
  ) {
    throw new UnauthorizedException('Authentication not configured');
  }

  @Get('stats')
>>>>>>> karma
  async getStats() {
    const stats = await this.employeeProfileService.getEmployeeStats();
    return {
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('department/:departmentId')
<<<<<<< HEAD
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.DEPARTMENT_HEAD,
  )
=======
>>>>>>> karma
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
<<<<<<< HEAD
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
=======
>>>>>>> karma
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
<<<<<<< HEAD
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER)
=======
>>>>>>> karma
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.employeeProfileService.remove(id);
    return {
      message: 'Employee deactivated successfully',
    };
  }

  @Post('assign-roles')
<<<<<<< HEAD
  @Roles(SystemRole.SYSTEM_ADMIN)
=======
>>>>>>> karma
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
<<<<<<< HEAD
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER)
=======
>>>>>>> karma
  async getEmployeeRoles(@Param('id') id: string) {
    const roles = await this.employeeProfileService.getSystemRoles(id);
    return {
      message: 'Employee roles retrieved successfully',
      data: roles,
    };
  }
<<<<<<< HEAD
=======

  // ============= CANDIDATE ENDPOINTS =============

  @Post('candidates')
  @HttpCode(HttpStatus.CREATED)
  async createCandidate(@Body() createCandidateDto: CreateCandidateDto) {
    const candidate = await this.employeeProfileService.createCandidate(createCandidateDto);
    return {
      message: 'Candidate created successfully',
      data: candidate,
    };
  }

  @Get('candidates')
  async getAllCandidates() {
    const candidates = await this.employeeProfileService.findAllCandidates();
    return {
      message: 'Candidates retrieved successfully',
      data: candidates,
    };
  }

  @Get('candidates/:id')
  async getCandidateById(@Param('id') id: string) {
    const candidate = await this.employeeProfileService.findCandidateById(id);
    return {
      message: 'Candidate retrieved successfully',
      data: candidate,
    };
  }
>>>>>>> karma
}
