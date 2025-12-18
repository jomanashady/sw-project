# Manual Accrual Adjustment Test Scenario

## Overview
This document provides a comprehensive test scenario to verify that manual accrual adjustments work correctly for all four adjustment types.

## Prerequisites
1. **User Role**: HR Admin or HR Manager account
2. **Test Employee**: An employee with an existing leave entitlement
3. **Leave Type**: A leave type (e.g., Annual Leave, Sick Leave) configured for the test employee
4. **Initial State**: Note the employee's current leave balance before testing

## Test Scenario: Complete Accrual Adjustment Workflow

### Step 1: Record Initial Balance
**Action**: Before making any adjustments, record the employee's current leave balance.

**Expected Result**: 
- Note the `accruedActual`, `accruedRounded`, and `remaining` values
- These will be used to verify calculations

**How to Check**:
- Navigate to employee's leave balance page
- Or use API: `GET /leaves/entitlement/{employeeId}/{leaveTypeId}`
- Record: `previousBalance = remaining`

---

### Step 2: Test Suspension (Reduce Accrued)
**Purpose**: Test pausing accrual during unpaid leave

**Test Data**:
- **Employee**: [Select test employee]
- **Leave Type**: [Select leave type, e.g., Annual Leave]
- **Adjustment Type**: `suspension`
- **Adjustment Amount**: `2.5` days
- **From Date**: Today's date
- **To Date**: (Optional) Leave empty or set future date
- **Reason**: "Unpaid leave suspension"
- **Notes**: "Employee on unpaid leave for 2 weeks"

**Expected Behavior**:
1. `accruedActual` should decrease by 2.5 days
2. `accruedRounded` should be recalculated based on rounding rule
3. `remaining` should be recalculated (typically decreases)
4. Success message: "Accrual adjustment applied successfully"

**Verification**:
- Check response: `previousBalance` vs `newBalance`
- Verify `newBalance = previousBalance - 2.5` (approximately, depending on rounding)
- Check that `accruedActual` decreased by 2.5

---

### Step 3: Test Reduction (Reduce Remaining Balance)
**Purpose**: Test direct reduction of available balance

**Test Data**:
- **Employee**: Same employee from Step 2
- **Leave Type**: Same leave type
- **Adjustment Type**: `reduction`
- **Adjustment Amount**: `1.0` day
- **From Date**: Today's date
- **To Date**: (Optional)
- **Reason**: "Disciplinary action"
- **Notes**: "Reduction due to policy violation"

**Expected Behavior**:
1. `remaining` should decrease by exactly 1.0 day
2. `accruedActual` and `accruedRounded` should NOT change
3. Success message displayed

**Verification**:
- Check response: `newBalance = previousBalance - 1.0`
- Verify `accruedActual` remains unchanged from Step 2
- Verify only `remaining` was modified

---

### Step 4: Test Adjustment (Increase Remaining Balance)
**Purpose**: Test direct increase of available balance

**Test Data**:
- **Employee**: Same employee
- **Leave Type**: Same leave type
- **Adjustment Type**: `adjustment`
- **Adjustment Amount**: `3.0` days
- **From Date**: Today's date
- **To Date**: (Optional)
- **Reason**: "Correction for previous error"
- **Notes**: "Restoring incorrectly deducted days"

**Expected Behavior**:
1. `remaining` should increase by exactly 3.0 days
2. `accruedActual` and `accruedRounded` should NOT change
3. Success message displayed

**Verification**:
- Check response: `newBalance = previousBalance + 3.0`
- Verify `accruedActual` remains unchanged
- Verify only `remaining` was modified

---

### Step 5: Test Restoration (Restore Accrued)
**Purpose**: Test restoring previously suspended accrual

**Test Data**:
- **Employee**: Same employee
- **Leave Type**: Same leave type
- **Adjustment Type**: `restoration`
- **Adjustment Amount**: `2.5` days (same as Step 2 suspension)
- **From Date**: Today's date
- **To Date**: (Optional)
- **Reason**: "Restore after unpaid leave completion"
- **Notes**: "Employee returned from unpaid leave"

**Expected Behavior**:
1. `accruedActual` should increase by 2.5 days
2. `accruedRounded` should be recalculated based on rounding rule
3. `remaining` should be recalculated (typically increases)
4. Success message displayed

**Verification**:
- Check response: `newBalance` should be higher than previous
- Verify `accruedActual` increased by 2.5
- Verify `accruedRounded` was recalculated

---

## Complete Test Flow Summary

### Test Sequence:
1. **Initial State** → Record baseline balance
2. **Suspension** → Reduce accrued (affects accrued fields)
3. **Reduction** → Reduce remaining (direct change)
4. **Adjustment** → Increase remaining (direct change)
5. **Restoration** → Restore accrued (affects accrued fields)

