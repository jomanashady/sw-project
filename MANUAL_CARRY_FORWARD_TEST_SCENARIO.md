# Manual Carry Forward Test Scenario

## Overview
This document provides a comprehensive test scenario to verify that manual carry forward works correctly. Carry forward moves unused leave days from the current period to the next period, respecting the maximum carry forward limit set in the leave policy.

## Prerequisites
1. **User Role**: HR Admin or HR Manager account
2. **Leave Policy**: A leave type with carry forward enabled and maxCarryForward limit set
3. **Test Employees**: Employees with existing leave entitlements and remaining balance
4. **Initial State**: Note employees' current leave balances before testing

## Understanding Carry Forward

### How It Works:
1. **Carry Forward Amount**: The system calculates `carryForwardAmount = min(remaining, maxCarryForward)`
2. **Update Process**: 
   - Sets `carryForward` field to the calculated amount
   - Decrements `remaining` by the carry forward amount
   - Recalculates `remaining` to ensure consistency
3. **Scope**: Can be run for:
   - All employees (leave employeeId empty)
   - Single employee (specify employeeId)
   - All employees for a specific leave type

### Key Fields:
- **remaining**: Current available balance
- **carryForward**: Days carried forward from previous period
- **maxCarryForward**: Maximum days allowed to carry forward (from policy)

---

## Test Scenario 1: Single Employee Carry Forward

### Step 1: Prepare Test Data
**Action**: Set up an employee with a known remaining balance.

**Test Data**:
- **Employee**: [Select test employee]
- **Leave Type**: Annual Leave (with carry forward enabled)
- **Initial Remaining Balance**: 15 days
- **Policy maxCarryForward**: 10 days

**Expected Result**: 
- Employee has 15 days remaining
- Policy allows max 10 days carry forward

**How to Check**:
- Navigate to employee's leave balance page
- Or use API: `GET /leaves/entitlement/{employeeId}/{leaveTypeId}`
- Check leave policy: `GET /leaves/policy` to verify `maxCarryForward` setting

---

### Step 2: Run Carry Forward for Single Employee
**Action**: Execute carry forward for the test employee.

**Test Data**:
- **Leave Type**: Annual Leave
- **Employee ID**: [Test employee ID]
- **As Of Date**: (Optional) Leave empty or set to today's date
- **Department ID**: (Optional) Leave empty

**Expected Behavior**:
1. System calculates: `carryForwardAmount = min(15, 10) = 10 days`
2. Updates entitlement:
   - `carryForward` = 10 days
   - `remaining` = 15 - 10 = 5 days
3. Recalculates `remaining` to ensure consistency
4. Success message displayed

**Verification**:
- Check response: `carryForwardAmount = 10`
- Check response: `newBalance = 5` (or recalculated value)
- Verify `carryForward` field is now 10
- Verify `remaining` decreased by 10 days
- Check that `remaining = accruedRounded + carryForward - taken - pending`

---

## Test Scenario 2: Carry Forward with Balance Below Maximum

### Step 1: Prepare Test Data
**Test Data**:
- **Employee**: [Select different test employee]
- **Leave Type**: Annual Leave
- **Initial Remaining Balance**: 5 days
- **Policy maxCarryForward**: 10 days

**Expected Result**: 
- Employee has 5 days remaining (less than maxCarryForward)

---

### Step 2: Run Carry Forward
**Action**: Execute carry forward for this employee.

**Expected Behavior**:
1. System calculates: `carryForwardAmount = min(5, 10) = 5 days`
2. Updates entitlement:
   - `carryForward` = 5 days
   - `remaining` = 5 - 5 = 0 days
3. Success message displayed

**Verification**:
- Check response: `carryForwardAmount = 5`
- Check response: `newBalance = 0` (or recalculated value)
- Verify `carryForward` field is now 5
- Verify `remaining` is now 0

---

## Test Scenario 3: Carry Forward for All Employees

