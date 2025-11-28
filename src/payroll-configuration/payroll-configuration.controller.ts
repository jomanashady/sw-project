import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { PayrollConfigurationService } from './payroll-configuration.service';
import { ConfigStatus } from './enums/payroll-configuration-enums';

// DTO Classes
class CreatePayGradeDto {
  grade: string;
  baseSalary: number;
  grossSalary: number;
}

class UpdatePayGradeDto {
  grade?: string;
  baseSalary?: number;
  grossSalary?: number;
}

class ApprovalDto {
  approvedBy: string;
}

class RejectionDto {
  rejectedBy: string;
}

class FilterDto {
  status?: ConfigStatus;
  createdBy?: string;
  page?: number;
  limit?: number;
}

@ApiTags('payroll-configuration')
@Controller('payroll-configuration')
export class PayrollConfigurationController {
  constructor(
    private readonly payrollConfigService: PayrollConfigurationService
  ) {}

  // ==================== PAY GRADES ====================
  @Get('pay-grades')
  @ApiOperation({ summary: 'Get all pay grades with pagination and filtering' })
  @ApiQuery({ name: 'status', required: false, enum: ConfigStatus })
  @ApiQuery({ name: 'createdBy', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns paginated list of pay grades' })
  async getPayGrades(@Query() filterDto: FilterDto) {
    return this.payrollConfigService.findAllPayGrades(filterDto);
  }

  @Get('pay-grades/:id')
  @ApiOperation({ summary: 'Get pay grade by ID' })
  @ApiParam({ name: 'id', description: 'Pay grade ID' })
  @ApiResponse({ status: 200, description: 'Returns pay grade details' })
  @ApiResponse({ status: 404, description: 'Pay grade not found' })
  async getPayGrade(@Param('id') id: string) {
    return this.payrollConfigService.findOnePayGrade(id);
  }

  @Post('pay-grades')
  @ApiOperation({ summary: 'Create a new pay grade' })
  @ApiBody({ type: CreatePayGradeDto })
  @ApiResponse({ status: 201, description: 'Pay grade created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createPayGrade(@Body() createDto: CreatePayGradeDto) {
    const userId = 'current-user-id';
    return this.payrollConfigService.createPayGrade(createDto, userId);
  }

  @Put('pay-grades/:id')
  @ApiOperation({ summary: 'Update a pay grade (DRAFT only)' })
  @ApiParam({ name: 'id', description: 'Pay grade ID' })
  @ApiBody({ type: UpdatePayGradeDto })
  @ApiResponse({ status: 200, description: 'Pay grade updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update non-DRAFT pay grade' })
  @ApiResponse({ status: 404, description: 'Pay grade not found' })
  async updatePayGrade(@Param('id') id: string, @Body() updateDto: UpdatePayGradeDto) {
    const userId = 'current-user-id';
    return this.payrollConfigService.updatePayGrade(id, updateDto, userId);
  }

  @Delete('pay-grades/:id')
  @ApiOperation({ summary: 'Delete a pay grade (DRAFT only)' })
  @ApiParam({ name: 'id', description: 'Pay grade ID' })
  @ApiResponse({ status: 200, description: 'Pay grade deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete non-DRAFT pay grade' })
  @ApiResponse({ status: 404, description: 'Pay grade not found' })
  async deletePayGrade(@Param('id') id: string) {
    return this.payrollConfigService.deletePayGrade(id);
  }

  @Post('pay-grades/:id/approve')
  @ApiOperation({ summary: 'Approve a pay grade' })
  @ApiParam({ name: 'id', description: 'Pay grade ID' })
  @ApiBody({ type: ApprovalDto })
  @ApiResponse({ status: 200, description: 'Pay grade approved successfully' })
  @ApiResponse({ status: 400, description: 'Cannot approve non-DRAFT pay grade' })
  @ApiResponse({ status: 404, description: 'Pay grade not found' })
  async approvePayGrade(@Param('id') id: string, @Body() approvalDto: ApprovalDto) {
    return this.payrollConfigService.approvePayGrade(id, approvalDto);
  }

  @Post('pay-grades/:id/reject')
  @ApiOperation({ summary: 'Reject a pay grade' })
  @ApiParam({ name: 'id', description: 'Pay grade ID' })
  @ApiBody({ type: RejectionDto })
  @ApiResponse({ status: 200, description: 'Pay grade rejected successfully' })
  @ApiResponse({ status: 400, description: 'Cannot reject non-DRAFT pay grade' })
  @ApiResponse({ status: 404, description: 'Pay grade not found' })
  async rejectPayGrade(@Param('id') id: string, @Body() rejectionDto: RejectionDto) {
    return this.payrollConfigService.rejectPayGrade(id, rejectionDto);
  }

  // ==================== DASHBOARD & UTILITIES ====================
  @Get('stats')
  @ApiOperation({ summary: 'Get configuration statistics dashboard' })
  @ApiResponse({ status: 200, description: 'Returns configuration statistics' })
  async getConfigurationStats() {
    return this.payrollConfigService.getConfigurationStats();
  }

  @Get('pending-approvals')
  @ApiOperation({ summary: 'Get all pending approvals' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiResponse({ status: 200, description: 'Returns pending approval items' })
  async getPendingApprovals(@Query('userId') userId?: string) {
    return this.payrollConfigService.getPendingApprovals(userId);
  }

  // ==================== COMPANY SETTINGS ====================
  @Get('company-settings')
  @ApiOperation({ summary: 'Get company-wide settings' })
  @ApiResponse({ status: 200, description: 'Returns company settings' })
  @ApiResponse({ status: 404, description: 'Company settings not found' })
  async getCompanySettings() {
    return this.payrollConfigService.getCompanySettings();
  }

  @Post('company-settings')
  @ApiOperation({ summary: 'Create company-wide settings' })
  @ApiResponse({ status: 201, description: 'Company settings created' })
  @ApiResponse({ status: 409, description: 'Company settings already exist' })
  async createCompanySettings(@Body() createDto: any) {
    return this.payrollConfigService.createCompanySettings(createDto);
  }

  @Put('company-settings')
  @ApiOperation({ summary: 'Update company-wide settings' })
  @ApiResponse({ status: 200, description: 'Company settings updated' })
  @ApiResponse({ status: 404, description: 'Company settings not found' })
  async updateCompanySettings(@Body() updateDto: any) {
    return this.payrollConfigService.updateCompanySettings(updateDto);
  }
}