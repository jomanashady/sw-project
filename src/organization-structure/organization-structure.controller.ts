import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { OrganizationStructureService } from './organization-structure.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentResponseDto,
} from './dto/department.dto';
import {
  CreatePositionDto,
  UpdatePositionDto,
  PositionResponseDto,
} from './dto/position.dto';
import {
  CreatePositionAssignmentDto,
  UpdatePositionAssignmentDto,
  PositionAssignmentResponseDto,
} from './dto/position-assignment.dto';
import {
  CreateStructureChangeRequestDto,
  UpdateStructureChangeRequestDto,
  SubmitChangeRequestDto,
  StructureChangeRequestResponseDto,
} from './dto/structure-change-request.dto';
import {
  CreateStructureApprovalDto,
  UpdateApprovalDecisionDto,
  StructureApprovalResponseDto,
} from './dto/structure-approval.dto';
import { StructureRequestStatus } from './enums/organization-structure.enums';

@ApiTags('Organization Structure')
@Controller('organization-structure')
export class OrganizationStructureController {
  constructor(
    private readonly structureService: OrganizationStructureService,
  ) {}

  // ============ DEPARTMENT ENDPOINTS ============

  @Post('departments')
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Department created successfully',
    type: DepartmentResponseDto,
  })
  async createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.structureService.createDepartment(dto);
  }

  @Get('departments')
  @ApiOperation({ summary: 'Get all departments' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of departments',
    type: [DepartmentResponseDto],
  })
  async getAllDepartments(@Query('isActive') isActive?: boolean) {
    return this.structureService.getAllDepartments(
      isActive !== undefined ? isActive === true : undefined,
    );
  }

  @Get('departments/:id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department details',
    type: DepartmentResponseDto,
  })
  async getDepartmentById(@Param('id') id: string) {
    return this.structureService.getDepartmentById(id);
  }

  @Put('departments/:id')
  @ApiOperation({ summary: 'Update department' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department updated successfully',
    type: DepartmentResponseDto,
  })
  async updateDepartment(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.structureService.updateDepartment(id, dto);
  }

  @Delete('departments/:id')
  @ApiOperation({ summary: 'Deactivate department' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department deactivated successfully',
    type: DepartmentResponseDto,
  })
  async deactivateDepartment(@Param('id') id: string) {
    return this.structureService.deactivateDepartment(id);
  }

  @Get('departments/hierarchy/all')
  @ApiOperation({ summary: 'Get complete department hierarchy' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department hierarchy with positions',
  })
  async getDepartmentHierarchy() {
    return this.structureService.getDepartmentHierarchy();
  }

  // ============ POSITION ENDPOINTS ============

  @Post('positions')
  @ApiOperation({ summary: 'Create a new position' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Position created successfully',
    type: PositionResponseDto,
  })
  async createPosition(@Body() dto: CreatePositionDto) {
    return this.structureService.createPosition(dto);
  }

  @Get('positions')
  @ApiOperation({ summary: 'Get all positions' })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of positions',
    type: [PositionResponseDto],
  })
  async getAllPositions(
    @Query('departmentId') departmentId?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.structureService.getAllPositions(
      departmentId,
      isActive !== undefined ? isActive === true : undefined,
    );
  }

  @Get('positions/:id')
  @ApiOperation({ summary: 'Get position by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Position details',
    type: PositionResponseDto,
  })
  async getPositionById(@Param('id') id: string) {
    return this.structureService.getPositionById(id);
  }

  @Put('positions/:id')
  @ApiOperation({ summary: 'Update position' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Position updated successfully',
    type: PositionResponseDto,
  })
  async updatePosition(
    @Param('id') id: string,
    @Body() dto: UpdatePositionDto,
  ) {
    return this.structureService.updatePosition(id, dto);
  }

  @Delete('positions/:id')
  @ApiOperation({ summary: 'Deactivate position' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Position deactivated successfully',
    type: PositionResponseDto,
  })
  async deactivatePosition(@Param('id') id: string) {
    return this.structureService.deactivatePosition(id);
  }

  @Get('positions/:id/hierarchy')
  @ApiOperation({ summary: 'Get position hierarchy (subordinates)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Position hierarchy tree',
  })
  async getPositionHierarchy(@Param('id') id: string) {
    return this.structureService.getPositionHierarchy(id);
  }

  // ============ POSITION ASSIGNMENT ENDPOINTS ============

  @Post('assignments')
  @ApiOperation({ summary: 'Create a new position assignment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Assignment created successfully',
    type: PositionAssignmentResponseDto,
  })
  async createPositionAssignment(@Body() dto: CreatePositionAssignmentDto) {
    return this.structureService.createPositionAssignment(dto);
  }

  @Get('assignments/employee/:employeeProfileId')
  @ApiOperation({ summary: 'Get all assignments for an employee' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of employee assignments',
    type: [PositionAssignmentResponseDto],
  })
  async getEmployeeAssignments(
    @Param('employeeProfileId') employeeProfileId: string,
    @Query('activeOnly') activeOnly?: boolean,
  ) {
    return this.structureService.getEmployeeAssignments(
      employeeProfileId,
      activeOnly === true,
    );
  }

  @Get('assignments/position/:positionId')
  @ApiOperation({ summary: 'Get all assignments for a position' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of position assignments',
    type: [PositionAssignmentResponseDto],
  })
  async getPositionAssignments(@Param('positionId') positionId: string) {
    return this.structureService.getPositionAssignments(positionId);
  }

  @Patch('assignments/:id')
  @ApiOperation({ summary: 'Update position assignment' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assignment updated successfully',
    type: PositionAssignmentResponseDto,
  })
  async updatePositionAssignment(
    @Param('id') id: string,
    @Body() dto: UpdatePositionAssignmentDto,
  ) {
    return this.structureService.updatePositionAssignment(id, dto);
  }

  @Patch('assignments/:id/end')
  @ApiOperation({ summary: 'End position assignment' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assignment ended successfully',
    type: PositionAssignmentResponseDto,
  })
  async endPositionAssignment(
    @Param('id') id: string,
    @Body('endDate') endDate: string,
  ) {
    return this.structureService.endPositionAssignment(id, new Date(endDate));
  }

  // ============ CHANGE REQUEST ENDPOINTS ============

  @Post('change-requests')
  @ApiOperation({ summary: 'Create a new structure change request' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Change request created successfully',
    type: StructureChangeRequestResponseDto,
  })
  async createChangeRequest(@Body() dto: CreateStructureChangeRequestDto) {
    return this.structureService.createChangeRequest(dto);
  }

  @Get('change-requests')
  @ApiOperation({ summary: 'Get all change requests' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: StructureRequestStatus,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of change requests',
    type: [StructureChangeRequestResponseDto],
  })
  async getAllChangeRequests(@Query('status') status?: StructureRequestStatus) {
    return this.structureService.getAllChangeRequests(status);
  }

  @Get('change-requests/:id')
  @ApiOperation({ summary: 'Get change request by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Change request details',
    type: StructureChangeRequestResponseDto,
  })
  async getChangeRequestById(@Param('id') id: string) {
    return this.structureService.getChangeRequestById(id);
  }

  @Put('change-requests/:id')
  @ApiOperation({ summary: 'Update change request (draft only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Change request updated successfully',
    type: StructureChangeRequestResponseDto,
  })
  async updateChangeRequest(
    @Param('id') id: string,
    @Body() dto: UpdateStructureChangeRequestDto,
  ) {
    return this.structureService.updateChangeRequest(id, dto);
  }

  @Post('change-requests/:id/submit')
  @ApiOperation({ summary: 'Submit change request for approval' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Change request submitted successfully',
    type: StructureChangeRequestResponseDto,
  })
  async submitChangeRequest(
    @Param('id') id: string,
    @Body() dto: SubmitChangeRequestDto,
  ) {
    return this.structureService.submitChangeRequest(id, dto);
  }

  @Post('change-requests/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel change request' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Change request cancelled successfully',
    type: StructureChangeRequestResponseDto,
  })
  async cancelChangeRequest(@Param('id') id: string) {
    return this.structureService.cancelChangeRequest(id);
  }

  // ============ APPROVAL ENDPOINTS ============

  @Post('approvals')
  @ApiOperation({ summary: 'Create approval for change request' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Approval created successfully',
    type: StructureApprovalResponseDto,
  })
  async createApproval(@Body() dto: CreateStructureApprovalDto) {
    return this.structureService.createApproval(dto);
  }

  @Patch('approvals/:id/decision')
  @ApiOperation({ summary: 'Update approval decision' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Approval decision updated successfully',
    type: StructureApprovalResponseDto,
  })
  async updateApprovalDecision(
    @Param('id') id: string,
    @Body() dto: UpdateApprovalDecisionDto,
  ) {
    return this.structureService.updateApprovalDecision(id, dto);
  }

  @Get('approvals/change-request/:changeRequestId')
  @ApiOperation({ summary: 'Get all approvals for a change request' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of approvals',
    type: [StructureApprovalResponseDto],
  })
  async getRequestApprovals(@Param('changeRequestId') changeRequestId: string) {
    return this.structureService.getRequestApprovals(changeRequestId);
  }

  // ============ CHANGE LOG ENDPOINTS ============

  @Get('change-logs')
  @ApiOperation({ summary: 'Get structure change logs' })
  @ApiQuery({ name: 'entityType', required: false, type: String })
  @ApiQuery({ name: 'entityId', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of change logs',
  })
  async getChangeLogs(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.structureService.getChangeLogs(entityType, entityId);
  }
}
