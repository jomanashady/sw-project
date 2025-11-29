import { Controller, Post, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { TimeManagementService } from '../Services/TimeManagementService';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SelfAccessGuard } from '../auth/guards/self-access.guard';
import { Roles } from '../auth/decorators/roles.decorator';
// Import DTOs from DTOs folder
import {
  CreateAttendanceRecordDto,
  GetAttendanceRecordDto,
  UpdateAttendanceRecordDto,
  SubmitCorrectionRequestDto,
  GetCorrectionsDto,
  GetAllCorrectionsDto,
  CreateTimeExceptionDto,
  UpdateTimeExceptionDto,
  GetTimeExceptionsByEmployeeDto,
  ApproveTimeExceptionDto,
  RejectTimeExceptionDto,
  EscalateTimeExceptionDto,
  ApproveCorrectionRequestDto,
  RejectCorrectionRequestDto,
} from '../DTOs/attendance.dtos';
import {
  ApplyAttendanceRoundingDto,
  EnforcePunchPolicyDto,
  EnforceShiftPunchPolicyDto,
  MonitorRepeatedLatenessDto,
  RecordPunchWithMetadataDto,
  TriggerLatenessDisciplinaryDto,
} from '../DTOs/time-permission.dtos';
import {
  GenerateOvertimeReportDto,
  GenerateLatenessReportDto,
  GenerateExceptionReportDto,
  ExportReportDto,
} from '../DTOs/Reporting.dtos';

// ===== TIME MANAGEMENT CONTROLLER =====
// Combines AttendanceController and TimeExceptionController
@UseGuards(AuthGuard, RolesGuard)
@Controller('time-management')
export class TimeManagementController {
  constructor(private readonly timeManagementService: TimeManagementService) {}

  // ===== Clocking and Attendance Records =====
  
  // 1. Clock in with employee ID
  @Roles('employee', 'SystemAdmin')
  @UseGuards(SelfAccessGuard)
  @Post('clock-in/:employeeId')
  async clockInWithID(@Param('employeeId') employeeId: string) {
    return this.timeManagementService.clockInWithID(employeeId);
  }

  // 1b. Clock out with employee ID
  @Roles('employee', 'SystemAdmin')
  @UseGuards(SelfAccessGuard)
  @Post('clock-out/:employeeId')
  async clockOutWithID(@Param('employeeId') employeeId: string) {
    return this.timeManagementService.clockOutWithID(employeeId);
  }

  // 2. Create a new attendance record (clock-in/out)
  @Roles('LineManager', 'HrManager', 'HrAdmin', 'SystemAdmin')
  @Post('attendance')
  async createAttendanceRecord(@Body() createAttendanceRecordDto: CreateAttendanceRecordDto) {
    return this.timeManagementService.createAttendanceRecord(createAttendanceRecordDto);
  }

      // // 3. Get attendance records by employee ID (and optional date range) //not needed by user stories
      // @Roles('employee', 'LineManager', 'HrManager', 'HrAdmin', 'SystemAdmin', 'PayrollOfficer')
      // @UseGuards(SelfAccessGuard)
      // @Get('attendance/employee/:id')
      // async getAttendanceRecordByEmployee(
      //   @Param('id') id: string,
      //   @Body() getAttendanceRecordDto: GetAttendanceRecordDto,
      // ) {
      //   return this.timeManagementService.getAttendanceRecordByEmployee(id, getAttendanceRecordDto);
      // }

  // 4. Update an attendance record (e.g., add missed punches or corrections) 
  @Roles('LineManager', 'HrManager', 'HrAdmin', 'SystemAdmin')
  @Put('attendance/:id')
  async updateAttendanceRecord(
    @Param('id') id: string,
    @Body() updateAttendanceRecordDto: UpdateAttendanceRecordDto,
  ) {
    return this.timeManagementService.updateAttendanceRecord(id, updateAttendanceRecordDto);
  }

  // 5. Submit an attendance correction request (for missed punches, etc.)
  @Roles('employee', 'LineManager', 'HrAdmin', 'SystemAdmin')
  @UseGuards(SelfAccessGuard)
  @Post('attendance/correction')
  async submitAttendanceCorrectionRequest(@Body() submitCorrectionRequestDto: SubmitCorrectionRequestDto) {
    return this.timeManagementService.submitAttendanceCorrectionRequest(submitCorrectionRequestDto);
  }

  // // 6. Get all correction requests by employee ID (optional filter by status) //not needed by user stories
  // @Roles('employee', 'LineManager', 'HrAdmin', 'SystemAdmin')
  // @UseGuards(SelfAccessGuard)
  // @Get('attendance/corrections/employee/:id')
  // async getAttendanceCorrectionRequestsByEmployee(
  //   @Param('id') id: string,
  //   @Body() getCorrectionsDto: GetCorrectionsDto,
  // ) {
  //   return this.timeManagementService.getAttendanceCorrectionRequestsByEmployee(id, getCorrectionsDto);
  // }