### Step 1: Prepare Test Data
**Test Data**:
- **Leave Type**: Annual Leave
- **Multiple Employees**: At least 3 employees with different remaining balances
  - Employee A: 20 days remaining
  - Employee B: 8 days remaining
  - Employee C: 0 days remaining
- **Policy maxCarryForward**: 10 days

**Expected Result**: 
- Multiple employees with varying balances

---

### Step 2: Run Carry Forward for All Employees
**Action**: Execute carry forward without specifying employeeId.

**Test Data**:
- **Leave Type**: Annual Leave
- **Employee ID**: (Leave empty)
- **As Of Date**: (Optional)
- **Department ID**: (Optional)

**Expected Behavior**:
1. System processes all employees with entitlements for this leave type
2. For each employee:
   - Employee A: `carryForwardAmount = min(20, 10) = 10`, `remaining = 10`
   - Employee B: `carryForwardAmount = min(8, 10) = 8`, `remaining = 0`
   - Employee C: `carryForwardAmount = min(0, 10) = 0`, status = 'skipped'
3. Response shows:
   - `total`: Total employees processed
   - `successful`: Number of successful carry forwards
   - `failed`: Number of failures
   - `details`: Array with results for each employee

**Verification**:
- Check response: `total = 3` (or number of employees)
- Check response: `successful = 2` (A and B)
- Check response: `failed = 0`
- Check `details` array:
  - Employee A: `status = 'success'`, `carryForwardAmount = 10`
  - Employee B: `status = 'success'`, `carryForwardAmount = 8`
  - Employee C: `status = 'skipped'`, `reason = 'No remaining balance to carry forward'`
- Verify each employee's entitlement was updated correctly

---

## Test Scenario 4: Carry Forward with Zero Balance

### Step 1: Prepare Test Data
**Test Data**:
- **Employee**: [Select employee with 0 remaining balance]
- **Leave Type**: Annual Leave
- **Initial Remaining Balance**: 0 days

---

### Step 2: Run Carry Forward
**Action**: Execute carry forward for employee with zero balance.

**Expected Behavior**:
1. System calculates: `carryForwardAmount = min(0, 10) = 0`
2. Employee is skipped (not processed)
3. Response shows: `status = 'skipped'`, `reason = 'No remaining balance to carry forward'`

**Verification**:
- Check response: `status = 'skipped'`
- Check response: `carryForwardAmount = 0`
- Verify `carryForward` field remains unchanged
- Verify `remaining` remains unchanged

---

## Test Scenario 5: Carry Forward with Negative Balance

### Step 1: Prepare Test Data
**Test Data**:
- **Employee**: [Select employee with negative remaining balance]
- **Leave Type**: Annual Leave
- **Initial Remaining Balance**: -2 days (if system allows negative)

---

### Step 2: Run Carry Forward
**Action**: Execute carry forward for employee with negative balance.

**Expected Behavior**:
1. System calculates: `carryForwardAmount = min(-2, 10) = -2` (or 0 if clamped)
2. Either:
   - Employee is skipped (if carryForwardAmount <= 0)
   - OR error occurs (if negative values not allowed)

**Verification**:
- Check if employee is skipped or error occurs
- Verify no carry forward is applied

---

## Test Scenario 6: Carry Forward with Exact Maximum

### Step 1: Prepare Test Data
**Test Data**:
- **Employee**: [Select test employee]
- **Leave Type**: Annual Leave
- **Initial Remaining Balance**: 10 days (exactly equal to maxCarryForward)
- **Policy maxCarryForward**: 10 days

---

### Step 2: Run Carry Forward
**Action**: Execute carry forward.

**Expected Behavior**:
1. System calculates: `carryForwardAmount = min(10, 10) = 10 days`
2. Updates entitlement:
   - `carryForward` = 10 days
   - `remaining` = 10 - 10 = 0 days
3. Success message displayed

**Verification**:
- Check response: `carryForwardAmount = 10`
- Check response: `newBalance = 0`
- Verify `carryForward` field is exactly 10
- Verify `remaining` is exactly 0

