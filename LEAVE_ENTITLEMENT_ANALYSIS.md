# Leave Entitlement & Balance Calculation Analysis

## Overview
This document analyzes the backend logic for leave entitlements, accruals, rounding, and balance calculations, identifying issues and providing a happy path test scenario.

---

## Current Implementation Analysis

### 1. **Leave Entitlement Schema Fields**

```typescript
yearlyEntitlement: number      // Total entitlement per year (base)
accruedActual: number          // Accrued before rounding (precise)
accruedRounded: number         // Rounded accrued value (for UI/usage)
carryForward: number           // Carried forward from last cycle
taken: number                  // Approved & consumed leave
pending: number                // Pending approval
remaining: number              // Available balance
```

### 2. **Key Operations & Issues**

#### ❌ **Issue 1: Inconsistent Remaining Balance Calculation**

The `remaining` field is maintained through manual increments/decrements, but the calculation logic is inconsistent:

**Current Logic:**
- **Accrual** (`autoAccrueLeave`): `remaining += roundedAmount` ✅
- **Leave Request Finalized** (`finalizeApprovedLeaveRequest`): `remaining -= durationDays` ✅
- **Reset** (`resetLeaveBalancesForNewYear`): `newRemaining = yearlyEntitlement - taken` ❌ **WRONG** - doesn't account for accrued
- **Adjustment** (`adjustAccrual`): `remaining = yearlyEntitlement - taken + accruedActual` ❌ **INCONSISTENT** - uses `accruedActual` instead of `accruedRounded`

**Expected Formula:**
```
remaining = accruedRounded + carryForward - taken - pending
```

**Problem:** The system doesn't recalculate `remaining` from the formula. It relies on manual increments/decrements, which can lead to inconsistencies if any operation fails or is skipped.

---

#### ❌ **Issue 2: Carry-Forward Logic**

**In `runCarryForward`:**
```typescript
carryForwardAmount = Math.min(entitlement.remaining, 10); // Hardcoded 10!
$set: { carryForward: carryForwardAmount },
$inc: { remaining: -carryForwardAmount }
```
- Hardcoded max carry-forward of 10 days (should use `maxCarryForward` from policy)
- Decrements `remaining` when setting carry-forward

**In `resetLeaveBalancesForNewYear`:**
```typescript
newRemaining = yearlyEntitlement - taken;
if (carryForwardAllowed && carryForward > 0) {
  newRemaining += carryForward;
}
```
- Adds `carryForward` to `newRemaining`
- **BUT:** Doesn't reset `carryForward` to 0 after using it
- **AND:** Doesn't account for `accruedRounded` in the reset calculation

**Problem:** After reset, `carryForward` should be set to 0, and the reset should properly account for accrued days.

---

#### ❌ **Issue 3: Missing Eligibility Validation**

The `LeavePolicy` has an `eligibility` field:
```typescript
eligibility: {
  minTenureMonths: Number,
  positionsAllowed: [String],
  contractTypesAllowed: [String]
}
```

**Problem:** There's no validation logic that:
- Checks `minTenureMonths` when creating entitlements
- Validates `positionsAllowed` or `contractTypesAllowed` when assigning entitlements
- Prevents accrual for ineligible employees

---

#### ❌ **Issue 4: Missing Unpaid Leave/Suspension Check (BR 11)**

**Business Rule 11:** "Accrual must pause during unpaid leave or suspension"

**Problem:** The `autoAccrueLeave` and `autoAccrueAllEmployees` methods don't check if the employee is on unpaid leave or suspended before accruing.

**Solution Needed:** Check employee status before accruing.

---

#### ⚠️ **Issue 5: Reset Logic Doesn't Account for Accrued Days**

**In `resetLeaveBalancesForNewYear`:**
```typescript
newRemaining = yearlyEntitlement - taken; // ❌ Ignores accruedRounded
```

**Problem:** After reset, the employee should start with their `yearlyEntitlement`, but any accrued days from the previous cycle should be considered. The current logic doesn't account for `accruedRounded`.

