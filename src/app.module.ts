import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// ===== SCHEMA IMPORTS =====

// 1. Shift Template
import {
  ShiftTemplate,
  ShiftTemplateSchema,
} from './schemas/shift-template.schema';

// 2. Employee Shift Assignment
import {
  EmployeeShiftAssignment,
  EmployeeShiftAssignmentSchema,
} from './schemas/employee-shift-assignment.schema';

// 3. Attendance Record
import {
  AttendanceRecord,
  AttendanceRecordSchema,
} from './schemas/attendance-record.schema';

// 4. Attendance Correction Request
import {
  AttendanceCorrectionRequest,
  AttendanceCorrectionRequestSchema,
} from './schemas/attendance-correction-request.schema';

// 5. Permission
import {
  Permission,
  PermissionSchema,
} from './schemas/permission.schema';

// 6. Holiday
import { Holiday, HolidaySchema } from './schemas/holiday.schema';

// 7. Attendance Summary
import {
  AttendanceSummary,
  AttendanceSummarySchema,
} from './schemas/attendance-summary.schema';

// 8. Time Policy
import {
  TimePolicy,
  TimePolicySchema,
} from './schemas/time-policy.schema';

// 9. Schedule Pattern
import {
  SchedulePattern,
  SchedulePatternSchema,
} from './schemas/schedule-pattern.schema';

// 10. Time Request Approval
import {
  TimeRequestApproval,
  TimeRequestApprovalSchema,
} from './schemas/time-request-approval.schema';


@Module({
  imports: [
    // Load env variables from .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Connect to MongoDB Atlas
    MongooseModule.forRoot(process.env.MONGODB_URI),

    // Register all schemas
    MongooseModule.forFeature([
      { name: ShiftTemplate.name, schema: ShiftTemplateSchema },
      { name: EmployeeShiftAssignment.name, schema: EmployeeShiftAssignmentSchema },
      { name: AttendanceRecord.name, schema: AttendanceRecordSchema },
      { name: AttendanceCorrectionRequest.name, schema: AttendanceCorrectionRequestSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: Holiday.name, schema: HolidaySchema },
      { name: AttendanceSummary.name, schema: AttendanceSummarySchema },
      { name: TimePolicy.name, schema: TimePolicySchema },
      { name: SchedulePattern.name, schema: SchedulePatternSchema },
      { name: TimeRequestApproval.name, schema: TimeRequestApprovalSchema },
    ]),
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
