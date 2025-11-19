import { NestFactory } from '@nestjs/core';
import { Types } from 'mongoose';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShiftType } from '../src/time-management/schemas/shift-type.schema';
import { SchedulingRule } from '../src/time-management/schemas/scheduling-rule.schema';
import { ShiftAssignment } from '../src/time-management/schemas/shift-assignment.schema';
import { RestDayConfig } from '../src/time-management/schemas/rest-day-config.schema';
import { AttendanceRecord } from '../src/time-management/schemas/attendance-record.schema';
import { AttendanceCorrectionRequest } from '../src/time-management/schemas/attendance-correction-request.schema';
import { OvertimeRule } from '../src/time-management/schemas/overtime-rule.schema';
import { LatenessRule } from '../src/time-management/schemas/lateness-rule.schema';
import { PermissionRule } from '../src/time-management/schemas/permission-rule.schema';
import { TimeExceptionRequest } from '../src/time-management/schemas/time-exception-request.schema';
import { OrganizationCalendarDay } from '../src/time-management/schemas/organization-calendar.schema';
import { IntegrationSyncLog } from '../src/time-management/schemas/integration-sync-log.schema';

async function seedDatabase() {
  console.log('🌱 Starting Time Management database seed...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Get models directly for time-management schemas
  const shiftTypeModel = app.get<Model<ShiftType>>(getModelToken(ShiftType.name));
  const schedulingRuleModel = app.get<Model<SchedulingRule>>(getModelToken(SchedulingRule.name));
  const shiftAssignmentModel = app.get<Model<ShiftAssignment>>(getModelToken(ShiftAssignment.name));
  const restDayConfigModel = app.get<Model<RestDayConfig>>(getModelToken(RestDayConfig.name));
  const attendanceRecordModel = app.get<Model<AttendanceRecord>>(getModelToken(AttendanceRecord.name));
  const attendanceCorrectionRequestModel = app.get<Model<AttendanceCorrectionRequest>>(getModelToken(AttendanceCorrectionRequest.name));
  const overtimeRuleModel = app.get<Model<OvertimeRule>>(getModelToken(OvertimeRule.name));
  const latenessRuleModel = app.get<Model<LatenessRule>>(getModelToken(LatenessRule.name));
  const permissionRuleModel = app.get<Model<PermissionRule>>(getModelToken(PermissionRule.name));
  const timeExceptionRequestModel = app.get<Model<TimeExceptionRequest>>(getModelToken(TimeExceptionRequest.name));
  const organizationCalendarModel = app.get<Model<OrganizationCalendarDay>>(getModelToken(OrganizationCalendarDay.name));
  const integrationSyncLogModel = app.get<Model<IntegrationSyncLog>>(getModelToken(IntegrationSyncLog.name));

  try {
    // 1. Create Shift Types
    console.log('🕐 Creating shift types...');
    
    const shiftTypeNormal = await shiftTypeModel.findOneAndUpdate(
      { code: 'SHIFT_NORMAL' },
      {
        code: 'SHIFT_NORMAL',
        name: 'Normal Working Hours',
        description: 'Standard 9-to-5 work shift',
        category: 'normal',
        standardStartTime: '09:00',
        standardEndTime: '17:00',
        isOvernight: false,
        gracePeriodMinutes: 15,
        punchMode: 'FIRST_LAST',
        isActive: true,
      },
      { upsert: true, new: true },
    );
    console.log('✅ Created/Updated: Normal Shift\n');

    const shiftTypeEvening = await shiftTypeModel.findOneAndUpdate(
      { code: 'SHIFT_EVENING' },
      {
        code: 'SHIFT_EVENING',
        name: 'Evening Shift',
        description: 'Evening work shift',
        category: 'normal',
        standardStartTime: '14:00',
        standardEndTime: '22:00',
        isOvernight: false,
        gracePeriodMinutes: 15,
        punchMode: 'FIRST_LAST',
        isActive: true,
      },
      { upsert: true, new: true },
    );
    console.log('✅ Created/Updated: Evening Shift\n');

    const shiftTypeSplit = await shiftTypeModel.findOneAndUpdate(
      { code: 'SHIFT_SPLIT' },
      {
        code: 'SHIFT_SPLIT',
        name: 'Split Shift',
        description: 'Split shift with break in between',
        category: 'split',
        standardStartTime: '09:00',
        standardEndTime: '18:00',
        splitSegments: [
          { startTime: '09:00', endTime: '13:00' },
          { startTime: '14:00', endTime: '18:00' },
        ],
        isOvernight: false,
        gracePeriodMinutes: 15,
        punchMode: 'MULTIPLE',
        isActive: true,
      },
      { upsert: true, new: true },
    );
    console.log('✅ Created/Updated: Split Shift\n');

    // 2. Create Overtime Rules
    console.log('⏰ Creating overtime rules...');
    
    const overtimeRuleNormal = await overtimeRuleModel.findOneAndUpdate(
      { code: 'OT_NORMAL_DAY' },
      {
        code: 'OT_NORMAL_DAY',
        name: 'Overtime on Normal Day',
        description: 'Overtime worked on a normal working day',
        contextType: 'normal_day',
        multiplier: 1.5,
        requiresPreApproval: true,
        isActive: true,
      },
      { upsert: true, new: true },
    );
    console.log('✅ Created/Updated: Overtime Rule - Normal Day\n');

    const overtimeRuleRestDay = await overtimeRuleModel.findOneAndUpdate(
      { code: 'OT_REST_DAY' },
      {
        code: 'OT_REST_DAY',
        name: 'Overtime on Rest Day',
        description: 'Overtime worked on a rest day',
        contextType: 'rest_day',
        multiplier: 2.0,
        requiresPreApproval: true,
        isActive: true,
      },
      { upsert: true, new: true },
    );
    console.log('✅ Created/Updated: Overtime Rule - Rest Day\n');

    const overtimeRuleHoliday = await overtimeRuleModel.findOneAndUpdate(
      { code: 'OT_HOLIDAY' },
      {
        code: 'OT_HOLIDAY',
        name: 'Overtime on Public Holiday',
        description: 'Overtime worked on a public holiday',
        contextType: 'public_holiday',
        multiplier: 2.5,
        requiresPreApproval: true,
        isActive: true,
      },
      { upsert: true, new: true },
    );
    console.log('✅ Created/Updated: Overtime Rule - Public Holiday\n');

    // 3. Create Lateness Rules
    console.log('⏱️ Creating lateness rules...');
    
    const latenessRuleMinor = await latenessRuleModel.findOneAndUpdate(
      { code: 'LATE_MINOR' },
      {
        code: 'LATE_MINOR',
        description: 'Minor lateness with grace period',
        gracePeriodMinutes: 15,
        warningThresholdMinutes: 30,
        penaltyThresholdMinutes: 60,
        penaltyFormula: '0.5 * hourly_rate',
        isActive: true,
      },
      { upsert: true, new: true },
    );
    console.log('✅ Created/Updated: Lateness Rule - Minor\n');

    const latenessRuleMajor = await latenessRuleModel.findOneAndUpdate(
      { code: 'LATE_MAJOR' },
      {
        code: 'LATE_MAJOR',
        description: 'Major lateness with higher penalty',
        gracePeriodMinutes: 15,
        warningThresholdMinutes: 60,
        penaltyThresholdMinutes: 120,
        penaltyFormula: '1.0 * hourly_rate',
        isActive: true,
      },
      { upsert: true, new: true },
    );
    console.log('✅ Created/Updated: Lateness Rule - Major\n');

    // 4. Create Permission Rules
    console.log('🚪 Creating permission rules...');
    
    const permissionRuleEarlyLeave = await permissionRuleModel.findOneAndUpdate(
      { code: 'PERM_EARLY_LEAVE' },
      {
        code: 'PERM_EARLY_LEAVE',
        name: 'Early Leave Permission',
        description: 'Permission to leave early',
        permissionType: 'early_leave',
        maxDurationMinutes: 120,
        countsAsPaidTime: false,
        impactsOvertimeCalculation: true,
        isActive: true,
      },
      { upsert: true, new: true },
    );
    console.log('✅ Created/Updated: Permission Rule - Early Leave\n');

    const permissionRuleLateArrival = await permissionRuleModel.findOneAndUpdate(
      { code: 'PERM_LATE_ARRIVAL' },
      {
        code: 'PERM_LATE_ARRIVAL',
        name: 'Late Arrival Permission',
        description: 'Permission to arrive late',
        permissionType: 'late_arrival',
        maxDurationMinutes: 120,
        countsAsPaidTime: false,
        impactsOvertimeCalculation: false,
        isActive: true,
      },
      { upsert: true, new: true },
    );
    console.log('✅ Created/Updated: Permission Rule - Late Arrival\n');

    // 5. Create Scheduling Rules
    console.log('📅 Creating scheduling rules...');
    
    const schedulingRuleFlex = await schedulingRuleModel.findOneAndUpdate(
      { code: 'FLEX_SCHEDULE' },
      {
        code: 'FLEX_SCHEDULE',
        name: 'Flexible Schedule',
        description: 'Flexible working hours schedule',
        ruleType: 'flex',
        maxWeeklyHours: 40,
        minWeeklyHours: 30,
        weeklyPattern: [
          { dayOfWeek: 1, shiftTypeId: shiftTypeNormal._id },
          { dayOfWeek: 2, shiftTypeId: shiftTypeNormal._id },
          { dayOfWeek: 3, shiftTypeId: shiftTypeNormal._id },
          { dayOfWeek: 4, shiftTypeId: shiftTypeNormal._id },
          { dayOfWeek: 5, shiftTypeId: shiftTypeNormal._id },
        ],
        isActive: true,
      },
      { upsert: true, new: true },
    );
    console.log('✅ Created/Updated: Scheduling Rule - Flexible\n');

    const schedulingRuleFixed = await schedulingRuleModel.findOneAndUpdate(
      { code: 'FIXED_SCHEDULE' },
      {
        code: 'FIXED_SCHEDULE',
        name: 'Fixed Schedule',
        description: 'Fixed working hours schedule',
        ruleType: 'fixed',
        maxWeeklyHours: 40,
        minWeeklyHours: 40,
        weeklyPattern: [
          { dayOfWeek: 1, shiftTypeId: shiftTypeNormal._id },
          { dayOfWeek: 2, shiftTypeId: shiftTypeNormal._id },
          { dayOfWeek: 3, shiftTypeId: shiftTypeNormal._id },
          { dayOfWeek: 4, shiftTypeId: shiftTypeNormal._id },
          { dayOfWeek: 5, shiftTypeId: shiftTypeNormal._id },
        ],
        isActive: true,
      },
      { upsert: true, new: true },
    );
    console.log('✅ Created/Updated: Scheduling Rule - Fixed\n');

    // 6. Create Organization Calendar Days
    console.log('📆 Creating organization calendar...');
    
    // Create a national holiday
    const publicHoliday = await organizationCalendarModel.findOneAndUpdate(
      { date: new Date('2025-10-06') },
      {
        date: new Date('2025-10-06'),
        type: 'national_holiday',
        description: 'Armed Forces Day - National holiday',
        isPaidHoliday: true,
        isLeaveBlocked: false,
      },
      { upsert: true, new: true },
    );
    console.log('✅ Created/Updated: Organization Calendar - National Holiday\n');

    // Create a company holiday
    const companyHoliday = await organizationCalendarModel.findOneAndUpdate(
      { date: new Date('2025-12-25') },
      {
        date: new Date('2025-12-25'),
        type: 'company_holiday',
        description: 'Company Holiday - Christmas',
        isPaidHoliday: true,
        isLeaveBlocked: true,
      },
      { upsert: true, new: true },
    );
    console.log('✅ Created/Updated: Organization Calendar - Company Holiday\n');

    // 7. Create Rest Day Configurations
    // Note: These require employee IDs (we don't create employees here)
    console.log('🏖️ Creating rest day configurations...');
    console.log('   Note: Rest day configs require existing employee IDs.\n');
    console.log('   To create rest day configs, use the RestDayConfig model with valid employee ObjectIds.\n');

    // 8. Create Shift Assignments
    // Note: These require employee IDs (we don't create employees here)
    console.log('👔 Creating shift assignments...');
    console.log('   Note: Shift assignments require existing employee IDs.\n');
    console.log('   To create shift assignments, use the ShiftAssignment model with valid employee ObjectIds.\n');

    // 9. Create Attendance Records
    // Note: These require employee IDs (we don't create employees here)
    console.log('📝 Creating attendance records...');
    console.log('   Note: Attendance records require existing employee IDs.\n');
    console.log('   To create attendance records, use the AttendanceRecord model with valid employee ObjectIds.\n');

    // 10. Create Time Exception Requests
    // Note: These require employee IDs (we don't create employees here)
    console.log('⏳ Creating time exception requests...');
    console.log('   Note: Time exception requests require existing employee IDs.\n');
    console.log('   To create time exception requests, use the TimeExceptionRequest model with valid employee ObjectIds.\n');

    // 11. Create Attendance Correction Requests
    // Note: These require employee IDs and attendance record IDs
    console.log('✏️ Creating attendance correction requests...');
    console.log('   Note: Attendance correction requests require existing employee IDs and attendance record IDs.\n');
    console.log('   To create correction requests, use the AttendanceCorrectionRequest model with valid IDs.\n');

    // 12. Create Integration Sync Logs
    // Note: These require sourceRecordId (attendance record or time exception request ID)
    console.log('🔄 Creating integration sync logs...');
    console.log('   Note: Integration sync logs require existing source record IDs.\n');
    console.log('   To create sync logs, use the IntegrationSyncLog model with valid sourceRecordId.\n');

    console.log('🎉 Time Management database seeding completed successfully!\n');
    console.log('📋 Summary:');
    console.log('   - 3 Shift Types created');
    console.log('   - 3 Overtime Rules created');
    console.log('   - 2 Lateness Rules created');
    console.log('   - 2 Permission Rules created');
    console.log('   - 2 Scheduling Rules created');
    console.log('   - 2 Organization Calendar Days created');
    console.log('   - Integration Sync Logs should be created when source records exist');
    console.log('   - Employee-dependent data (Rest Day Configs, Shift Assignments, Attendance Records, etc.)');
    console.log('     should be created separately when employees exist\n');
    console.log('💡 Note: This seed script only creates data from Time Management schemas.');
    console.log('   Other data (employees, etc.) should be seeded separately.\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
  } finally {
    await app.close();
  }
}

seedDatabase();
