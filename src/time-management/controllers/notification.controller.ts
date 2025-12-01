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
}
