import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ShiftType, ShiftTypeSchema } from './schemas/shift-type.schema';
import { SchedulingRule, SchedulingRuleSchema } from './schemas/scheduling-rule.schema';
import { ShiftAssignment, ShiftAssignmentSchema } from './schemas/shift-assignment.schema';
import {
  OrganizationCalendarDay,
  OrganizationCalendarDaySchema,
} from './schemas/organization-calendar.schema';
import { RestDayConfig, RestDayConfigSchema } from './schemas/rest-day-config.schema';
import { AttendanceRecord, AttendanceRecordSchema } from './schemas/attendance-record.schema';
import {
  AttendanceCorrectionRequest,
  AttendanceCorrectionRequestSchema,
} from './schemas/attendance-correction-request.schema';
import { OvertimeRule, OvertimeRuleSchema } from './schemas/overtime-rule.schema';
import { LatenessRule, LatenessRuleSchema } from './schemas/lateness-rule.schema';
import { PermissionRule, PermissionRuleSchema } from './schemas/permission-rule.schema';
import {
  TimeExceptionRequest,
  TimeExceptionRequestSchema,
} from './schemas/time-exception-request.schema';
import {
  IntegrationSyncLog,
  IntegrationSyncLogSchema,
} from './schemas/integration-sync-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShiftType.name, schema: ShiftTypeSchema },
      { name: SchedulingRule.name, schema: SchedulingRuleSchema },
      { name: ShiftAssignment.name, schema: ShiftAssignmentSchema },
      { name: OrganizationCalendarDay.name, schema: OrganizationCalendarDaySchema },
      { name: RestDayConfig.name, schema: RestDayConfigSchema },
      { name: AttendanceRecord.name, schema: AttendanceRecordSchema },
      { name: AttendanceCorrectionRequest.name, schema: AttendanceCorrectionRequestSchema },
      { name: OvertimeRule.name, schema: OvertimeRuleSchema },
      { name: LatenessRule.name, schema: LatenessRuleSchema },
      { name: PermissionRule.name, schema: PermissionRuleSchema },
      { name: TimeExceptionRequest.name, schema: TimeExceptionRequestSchema },
      { name: IntegrationSyncLog.name, schema: IntegrationSyncLogSchema },
    ]),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class TimeManagementModule {}
