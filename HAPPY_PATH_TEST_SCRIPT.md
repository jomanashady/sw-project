# Happy Path Test Script - Leave Entitlement Flow

This document provides step-by-step API calls to test the leave entitlement system from start to finish.

## Prerequisites

1. Backend server running on `http://localhost:3001`
2. Valid JWT token for HR Admin user
3. An employee profile already created (employeeId needed)

---

## Step 1: Create Leave Category

```bash
POST http://localhost:3001/leaves/categories
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "name": "Paid Leave",
  "description": "Leave types that deduct from annual balance"
}
```

**Expected Response:**
```json
{
  "_id": "category_id_here",
  "name": "Paid Leave",
  "description": "Leave types that deduct from annual balance",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Save `_id` as `CATEGORY_ID`**

---

## Step 2: Create Leave Type (Annual Leave)

```bash
POST http://localhost:3001/leaves/types
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "name": "Annual Leave",
  "code": "ANNUAL",
  "categoryId": "CATEGORY_ID",
  "description": "Annual vacation leave"
}
```

**Expected Response:**
```json
{
  "_id": "leave_type_id_here",
  "name": "Annual Leave",
  "code": "ANNUAL",
  "categoryId": "CATEGORY_ID",
  "description": "Annual vacation leave",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Save `_id` as `LEAVE_TYPE_ID`**

---

## Step 3: Create Leave Policy

```bash
POST http://localhost:3001/leaves/policies
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "leaveTypeId": "LEAVE_TYPE_ID",
  "accrualMethod": "monthly",
  "monthlyRate": 1.25,
  "yearlyRate": 15,
  "carryForwardAllowed": true,
  "maxCarryForward": 5,
  "roundingRule": "round",
  "minNoticeDays": 7,
  "maxConsecutiveDays": 30,
  "eligibility": {
    "minTenureMonths": 3,
    "positionsAllowed": ["Full-Time", "Part-Time"],
    "contractTypesAllowed": ["Permanent", "Contract"]
  }
}
```

**Expected Response:**
```json
{
  "_id": "policy_id_here",
  "leaveTypeId": "LEAVE_TYPE_ID",
  "accrualMethod": "monthly",
  "monthlyRate": 1.25,
  "yearlyRate": 15,
  "carryForwardAllowed": true,
  "maxCarryForward": 5,
  "roundingRule": "round",
  "minNoticeDays": 7,
  "maxConsecutiveDays": 30,
  "eligibility": {
    "minTenureMonths": 3,
    "positionsAllowed": ["Full-Time", "Part-Time"],
    "contractTypesAllowed": ["Permanent", "Contract"]
  },
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Save `_id` as `POLICY_ID`**

---

## Step 4: Create Employee Entitlement

**Note:** Replace `EMPLOYEE_ID` with an actual employee ID from your system.

```bash
POST http://localhost:3001/leaves/entitlements
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "employeeId": "EMPLOYEE_ID",
  "leaveTypeId": "LEAVE_TYPE_ID",
  "yearlyEntitlement": 15,
  "accruedActual": 0,
  "accruedRounded": 0,
  "carryForward": 0,
  "taken": 0,
  "pending": 0,
  "remaining": 0
}
```

**Expected Response:**
```json
{
  "_id": "entitlement_id_here",
  "employeeId": "EMPLOYEE_ID",
  "leaveTypeId": "LEAVE_TYPE_ID",
  "yearlyEntitlement": 15,
  "accruedActual": 0,
  "accruedRounded": 0,
  "carryForward": 0,
  "taken": 0,
  "pending": 0,
  "remaining": 0,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Save `_id` as `ENTITLEMENT_ID`**

---

## Step 5: Check Initial Entitlement

```bash
GET http://localhost:3001/leaves/entitlements/EMPLOYEE_ID/LEAVE_TYPE_ID
Authorization: Bearer <your_jwt_token>
```

**Expected Response:**
```json
{
  "_id": "ENTITLEMENT_ID",
  "employeeId": "EMPLOYEE_ID",
  "leaveTypeId": "LEAVE_TYPE_ID",
  "yearlyEntitlement": 15,
  "accruedActual": 0,
  "accruedRounded": 0,
  "carryForward": 0,
  "taken": 0,
  "pending": 0,
  "remaining": 0
}
```

---

## Step 6: Month 1 - Run Monthly Accrual

```bash
POST http://localhost:3001/leaves/accruals/auto
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "leaveTypeId": "LEAVE_TYPE_ID",
  "accrualAmount": 1.25,
  "accrualType": "monthly"
}
```

**Expected Response:**
```json
{
  "successful": 1,
  "failed": 0,
  "total": 1,
  "details": [
    {
      "employeeId": "EMPLOYEE_ID",
      "status": "success",
      "previousBalance": 0,
      "newBalance": 1,
      "accrualAmount": 1.25,
      "accrualType": "monthly"
    }
  ]
}
```

**Verify Entitlement:**
```bash
GET http://localhost:3001/leaves/entitlements/EMPLOYEE_ID/LEAVE_TYPE_ID
```

**Expected:**
```json
{
  "accruedActual": 1.25,
  "accruedRounded": 1,
  "remaining": 1
}
```

---

## Step 7: Month 2 - Run Second Accrual

```bash
POST http://localhost:3001/leaves/accruals/auto
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "leaveTypeId": "LEAVE_TYPE_ID",
  "accrualAmount": 1.25,
  "accrualType": "monthly"
}
```

**Expected Response:**
```json
{
  "details": [
    {
      "employeeId": "EMPLOYEE_ID",
      "status": "success",
      "previousBalance": 1,
      "newBalance": 3,
      "accrualAmount": 1.25
    }
  ]
}
```

**Verify Entitlement:**
```json
{
  "accruedActual": 2.5,
  "accruedRounded": 3,
  "remaining": 3
}
```

---

## Step 8: Month 3 - Create Leave Request (5 days)

```bash
POST http://localhost:3001/leaves/requests
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "employeeId": "EMPLOYEE_ID",
  "leaveTypeId": "LEAVE_TYPE_ID",
  "startDate": "2025-03-15",
  "endDate": "2025-03-19",
  "justification": "Vacation"
}
```

**Expected Response:**
```json
{
  "_id": "request_id_here",
  "employeeId": "EMPLOYEE_ID",
  "leaveTypeId": "LEAVE_TYPE_ID",
  "startDate": "2025-03-15T00:00:00.000Z",
  "endDate": "2025-03-19T00:00:00.000Z",
  "durationDays": 5,
  "status": "PENDING",
  "justification": "Vacation"
}
```

**Verify Entitlement (should show pending):**
```json
{
  "accruedActual": 3.75,
  "accruedRounded": 4,
  "taken": 0,
  "pending": 5,
  "remaining": -1
}
```

---

## Step 9: Approve Leave Request

**Note:** Replace `REQUEST_ID` with the ID from Step 8.

```bash
POST http://localhost:3001/leaves/requests/REQUEST_ID/approve
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "approvedBy": "MANAGER_USER_ID",
  "comments": "Approved"
}
```

**Expected Response:**
```json
{
  "_id": "REQUEST_ID",
  "status": "APPROVED",
  "approvalFlow": [
    {
      "role": "Manager",
      "status": "APPROVED",
      "decidedBy": "MANAGER_USER_ID",
      "decidedAt": "2025-03-10T00:00:00.000Z",
      "comments": "Approved"
    }
  ]
}
```

**Verify Entitlement (after approval):**
```json
{
  "accruedActual": 3.75,
  "accruedRounded": 4,
  "taken": 5,
  "pending": 0,
  "remaining": -1
}
```

---

## Step 10: Month 4 - Run Fourth Accrual

```bash
POST http://localhost:3001/leaves/accruals/auto
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "leaveTypeId": "LEAVE_TYPE_ID",
  "accrualAmount": 1.25,
  "accrualType": "monthly"
}
```

**Verify Entitlement:**
```json
{
  "accruedActual": 5.0,
  "accruedRounded": 5,
  "taken": 5,
  "pending": 0,
  "remaining": 0
}
```

---

## Step 11: End of Year - Run Carry-Forward

```bash
POST http://localhost:3001/leaves/carry-forward
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "leaveTypeId": "LEAVE_TYPE_ID",
  "asOfDate": "2025-12-31"
}
```

**Expected Response:**
```json
{
  "processedDate": "2025-12-31T00:00:00.000Z",
  "leaveTypeId": "LEAVE_TYPE_ID",
  "successful": 1,
  "failed": 0,
  "total": 1,
  "details": [
    {
      "employeeId": "EMPLOYEE_ID",
      "status": "success",
      "carryForwardAmount": 0,
      "newBalance": 0
    }
  ]
}
```

**If remaining was 3:**
```json
{
  "carryForwardAmount": 3,
  "newBalance": 0
}
```

**Verify Entitlement:**
```json
{
  "accruedActual": 15.0,
  "accruedRounded": 15,
  "carryForward": 3,
  "taken": 12,
  "remaining": 0
}
```

---

## Step 12: New Year - Reset Leave Balances

```bash
POST http://localhost:3001/leaves/reset
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "criterion": "HIRE_DATE"
}
```

**Expected Response:**
```json
{
  "message": "Leave balances reset successfully",
  "resetCount": 1
}
```

**Verify Entitlement (after reset):**
```json
{
  "yearlyEntitlement": 15,
  "accruedActual": 0,
  "accruedRounded": 0,
  "carryForward": 0,
  "taken": 0,
  "pending": 0,
  "remaining": 15
}
```

**Note:** If carry-forward was 3 and policy allows it, `remaining` should be 18 (15 + 3).

---

## Testing Checklist

- [ ] Category created successfully
- [ ] Leave type created successfully
- [ ] Policy created with correct settings
- [ ] Entitlement created with initial values
- [ ] Month 1 accrual: `accruedActual=1.25`, `accruedRounded=1`, `remaining=1`
- [ ] Month 2 accrual: `accruedActual=2.5`, `accruedRounded=3`, `remaining=3`
- [ ] Leave request created: `pending=5`, `remaining=-1`
- [ ] Leave request approved: `taken=5`, `pending=0`, `remaining=-1`
- [ ] Month 4 accrual: `accruedActual=5.0`, `accruedRounded=5`, `remaining=0`
- [ ] Carry-forward: `carryForward=3` (if remaining was 3), `remaining=0`
- [ ] Reset: All fields reset correctly, `remaining=15` (or 18 if carry-forward added)

---

## Common Issues to Watch For

1. **Rounding Issues:** Check if `accruedRounded` matches the rounding rule
2. **Remaining Balance:** Verify `remaining` is calculated correctly after each operation
3. **Carry-Forward:** Ensure `maxCarryForward` from policy is respected
4. **Reset Logic:** Verify all fields reset correctly, including carry-forward
5. **Pending vs Taken:** Ensure `pending` is cleared when request is approved

---

## Notes

- Replace all placeholder IDs (`EMPLOYEE_ID`, `LEAVE_TYPE_ID`, etc.) with actual IDs from your system
- Dates should be adjusted based on your test timeline
- The accrual amounts (1.25 per month) assume 15 days per year
- Adjust `monthlyRate` in the policy if you want different accrual amounts

