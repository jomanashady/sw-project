import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TimeManagementService } from '../services/time-management.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';
// Import DTOs from DTOs folder
import {
  CreateAttendanceRecordDto,
  UpdateAttendanceRecordDto,
  SubmitCorrectionRequestDto,
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
} from '../DTOs/reporting.dtos';

@Controller('time-management')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimeManagementController {
  constructor(private readonly timeManagementService: TimeManagementService) {}

  // ===== Clocking and Attendance Records =====
  @Post('clock-in/:employeeId')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.SYSTEM_ADMIN)
  async clockInWithID(
    @Param('employeeId') employeeId: string,
    @CurrentUser() user: any,
  ) {
    // Self-access check
    if (
      user.roles.includes(SystemRole.DEPARTMENT_EMPLOYEE) &&
      user.userId !== employeeId
    ) {
      throw new Error('Access denied');
    }
    return this.timeManagementService.clockInWithID(employeeId, user.userId);
  }

  @Post('clock-out/:employeeId')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.SYSTEM_ADMIN)
  async clockOutWithID(
    @Param('employeeId') employeeId: string,
    @CurrentUser() user: any,
  ) {
    // Self-access check
    if (
      user.roles.includes(SystemRole.DEPARTMENT_EMPLOYEE) &&
      user.userId !== employeeId
    ) {
      throw new Error('Access denied');
    }
    return this.timeManagementService.clockOutWithID(employeeId, user.userId);
  }

  @Post('attendance')
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async createAttendanceRecord(
    @Body() createAttendanceRecordDto: CreateAttendanceRecordDto,
    @CurrentUser() user: any,
  ) {
    return this.timeManagementService.createAttendanceRecord(
      createAttendanceRecordDto,
      user.userId,
    );
  }

  @Put('attendance/:id')
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async updateAttendanceRecord(
    @Param('id') id: string,
    @Body() updateAttendanceRecordDto: UpdateAttendanceRecordDto,
    @CurrentUser() user: any,
  ) {
    return this.timeManagementService.updateAttendanceRecord(
      id,
      updateAttendanceRecordDto,
      user.userId,
    );
  }

  @Post('attendance/correction')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async submitAttendanceCorrectionRequest(
    @Body() submitCorrectionRequestDto: SubmitCorrectionRequestDto,
    @CurrentUser() user: any,
  ) {
    // Self-access check for employees
    if (
      user.roles.includes(SystemRole.DEPARTMENT_EMPLOYEE) &&
      user.userId !== submitCorrectionRequestDto.employeeId
    ) {
      throw new Error('Access denied');
    }
    return this.timeManagementService.submitAttendanceCorrectionRequest(
      submitCorrectionRequestDto,
      user.userId,
    );
  }

  @Get('attendance/corrections')
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.SYSTEM_ADMIN,
  )
  async getAllCorrectionRequests(
    @Body() getAllCorrectionsDto: GetAllCorrectionsDto,
    @CurrentUser() user: any,
  ) {
    return this.timeManagementService.getAllCorrectionRequests(
      getAllCorrectionsDto,
      user.userId,
    );
  }

  @Post('attendance/corrections/approve')
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async approveCorrectionRequest(
    @Body() approveCorrectionRequestDto: ApproveCorrectionRequestDto,
    @CurrentUser() user: any,
  ) {
    return this.timeManagementService.approveCorrectionRequest(
      approveCorrectionRequestDto,
      user.userId,
    );
  }

  @Post('attendance/corrections/reject')
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async rejectCorrectionRequest(
    @Body() rejectCorrectionRequestDto: RejectCorrectionRequestDto,
    @CurrentUser() user: any,
  ) {
    return this.timeManagementService.rejectCorrectionRequest(
      rejectCorrectionRequestDto,
      user.userId,
    );
  }

  // ===== Attendance Punch Enhancements =====
  @Post('attendance/punch/metadata')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async recordPunchWithMetadata(
    @Body() recordPunchWithMetadataDto: RecordPunchWithMetadataDto,
    @CurrentUser() user: any,
  ) {
    // Self-access check
    if (
      user.roles.includes(SystemRole.DEPARTMENT_EMPLOYEE) &&
      user.userId !== recordPunchWithMetadataDto.employeeId
    ) {
      throw new Error('Access denied');
    }
    return this.timeManagementService.recordPunchWithMetadata(
      recordPunchWithMetadataDto,
      user.userId,
    );
  }

  @Post('attendance/punch/device')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.SYSTEM_ADMIN)
  async recordPunchFromDevice(
    @Body() recordPunchWithMetadataDto: RecordPunchWithMetadataDto,
    @CurrentUser() user: any,
  ) {
    // Self-access check
    if (
      user.roles.includes(SystemRole.DEPARTMENT_EMPLOYEE) &&
      user.userId !== recordPunchWithMetadataDto.employeeId
    ) {
      throw new Error('Access denied');
    }
    return this.timeManagementService.recordPunchFromDevice(
      recordPunchWithMetadataDto,
      user.userId,
    );
  }

  @Post('attendance/enforce-punch-policy')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async enforcePunchPolicy(
    @Body() enforcePunchPolicyDto: EnforcePunchPolicyDto,
    @CurrentUser() user: any,
  ) {
    return this.timeManagementService.enforcePunchPolicy(
      enforcePunchPolicyDto,
      user.userId,
    );
  }

  @Post('attendance/rounding')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async applyAttendanceRounding(
    @Body() applyAttendanceRoundingDto: ApplyAttendanceRoundingDto,
    @CurrentUser() user: any,
  ) {
    return this.timeManagementService.applyAttendanceRounding(
      applyAttendanceRoundingDto,
      user.userId,
    );
  }

  @Post('attendance/enforce-shift-policy')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async enforceShiftPunchPolicy(
    @Body() enforceShiftPunchPolicyDto: EnforceShiftPunchPolicyDto,
    @CurrentUser() user: any,
  ) {
    return this.timeManagementService.enforceShiftPunchPolicy(
      enforceShiftPunchPolicyDto,
      user.userId,
    );
  }

  // ===== Time Exceptions =====
  @Post('time-exception')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
  )
  async createTimeException(
    @Body() createTimeExceptionDto: CreateTimeExceptionDto,
    @CurrentUser() user: any,
  ) {
    // Self-access check
    if (
      user.roles.includes(SystemRole.DEPARTMENT_EMPLOYEE) &&
      user.userId !== createTimeExceptionDto.employeeId
    ) {
      throw new Error('Access denied');
    }
    return this.timeManagementService.createTimeException(
      createTimeExceptionDto,
      user.userId,
    );
  }

  @Put('time-exception/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async updateTimeException(
    @Param('id') id: string,
    @Body() updateTimeExceptionDto: UpdateTimeExceptionDto,
    @CurrentUser() user: any,
  ) {
    return this.timeManagementService.updateTimeException(
      id,
      updateTimeExceptionDto,
      user.userId,
    );
  }

  @Get('time-exception/employee/:id')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async getTimeExceptionsByEmployee(
    @Param('id') id: string,
    @Body() getTimeExceptionsByEmployeeDto: GetTimeExceptionsByEmployeeDto,
    @CurrentUser() user: any,
  ) {
    // Self-access check
    if (
      user.roles.includes(SystemRole.DEPARTMENT_EMPLOYEE) &&
      user.userId !== id
    ) {
      throw new Error('Access denied');
    }
    return this.timeManagementService.getTimeExceptionsByEmployee(
      id,
      getTimeExceptionsByEmployeeDto,
      user.userId,
    );
  }

  @Post('time-exception/approve')
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async approveTimeException(
    @Body() approveTimeExceptionDto: ApproveTimeExceptionDto,
    @CurrentUser() user: any,
  ) {
    return this.timeManagementService.approveTimeException(
      approveTimeExceptionDto,
      user.userId,
    );
  }

  @Post('time-exception/reject')
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async rejectTimeException(
    @Body() rejectTimeExceptionDto: RejectTimeExceptionDto,
    @CurrentUser() user: any,
  ) {
    return this.timeManagementService.rejectTimeException(
      rejectTimeExceptionDto,
      user.userId,
    );
  }

  @Post('time-exception/escalate')
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.SYSTEM_ADMIN,
  )
  async escalateTimeException(
    @Body() escalateTimeExceptionDto: EscalateTimeExceptionDto,
    @CurrentUser() user: any,
  ) {
    return this.timeManagementService.escalateTimeException(
      escalateTimeExceptionDto,
      user.userId,
    );
  }

  // ===== Automatic Detection Methods =====
  @Post('automation/check-expiring-shifts')
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async checkExpiringShiftAssignments(
    @Body() body: { daysBeforeExpiry?: number },
    @CurrentUser() user: any,
  ) {
    return this.timeManagementService.checkExpiringShiftAssignments(
      body.daysBeforeExpiry || 7,
      user.userId,
    );
  }

  @Post('automation/detect-missed-punches')
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async detectMissedPunches(@CurrentUser() user: any) {
    return this.timeManagementService.detectMissedPunches(user.userId);
  }

  @Post('automation/escalate-before-payroll')
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
  )
  async escalateUnresolvedRequestsBeforePayroll(
    @Body() body: { payrollCutOffDate: Date },
    @CurrentUser() user: any,
  ) {
    return this.timeManagementService.escalateUnresolvedRequestsBeforePayroll(
      new Date(body.payrollCutOffDate),
      user.userId,
    );
  }

  @Post('automation/monitor-lateness')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async monitorRepeatedLateness(
    @Body() monitorRepeatedLatenessDto: MonitorRepeatedLatenessDto,
    @CurrentUser() user: any,
  ) {
    return this.timeManagementService.monitorRepeatedLateness(
      monitorRepeatedLatenessDto,
      user.userId,
    );
  }

  @Post('automation/trigger-lateness')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.DEPARTMENT_HEAD,
  )
  async triggerLatenessDisciplinary(
    @Body() triggerLatenessDisciplinaryDto: TriggerLatenessDisciplinaryDto,
    @CurrentUser() user: any,
  ) {
    return this.timeManagementService.triggerLatenessDisciplinary(
      triggerLatenessDisciplinaryDto,
      user.userId,
    );
  }

  @Post('automation/schedule-backup')
  @Roles(SystemRole.SYSTEM_ADMIN)
  async scheduleTimeDataBackup(@CurrentUser() user: any) {
    return this.timeManagementService.scheduleTimeDataBackup(user.userId);
  }

  // ===== REPORTING =====
  @Post('reports/overtime')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
  )
  async generateOvertimeReport(
    @Body() generateOvertimeReportDto: GenerateOvertimeReportDto,
    @CurrentUser() user: any,
  ) {
    return this.timeManagementService.generateOvertimeReport(
      generateOvertimeReportDto,
      user.userId,
    );
  }

  @Post('reports/lateness')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
  )
  async generateLatenessReport(
    @Body() generateLatenessReportDto: GenerateLatenessReportDto,
    @CurrentUser() user: any,
  ) {
    return this.timeManagementService.generateLatenessReport(
      generateLatenessReportDto,
      user.userId,
    );
  }

  @Post('reports/exception')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
  )
  async generateExceptionReport(
    @Body() generateExceptionReportDto: GenerateExceptionReportDto,
    @CurrentUser() user: any,
  ) {
    return this.timeManagementService.generateExceptionReport(
      generateExceptionReportDto,
      user.userId,
    );
  }

  @Post('reports/export')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
  )
  async exportReport(
    @Body() exportReportDto: ExportReportDto,
    @CurrentUser() user: any,
  ) {
    return this.timeManagementService.exportReport(
      exportReportDto,
      user.userId,
    );
  }
}
