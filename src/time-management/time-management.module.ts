import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationLogSchema, NotificationLog } from './models/notification-log.schema';
import { AttendanceCorrectionRequestSchema, AttendanceCorrectionRequest } from './models/attendance-correction-request.schema';
import { ShiftTypeSchema, ShiftType } from './models/shift-type.schema';
import { ScheduleRuleSchema, ScheduleRule } from './models/schedule-rule.schema';
import { AttendanceRecordSchema, AttendanceRecord } from './models/attendance-record.schema';
import { TimeExceptionSchema, TimeException } from './models/time-exception.schema';
import { ShiftSchema, Shift } from './models/shift.schema';
import { ShiftAssignmentSchema, ShiftAssignment } from './models/shift-assignment.schema';
import { OvertimeRuleSchema, OvertimeRule } from './models/overtime-rule.schema';
import { latenessRuleSchema, LatenessRule } from './models/lateness-rule.schema';
import { HolidaySchema, Holiday } from './models/holiday.schema';

// ===== CONSOLIDATED CONTROLLERS =====
import { TimeManagementController } from './Controllers/TimeManagementController';
import { ShiftAndScheduleController } from './Controllers/ShiftScheduleController';
import { NotificationAndSyncController } from './Controllers/NotificationController';
import { PolicyConfigController } from './Controllers/PolicyConfigController';

// ===== SERVICES =====
import { TimeManagementService } from './Services/TimeManagementService';
import { ShiftScheduleService } from './Services/ShiftScheduleService';
import { NotificationService } from './Services/NotificationService';
import { PolicyConfigService } from './Services/PolicyConfigService';
import { AuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { SelfAccessGuard } from './auth/guards/self-access.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationLog.name, schema: NotificationLogSchema },
      { name: AttendanceCorrectionRequest.name, schema: AttendanceCorrectionRequestSchema },
      { name: ShiftType.name, schema: ShiftTypeSchema },
      { name: ScheduleRule.name, schema: ScheduleRuleSchema },
      { name: AttendanceRecord.name, schema: AttendanceRecordSchema },
      { name: TimeException.name, schema: TimeExceptionSchema },
      { name: Shift.name, schema: ShiftSchema },
      { name: ShiftAssignment.name, schema: ShiftAssignmentSchema },
      { name: OvertimeRule.name, schema: OvertimeRuleSchema },
      { name: LatenessRule.name, schema: latenessRuleSchema },
      { name: Holiday.name, schema: HolidaySchema },
    ])
  ],
  controllers: [
    TimeManagementController,
    ShiftAndScheduleController,
    NotificationAndSyncController,
    PolicyConfigController,
  ],
  providers: [
    TimeManagementService,
    ShiftScheduleService,
    NotificationService,
    PolicyConfigService,
    AuthGuard,
    RolesGuard,
    SelfAccessGuard,
  ]
  
})
export class TimeManagementModule {}