  // 6b. Get all correction requests (for review by managers/admins)
  // User Story: "As a Line Manager/HR Admin, I want to review, approve, or reject attendance-related requests"
  @Roles('LineManager', 'HrAdmin', 'HrManager', 'SystemAdmin')
  @Get('attendance/corrections')
  async getAllCorrectionRequests(@Body() getAllCorrectionsDto: GetAllCorrectionsDto) {
    return this.timeManagementService.getAllCorrectionRequests(getAllCorrectionsDto);
  }

  // 6c. Approve a correction request
  // User Story: "As a Line Manager/HR Admin, I want to review, approve, or reject attendance-related requests"
  @Roles('LineManager', 'HrAdmin', 'SystemAdmin')
  @Post('attendance/corrections/approve')
  async approveCorrectionRequest(@Body() approveCorrectionRequestDto: ApproveCorrectionRequestDto) {
    return this.timeManagementService.approveCorrectionRequest(approveCorrectionRequestDto);
  }

  // 6d. Reject a correction request
  // User Story: "As a Line Manager/HR Admin, I want to review, approve, or reject attendance-related requests"
  @Roles('LineManager', 'HrAdmin', 'SystemAdmin')
  @Post('attendance/corrections/reject')
  async rejectCorrectionRequest(@Body() rejectCorrectionRequestDto: RejectCorrectionRequestDto) {
    return this.timeManagementService.rejectCorrectionRequest(rejectCorrectionRequestDto);
  }

  // ===== Attendance Punch Enhancements =====

  @Roles('employee', 'LineManager', 'HrManager', 'HrAdmin', 'SystemAdmin')
  @UseGuards(SelfAccessGuard)
  @Post('attendance/punch/metadata')
  async recordPunchWithMetadata(@Body() recordPunchWithMetadataDto: RecordPunchWithMetadataDto) {
    return this.timeManagementService.recordPunchWithMetadata(recordPunchWithMetadataDto);
  }

  @Roles('employee', 'SystemAdmin')
  @UseGuards(SelfAccessGuard)
  @Post('attendance/punch/device')
  async recordPunchFromDevice(@Body() recordPunchWithMetadataDto: RecordPunchWithMetadataDto) {
    return this.timeManagementService.recordPunchFromDevice(recordPunchWithMetadataDto);
  }

  @Roles('HrManager', 'HrAdmin', 'SystemAdmin')
  @Post('attendance/enforce-punch-policy')
  async enforcePunchPolicy(@Body() enforcePunchPolicyDto: EnforcePunchPolicyDto) {
    return this.timeManagementService.enforcePunchPolicy(enforcePunchPolicyDto);
  }

  @Roles('HrManager', 'HrAdmin', 'SystemAdmin')
  @Post('attendance/rounding')
  async applyAttendanceRounding(@Body() applyAttendanceRoundingDto: ApplyAttendanceRoundingDto) {
    return this.timeManagementService.applyAttendanceRounding(applyAttendanceRoundingDto);
  }

  @Roles('HrManager', 'HrAdmin', 'SystemAdmin')
  @Post('attendance/enforce-shift-policy')
  async enforceShiftPunchPolicy(@Body() enforceShiftPunchPolicyDto: EnforceShiftPunchPolicyDto) {
    return this.timeManagementService.enforceShiftPunchPolicy(enforceShiftPunchPolicyDto);
  }

  // ===== Time Exceptions ===== //isnt this attendance exceptions?and implemented above in getAllCorrectionRequests approveCorrectionRequest, and rejectCorrectionRequest ? 

  // 7. Create a new time exception (e.g., missed punch, overtime) 
  @Roles('employee', 'LineManager', 'HrManager')
  @UseGuards(SelfAccessGuard)
  @Post('time-exception')
  async createTimeException(@Body() createTimeExceptionDto: CreateTimeExceptionDto) {
    return this.timeManagementService.createTimeException(createTimeExceptionDto);
  }

  // 8. Update a time exception status (approve, reject, etc.)
  @Roles('HrManager', 'HrAdmin', 'SystemAdmin')
  @Put('time-exception/:id')
  async updateTimeException(
    @Param('id') id: string,
    @Body() updateTimeExceptionDto: UpdateTimeExceptionDto,
  ) {
    return this.timeManagementService.updateTimeException(id, updateTimeExceptionDto);
  }

  // 9. Get all time exceptions by employee (optional filter by status)
  @Roles('employee', 'LineManager', 'HrManager', 'HrAdmin', 'SystemAdmin')
  @UseGuards(SelfAccessGuard)
  @Get('time-exception/employee/:id')
  async getTimeExceptionsByEmployee(
    @Param('id') id: string,
    @Body() getTimeExceptionsByEmployeeDto: GetTimeExceptionsByEmployeeDto,
  ) {
    return this.timeManagementService.getTimeExceptionsByEmployee(id, getTimeExceptionsByEmployeeDto);
  }

  // 10. Approve a time exception
  @Roles('LineManager', 'HrAdmin', 'SystemAdmin')
  @Post('time-exception/approve')
  async approveTimeException(@Body() approveTimeExceptionDto: ApproveTimeExceptionDto) {
    return this.timeManagementService.approveTimeException(approveTimeExceptionDto);
  }

