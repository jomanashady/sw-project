import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';
// Import DTOs from DTOs folder
import {
  SendNotificationDto,
  GetNotificationLogsByEmployeeDto,
  SyncAttendanceWithPayrollDto,
  SyncLeaveWithPayrollDto,
  SynchronizeAttendanceAndPayrollDto,
} from '../dtos/notification-and-sync.dtos';

@Controller('notification-sync')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationAndSyncController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('notification')
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.DEPARTMENT_HEAD,
  )
  async sendNotification(
    @Body() sendNotificationDto: SendNotificationDto,
    @CurrentUser() user: any,
  ) {
    return this.notificationService.sendNotification(
      sendNotificationDto,
      user.userId,
    );
  }

  @Get('notification/employee/:employeeId')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
  )
  async getNotificationLogsByEmployee(
    @Param('employeeId') employeeId: string,
    @CurrentUser() user: any,
  ) {
    // Self-access check: employees can only view their own notifications
    if (
      user.roles.includes(SystemRole.DEPARTMENT_EMPLOYEE) &&
      user.userId !== employeeId
    ) {
      throw new Error('Access denied');
    }
    return this.notificationService.getNotificationLogsByEmployee(
      {
        employeeId,
      },
      user.userId,
    );
  }

  @Post('sync/attendance')
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
  )
  async syncAttendanceWithPayroll(
    @Body() syncAttendanceWithPayrollDto: SyncAttendanceWithPayrollDto,
    @CurrentUser() user: any,
  ) {
    return this.notificationService.syncAttendanceWithPayroll(
      syncAttendanceWithPayrollDto,
      user.userId,
    );
  }

  @Post('sync/leave')
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
  )
  async syncLeaveWithPayroll(
    @Body() syncLeaveWithPayrollDto: SyncLeaveWithPayrollDto,
    @CurrentUser() user: any,
  ) {
    return this.notificationService.syncLeaveWithPayroll(
      syncLeaveWithPayrollDto,
      user.userId,
    );
  }

  @Post('sync/attendance-leave')
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
  )
  async synchronizeAttendanceAndPayroll(
    @Body()
    synchronizeAttendanceAndPayrollDto: SynchronizeAttendanceAndPayrollDto,
    @CurrentUser() user: any,
  ) {
    return this.notificationService.synchronizeAttendanceAndPayroll(
      synchronizeAttendanceAndPayrollDto,
      user.userId,
    );
  }

  // ===== GET ENDPOINTS FOR PAYROLL/LEAVES TO CONSUME DATA =====
  @Get('sync/attendance/:employeeId')
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
  )
  async getAttendanceDataForSync(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser() user?: any,
  ) {
    return this.notificationService.getAttendanceDataForSync(
      employeeId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      user.userId,
    );
  }

  @Get('sync/overtime/:employeeId')
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.PAYROLL_SPECIALIST,
  )
  async getOvertimeDataForSync(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser() user?: any,
  ) {
    return this.notificationService.getOvertimeDataForSync(
      employeeId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      user.userId,
    );
  }

  // ===== US9: ATTENDANCE-TO-PAYROLL SYNC =====
  // BR-TM-22: All time management data must sync daily with payroll, benefits, and leave modules

  @Post('sync/daily-batch')
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN, SystemRole.PAYROLL_SPECIALIST)
  async runDailyPayrollSync(
    @Body() body: { syncDate: Date },
    @CurrentUser() user: any,
  ) {
    return this.notificationService.runDailyPayrollSync(
      new Date(body.syncDate),
      user.userId,
    );
  }

  @Get('sync/pending')
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN, SystemRole.PAYROLL_SPECIALIST)
  async getPendingPayrollSyncData(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('departmentId') departmentId?: string,
    @CurrentUser() user?: any,
  ) {
    const filters: { startDate?: Date; endDate?: Date; departmentId?: string } = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (departmentId) filters.departmentId = departmentId;
    return this.notificationService.getPendingPayrollSyncData(filters, user.userId);
  }

  @Post('sync/finalize')
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN, SystemRole.PAYROLL_SPECIALIST)
  async finalizeRecordsForPayroll(
    @Body() body: { recordIds: string[] },
    @CurrentUser() user: any,
  ) {
    return this.notificationService.finalizeRecordsForPayroll(
      body.recordIds,
      user.userId,
    );
  }

  @Post('sync/validate')
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN, SystemRole.PAYROLL_SPECIALIST)
  async validateDataForPayrollSync(
    @Body() body: { startDate: Date; endDate: Date },
    @CurrentUser() user: any,
  ) {
    return this.notificationService.validateDataForPayrollSync(
      {
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
      },
      user.userId,
    );
  }

  @Get('sync/exceptions')
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN, SystemRole.PAYROLL_SPECIALIST)
  async getExceptionDataForPayrollSync(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('employeeId') employeeId?: string,
    @CurrentUser() user?: any,
  ) {
    const filters: { startDate?: Date; endDate?: Date; employeeId?: string } = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (employeeId) filters.employeeId = employeeId;
    return this.notificationService.getExceptionDataForPayrollSync(filters, user.userId);
  }

  @Get('sync/history')
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN, SystemRole.PAYROLL_SPECIALIST)
  async getPayrollSyncHistory(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: any,
  ) {
    const filters: { startDate?: Date; endDate?: Date; limit?: number } = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (limit) filters.limit = parseInt(limit, 10);
    return this.notificationService.getPayrollSyncHistory(filters, user.userId);
  }

  @Post('sync/comprehensive')
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN, SystemRole.PAYROLL_SPECIALIST)
  async getComprehensivePayrollData(
    @Body() body: { startDate: Date; endDate: Date; departmentId?: string },
    @CurrentUser() user: any,
  ) {
    return this.notificationService.getComprehensivePayrollData(
      {
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        departmentId: body.departmentId,
      },
      user.userId,
    );
  }

  // ===== US4: SHIFT EXPIRY NOTIFICATIONS =====
  // BR-TM-05: Shift schedules must be assignable by Department, Position, or Individual

  @Post('shift-expiry/notify')
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async sendShiftExpiryNotification(
    @Body() body: {
      recipientId: string;
      shiftAssignmentId: string;
      employeeId: string;
      endDate: Date;
      daysRemaining: number;
    },
    @CurrentUser() user: any,
  ) {
    return this.notificationService.sendShiftExpiryNotification(
      body.recipientId,
      body.shiftAssignmentId,
      body.employeeId,
      new Date(body.endDate),
      body.daysRemaining,
      user.userId,
    );
  }

  @Post('shift-expiry/notify-bulk')
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async sendBulkShiftExpiryNotifications(
    @Body() body: {
      hrAdminIds: string[];
      expiringAssignments: Array<{
        assignmentId: string;
        employeeId: string;
        employeeName?: string;
        shiftName?: string;
        endDate: Date;
        daysRemaining: number;
      }>;
    },
    @CurrentUser() user: any,
  ) {
    return this.notificationService.sendBulkShiftExpiryNotifications(
      body.hrAdminIds,
      body.expiringAssignments.map(a => ({
        ...a,
        endDate: new Date(a.endDate),
      })),
      user.userId,
    );
  }

  @Get('shift-expiry/:hrAdminId')
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER)
  async getShiftExpiryNotifications(
    @Param('hrAdminId') hrAdminId: string,
    @CurrentUser() user: any,
  ) {
    return this.notificationService.getShiftExpiryNotifications(
      hrAdminId,
      user.userId,
    );
  }

  @Post('shift-renewal/confirm')
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER)
  async sendShiftRenewalConfirmation(
    @Body() body: {
      recipientId: string;
      shiftAssignmentId: string;
      newEndDate: Date;
    },
    @CurrentUser() user: any,
  ) {
    return this.notificationService.sendShiftRenewalConfirmation(
      body.recipientId,
      body.shiftAssignmentId,
      new Date(body.newEndDate),
      user.userId,
    );
  }

  @Post('shift-archive/notify')
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async sendShiftArchiveNotification(
    @Body() body: {
      recipientId: string;
      shiftAssignmentId: string;
      employeeId: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.notificationService.sendShiftArchiveNotification(
      body.recipientId,
      body.shiftAssignmentId,
      body.employeeId,
      user.userId,
    );
  }

  @Get('shift-notifications/:hrAdminId')
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER)
  async getAllShiftNotifications(
    @Param('hrAdminId') hrAdminId: string,
    @CurrentUser() user: any,
  ) {
    return this.notificationService.getAllShiftNotifications(
      hrAdminId,
      user.userId,
    );
  }

  // ===== US8: MISSED PUNCH MANAGEMENT & ALERTS =====
  // BR-TM-14: Missed punches/late sign-ins must be handled via auto-flagging, notifications, or payroll blocking

  @Post('missed-punch/alert/employee')
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.DEPARTMENT_HEAD,
  )
  async sendMissedPunchAlertToEmployee(
    @Body() body: {
      employeeId: string;
      attendanceRecordId: string;
      missedPunchType: 'CLOCK_IN' | 'CLOCK_OUT';
      date: Date;
    },
    @CurrentUser() user: any,
  ) {
    return this.notificationService.sendMissedPunchAlertToEmployee(
      body.employeeId,
      body.attendanceRecordId,
      body.missedPunchType,
      new Date(body.date),
      user.userId,
    );
  }

  @Post('missed-punch/alert/manager')
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
  )
  async sendMissedPunchAlertToManager(
    @Body() body: {
      managerId: string;
      employeeId: string;
      employeeName: string;
      attendanceRecordId: string;
      missedPunchType: 'CLOCK_IN' | 'CLOCK_OUT';
      date: Date;
    },
    @CurrentUser() user: any,
  ) {
    return this.notificationService.sendMissedPunchAlertToManager(
      body.managerId,
      body.employeeId,
      body.employeeName,
      body.attendanceRecordId,
      body.missedPunchType,
      new Date(body.date),
      user.userId,
    );
  }

  @Post('missed-punch/alert/bulk')
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async sendBulkMissedPunchAlerts(
    @Body() body: {
      alerts: Array<{
        employeeId: string;
        managerId?: string;
        employeeName?: string;
        attendanceRecordId: string;
        missedPunchType: 'CLOCK_IN' | 'CLOCK_OUT';
        date: Date;
      }>;
    },
    @CurrentUser() user: any,
  ) {
    const alerts = body.alerts.map(a => ({
      ...a,
      date: new Date(a.date),
    }));
    return this.notificationService.sendBulkMissedPunchAlerts(
      alerts,
      user.userId,
    );
  }

  @Get('missed-punch/employee/:employeeId')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.SYSTEM_ADMIN,
  )
  async getMissedPunchNotificationsByEmployee(
    @Param('employeeId') employeeId: string,
    @CurrentUser() user: any,
  ) {
    // Self-access check
    if (
      user.roles?.includes(SystemRole.DEPARTMENT_EMPLOYEE) &&
      user.userId !== employeeId
    ) {
      throw new Error('Access denied');
    }
    return this.notificationService.getMissedPunchNotificationsByEmployee(
      employeeId,
      user.userId,
    );
  }

  @Get('missed-punch/manager/:managerId')
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.SYSTEM_ADMIN,
  )
  async getMissedPunchNotificationsByManager(
    @Param('managerId') managerId: string,
    @CurrentUser() user: any,
  ) {
    // Self-access check for managers
    if (
      user.roles?.includes(SystemRole.DEPARTMENT_HEAD) &&
      user.userId !== managerId
    ) {
      throw new Error('Access denied');
    }
    return this.notificationService.getMissedPunchNotificationsByManager(
      managerId,
      user.userId,
    );
  }

  @Get('missed-punch/all')
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN, SystemRole.HR_MANAGER)
  async getAllMissedPunchNotifications(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser() user?: any,
  ) {
    const filters: { startDate?: Date; endDate?: Date } = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    return this.notificationService.getAllMissedPunchNotifications(
      filters,
      user.userId,
    );
  }

  @Post('missed-punch/flag-with-notification')
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.DEPARTMENT_HEAD,
  )
  async flagMissedPunchWithNotification(
    @Body() body: {
      attendanceRecordId: string;
      employeeId: string;
      managerId: string;
      employeeName: string;
      missedPunchType: 'CLOCK_IN' | 'CLOCK_OUT';
    },
    @CurrentUser() user: any,
  ) {
    return this.notificationService.flagMissedPunchWithNotification(
      body.attendanceRecordId,
      body.employeeId,
      body.managerId,
      body.employeeName,
      body.missedPunchType,
      user.userId,
    );
  }

  @Get('missed-punch/statistics')
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.HR_MANAGER,
    SystemRole.PAYROLL_SPECIALIST,
  )
  async getMissedPunchStatistics(
    @Query('employeeId') employeeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser() user?: any,
  ) {
    const filters: { employeeId?: string; startDate?: Date; endDate?: Date } = {};
    if (employeeId) filters.employeeId = employeeId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    return this.notificationService.getMissedPunchStatistics(
      filters,
      user.userId,
    );
  }
}
