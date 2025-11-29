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

// ===== CONSOLIDATED CONTROLLERS =====
// All controllers consolidated from controllers folder into time-management.controller.ts
import { TimeManagementController } from './Controllers/TimeManagementController';
import { ShiftAndScheduleController } from './Controllers/ShiftScheduleController';
import { NotificationAndSyncController } from './Controllers/NotificationController';

// ===== SERVICES =====
// All services organized in Services folder
import { TimeManagementService } from './Services/TimeManagementService';
import { ShiftScheduleService } from './Services/ShiftScheduleService';
import { NotificationService } from './Services/NotificationService';
import { AuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { SelfAccessGuard } from './auth/guards/self-access.guard';

@Module({
  imports: [MongooseModule.forFeature([
    { name: NotificationLog.name, schema: NotificationLogSchema },
    { name: AttendanceCorrectionRequest.name, schema: AttendanceCorrectionRequestSchema },
    { name: ShiftType.name, schema: ShiftTypeSchema },
    { name: ScheduleRule.name, schema: ScheduleRuleSchema },
    { name: AttendanceRecord.name, schema: AttendanceRecordSchema },
    { name: TimeException.name, schema: TimeExceptionSchema },
    { name: Shift.name, schema: ShiftSchema },
    { name: ShiftAssignment.name, schema: ShiftAssignmentSchema },
  ])],
  controllers: [
    TimeManagementController,
    ShiftAndScheduleController,
    NotificationAndSyncController,
  ],
  providers: [
    TimeManagementService,
    ShiftScheduleService,
    NotificationService,
    AuthGuard,
    RolesGuard,
    SelfAccessGuard,
  ]
  
})
export class TimeManagementModule {}
