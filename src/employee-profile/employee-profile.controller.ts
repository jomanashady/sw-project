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
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { SystemRole } from './enums/employee-profile.enums';

@Controller('employee-profile')
export class EmployeeProfileController {
  constructor(
    private readonly employeeProfileService: EmployeeProfileService,
  ) {}

  @Post()
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
  async findAll(@Query() query: QueryEmployeeDto) {
    const result = await this.employeeProfileService.findAll(
      query,
      undefined,
    );
    return {
      message: 'Employees retrieved successfully',
      ...result,
    };
  }

  @Get('me')
  async getMyProfile() {
    throw new UnauthorizedException('Authentication not configured');
  }

  @Patch('me')
  async updateMyProfile(
    @Body() updateDto: UpdateEmployeeSelfServiceDto,
  ) {
    throw new UnauthorizedException('Authentication not configured');
  }

  @Get('stats')
  async getStats() {
    const stats = await this.employeeProfileService.getEmployeeStats();
    return {
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('department/:departmentId')
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.employeeProfileService.remove(id);
    return {
      message: 'Employee deactivated successfully',
    };
  }

  @Post('assign-roles')
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
  async getEmployeeRoles(@Param('id') id: string) {
    const roles = await this.employeeProfileService.getSystemRoles(id);
    return {
      message: 'Employee roles retrieved successfully',
      data: roles,
    };
  }

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
}