**Expected:**
```typescript
// Reset accrued counters, but keep taken/pending
newRemaining = yearlyEntitlement - taken - pending;
if (carryForwardAllowed && carryForward > 0) {
  newRemaining += carryForward;
}
// Reset accruedActual and accruedRounded to 0
// Reset carryForward to 0 after using it
```

---

## Happy Path Test Scenario

### Setup Steps

1. **Create Leave Category**
   ```
   POST /leaves/categories
   {
     "name": "Paid Leave",
     "description": "Leave types that deduct from annual balance"
   }
   ```

2. **Create Leave Type (Annual Leave)**
   ```
   POST /leaves/types
   {
     "name": "Annual Leave",
     "code": "ANNUAL",
     "categoryId": "<category_id>",
     "description": "Annual vacation leave"
   }
   ```

3. **Create Leave Policy**
   ```
   POST /leaves/policies
   {
     "leaveTypeId": "<leave_type_id>",
     "accrualMethod": "monthly",
     "monthlyRate": 1.25,        // 15 days per year = 1.25 per month
     "yearlyRate": 15,
     "carryForwardAllowed": true,
     "maxCarryForward": 5,        // Max 5 days can be carried forward
     "roundingRule": "round",      // Round to nearest integer
     "minNoticeDays": 7,
     "maxConsecutiveDays": 30,
     "eligibility": {
       "minTenureMonths": 3,      // Must work 3 months before eligible
       "positionsAllowed": ["Full-Time", "Part-Time"],
       "contractTypesAllowed": ["Permanent", "Contract"]
     }
   }
   ```

4. **Create Employee Entitlement**
   ```
   POST /leaves/entitlements
   {
     "employeeId": "<employee_id>",
     "leaveTypeId": "<leave_type_id>",
     "yearlyEntitlement": 15,
     "accruedActual": 0,
     "accruedRounded": 0,
     "carryForward": 0,
     "taken": 0,
     "pending": 0,
     "remaining": 0
   }
   ```

### Test Flow

#### **Month 1: Initial Accrual (After 3 months tenure)**

**Action:** Run monthly accrual
```
POST /leaves/accruals/auto
{
  "leaveTypeId": "<leave_type_id>",
  "accrualAmount": 1.25,
  "accrualType": "monthly"
}
```

**Expected Result:**
```
{
  employeeId: "<employee_id>",
  previousBalance: 0,
  newBalance: 1,              // 1.25 rounded to 1
  accrualAmount: 1.25
}
```

**Entitlement State:**
```
yearlyEntitlement: 15
accruedActual: 1.25
accruedRounded: 1
carryForward: 0
taken: 0
pending: 0
remaining: 1                  // ✅ Should be 1 (rounded)
```

---

#### **Month 2: Second Accrual**

**Action:** Run monthly accrual again
```
POST /leaves/accruals/auto
{
  "leaveTypeId": "<leave_type_id>",
  "accrualAmount": 1.25,
  "accrualType": "monthly"
}
```

**Expected Result:**
```
{
  employeeId: "<employee_id>",
  previousBalance: 1,
  newBalance: 3,              // 1.25 + 1.25 = 2.5, rounded to 3
  accrualAmount: 1.25
}
```

**Entitlement State:**
```
yearlyEntitlement: 15
accruedActual: 2.5            // 1.25 + 1.25
accruedRounded: 3              // 2.5 rounded to 3
carryForward: 0
taken: 0
pending: 0
remaining: 3                  // ✅ Should be 3
```

---

#### **Month 3: Request Leave (5 days)**

**Action:** Create leave request
```
POST /leaves/requests
{
  "employeeId": "<employee_id>",
  "leaveTypeId": "<leave_type_id>",
  "startDate": "2025-03-15",
  "endDate": "2025-03-19",
  "justification": "Vacation"
}
```

**Expected Result:** Request created with status `PENDING`

**Entitlement State (After Request Created):**
```
yearlyEntitlement: 15
accruedActual: 3.75           // 1.25 * 3 months
accruedRounded: 4              // 3.75 rounded to 4
carryForward: 0
taken: 0
pending: 5                     // ✅ 5 days pending
remaining: -1                  // ⚠️ ISSUE: Should be 4 - 5 = -1 (negative allowed for pending)
```

