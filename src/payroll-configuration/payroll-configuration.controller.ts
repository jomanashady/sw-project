import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { PayrollConfigurationService } from './payroll-configuration.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigStatus } from './enums/payroll-configuration-enums';
import { CreatePayGradeDto, UpdatePayGradeDto } from './dto/pay-grade.dto';
import { ApprovalDto, RejectionDto } from './dto/approval.dto';
import { FilterDto } from './dto/filter.dto';
import { CreateAllowanceDto, UpdateAllowanceDto } from './dto/allowance.dto';
import { CreatePayTypeDto, UpdatePayTypeDto } from './dto/pay-type.dto';
import { CreateTaxRuleDto, UpdateTaxRuleDto } from './dto/tax-rule.dto';
import {
  CreateInsuranceBracketDto,
  UpdateInsuranceBracketDto,
} from './dto/insurance-bracket.dto';
import {
  CreateSigningBonusDto,
  UpdateSigningBonusDto,
} from './dto/signing-bonus.dto';
import {
  CreateTerminationBenefitDto,
  UpdateTerminationBenefitDto,
} from './dto/termination-benefit.dto';
import {
  CreatePayrollPolicyDto,
  UpdatePayrollPolicyDto,
} from './dto/payroll-policy.dto';
import {
  CreateCompanySettingsDto,
  UpdateCompanySettingsDto,
} from './dto/company-settings.dto';
import { ObjectIdPipe } from './common/pipes/object-id.pipe';

