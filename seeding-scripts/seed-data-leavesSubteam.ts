/* eslint-disable @typescript-eslint/no-unused-vars */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

/* Import your leaves schemas */
import { LeaveType } from '../src/leaves-management/schemas/leave-type.schema';
import { LeavePackage } from '../src/leaves-management/schemas/leave-package.schema';
import { LeaveBalance } from '../src/leaves-management/schemas/leave-balance.schema';
import { LeavePolicyConfig } from '../src/leaves-management/schemas/leave-policy-config.schema';
import { HolidayCalendar, LeaveBlockedPeriod } from '../src/leaves-management/schemas/holiday-calendar.schema';
import { LeaveRequest, LeaveRequestChange } from '../src/leaves-management/schemas/leave-request.schema';
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
} from '../src/leaves-management/schemas/leaves.enums';

async function seedLeaves() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const leaveTypeModel = app.get<Model<LeaveType>>(getModelToken(LeaveType.name));
  const leavePackageModel = app.get<Model<LeavePackage>>(getModelToken(LeavePackage.name));
  const leaveBalanceModel = app.get<Model<LeaveBalance>>(getModelToken(LeaveBalance.name));
  const leavePolicyModel = app.get<Model<LeavePolicyConfig>>(getModelToken(LeavePolicyConfig.name));
  const holidayModel = app.get<Model<HolidayCalendar>>(getModelToken(HolidayCalendar.name));
  const blockedPeriodModel = app.get<Model<LeaveBlockedPeriod>>(getModelToken(LeaveBlockedPeriod.name));
  const leaveReqModel = app.get<Model<LeaveRequest>>(getModelToken(LeaveRequest.name));
  const adjustLogModel = app.get<Model<LeaveAdjustmentLog>>(getModelToken(LeaveAdjustmentLog.name));
  const delegationModel = app.get<Model<ApprovalDelegation>>(getModelToken(ApprovalDelegation.name));
  const overrideModel = app.get<Model<EmployeeEntitlementOverride>>(getModelToken(EmployeeEntitlementOverride.name));
  const patternFlagModel = app.get<Model<LeavePatternFlag>>(getModelToken(LeavePatternFlag.name));
  const bulkOpModel = app.get<Model<LeaveBulkOperation>>(getModelToken(LeaveBulkOperation.name));
  const requestHistoryModel = app.get<Model<LeaveRequestHistory>>(getModelToken(LeaveRequestHistory.name));

  try {
    console.log('🧹 Clearing collections...');

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

    console.log('🌱 Seeding leaves dummy data...\n');

    /* ===============================
           LEAVE TYPES
       ===============================*/
    const type1 = await leaveTypeModel.create({
      name: 'Annual Leave',
      code: 'ANL',
      category: LeaveCategory.ANNUAL,
      isActive: true,
      paid: true,
      approvalWorkflow: 'MANAGER_THEN_HR',
      affectsAnnualBalance: true,
      minNoticeDays: 2,
      contractType: new Types.ObjectId(),
      hireDate: new Types.ObjectId(),
    });

    const type2 = await leaveTypeModel.create({
      name: 'Sick Leave',
      code: 'SL',
      category: LeaveCategory.SICK,
      isActive: true,
      paid: true,
      approvalWorkflow: 'MANAGER_THEN_HR',
      requiresDocument: true,
      contractType: new Types.ObjectId(),
      hireDate: new Types.ObjectId(),
    });

    /* ===============================
           LEAVE PACKAGE
       ===============================*/
    const leavePackage = await leavePackageModel.create({
      code: 'BASIC',
      name: 'Basic Leave Package',
      entitlements: [
        {
          leaveType: type1._id,
          daysPerYear: 21,
          accrualFrequency: AccrualFrequency.MONTHLY,
          roundingMethod: RoundingMethod.ARITHMETIC,
        },
      ],
    });

    /* ===============================
           HOLIDAY CALENDAR
       ===============================*/
    await holidayModel.create({
      name: 'New Year',
      date: new Date('2025-01-01'),
      isFullDay: true,
    });

    /* ===============================
           BLOCKED PERIOD
       ===============================*/
    await blockedPeriodModel.create({
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-05'),
      reason: 'System Maintenance',
      leaveTypeCodes: ['ANL'],
    });

    /* ===============================
           POLICY CONFIG
       ===============================*/
    await leavePolicyModel.create({
      defaultAccrualFrequency: AccrualFrequency.MONTHLY,
      defaultRoundingMethod: RoundingMethod.ARITHMETIC,
      resetCriterion: 'HIRE_DATE',
      allowNegativeBalance: false,
      isInitialized: true,
    });

    /* ===============================
           LEAVE BALANCE
       ===============================*/
    await leaveBalanceModel.create({
      employeeId: new Types.ObjectId(),
      leaveType: type1._id,
      leavePackage: leavePackage._id,
      leaveYear: 2025,
      accruedActual: 5,
      takenActual: 1,
      remainingActual: 4,
    });

    /* ===============================
           LEAVE REQUEST
       ===============================*/
    const req = await leaveReqModel.create({
      employeeId: new Types.ObjectId(),
      leaveType: type1._id,
      startDate: new Date('2025-03-10'),
      endDate: new Date('2025-03-12'),
      totalCalendarDays: 3,
      totalWorkingDays: 3,
      status: LeaveRequestStatus.PENDING_MANAGER,
      timeManagementEventId: new Types.ObjectId(),
      employmentStatus: new Types.ObjectId(),
    });

    /* ===============================
           REQUEST HISTORY
       ===============================*/
    await requestHistoryModel.create({
      requestId: req._id,
      version: 1,
      modifiedBy: 'system',
      changes: [{ field: 'status', oldValue: 'DRAFT', newValue: 'PENDING_MANAGER' }],
    });

    /* ===============================
           ADJUSTMENT LOG
       ===============================*/
    await adjustLogModel.create({
      employeeId: new Types.ObjectId(),
      leaveType: type1._id,
      source: AdjustmentSource.MANUAL,
      leaveYear: 2025,
      amountActual: -1,
      amountRounded: -1,
      balanceAfterActual: 4,
      balanceAfterRounded: 4,
    });

    /* ===============================
           APPROVAL DELEGATION
       ===============================*/
    await delegationModel.create({
      managerId: new Types.ObjectId(),
      delegateId: new Types.ObjectId(),
      startDate: new Date(),
      endDate: new Date(),
      active: true,
    });

    /* ===============================
           ENTITLEMENT OVERRIDE
       ===============================*/
    await overrideModel.create({
      employeeId: new Types.ObjectId(),
      leaveType: type1._id,
      leavePackage: leavePackage._id,
      daysPerYearOverride: 25,
    });

    /* ===============================
           PATTERN FLAG
       ===============================*/
    await patternFlagModel.create({
      employeeId: new Types.ObjectId(),
      managerId: new Types.ObjectId(),
      relatedRequests: [],
      patternType: IrregularPatternType.FREQUENT_SHORT_LEAVES,
      reason: 'Test flag',
      status: PatternFlagStatus.OPEN,
    });

    /* ===============================
           BULK OPERATION
       ===============================*/
    await bulkOpModel.create({
      initiatedByUserId: new Types.ObjectId(),
      type: BulkOperationType.APPROVE,
      requestIds: [req._id],
      status: BulkOperationStatus.PENDING,
      totalCount: 1,
    });

    console.log('🎉 Dummy leaves-only seeding completed.');

  } catch (err) {
    console.error(err);
  } finally {
    await app.close();
  }
}

seedLeaves();