**Note:** The system should allow negative `remaining` when there's `pending`, but the actual deduction happens only when approved.

---

#### **Month 3: Approve Leave Request**

**Action:** Approve the leave request
```
POST /leaves/requests/<request_id>/approve
{
  "approvedBy": "<manager_id>",
  "comments": "Approved"
}
```

**Expected Result:** Request status changes to `APPROVED` and is finalized

**Entitlement State (After Approval):**
```
yearlyEntitlement: 15
accruedActual: 3.75
accruedRounded: 4
carryForward: 0
taken: 5                       // ✅ 5 days taken
pending: 0                     // ✅ Pending cleared
remaining: -1                  // ⚠️ ISSUE: Should be 4 - 5 = -1
```

**Problem:** The employee has taken more than they've accrued. This should be allowed if the policy allows it, but the system should track this properly.

---

#### **Month 4: Fourth Accrual**

**Action:** Run monthly accrual
```
POST /leaves/accruals/auto
{
  "leaveTypeId": "<leave_type_id>",
  "accrualAmount": 1.25,
  "accrualType": "monthly"
}
```

**Expected Result:**
```
{
  employeeId: "<employee_id>",
  previousBalance: -1,
  newBalance: 0,               // -1 + 1.25 = 0.25, rounded to 0
  accrualAmount: 1.25
}
```

**Entitlement State:**
```
yearlyEntitlement: 15
accruedActual: 5.0             // 3.75 + 1.25
accruedRounded: 5              // 5.0 rounded to 5
carryForward: 0
taken: 5
pending: 0
remaining: 0                  // ✅ Should be 5 - 5 = 0
```

---

#### **End of Year: Carry-Forward**

**Action:** Run carry-forward before reset
```
POST /leaves/carry-forward
{
  "leaveTypeId": "<leave_type_id>",
  "asOfDate": "2025-12-31"
}
```

**Expected Result:**
```
{
  employeeId: "<employee_id>",
  carryForwardAmount: 0,       // remaining is 0, so no carry-forward
  newBalance: 0
}
```

**If remaining was 3:**
```
carryForwardAmount: 3,         // min(3, maxCarryForward=5) = 3
newBalance: 0                  // 3 - 3 = 0
```

**Entitlement State:**
```
yearlyEntitlement: 15
accruedActual: 15.0            // Full year accrued
accruedRounded: 15
carryForward: 3                // ✅ 3 days carried forward
taken: 12                      // Used 12 days
pending: 0
remaining: 0                   // ✅ 3 - 3 = 0 (carry-forward moved)
```

---

#### **New Year: Reset**

**Action:** Reset leave balances
```
POST /leaves/reset
{
  "criterion": "HIRE_DATE"
}
```

**Expected Result:** All entitlements reset based on hire date

**Entitlement State (After Reset):**
```
yearlyEntitlement: 15
accruedActual: 0               // ✅ Reset to 0
accruedRounded: 0              // ✅ Reset to 0
carryForward: 0                // ⚠️ ISSUE: Should be reset to 0 after using it
taken: 0                       // ✅ Reset to 0 (or keep if tracking history)
pending: 0
remaining: 15                  // ⚠️ ISSUE: Should be 15 + 3 (carryForward) = 18, but carryForward was already used
```

**Problem:** The reset logic doesn't properly handle carry-forward. It should:
1. Add `carryForward` to `remaining` (if allowed)
2. Reset `carryForward` to 0
3. Reset `accruedActual` and `accruedRounded` to 0
4. Reset `taken` to 0 (or keep for history tracking)

---

## Recommended Fixes

### Fix 1: Standardize Remaining Balance Calculation

**Add a helper method:**
```typescript
private calculateRemaining(entitlement: LeaveEntitlementDocument): number {
  return entitlement.accruedRounded + entitlement.carryForward 
         - entitlement.taken - entitlement.pending;
}
```