@ApiTags('payroll-configuration')
@Controller('payroll-configuration')
export class PayrollConfigurationController {
  constructor(
    private readonly payrollConfigService: PayrollConfigurationService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  private getUserId(): string {
    return process.env.DEFAULT_TEST_USER_ID || '665f1c2b5b88c3d9b3c3b1ab';
  }

  // ==================== PAY GRADES ====================
  @Get('pay-grades')
  @ApiOperation({ summary: 'Get all pay grades with pagination and filtering' })
  @ApiQuery({ name: 'status', required: false, enum: ConfigStatus })
  @ApiQuery({ name: 'createdBy', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of pay grades',
  })
  async getPayGrades(@Query() filterDto: FilterDto) {
    return this.payrollConfigService.findAllPayGrades(filterDto);
  }

  @Get('pay-grades/:id')
  @ApiOperation({ summary: 'Get pay grade by ID' })
  @ApiParam({ name: 'id', description: 'Pay grade ID' })
  @ApiResponse({ status: 200, description: 'Returns pay grade details' })
  @ApiResponse({ status: 404, description: 'Pay grade not found' })
  async getPayGrade(@Param('id', ObjectIdPipe) id: string) {
    return this.payrollConfigService.findOnePayGrade(id);
  }

  @Post('pay-grades')
  @ApiOperation({ summary: 'Create a new pay grade' })
  @ApiBody({ type: CreatePayGradeDto })
  @ApiResponse({ status: 201, description: 'Pay grade created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createPayGrade(@Body() createDto: CreatePayGradeDto) {
    const userId = this.getUserId();
    return this.payrollConfigService.createPayGrade(createDto, userId);
  }

  @Put('pay-grades/:id')
  @ApiOperation({ summary: 'Update a pay grade (DRAFT only)' })
  @ApiParam({ name: 'id', description: 'Pay grade ID' })
  @ApiBody({ type: UpdatePayGradeDto })
  @ApiResponse({ status: 200, description: 'Pay grade updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot update non-DRAFT pay grade',
  })
  @ApiResponse({ status: 404, description: 'Pay grade not found' })
  async updatePayGrade(
    @Param('id', ObjectIdPipe) id: string,
    @Body() updateDto: UpdatePayGradeDto,
  ) {
    const userId = this.getUserId();
    return this.payrollConfigService.updatePayGrade(id, updateDto, userId);
  }

  @Delete('pay-grades/:id')
  @ApiOperation({ summary: 'Delete a pay grade (DRAFT only)' })
  @ApiParam({ name: 'id', description: 'Pay grade ID' })
  @ApiResponse({ status: 200, description: 'Pay grade deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete non-DRAFT pay grade',
  })
  @ApiResponse({ status: 404, description: 'Pay grade not found' })
  async deletePayGrade(@Param('id', ObjectIdPipe) id: string) {
    return this.payrollConfigService.deletePayGrade(id);
  }

  @Post('pay-grades/:id/approve')
  @ApiOperation({ summary: 'Approve a pay grade' })
  @ApiParam({ name: 'id', description: 'Pay grade ID' })
  @ApiBody({ type: ApprovalDto })
  @ApiResponse({ status: 200, description: 'Pay grade approved successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot approve non-DRAFT pay grade',
  })
  @ApiResponse({ status: 404, description: 'Pay grade not found' })
  async approvePayGrade(
    @Param('id', ObjectIdPipe) id: string,
    @Body() approvalDto: ApprovalDto,
  ) {
    return this.payrollConfigService.approvePayGrade(id, approvalDto);
  }

  @Post('pay-grades/:id/reject')
  @ApiOperation({ summary: 'Reject a pay grade' })
  @ApiParam({ name: 'id', description: 'Pay grade ID' })
  @ApiBody({ type: RejectionDto })
  @ApiResponse({ status: 200, description: 'Pay grade rejected successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot reject non-DRAFT pay grade',
  })
  @ApiResponse({ status: 404, description: 'Pay grade not found' })
  async rejectPayGrade(
    @Param('id', ObjectIdPipe) id: string,
    @Body() rejectionDto: RejectionDto,
  ) {
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
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
  })
  @ApiResponse({ status: 200, description: 'Returns pending approval items' })
  async getPendingApprovals(@Query('userId') userId?: string) {
    return this.payrollConfigService.getPendingApprovals(userId);
  }

  @Get('debug/db')
  @ApiOperation({ summary: 'Debug database connection info' })
  async getDbDebug() {
    const db = this.connection?.db;
    if (!db) {
      throw new BadRequestException('Database connection not initialized');
    }
    const collections = await db.listCollections().toArray();
    return { database: db.databaseName, collections: collections.map((c) => c.name) };
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
  async createCompanySettings(@Body() createDto: CreateCompanySettingsDto) {
    if (!createDto) {
      throw new BadRequestException('Request body is required');
    }
    return this.payrollConfigService.createCompanySettings(createDto);
  }

  @Put('company-settings')
  @ApiOperation({ summary: 'Update company-wide settings' })
  @ApiResponse({ status: 200, description: 'Company settings updated' })
  @ApiResponse({ status: 404, description: 'Company settings not found' })
  async updateCompanySettings(@Body() updateDto: UpdateCompanySettingsDto) {
    return this.payrollConfigService.updateCompanySettings(updateDto);
  }

  // ==================== ALLOWANCES ====================
  @Get('allowances')
  @ApiOperation({ summary: 'Get all allowances with pagination and filtering' })
  @ApiQuery({ name: 'status', required: false, enum: ConfigStatus })
  @ApiQuery({ name: 'createdBy', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllowances(@Query() filterDto: FilterDto) {
    return this.payrollConfigService.findAllAllowances(filterDto);
  }

  @Get('allowances/:id')
  @ApiOperation({ summary: 'Get allowance by ID' })
  @ApiParam({ name: 'id', description: 'Allowance ID' })
  async getAllowance(@Param('id', ObjectIdPipe) id: string) {
    return this.payrollConfigService.findOneAllowance(id);
  }

  @Post('allowances')
  @ApiOperation({ summary: 'Create allowance (DRAFT)' })
  async createAllowance(@Body() createDto: CreateAllowanceDto) {
    const userId = this.getUserId();
    return this.payrollConfigService.createAllowance(createDto, userId);
  }

  @Put('allowances/:id')
  @ApiOperation({ summary: 'Update allowance (DRAFT only)' })
  @ApiParam({ name: 'id', description: 'Allowance ID' })
  async updateAllowance(
    @Param('id', ObjectIdPipe) id: string,
    @Body() updateDto: UpdateAllowanceDto,
  ) {
    const userId = this.getUserId();
    return this.payrollConfigService.updateAllowance(id, updateDto, userId);
  }

  @Delete('allowances/:id')
  @ApiOperation({ summary: 'Delete allowance (DRAFT only)' })
  @ApiParam({ name: 'id', description: 'Allowance ID' })
  async deleteAllowance(@Param('id', ObjectIdPipe) id: string) {
    return this.payrollConfigService.deleteAllowance(id);
  }

  @Post('allowances/:id/approve')
  @ApiOperation({ summary: 'Approve allowance' })
  async approveAllowance(
    @Param('id', ObjectIdPipe) id: string,
    @Body() approvalDto: ApprovalDto,
  ) {
    return this.payrollConfigService.approveAllowance(id, approvalDto);
  }

  @Post('allowances/:id/reject')
  @ApiOperation({ summary: 'Reject allowance' })
  async rejectAllowance(
    @Param('id', ObjectIdPipe) id: string,
    @Body() rejectionDto: RejectionDto,
  ) {
    return this.payrollConfigService.rejectAllowance(id, rejectionDto);
  }

  // ==================== PAY TYPES ====================
  @Get('pay-types')
  @ApiOperation({ summary: 'Get all pay types with pagination and filtering' })
  async getPayTypes(@Query() filterDto: FilterDto) {
    return this.payrollConfigService.findAllPayTypes(filterDto);
  }

  @Get('pay-types/:id')
  @ApiOperation({ summary: 'Get pay type by ID' })
  async getPayType(@Param('id', ObjectIdPipe) id: string) {
    return this.payrollConfigService.findOnePayType(id);
  }

  @Post('pay-types')
  @ApiOperation({ summary: 'Create pay type (DRAFT)' })
  async createPayType(@Body() createDto: CreatePayTypeDto) {
    const userId = this.getUserId();
    return this.payrollConfigService.createPayType(createDto, userId);
  }

  @Put('pay-types/:id')
  @ApiOperation({ summary: 'Update pay type (DRAFT only)' })
  async updatePayType(
    @Param('id', ObjectIdPipe) id: string,
    @Body() updateDto: UpdatePayTypeDto,
  ) {
    const userId = this.getUserId();
    return this.payrollConfigService.updatePayType(id, updateDto, userId);
  }

  @Delete('pay-types/:id')
  @ApiOperation({ summary: 'Delete pay type (DRAFT only)' })
  async deletePayType(@Param('id', ObjectIdPipe) id: string) {
    return this.payrollConfigService.deletePayType(id);
  }

  @Post('pay-types/:id/approve')
  @ApiOperation({ summary: 'Approve pay type' })
  async approvePayType(
    @Param('id', ObjectIdPipe) id: string,
    @Body() approvalDto: ApprovalDto,
  ) {
    return this.payrollConfigService.approvePayType(id, approvalDto);
  }

  @Post('pay-types/:id/reject')
  @ApiOperation({ summary: 'Reject pay type' })
  async rejectPayType(
    @Param('id', ObjectIdPipe) id: string,
    @Body() rejectionDto: RejectionDto,
  ) {
    return this.payrollConfigService.rejectPayType(id, rejectionDto);
  }

  // ==================== TAX RULES ====================
  @Get('tax-rules')
  @ApiOperation({ summary: 'Get all tax rules with pagination and filtering' })
  async getTaxRules(@Query() filterDto: FilterDto) {
    return this.payrollConfigService.findAllTaxRules(filterDto);
  }

  @Get('tax-rules/:id')
  @ApiOperation({ summary: 'Get tax rule by ID' })
  async getTaxRule(@Param('id', ObjectIdPipe) id: string) {
    return this.payrollConfigService.findOneTaxRule(id);
  }

  @Post('tax-rules')
  @ApiOperation({ summary: 'Create tax rule (DRAFT)' })
  async createTaxRule(@Body() createDto: CreateTaxRuleDto) {
    const userId = this.getUserId();
    return this.payrollConfigService.createTaxRule(createDto, userId);
  }

  @Put('tax-rules/:id')
  @ApiOperation({ summary: 'Update tax rule (DRAFT only)' })
  async updateTaxRule(
    @Param('id', ObjectIdPipe) id: string,
    @Body() updateDto: UpdateTaxRuleDto,
  ) {
    const userId = this.getUserId();
    return this.payrollConfigService.updateTaxRule(id, updateDto, userId);
  }

  @Delete('tax-rules/:id')
  @ApiOperation({ summary: 'Delete tax rule (DRAFT only)' })
  async deleteTaxRule(@Param('id', ObjectIdPipe) id: string) {
    return this.payrollConfigService.deleteTaxRule(id);
  }

  @Post('tax-rules/:id/approve')
  @ApiOperation({ summary: 'Approve tax rule' })
  async approveTaxRule(
    @Param('id', ObjectIdPipe) id: string,
    @Body() approvalDto: ApprovalDto,
  ) {
    return this.payrollConfigService.approveTaxRule(id, approvalDto);
  }

  @Post('tax-rules/:id/reject')
  @ApiOperation({ summary: 'Reject tax rule' })
  async rejectTaxRule(
    @Param('id', ObjectIdPipe) id: string,
    @Body() rejectionDto: RejectionDto,
  ) {
    return this.payrollConfigService.rejectTaxRule(id, rejectionDto);
  }

  // ==================== INSURANCE BRACKETS ====================
  @Get('insurance-brackets')
  @ApiOperation({
    summary: 'Get all insurance brackets with pagination and filtering',
  })
  async getInsuranceBrackets(@Query() filterDto: FilterDto) {
    return this.payrollConfigService.findAllInsuranceBrackets(filterDto);
  }

  @Get('insurance-brackets/:id')
  @ApiOperation({ summary: 'Get insurance bracket by ID' })
  async getInsuranceBracket(@Param('id', ObjectIdPipe) id: string) {
    return this.payrollConfigService.findOneInsuranceBracket(id);
  }

  @Post('insurance-brackets')
  @ApiOperation({ summary: 'Create insurance bracket (DRAFT)' })
  async createInsuranceBracket(@Body() createDto: CreateInsuranceBracketDto) {
    const userId = this.getUserId();
    return this.payrollConfigService.createInsuranceBracket(createDto, userId);
  }

  @Put('insurance-brackets/:id')
  @ApiOperation({ summary: 'Update insurance bracket (DRAFT only)' })
  async updateInsuranceBracket(
    @Param('id', ObjectIdPipe) id: string,
    @Body() updateDto: UpdateInsuranceBracketDto,
  ) {
    const userId = this.getUserId();
    return this.payrollConfigService.updateInsuranceBracket(
      id,
      updateDto,
      userId,
    );
  }

  @Delete('insurance-brackets/:id')
  @ApiOperation({ summary: 'Delete insurance bracket (DRAFT only)' })
  async deleteInsuranceBracket(@Param('id', ObjectIdPipe) id: string) {
    return this.payrollConfigService.deleteInsuranceBracket(id);
  }

  @Post('insurance-brackets/:id/approve')
  @ApiOperation({ summary: 'Approve insurance bracket' })
  async approveInsuranceBracket(
    @Param('id', ObjectIdPipe) id: string,
    @Body() approvalDto: ApprovalDto,
  ) {
    return this.payrollConfigService.approveInsuranceBracket(id, approvalDto);
  }

  @Post('insurance-brackets/:id/reject')
  @ApiOperation({ summary: 'Reject insurance bracket' })
  async rejectInsuranceBracket(
    @Param('id', ObjectIdPipe) id: string,
    @Body() rejectionDto: RejectionDto,
  ) {
    return this.payrollConfigService.rejectInsuranceBracket(id, rejectionDto);
  }

  // ==================== SIGNING BONUSES ====================
  @Get('signing-bonuses')
  @ApiOperation({
    summary: 'Get all signing bonuses with pagination and filtering',
  })
  async getSigningBonuses(@Query() filterDto: FilterDto) {
    return this.payrollConfigService.findAllSigningBonuses(filterDto);
  }

  @Get('signing-bonuses/:id')
  @ApiOperation({ summary: 'Get signing bonus by ID' })
  async getSigningBonus(@Param('id', ObjectIdPipe) id: string) {
    return this.payrollConfigService.findOneSigningBonus(id);
  }

  @Post('signing-bonuses')
  @ApiOperation({ summary: 'Create signing bonus (DRAFT)' })
  async createSigningBonus(@Body() createDto: CreateSigningBonusDto) {
    const userId = this.getUserId();
    return this.payrollConfigService.createSigningBonus(createDto, userId);
  }

  @Put('signing-bonuses/:id')
  @ApiOperation({ summary: 'Update signing bonus (DRAFT only)' })
  async updateSigningBonus(
    @Param('id', ObjectIdPipe) id: string,
    @Body() updateDto: UpdateSigningBonusDto,
  ) {
    const userId = this.getUserId();
    return this.payrollConfigService.updateSigningBonus(id, updateDto, userId);
  }

  @Delete('signing-bonuses/:id')
  @ApiOperation({ summary: 'Delete signing bonus (DRAFT only)' })
  async deleteSigningBonus(@Param('id', ObjectIdPipe) id: string) {
    return this.payrollConfigService.deleteSigningBonus(id);
  }

  @Post('signing-bonuses/:id/approve')
  @ApiOperation({ summary: 'Approve signing bonus' })
  async approveSigningBonus(
    @Param('id', ObjectIdPipe) id: string,
    @Body() approvalDto: ApprovalDto,
  ) {
    return this.payrollConfigService.approveSigningBonus(id, approvalDto);
  }

  @Post('signing-bonuses/:id/reject')
  @ApiOperation({ summary: 'Reject signing bonus' })
  async rejectSigningBonus(
    @Param('id', ObjectIdPipe) id: string,
    @Body() rejectionDto: RejectionDto,
  ) {
    return this.payrollConfigService.rejectSigningBonus(id, rejectionDto);
  }

  // ==================== TERMINATION BENEFITS ====================
  @Get('termination-benefits')
  @ApiOperation({
    summary: 'Get all termination benefits with pagination and filtering',
  })
  async getTerminationBenefits(@Query() filterDto: FilterDto) {
    return this.payrollConfigService.findAllTerminationBenefits(filterDto);
  }

  @Get('termination-benefits/:id')
  @ApiOperation({ summary: 'Get termination benefit by ID' })
  async getTerminationBenefit(@Param('id', ObjectIdPipe) id: string) {
    return this.payrollConfigService.findOneTerminationBenefit(id);
  }

  @Post('termination-benefits')
  @ApiOperation({ summary: 'Create termination benefit (DRAFT)' })
  async createTerminationBenefit(
    @Body() createDto: CreateTerminationBenefitDto,
  ) {
    const userId = this.getUserId();
    return this.payrollConfigService.createTerminationBenefit(
      createDto,
      userId,
    );
  }

  @Put('termination-benefits/:id')
  @ApiOperation({ summary: 'Update termination benefit (DRAFT only)' })
  async updateTerminationBenefit(
    @Param('id', ObjectIdPipe) id: string,
    @Body() updateDto: UpdateTerminationBenefitDto,
  ) {
    const userId = this.getUserId();
    return this.payrollConfigService.updateTerminationBenefit(
      id,
      updateDto,
      userId,
    );
  }

  @Delete('termination-benefits/:id')
  @ApiOperation({ summary: 'Delete termination benefit (DRAFT only)' })
  async deleteTerminationBenefit(@Param('id', ObjectIdPipe) id: string) {
    return this.payrollConfigService.deleteTerminationBenefit(id);
  }

  @Post('termination-benefits/:id/approve')
  @ApiOperation({ summary: 'Approve termination benefit' })
  async approveTerminationBenefit(
    @Param('id', ObjectIdPipe) id: string,
    @Body() approvalDto: ApprovalDto,
  ) {
    return this.payrollConfigService.approveTerminationBenefit(id, approvalDto);
  }

  @Post('termination-benefits/:id/reject')
  @ApiOperation({ summary: 'Reject termination benefit' })
  async rejectTerminationBenefit(
    @Param('id', ObjectIdPipe) id: string,
    @Body() rejectionDto: RejectionDto,
  ) {
    return this.payrollConfigService.rejectTerminationBenefit(id, rejectionDto);
  }

  // ==================== PAYROLL POLICIES ====================
  @Get('policies')
  @ApiOperation({
    summary: 'Get all payroll policies with pagination and filtering',
  })
  async getPayrollPolicies(@Query() filterDto: FilterDto) {
    return this.payrollConfigService.findAllPayrollPolicies(filterDto);
  }

  @Get('policies/:id')
  @ApiOperation({ summary: 'Get payroll policy by ID' })
  async getPayrollPolicy(@Param('id', ObjectIdPipe) id: string) {
    return this.payrollConfigService.findOnePayrollPolicy(id);
  }

  @Post('policies')
  @ApiOperation({ summary: 'Create payroll policy (DRAFT)' })
  async createPayrollPolicy(@Body() createDto: CreatePayrollPolicyDto) {
    const userId = this.getUserId();
    return this.payrollConfigService.createPayrollPolicy(createDto, userId);
  }

  @Put('policies/:id')
  @ApiOperation({ summary: 'Update payroll policy (DRAFT only)' })
  async updatePayrollPolicy(
    @Param('id', ObjectIdPipe) id: string,
    @Body() updateDto: UpdatePayrollPolicyDto,
  ) {
    const userId = this.getUserId();
    return this.payrollConfigService.updatePayrollPolicy(id, updateDto, userId);
  }

  @Delete('policies/:id')
  @ApiOperation({ summary: 'Delete payroll policy (DRAFT only)' })
  async deletePayrollPolicy(@Param('id', ObjectIdPipe) id: string) {
    return this.payrollConfigService.deletePayrollPolicy(id);
  }

  @Post('policies/:id/approve')
  @ApiOperation({ summary: 'Approve payroll policy' })
  async approvePayrollPolicy(
    @Param('id', ObjectIdPipe) id: string,
    @Body() approvalDto: ApprovalDto,
  ) {
    return this.payrollConfigService.approvePayrollPolicy(id, approvalDto);
  }

  @Post('policies/:id/reject')
  @ApiOperation({ summary: 'Reject payroll policy' })
  async rejectPayrollPolicy(
    @Param('id', ObjectIdPipe) id: string,
    @Body() rejectionDto: RejectionDto,
  ) {
    return this.payrollConfigService.rejectPayrollPolicy(id, rejectionDto);
  }
}