### Expected Final Balance Calculation:
```
Final Balance = Initial Balance 
  - Suspension Amount (2.5)
  - Reduction Amount (1.0)
  + Adjustment Amount (3.0)
  + Restoration Amount (2.5)
  
= Initial Balance + 2.0 days
```

---

## Edge Cases to Test

### Edge Case 1: Negative Balance
**Scenario**: Apply a reduction that would make balance negative
- **Action**: Apply reduction of 100 days to an employee with 5 days remaining
- **Expected**: System should either:
  - Allow negative balance (if business rules permit)
  - OR prevent the adjustment with an error message

### Edge Case 2: Invalid Employee
**Scenario**: Try to adjust accrual for non-existent employee
- **Action**: Use invalid employeeId
- **Expected**: Error message: "Employee not found" or similar

### Edge Case 3: Invalid Leave Type
**Scenario**: Try to adjust accrual for leave type not assigned to employee
- **Action**: Use leave type that employee doesn't have entitlement for
- **Expected**: Error message indicating entitlement not found

### Edge Case 4: Missing Required Fields
**Scenario**: Submit form without required fields
- **Action**: Leave employee, leave type, amount, or fromDate empty
- **Expected**: Form validation error preventing submission

### Edge Case 5: Date Range
**Scenario**: Test with date range (fromDate and toDate)
- **Action**: Set both fromDate and toDate
- **Expected**: Adjustment should still work correctly

### Edge Case 6: Decimal Amounts
**Scenario**: Test with fractional days
- **Action**: Use amounts like 0.5, 1.25, 2.75 days
- **Expected**: System should handle decimal values correctly

---

## API Testing (Alternative to UI)

### Endpoint
```
POST /leaves/adjust-accrual
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body Example (Suspension)
```json
{
  "employeeId": "507f1f77bcf86cd799439011",
  "leaveTypeId": "507f1f77bcf86cd799439012",
  "adjustmentType": "suspension",
  "adjustmentAmount": 2.5,
  "fromDate": "2024-01-15T00:00:00.000Z",
  "toDate": "2024-01-29T00:00:00.000Z",
  "reason": "Unpaid leave suspension",
  "notes": "Employee on unpaid leave for 2 weeks"
}
```

### Expected Response
```json
{
  "success": true,
  "employeeId": "507f1f77bcf86cd799439011",
  "leaveTypeId": "507f1f77bcf86cd799439012",
  "adjustmentType": "suspension",
  "adjustmentAmount": 2.5,
  "previousBalance": 10.0,
  "newBalance": 7.5,
  "effectiveDate": "2024-01-15T00:00:00.000Z",
  "reason": "Unpaid leave suspension",
  "notes": "Employee on unpaid leave for 2 weeks"
}
```

---

## Verification Checklist

After completing all test steps, verify:

- [ ] **Suspension** correctly reduces `accruedActual` and recalculates `remaining`
- [ ] **Reduction** correctly reduces `remaining` without affecting `accruedActual`
- [ ] **Adjustment** correctly increases `remaining` without affecting `accruedActual`
- [ ] **Restoration** correctly increases `accruedActual` and recalculates `remaining`
- [ ] Success messages appear after each adjustment
- [ ] Error messages appear for invalid inputs
- [ ] Final balance matches expected calculation
- [ ] All adjustments are recorded/logged (if audit trail exists)
- [ ] UI form validation works correctly
- [ ] Decimal amounts are handled properly
- [ ] Date fields accept valid dates

---

## Notes

1. **Rounding Rules**: If the leave policy has rounding rules (e.g., round to nearest 0.5), verify that `accruedRounded` follows these rules after suspension/restoration.

2. **Recalculation**: For suspension/restoration, `remaining` is recalculated. The formula typically is:
   ```
   remaining = accruedRounded - used - pending
   ```

3. **Audit Trail**: Check if adjustments are logged in a separate adjustments table or audit log.

4. **Permissions**: Verify that only HR Admin and HR Manager roles can perform adjustments.

5. **Data Integrity**: After each adjustment, verify that the entitlement document in the database matches the response values.

---

## Test Data Template

Use this template to record your test results:

```
Test Employee: _______________________
Employee ID: _______________________
Leave Type: _______________________
Leave Type ID: _______________________

Initial Balance:
  - accruedActual: _______
  - accruedRounded: _______
  - remaining: _______

After Suspension (2.5 days):
  - accruedActual: _______
  - accruedRounded: _______
  - remaining: _______

After Reduction (1.0 day):
  - accruedActual: _______
  - accruedRounded: _______
  - remaining: _______

After Adjustment (+3.0 days):
  - accruedActual: _______
  - accruedRounded: _______
  - remaining: _______

After Restoration (2.5 days):
  - accruedActual: _______
  - accruedRounded: _______
  - remaining: _______

Final Balance Matches Expected: [ ] Yes [ ] No
```
