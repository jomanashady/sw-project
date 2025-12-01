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
  CreateCandidateDto,
  UpdateCandidateDto,
  CreateProfileChangeRequestDto,
  ProcessProfileChangeRequestDto,
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

  // ==================== EMPLOYEE ROUTES ====================

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

  // ==================== SYSTEM ROLE ROUTES ====================

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

  // ==================== CANDIDATE ROUTES ====================

  @Post('candidate')
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.RECRUITER,
  )
  @HttpCode(HttpStatus.CREATED)
  async createCandidate(@Body() createCandidateDto: CreateCandidateDto) {
    const candidate =
      await this.employeeProfileService.createCandidate(createCandidateDto);
    return {
      message: 'Candidate created successfully',
      data: candidate,
    };
  }

  @Get('candidate')
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.RECRUITER,
  )
  async findAllCandidates() {
    const candidates = await this.employeeProfileService.findAllCandidates();
    return {
      message: 'Candidates retrieved successfully',
      data: candidates,
    };
  }

  @Get('candidate/:id')
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.RECRUITER,
  )
  async findCandidateById(@Param('id') id: string) {
    const candidate = await this.employeeProfileService.findCandidateById(id);
    return {
      message: 'Candidate retrieved successfully',
      data: candidate,
    };
  }

  @Patch('candidate/:id')
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.RECRUITER,
  )
  async updateCandidate(
    @Param('id') id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
  ) {
    const candidate = await this.employeeProfileService.updateCandidate(
      id,
      updateCandidateDto,
    );
    return {
      message: 'Candidate updated successfully',
      data: candidate,
    };
  }

  @Delete('candidate/:id')
  @Roles(SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCandidate(@Param('id') id: string) {
    await this.employeeProfileService.removeCandidate(id);
    return {
      message: 'Candidate removed successfully',
    };
  }

  @Post('candidate/:id/convert-to-employee')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async convertCandidateToEmployee(
    @Param('id') candidateId: string,
    @Body()
    employeeData: {
      workEmail: string;
      dateOfHire: Date;
      contractType: string;
      workType: string;
      password?: string;
      primaryDepartmentId?: string;
      primaryPositionId?: string;
    },
  ) {
    const employee =
      await this.employeeProfileService.convertCandidateToEmployee(
        candidateId,
        employeeData,
      );
    return {
      message: 'Candidate converted to employee successfully',
      data: employee,
    };
  }

  @Get('candidate/status/:status')
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.RECRUITER,
  )
  async findCandidatesByStatus(@Param('status') status: string) {
    const candidates =
      await this.employeeProfileService.findCandidatesByStatus(status);
    return {
      message: 'Candidates retrieved successfully',
      data: candidates,
    };
  }

  // ==================== PROFILE CHANGE REQUEST ROUTES ====================

  @Post('change-request')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  @HttpCode(HttpStatus.CREATED)
  async createProfileChangeRequest(
    @CurrentUser() user: any,
    @Body() createRequestDto: CreateProfileChangeRequestDto,
  ) {
    const changeRequest =
      await this.employeeProfileService.createProfileChangeRequest(
        user.userId,
        createRequestDto,
      );
    return {
      message: 'Profile change request submitted successfully',
      data: changeRequest,
    };
  }

  @Get('change-request/my-requests')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  async getMyChangeRequests(@CurrentUser() user: any) {
    const requests =
      await this.employeeProfileService.getProfileChangeRequestsByEmployee(
        user.userId,
      );
    return {
      message: 'Your change requests retrieved successfully',
      data: requests,
    };
  }

  @Get('change-request')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.SYSTEM_ADMIN)
  async getAllChangeRequests(@Query('status') status?: string) {
    const requests =
      await this.employeeProfileService.getAllProfileChangeRequests(status);
    return {
      message: 'Change requests retrieved successfully',
      data: requests,
    };
  }

  @Get('change-request/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.SYSTEM_ADMIN)
  async getChangeRequestById(@Param('id') id: string) {
    const request =
      await this.employeeProfileService.getProfileChangeRequestById(id);
    return {
      message: 'Change request retrieved successfully',
      data: request,
    };
  }

  @Patch('change-request/:id/process')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async processChangeRequest(
    @Param('id') id: string,
    @Body() processDto: ProcessProfileChangeRequestDto,
  ) {
    const updatedRequest =
      await this.employeeProfileService.processProfileChangeRequest(
        id,
        processDto,
      );
    return {
      message: 'Change request processed successfully',
      data: updatedRequest,
    };
  }

  // ==================== QUALIFICATION ROUTES ====================

  @Post('qualification')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  async addQualification(
    @CurrentUser() user: any,
    @Body()
    qualificationData: {
      establishmentName: string;
      graduationType: string;
    },
  ) {
    const qualification = await this.employeeProfileService.addQualification(
      user.userId,
      qualificationData,
    );
    return {
      message: 'Qualification added successfully',
      data: qualification,
    };
  }

  @Get('qualification/my-qualifications')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  async getMyQualifications(@CurrentUser() user: any) {
    const qualifications =
      await this.employeeProfileService.getQualificationsByEmployee(
        user.userId,
      );
    return {
      message: 'Your qualifications retrieved successfully',
      data: qualifications,
    };
  }

  @Get('employee/:employeeId/qualifications')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.SYSTEM_ADMIN)
  async getEmployeeQualifications(@Param('employeeId') employeeId: string) {
    const qualifications =
      await this.employeeProfileService.getQualificationsByEmployee(employeeId);
    return {
      message: 'Employee qualifications retrieved successfully',
      data: qualifications,
    };
  }

  @Delete('qualification/:id')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeQualification(
    @Param('id') qualificationId: string,
    @CurrentUser() user: any,
  ) {
    await this.employeeProfileService.removeQualification(
      qualificationId,
      user.userId,
    );
    return {
      message: 'Qualification removed successfully',
    };
  }

  // ==================== SEARCH ROUTES ====================

  @Get('search/by-number/:employeeNumber')
  @Roles(
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
  )
  async findByEmployeeNumber(@Param('employeeNumber') employeeNumber: string) {
    const employee =
      await this.employeeProfileService.findByEmployeeNumber(employeeNumber);
    return {
      message: 'Employee retrieved successfully',
      data: employee,
    };
  }

  @Get('search/by-national-id/:nationalId')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async findByNationalId(@Param('nationalId') nationalId: string) {
    const employee =
      await this.employeeProfileService.findByNationalId(nationalId);
    return {
      message: 'Employee retrieved successfully',
      data: employee,
    };
  }
}
