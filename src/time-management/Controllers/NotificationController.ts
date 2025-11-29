import { Controller, Post, Get, Body, Param, UseGuards, Query } from '@nestjs/common';
import { NotificationService } from '../Services/NotificationService';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SelfAccessGuard } from '../auth/guards/self-access.guard';
import { Roles } from '../auth/decorators/roles.decorator';
// Import DTOs from DTOs folder
import {
  SendNotificationDto,
  GetNotificationLogsByEmployeeDto,
  SyncAttendanceWithPayrollDto,
  SyncLeaveWithPayrollDto,
  SynchronizeAttendanceAndPayrollDto,
} from '../DTOs/NotificationAndSync.dtos';

// ===== NOTIFICATION AND SYNC CONTROLLER =====
@Controller('notification-sync')
@UseGuards(AuthGuard, RolesGuard)
export class NotificationAndSyncController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('notification')
  @Roles('HrAdmin', 'HrManager', 'SystemAdmin', 'LineManager')
  async sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
    return this.notificationService.sendNotification(sendNotificationDto);
  }

  @Get('notification/employee/:employeeId')
  @UseGuards(SelfAccessGuard)
  @Roles('employee', 'LineManager', 'HrAdmin', 'HrManager', 'SystemAdmin', 'PayrollOfficer')
  async getNotificationLogsByEmployee(@Param('employeeId') employeeId: string) {
    return this.notificationService.getNotificationLogsByEmployee({ employeeId });
  }

  @Post('sync/attendance')
  @Roles('HrAdmin', 'SystemAdmin', 'PayrollOfficer')
  async syncAttendanceWithPayroll(@Body() syncAttendanceWithPayrollDto: SyncAttendanceWithPayrollDto) {
    return this.notificationService.syncAttendanceWithPayroll(syncAttendanceWithPayrollDto);
  }

  @Post('sync/leave')
  @Roles('HrAdmin', 'SystemAdmin', 'PayrollOfficer')
  async syncLeaveWithPayroll(@Body() syncLeaveWithPayrollDto: SyncLeaveWithPayrollDto) {
    return this.notificationService.syncLeaveWithPayroll(syncLeaveWithPayrollDto);
  }

  @Post('sync/attendance-leave')
  @Roles('HrAdmin', 'SystemAdmin', 'PayrollOfficer')
  async synchronizeAttendanceAndPayroll(@Body() synchronizeAttendanceAndPayrollDto: SynchronizeAttendanceAndPayrollDto) {
    return this.notificationService.synchronizeAttendanceAndPayroll(synchronizeAttendanceAndPayrollDto);
  }

  // ===== GET ENDPOINTS FOR PAYROLL/LEAVES TO CONSUME DATA =====
  // These are GET endpoints that Payroll and Leaves subsystems can call to retrieve data

  // Get attendance data for sync (for Payroll/Leaves)
  @Get('sync/attendance/:employeeId')
  @Roles('HrAdmin', 'SystemAdmin', 'PayrollOfficer')
  async getAttendanceDataForSync(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.notificationService.getAttendanceDataForSync(
      employeeId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  // Get overtime data for sync (for Payroll)
  @Get('sync/overtime/:employeeId')
  @Roles('HrAdmin', 'SystemAdmin', 'PayrollOfficer')
  async getOvertimeDataForSync(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.notificationService.getOvertimeDataForSync(
      employeeId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}