---

## Test Scenario 7: Multiple Carry Forward Runs

### Step 1: First Carry Forward
**Action**: Run carry forward once.

**Test Data**:
- **Employee**: [Select test employee]
- **Initial Remaining Balance**: 15 days
- **maxCarryForward**: 10 days

**Expected Result**:
- `carryForward` = 10 days
- `remaining` = 5 days

---

### Step 2: Second Carry Forward (Same Period)
**Action**: Run carry forward again immediately.

**Expected Behavior**:
1. System calculates: `carryForwardAmount = min(5, 10) = 5 days`
2. Updates entitlement:
   - `carryForward` = 5 days (overwrites previous 10)
   - `remaining` = 5 - 5 = 0 days
3. **Note**: This overwrites the previous carry forward!

**Verification**:
- Check that `carryForward` is updated to 5 (not cumulative)
- Check that `remaining` is now 0
- **Important**: Verify if this is expected behavior or if carry forward should be cumulative

---

## Edge Cases to Test

### Edge Case 1: Missing Leave Policy
**Scenario**: Run carry forward for leave type without policy
- **Action**: Use leave type with no policy configured
- **Expected**: 
  - `maxCarryForward = 0` (default)
  - All employees skipped (no carry forward possible)

### Edge Case 2: Invalid Employee ID
**Scenario**: Run carry forward with invalid employeeId
- **Action**: Use non-existent employeeId
- **Expected**: 
  - No entitlements found
  - `total = 0`, `successful = 0`, `failed = 0`

### Edge Case 3: Invalid Leave Type
**Scenario**: Run carry forward with invalid leaveTypeId
- **Action**: Use non-existent leaveTypeId
- **Expected**: Error message indicating leave type not found

### Edge Case 4: Decimal Values
**Scenario**: Test with decimal remaining balance
- **Action**: Employee with 10.5 days remaining, maxCarryForward = 10
- **Expected**: 
  - `carryForwardAmount = min(10.5, 10) = 10`
  - `remaining` = 0.5 days

### Edge Case 5: Very Large Balance
**Scenario**: Employee with balance much larger than maxCarryForward
- **Action**: Employee with 100 days remaining, maxCarryForward = 10
- **Expected**: 
  - `carryForwardAmount = 10`
  - `remaining` = 90 days

### Edge Case 6: As Of Date
**Scenario**: Test with specific asOfDate
- **Action**: Set asOfDate to a past or future date
- **Expected**: 
  - Process uses the specified date
  - Verify if date affects the calculation (may be used for future features)

---

## API Testing (Alternative to UI)

