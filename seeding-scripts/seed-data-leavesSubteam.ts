/* eslint-disable @typescript-eslint/no-unused-vars */

// seeding-scripts/seed-data-leavesSubteam.ts  (for example)

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

/* -------- Leaves schemas (this subsystem) -------- */
import { LeaveType } from '../src/leaves-management/schemas/leave-type.schema';
import { LeavePackage } from '../src/leaves-management/schemas/leave-package.schema';
import { LeaveBalance } from '../src/leaves-management/schemas/leave-balance.schema';
import { LeavePolicyConfig } from '../src/leaves-management/schemas/leave-policy-config.schema';
import {
  HolidayCalendar,
  LeaveBlockedPeriod,
} from '../src/leaves-management/schemas/holiday-calendar.schema';
import {
  LeaveRequest,
  LeaveRequestChange,
} from '../src/leaves-management/schemas/leave-request.schema';
import { LeaveAdjustmentLog } from '../src/leaves-management/schemas/leave-adjustment-log.schema';
import { ApprovalDelegation } from '../src/leaves-management/schemas/approval-delegation.schema';
import { EmployeeEntitlementOverride } from '../src/leaves-management/schemas/employee-leave-entitlement-override.schema';
import { LeavePatternFlag } from '../src/leaves-management/schemas/leave-pattern-flag.schema';
import { LeaveBulkOperation } from '../src/leaves-management/schemas/leave-bulk-operation.schema';
import { LeaveRequestHistory } from '../src/leaves-management/schemas/leave-request-history.schema';

import {
  LeaveCategory,
  AccrualFrequency,
  RoundingMethod,
  AdjustmentSource,
  IrregularPatternType,
  PatternFlagStatus,
  BulkOperationType,
  BulkOperationStatus,
  LeaveRequestStatus,
  ApprovalWorkflow,
  ResetCriterion,
} from '../src/leaves-management/schemas/leaves.enums';