  // 11. Reject a time exception
  @Roles('LineManager', 'HrAdmin', 'SystemAdmin')
  @Post('time-exception/reject')
  async rejectTimeException(@Body() rejectTimeExceptionDto: RejectTimeExceptionDto) {
    return this.timeManagementService.rejectTimeException(rejectTimeExceptionDto);
  }

  // 12. Escalate a time exception
  @Roles('LineManager', 'HrAdmin', 'HrManager', 'SystemAdmin')
  @Post('time-exception/escalate')
  async escalateTimeException(@Body() escalateTimeExceptionDto: EscalateTimeExceptionDto) {
    return this.timeManagementService.escalateTimeException(escalateTimeExceptionDto);
  }

  // ===== Automatic Detection Methods =====
  // These can be called manually or by scheduled jobs

  // 18. Check for expiring shift assignments and send notifications
  // User Story: "As an HR Admin, I want to be notified when a shift assignment is nearing expiry"
  @Roles('HrAdmin', 'SystemAdmin')
  @Post('automation/check-expiring-shifts')
  async checkExpiringShiftAssignments(@Body() body: { daysBeforeExpiry?: number }) {
    return this.timeManagementService.checkExpiringShiftAssignments(body.daysBeforeExpiry || 7);
  }

  // 19. Detect missed punches and send alerts
  // User Story: "As an Employee/Line Manager/Payroll Officer, I want the system to flag missed punches and send alerts"
  @Roles('HrAdmin', 'SystemAdmin')
  @Post('automation/detect-missed-punches')
  async detectMissedPunches() {
    return this.timeManagementService.detectMissedPunches();
  }

  // 20. Escalate unresolved requests before payroll cut-off
  // User Story: "As a System Admin/HR Admin, I want leave or time requests to escalate automatically if not reviewed before the monthly payroll cut-off date"
  @Roles('HrAdmin', 'SystemAdmin', 'PayrollOfficer')
  @Post('automation/escalate-before-payroll')
  async escalateUnresolvedRequestsBeforePayroll(@Body() body: { payrollCutOffDate: Date }) {
    return this.timeManagementService.escalateUnresolvedRequestsBeforePayroll(new Date(body.payrollCutOffDate));
  }

  @Roles('HrManager', 'HrAdmin', 'SystemAdmin')
  @Post('automation/monitor-lateness')
  async monitorRepeatedLateness(@Body() monitorRepeatedLatenessDto: MonitorRepeatedLatenessDto) {
    return this.timeManagementService.monitorRepeatedLateness(monitorRepeatedLatenessDto);
  }

  @Roles('HrManager', 'HrAdmin', 'SystemAdmin', 'LineManager')
  @Post('automation/trigger-lateness')
  async triggerLatenessDisciplinary(@Body() triggerLatenessDisciplinaryDto: TriggerLatenessDisciplinaryDto) {
    return this.timeManagementService.triggerLatenessDisciplinary(triggerLatenessDisciplinaryDto);
  }

  @Roles('SystemAdmin')
  @Post('automation/schedule-backup')
  async scheduleTimeDataBackup() {
    return this.timeManagementService.scheduleTimeDataBackup();
  }

  // ===== REPORTING =====

  // Generate overtime report
  // User Story: "As an HR or Payroll Officer, I want to view and export overtime and exception attendance reports"
  @Roles('HrManager', 'HrAdmin', 'SystemAdmin', 'PayrollOfficer')
  @Post('reports/overtime')
  async generateOvertimeReport(@Body() generateOvertimeReportDto: GenerateOvertimeReportDto) {
    return this.timeManagementService.generateOvertimeReport(generateOvertimeReportDto);
  }

  // Generate lateness report
  // User Story: "As an HR or Payroll Officer, I want to view and export overtime and exception attendance reports"
  @Roles('HrManager', 'HrAdmin', 'SystemAdmin', 'PayrollOfficer')
  @Post('reports/lateness')
  async generateLatenessReport(@Body() generateLatenessReportDto: GenerateLatenessReportDto) {
    return this.timeManagementService.generateLatenessReport(generateLatenessReportDto);
  }

  // Generate exception attendance report
  // User Story: "As an HR or Payroll Officer, I want to view and export overtime and exception attendance reports"
  @Roles('HrManager', 'HrAdmin', 'SystemAdmin', 'PayrollOfficer')
  @Post('reports/exception')
  async generateExceptionReport(@Body() generateExceptionReportDto: GenerateExceptionReportDto) {
    return this.timeManagementService.generateExceptionReport(generateExceptionReportDto);
  }

  // Export report in specified format (Excel, CSV, Text)
  // User Story: "As an HR or Payroll Officer, I want to view and export overtime and exception attendance reports"
  @Roles('HrManager', 'HrAdmin', 'SystemAdmin', 'PayrollOfficer')
  @Post('reports/export')
  async exportReport(@Body() exportReportDto: ExportReportDto) {
    return this.timeManagementService.exportReport(exportReportDto);
  }
}