### Endpoint
```
POST /leaves/carry-forward
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body Example (Single Employee)
```json
{
  "leaveTypeId": "507f1f77bcf86cd799439012",
  "employeeId": "507f1f77bcf86cd799439011",
  "asOfDate": "2024-12-31T00:00:00.000Z"
}
```

### Request Body Example (All Employees)
```json
{
  "leaveTypeId": "507f1f77bcf86cd799439012"
}
```

### Expected Response
```json
{
  "processedDate": "2024-12-31T00:00:00.000Z",
  "leaveTypeId": "507f1f77bcf86cd799439012",
  "successful": 2,
  "failed": 0,
  "total": 3,
  "details": [
    {
      "employeeId": "507f1f77bcf86cd799439011",
      "status": "success",
      "carryForwardAmount": 10,
      "expiringAmount": 0,
      "newBalance": 5
    },
    {
      "employeeId": "507f1f77bcf86cd799439012",
      "status": "success",
      "carryForwardAmount": 8,
      "expiringAmount": 0,
      "newBalance": 0
    },
    {
      "employeeId": "507f1f77bcf86cd799439013",
      "status": "skipped",
      "reason": "No remaining balance to carry forward",
      "carryForwardAmount": 0,
      "newBalance": 0
    }
  ]
}
```

---

## Verification Checklist

After completing all test scenarios, verify:

- [ ] **Single Employee**: Carry forward works correctly for one employee
- [ ] **Balance Below Max**: Correctly carries forward when balance < maxCarryForward
- [ ] **Balance Above Max**: Correctly limits to maxCarryForward when balance > maxCarryForward
- [ ] **Balance Equal to Max**: Correctly handles when balance = maxCarryForward
- [ ] **Zero Balance**: Correctly skips employees with 0 remaining balance
- [ ] **All Employees**: Processes multiple employees correctly
- [ ] **Carry Forward Field**: `carryForward` field is updated correctly
- [ ] **Remaining Balance**: `remaining` is decremented correctly
- [ ] **Recalculation**: `remaining` is recalculated to ensure consistency
- [ ] **Response Format**: Response includes all expected fields
- [ ] **Error Handling**: Errors are handled gracefully
- [ ] **Skip Logic**: Employees with no balance are skipped correctly
- [ ] **Decimal Values**: Handles decimal balances correctly
- [ ] **Multiple Runs**: Understands behavior when run multiple times

---

## Important Notes

1. **Carry Forward Overwrites**: Running carry forward multiple times will overwrite the previous `carryForward` value. It does NOT add to existing carry forward.

2. **Formula**: After carry forward, `remaining` should be recalculated as:
   ```
   remaining = accruedRounded + carryForward - taken - pending
   ```

3. **Policy Requirement**: The leave policy must have `carryForwardAllowed = true` and `maxCarryForward > 0` for carry forward to work.

4. **Atomic Operation**: The carry forward uses MongoDB atomic operations (`$set` and `$inc`) to ensure data consistency.

5. **Recalculation**: After setting `carryForward` and decrementing `remaining`, the system recalculates `remaining` to ensure it matches the formula. This may cause slight differences if there were rounding issues.

6. **Timing**: Carry forward is typically run at year-end or period-end to move unused days to the next period.

---

## Test Data Template

Use this template to record your test results:

```
Leave Type: _______________________
Leave Type ID: _______________________
Policy maxCarryForward: _______ days
Policy carryForwardAllowed: [ ] Yes [ ] No

Test Employee 1:
  Employee ID: _______________________
  Initial remaining: _______ days
  Initial carryForward: _______ days
  Expected carryForwardAmount: _______ days
  Expected new remaining: _______ days
  Actual carryForwardAmount: _______ days
  Actual new remaining: _______ days
  Status: [ ] Success [ ] Skipped [ ] Failed

Test Employee 2:
  Employee ID: _______________________
  Initial remaining: _______ days
  Initial carryForward: _______ days
  Expected carryForwardAmount: _______ days
  Expected new remaining: _______ days
  Actual carryForwardAmount: _______ days
  Actual new remaining: _______ days
  Status: [ ] Success [ ] Skipped [ ] Failed

Test Employee 3:
  Employee ID: _______________________
  Initial remaining: _______ days
  Initial carryForward: _______ days
  Expected carryForwardAmount: _______ days
  Expected new remaining: _______ days
  Actual carryForwardAmount: _______ days
  Actual new remaining: _______ days
  Status: [ ] Success [ ] Skipped [ ] Failed

All Tests Passed: [ ] Yes [ ] No
```

---

## Common Issues to Watch For

1. **Carry Forward Not Applied**: Check if policy has `carryForwardAllowed = true` and `maxCarryForward > 0`

2. **Incorrect Amount**: Verify that `carryForwardAmount = min(remaining, maxCarryForward)`

3. **Remaining Not Updated**: Check if `remaining` was decremented correctly

4. **Recalculation Issues**: Verify that `remaining` matches the formula after recalculation

5. **Multiple Runs**: Understand that running carry forward multiple times overwrites previous values

6. **Zero Balance**: Employees with 0 or negative balance should be skipped

7. **Decimal Precision**: Watch for floating point precision issues with decimal values