async function seedLeaves() {
  console.log('🌱 Starting Leaves subsystem seed WITH cross-subsystem refs...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  // ---- External models from other subsystems ----
  const employeeModel = app.get<Model<any>>(getModelToken('Employee')); // employees collection
  // Optional: time management attendance records (if they exist)
  let attendanceModel: Model<any> | null = null;
  try {
    attendanceModel = app.get<Model<any>>(getModelToken('AttendanceRecord'));
  } catch {
    attendanceModel = null;
  }

  // ---- Leaves models ----
  const leaveTypeModel = app.get<Model<LeaveType>>(getModelToken(LeaveType.name));
  const leavePackageModel = app.get<Model<LeavePackage>>(getModelToken(LeavePackage.name));
  const leaveBalanceModel = app.get<Model<LeaveBalance>>(getModelToken(LeaveBalance.name));
  const leavePolicyModel = app.get<Model<LeavePolicyConfig>>(getModelToken(LeavePolicyConfig.name));
  const holidayModel = app.get<Model<HolidayCalendar>>(getModelToken(HolidayCalendar.name));
  const blockedPeriodModel = app.get<Model<LeaveBlockedPeriod>>(getModelToken(LeaveBlockedPeriod.name));
  const leaveReqModel = app.get<Model<LeaveRequest>>(getModelToken(LeaveRequest.name));
  const adjustLogModel = app.get<Model<LeaveAdjustmentLog>>(getModelToken(LeaveAdjustmentLog.name));
  const delegationModel = app.get<Model<ApprovalDelegation>>(getModelToken(ApprovalDelegation.name));
  const overrideModel = app.get<Model<EmployeeEntitlementOverride>>(
    getModelToken(EmployeeEntitlementOverride.name),
  );
  const patternFlagModel = app.get<Model<LeavePatternFlag>>(getModelToken(LeavePatternFlag.name));
  const bulkOpModel = app.get<Model<LeaveBulkOperation>>(getModelToken(LeaveBulkOperation.name));
  const requestHistoryModel = app.get<Model<LeaveRequestHistory>>(
    getModelToken(LeaveRequestHistory.name),
  );

  try {
    /* ========= 1. Load existing employees from Employee subsystem ========= */
    console.log('👤 Fetching employees from Employee subsystem...');

    const employees = await employeeModel.find().limit(3).exec();
    if (!employees.length) {
      throw new Error(
        'No employees found in DB. Seed Employee/Org-Structure subsystem first.',
      );
    }

    const emp1 = employees[0]; // main employee
    const emp2 = employees[1] ?? emp1; // manager
    const emp3 = employees[2] ?? emp1; // HR/admin

    const emp1DeptId = emp1.departmentId;
    const emp1PosId = emp1.positionId;

    console.log(
      `✅ Using employees: ${employees
        .map((e) => e.employeeId || e._id.toString())
        .join(', ')}`,
    );

    // Optional: real AttendanceRecord
    let attendanceRecordId: any = undefined;
    if (attendanceModel) {
      const att = await attendanceModel.findOne().exec();
      if (att) {
        attendanceRecordId = att._id;
        console.log('✅ Using existing AttendanceRecord for timeManagementEventId');
      } else {
        console.log('ℹ No AttendanceRecord found, timeManagementEventId will be empty.');
      }
    }

    /* ========= 2. Clear leaves collections ========= */
    console.log('🧹 Clearing leaves collections...');

    await Promise.all([
      leaveTypeModel.deleteMany({}),
      leavePackageModel.deleteMany({}),
      leaveBalanceModel.deleteMany({}),
      leavePolicyModel.deleteMany({}),
      holidayModel.deleteMany({}),
      blockedPeriodModel.deleteMany({}),
      leaveReqModel.deleteMany({}),
      adjustLogModel.deleteMany({}),
      delegationModel.deleteMany({}),
      overrideModel.deleteMany({}),
      patternFlagModel.deleteMany({}),
      bulkOpModel.deleteMany({}),
      requestHistoryModel.deleteMany({}),
    ]);

    console.log('✅ Collections cleared.\n');

    /* ===============================
           LEAVE TYPES
       ===============================*/
    console.log('📄 Creating LeaveType docs...');

    const type1 = await leaveTypeModel.create({
      code: 'ANL',
      name: 'Annual Leave',
      category: LeaveCategory.ANNUAL,
      affectsAnnualBalance: true,
      paid: true,
      maxContinuousDays: 30,
      minNoticeDays: 2,
      approvalWorkflow: ApprovalWorkflow.MANAGER_THEN_HR,
      requiresDocument: false,
      isActive: true,
      // schema requires ObjectId refs to Employee
      contractType: emp1._id,
      hireDate: emp1._id,
    });

    const type2 = await leaveTypeModel.create({
      code: 'SL',
      name: 'Sick Leave',
      category: LeaveCategory.SICK,
      affectsAnnualBalance: false,
      paid: true,
      minNoticeDays: 0,
      approvalWorkflow: ApprovalWorkflow.MANAGER_THEN_HR,
      requiresDocument: true,
      requiresDocumentAfterDays: 2,
      isActive: true,
      contractType: emp1._id,
      hireDate: emp1._id,
    });

    console.log('✅ LeaveType: ANL, SL created.\n');

    /* ===============================
           LEAVE PACKAGE
       ===============================*/
    console.log('📦 Creating LeavePackage...');

    const leavePackage = await leavePackageModel.create({
      code: 'BASIC',
      name: 'Basic Leave Package',
      description: 'Minimal package for demo (annual + sick).',
      country: 'EG',
      entitlements: [
        {
          leaveType: type1._id,
          daysPerYear: 21,
          accrualFrequency: AccrualFrequency.MONTHLY,
          roundingMethod: RoundingMethod.ARITHMETIC,
        },
        {
          leaveType: type2._id,
          daysPerYear: 10,
          accrualFrequency: AccrualFrequency.MONTHLY,
          roundingMethod: RoundingMethod.ARITHMETIC,
        },
      ],
    });

    console.log('✅ LeavePackage: BASIC created.\n');

    /* ===============================
           HOLIDAY CALENDAR
       ===============================*/
    console.log('📅 Creating HolidayCalendar...');

    await holidayModel.create({
      date: new Date('2025-01-01'),
      name: 'New Year',
      isCompanySpecific: false,
      isFullDay: true,
      countryCode: 'EG',
      notes: 'Dummy holiday',
    });

    console.log('✅ HolidayCalendar created.\n');

    /* ===============================
           BLOCKED PERIOD
       ===============================*/
    console.log('🚫 Creating LeaveBlockedPeriod...');

    await blockedPeriodModel.create({
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-05'),
      reason: 'System maintenance window',
      leaveTypeCodes: ['ANL'],
    });

    console.log('✅ LeaveBlockedPeriod created.\n');

    /* ===============================
           POLICY CONFIG
       ===============================*/
    console.log('⚙ Creating LeavePolicyConfig...');

    await leavePolicyModel.create({
      defaultAccrualFrequency: AccrualFrequency.MONTHLY,
      defaultRoundingMethod: RoundingMethod.ARITHMETIC,
      resetCriterion: ResetCriterion.HIRE_DATE,
      defaultMaxCarryForwardDays: 45,
      defaultCarryForwardExpiryYears: 2,
      allowNegativeBalance: false,
      postLeaveRequestMaxDays: 7,
      escalationHoursForPendingRequests: 48,
      enableBlockedPeriods: true,
      lastEntitlementCalculationDate: new Date(),
      entitlementCalculationSchedule: '0 0 1 * *',
      isInitialized: true,
    });

    console.log('✅ LeavePolicyConfig created.\n');

    /* ===============================
           LEAVE BALANCE
       ===============================*/
    console.log('📊 Creating LeaveBalance...');

    await leaveBalanceModel.create({
      employeeId: emp1._id,
      departmentId: emp1DeptId,
      positionId: emp1PosId,
      leaveType: type1._id,
      leavePackage: leavePackage._id,
      leaveYear: 2025,
      accruedActual: 5,
      accruedRounded: 5,
      takenActual: 1,
      takenRounded: 1,
      remainingActual: 4,
      remainingRounded: 4,
      lockedForYearEnd: false,
    });

    console.log('✅ LeaveBalance created for main employee.\n');

    /* ===============================
           LEAVE REQUEST
       ===============================*/
    console.log('📝 Creating LeaveRequest...');

    const req = await leaveReqModel.create({
      employeeId: emp1._id,
      departmentId: emp1DeptId,
      positionId: emp1PosId,
      leaveType: type1._id,
      startDate: new Date('2025-03-10'),
      endDate: new Date('2025-03-12'),
      totalCalendarDays: 3,
      totalWorkingDays: 3,
      isPostLeaveRequest: false,
      justification: 'Dummy annual leave for testing.',
      attachmentUrls: [],
      status: LeaveRequestStatus.PENDING_MANAGER,
      managerId: emp2._id,
      hrAdminId: emp3._id,
      escalated: false,
      cancelledByEmployee: false,
      overlapsWithExistingApproved: false,
      convertedExcessToUnpaid: false,
      excessDaysConvertedToUnpaid: 0,
      timeManagementEventId: attendanceRecordId, // real AttendanceRecord or undefined
      employmentStatus: emp1._id,
      requiresDocumentVerification: false,
      documentVerified: false,
      version: 1,
      changeHistory: [] as LeaveRequestChange[],
    });

    console.log('✅ LeaveRequest created.\n');

    /* ===============================
           REQUEST HISTORY
       ===============================*/
    console.log('📚 Creating LeaveRequestHistory...');

    await requestHistoryModel.create({
      requestId: req._id,
      version: 1,
      modifiedBy: emp2.employeeId || emp2._id.toString(),
      changes: [
        {
          field: 'status',
          oldValue: LeaveRequestStatus.DRAFT,
          newValue: LeaveRequestStatus.PENDING_MANAGER,
        },
      ],
      modificationReason: 'Initial submission (dummy).',
      previousStatus: LeaveRequestStatus.DRAFT,
      newStatus: LeaveRequestStatus.PENDING_MANAGER,
    });

    console.log('✅ LeaveRequestHistory created.\n');

    /* ===============================
           ADJUSTMENT LOG
       ===============================*/
    console.log('📘 Creating LeaveAdjustmentLog...');

    await adjustLogModel.create({
      employeeId: emp1._id,
      leaveType: type1._id,
      source: AdjustmentSource.MANUAL,
      leaveYear: 2025,
      amountActual: -1,
      amountRounded: -1,
      balanceAfterActual: 4,
      balanceAfterRounded: 4,
      relatedRequestId: req._id,
      performedByUserId: emp3._id,
      reason: 'Dummy manual adjustment for testing.',
    });

    console.log('✅ LeaveAdjustmentLog created.\n');

    /* ===============================
           APPROVAL DELEGATION
       ===============================*/
    console.log('👥 Creating ApprovalDelegation...');

    await delegationModel.create({
      managerId: emp2._id,
      delegateId: emp3._id,
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-02-28'),
      active: true,
    });

    console.log('✅ ApprovalDelegation created.\n');

    /* ===============================
           ENTITLEMENT OVERRIDE
       ===============================*/
    console.log('🎯 Creating EmployeeEntitlementOverride...');

    await overrideModel.create({
      employeeId: emp1._id,
      leaveType: type1._id,
      leavePackage: leavePackage._id,
      daysPerYearOverride: 25,
      effectiveFrom: new Date('2025-01-01'),
      reason: 'Dummy override for testing.',
      createdByUserId: emp3._id,
    });

    console.log('✅ EmployeeEntitlementOverride created.\n');

    /* ===============================
           PATTERN FLAG
       ===============================*/
    console.log('🚩 Creating LeavePatternFlag...');

    await patternFlagModel.create({
      employeeId: emp1._id,
      managerId: emp2._id,
      departmentId: emp1DeptId,
      positionId: emp1PosId,
      relatedRequests: [req._id],
      patternType: IrregularPatternType.FREQUENT_SHORT_LEAVES,
      reason: 'Dummy flag – frequent short leaves.',
      status: PatternFlagStatus.OPEN,
      resolutionNotes: '',
    });

    console.log('✅ LeavePatternFlag created.\n');

    /* ===============================
           BULK OPERATION
       ===============================*/
    console.log('📦 Creating LeaveBulkOperation...');

    await bulkOpModel.create({
      initiatedByUserId: emp3._id,
      type: BulkOperationType.APPROVE,
      requestIds: [req._id],
      status: BulkOperationStatus.PENDING,
      totalCount: 1,
      successCount: 0,
      failureCount: 0,
      failureReasons: [],
      filterDescription: 'Dummy bulk approve for testing.',
    });

    console.log('✅ LeaveBulkOperation created.\n');

    console.log(
      '🎉 Leaves subsystem seeding completed WITH real cross-subsystem references.',
    );
  } catch (err) {
    console.error('❌ Error seeding leaves data:', err);
  } finally {
    await app.close();
  }
}

seedLeaves();