**Use it after every operation that affects balance:**
```typescript
// After accrual
entitlement.remaining = this.calculateRemaining(entitlement);

// After leave finalized
entitlement.remaining = this.calculateRemaining(entitlement);

// After reset
entitlement.remaining = this.calculateRemaining(entitlement);
```

### Fix 2: Fix Carry-Forward Logic

**In `runCarryForward`:**
```typescript
const leavePolicy = await this.leavePolicyModel
  .findOne({ leaveTypeId: entitlement.leaveTypeId })
  .exec();
const maxCarryForward = leavePolicy?.maxCarryForward || 0;
const carryForwardAmount = Math.min(entitlement.remaining, maxCarryForward);
```

**In `resetLeaveBalancesForNewYear`:**
```typescript
// Add carry-forward to remaining (if allowed)
if (leavePolicy?.carryForwardAllowed && entitlement.carryForward > 0) {
  newRemaining += entitlement.carryForward;
}

// Reset carry-forward to 0 after using it
await this.updateLeaveEntitlement(entitlement._id.toString(), {
  remaining: newRemaining,
  accruedActual: 0,
  accruedRounded: 0,
  carryForward: 0,  // ✅ Reset to 0
  taken: 0,
  pending: 0,
  lastAccrualDate: new Date(),
  nextResetDate: nextReset,
});
```

### Fix 3: Add Eligibility Validation

**Before creating entitlement:**
```typescript
async createLeaveEntitlement(dto: CreateLeaveEntitlementDto): Promise<LeaveEntitlementDocument> {
  // Get policy
  const policy = await this.leavePolicyModel
    .findOne({ leaveTypeId: dto.leaveTypeId })
    .exec();
  
  if (!policy) {
    throw new Error('Leave policy not found');
  }
  
  // Get employee
  const employee = await this.employeeProfileModel
    .findById(dto.employeeId)
    .exec();
  
  if (!employee) {
    throw new Error('Employee not found');
  }
  
  // Check eligibility
  const monthsWorked = this.calculateMonthsWorked(
    new Date(employee.dateOfHire),
    new Date()
  );
  
  if (policy.eligibility?.minTenureMonths && monthsWorked < policy.eligibility.minTenureMonths) {
    throw new Error(`Employee must work at least ${policy.eligibility.minTenureMonths} months`);
  }
  
  // Check position and contract type...
  
  // Create entitlement...
}
```

### Fix 4: Add Unpaid Leave Check (BR 11)

**Before accruing:**
```typescript
async autoAccrueLeave(...): Promise<any> {
  // Check if employee is on unpaid leave or suspended
  const employee = await this.employeeProfileModel.findById(employeeId).exec();
  
  // Check for unpaid leave requests
  const unpaidLeave = await this.leaveRequestModel.findOne({
    employeeId: new Types.ObjectId(employeeId),
    leaveTypeId: new Types.ObjectId(leaveTypeId),
    status: LeaveStatus.APPROVED,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
    // Assuming unpaid leave has a flag or specific type
  }).exec();
  
  if (unpaidLeave || employee.status === 'SUSPENDED') {
    // Skip accrual
    return {
      success: false,
      reason: 'Employee on unpaid leave or suspended',
      ...
    };
  }
  
  // Proceed with accrual...
}
```

---

## Summary

### ✅ **What Works:**
- Accrual logic with rounding
- Leave request approval and finalization
- Basic carry-forward mechanism

### ❌ **What Needs Fixing:**
1. Inconsistent `remaining` balance calculation
2. Carry-forward not using policy `maxCarryForward`
3. Reset logic doesn't properly handle carry-forward
4. Missing eligibility validation
5. Missing unpaid leave/suspension check (BR 11)
6. Reset doesn't account for accrued days properly

### 📋 **Next Steps:**
1. Implement standardized `calculateRemaining()` helper
2. Fix carry-forward logic to use policy settings
3. Fix reset logic to properly handle all fields
4. Add eligibility validation
5. Add unpaid leave/suspension check
6. Add comprehensive unit tests for all scenarios

