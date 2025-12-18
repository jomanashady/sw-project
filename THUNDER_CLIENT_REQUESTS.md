# Thunder Client Request Bodies for Testing

**Base URL:** `http://localhost:5000/api/v1/leaves`

**Important:** All endpoints require `/api/v1/` prefix!

---

## Setup Requests (Run Once)

### 1. Create Leave Category
**Method:** POST  
**URL:** `http://localhost:5000/api/v1/leaves/category`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
  "name": "Paid Leave",
  "description": "Leave types that deduct from annual balance"
}
```

---

### 2. Create Leave Type
**Method:** POST  
**URL:** `http://localhost:5000/api/v1/leaves/type`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
  "name": "Annual Leave",
  "code": "ANNUAL",
  "categoryId": "PASTE_CATEGORY_ID_HERE",
  "description": "Annual vacation leave"
}
```

---

### 3. Create Leave Policy
**Method:** POST  
**URL:** `http://localhost:5000/api/v1/leaves/policy`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
  "leaveTypeId": "PASTE_LEAVE_TYPE_ID_HERE",
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

---

### 4. Create Employee Entitlement
**Method:** POST  
**URL:** `http://localhost:5000/api/v1/leaves/entitlement`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
  "employeeId": "PASTE_EMPLOYEE_ID_HERE",
  "leaveTypeId": "PASTE_LEAVE_TYPE_ID_HERE",
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

## Test 1: Verify Initial State

### Get Employee Entitlement
**Method:** GET  
**URL:** `http://localhost:5000/api/v1/leaves/entitlement/PASTE_EMPLOYEE_ID_HERE/PASTE_LEAVE_TYPE_ID_HERE`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
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

## Test 2: Auto-Accrual (Month 1)

### Run Monthly Accrual (Single Employee)
**Method:** POST  
**URL:** `http://localhost:5000/api/v1/leaves/auto-accrue`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
  "employeeId": "PASTE_EMPLOYEE_ID_HERE",
  "leaveTypeId": "PASTE_LEAVE_TYPE_ID_HERE",
  "accrualAmount": 1.25,
  "accrualType": "monthly"
}
```

**Note:** `accrualType` must be one of: `"monthly"`, `"yearly"`, `"quarterly"`, or `"semi_annual"`

**Expected Response:**
```json
{
  "success": true,
  "employeeId": "YOUR_EMPLOYEE_ID",
  "leaveTypeId": "YOUR_LEAVE_TYPE_ID",
  "accrualAmount": 1.25,
  "accrualType": "monthly",
  "previousBalance": 0,
  "newBalance": 1,
  "effectiveDate": "2025-12-10T...",
  "notes": null
}
```

**Verify:** Get entitlement again - should show:
- `accruedActual: 1.25`
- `accruedRounded: 1` (rounded from 1.25)
- `remaining: 1` (1 + 0 - 0 - 0)

---

## Test 3: Auto-Accrual (Month 2)

### Run Monthly Accrual Again
**Method:** POST  
**URL:** `http://localhost:5000/api/v1/leaves/auto-accrue`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
  "employeeId": "PASTE_EMPLOYEE_ID_HERE",
  "leaveTypeId": "PASTE_LEAVE_TYPE_ID_HERE",
  "accrualAmount": 1.25,
  "accrualType": "monthly"
}
```

**Expected Response:**
```json
{
  "success": true,
  "employeeId": "YOUR_EMPLOYEE_ID",
  "previousBalance": 1,
  "newBalance": 3,
  "accrualAmount": 1.25,
  "accrualType": "monthly"
}
```

**Verify:** Get entitlement - should show:
- `accruedActual: 2.5` (1.25 + 1.25)
- `accruedRounded: 3` (2.5 rounded to 3)
- `remaining: 3` (3 + 0 - 0 - 0)

---

## Test 4: Auto-Accrue All Employees

### Run Accrual for All Employees
**Method:** POST  
**URL:** `http://localhost:5000/api/v1/leaves/auto-accrue-all`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
  "leaveTypeId": "PASTE_LEAVE_TYPE_ID_HERE",
  "accrualAmount": 1.25,
  "accrualType": "monthly"
}
```

**Expected Response:**
```json
{
  "successful": 1,
  "failed": 0,
  "skipped": 0,
  "total": 1,
  "details": [
    {
      "employeeId": "YOUR_EMPLOYEE_ID",
      "status": "success",
      "previousBalance": 3,
      "newBalance": 4,
      "accrualAmount": 1.25,
      "accrualType": "monthly"
    }
  ]
}
```

---

## Test 5: Create Leave Request

### Create Leave Request (5 days)
**Method:** POST  
**URL:** `http://localhost:5000/api/v1/leaves/request`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
  "employeeId": "PASTE_EMPLOYEE_ID_HERE",
  "leaveTypeId": "PASTE_LEAVE_TYPE_ID_HERE",
  "dates": {
    "from": "2025-03-15",
    "to": "2025-03-19"
  },
  "durationDays": 5,
  "justification": "Vacation"
}
```

**Note:** 
- Use `dates` object with `from` and `to` (not `startDate`/`endDate`)
- `durationDays` is required (calculate: endDate - startDate + 1, excluding weekends/holidays)

**Verify:** Get entitlement - should show:
- `pending: 5`
- `remaining: -1` (4 + 0 - 0 - 5 = -1, negative is OK for pending)

---

## Test 6: Approve Leave Request

### Approve Leave Request
**Method:** POST  
**URL:** `http://localhost:5000/api/v1/leaves/request/PASTE_REQUEST_ID_HERE/approve`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
  "approvedBy": "PASTE_MANAGER_USER_ID_HERE",
  "comments": "Approved"
}
```

**Verify:** Get entitlement - should show:
- `taken: 5`
- `pending: 0`
- `remaining: -1` (4 + 0 - 5 - 0 = -1)

---

## Test 7: Unpaid Leave/Suspension Check (BR 11)

### Update Employee Status to SUSPENDED
**Method:** PATCH  
**URL:** `http://localhost:5000/api/v1/employee-profiles/PASTE_EMPLOYEE_ID_HERE`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
  "status": "SUSPENDED"
}
```

---

### Try to Accrue (Should Skip)
**Method:** POST  
**URL:** `http://localhost:5000/api/v1/leaves/auto-accrue`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
  "employeeId": "PASTE_EMPLOYEE_ID_HERE",
  "leaveTypeId": "PASTE_LEAVE_TYPE_ID_HERE",
  "accrualAmount": 1.25,
  "accrualType": "monthly"
}
```

**Expected Response:**
```json
{
  "success": false,
  "employeeId": "YOUR_EMPLOYEE_ID",
  "leaveTypeId": "YOUR_LEAVE_TYPE_ID",
  "accrualAmount": 1.25,
  "accrualType": "monthly",
  "reason": "Accrual skipped: Employee is SUSPENDED",
  "effectiveDate": "2025-12-10T...",
  "notes": null
}
```

**✅ Verify:** Accrual was skipped!

---

### Restore Employee Status to ACTIVE
**Method:** PATCH  
**URL:** `http://localhost:5000/api/v1/employee-profiles/PASTE_EMPLOYEE_ID_HERE`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
  "status": "ACTIVE"
}
```

---

## Test 8: Carry-Forward with Policy maxCarryForward

### Build Up Remaining Balance First
Run accrual 3-4 more times to get remaining > 5:

**Method:** POST  
**URL:** `http://localhost:5000/api/v1/leaves/auto-accrue`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
  "employeeId": "PASTE_EMPLOYEE_ID_HERE",
  "leaveTypeId": "PASTE_LEAVE_TYPE_ID_HERE",
  "accrualAmount": 1.25,
  "accrualType": "monthly"
}
```

Repeat this request 3-4 times until `remaining > 5`

---

### Run Carry-Forward
**Method:** POST  
**URL:** `http://localhost:5000/api/v1/leaves/carry-forward`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
  "leaveTypeId": "PASTE_LEAVE_TYPE_ID_HERE",
  "asOfDate": "2025-12-31"
}
```

**Expected Response:**
```json
{
  "processedDate": "2025-12-31T00:00:00.000Z",
  "leaveTypeId": "YOUR_LEAVE_TYPE_ID",
  "successful": 1,
  "failed": 0,
  "total": 1,
  "details": [
    {
      "employeeId": "YOUR_EMPLOYEE_ID",
      "status": "success",
      "carryForwardAmount": 5,
      "expiringAmount": 0,
      "newBalance": <remaining - 5>
    }
  ]
}
```

**✅ Verify:** `carryForwardAmount = 5` (not 10! Uses policy `maxCarryForward`)

---

### Verify Entitlement After Carry-Forward
**Method:** GET  
**URL:** `http://localhost:5000/api/v1/leaves/entitlement/PASTE_EMPLOYEE_ID_HERE/PASTE_LEAVE_TYPE_ID_HERE`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected:**
- `carryForward: 5`
- `remaining: <previous_remaining - 5>`
- Verify: `remaining = accruedRounded + carryForward - taken - pending`

---

## Test 9: Reset Leave Balances

### Run Reset
**Method:** POST  
**URL:** `http://localhost:5000/api/v1/leaves/reset-leave-balances`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
  "criterion": "HIRE_DATE"
}
```

**Note:** `criterion` must be one of: `"HIRE_DATE"`, `"FIRST_VACATION_DATE"`, `"REVISED_HIRE_DATE"`, or `"WORK_RECEIVING_DATE"`

**Note:** This only resets if the reset date (based on hire date) has passed.

**Expected Response:**
```json
{
  "message": "Leave balances reset successfully for the new year."
}
```

### Verify Entitlement After Reset
**Method:** GET  
**URL:** `http://localhost:5000/api/v1/leaves/entitlement/PASTE_EMPLOYEE_ID_HERE/PASTE_LEAVE_TYPE_ID_HERE`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
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

**✅ Verify:**
- All accrual fields reset to 0
- `carryForward = 0` (reset after using it)
- `remaining = 15` (or 15 + carryForward if it was added)

---

## Test 10: Adjust Accrual (Suspension/Adjustment)

### Adjust Accrual (Suspension)
**Method:** POST  
**URL:** `http://localhost:5000/api/v1/leaves/adjust-accrual`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
  "employeeId": "PASTE_EMPLOYEE_ID_HERE",
  "leaveTypeId": "PASTE_LEAVE_TYPE_ID_HERE",
  "adjustmentType": "suspension",
  "adjustmentAmount": 1,
  "fromDate": "2025-01-01",
  "reason": "Unpaid leave period",
  "notes": "Employee on unpaid leave"
}
```

**Note:** `adjustmentType` must be one of: `"suspension"`, `"reduction"`, `"adjustment"`, or `"restoration"`

**Verify:** Get entitlement - `accruedActual` should decrease, `remaining` recalculated

---

### Adjust Accrual (Restoration)
**Method:** POST  
**URL:** `http://localhost:5000/api/v1/leaves/adjust-accrual`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
**Body:**
```json
{
  "employeeId": "PASTE_EMPLOYEE_ID_HERE",
  "leaveTypeId": "PASTE_LEAVE_TYPE_ID_HERE",
  "adjustmentType": "restoration",
  "adjustmentAmount": 1,
  "fromDate": "2025-01-01",
  "reason": "Restore after return",
  "notes": "Employee returned from unpaid leave"
}
```

---

## Test 10: Personalized Entitlement

### Assign Personalized Entitlement
**Method:** POST  
**URL:** `http://localhost:5000/api/v1/leaves/entitlement/PASTE_EMPLOYEE_ID_HERE/PASTE_LEAVE_TYPE_ID_HERE/personalized`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```
**Body:**
```json
3
```

**Note:** This endpoint expects just a number in the body, not a JSON object!

**Verify:** Get entitlement - both `accruedActual` and `remaining` should increase by 3

---

## Quick Verification Formula

After each operation, verify:
```
remaining = accruedRounded + carryForward - taken - pending
```

---

## Common Issues & Solutions

### Issue: "Employee not found"
- Make sure you're using a valid `employeeId` from your employee profiles
- Check: `GET http://localhost:3001/employee-profiles` to list employees

### Issue: "Leave type not found"
- Make sure you created the leave type and are using the correct `leaveTypeId`
- Check: `GET http://localhost:3001/leaves/types` to list leave types

### Issue: Accrual not working
- Check employee status (should be ACTIVE, not SUSPENDED or ON_LEAVE)
- Verify entitlement exists for that employee + leave type
- Check backend logs for errors

### Issue: Carry-forward amount is 10 instead of 5
- Verify policy has `maxCarryForward: 5` (not default)
- Check policy was saved correctly

---

## Testing Checklist

- [ ] ✅ Remaining balance calculation: `remaining = accruedRounded + carryForward - taken - pending`
- [ ] ✅ Rounding works: 1.25 → 1, 2.5 → 3
- [ ] ✅ Accrual skips when employee is SUSPENDED
- [ ] ✅ Accrual skips when employee is ON_LEAVE
- [ ] ✅ Carry-forward uses `maxCarryForward` from policy (5, not 10)
- [ ] ✅ Reset properly resets all fields including `carryForward = 0`
- [ ] ✅ Leave request moves from `pending` to `taken` correctly
- [ ] ✅ Adjust accrual updates `accruedRounded` with rounding

---

## Important Notes

1. **Base URL:** All endpoints use `http://localhost:5000/api/v1/leaves/...`
   - Don't forget the `/api/v1/` prefix!
   - Port is `5000` (not 3001)

2. **Replace all placeholders:**
   - `YOUR_JWT_TOKEN` → Your actual JWT token
   - `PASTE_EMPLOYEE_ID_HERE` → Actual employee ID
   - `PASTE_LEAVE_TYPE_ID_HERE` → Actual leave type ID
   - `PASTE_CATEGORY_ID_HERE` → Actual category ID
   - `PASTE_REQUEST_ID_HERE` → Actual request ID
   - `PASTE_MANAGER_USER_ID_HERE` → Actual manager user ID

3. **Enum Values:**
   - `accrualType`: Must be `"monthly"`, `"yearly"`, `"quarterly"`, or `"semi_annual"`
   - `adjustmentType`: Must be `"suspension"`, `"reduction"`, `"adjustment"`, or `"restoration"`

4. **Dates:** Adjust dates based on your current date (e.g., if today is 2025-01-15, use future dates for leave requests)

5. **Save IDs:** After creating category, type, policy, entitlement, save their IDs for subsequent requests

6. **Required Fields:**
   - `auto-accrue` requires `employeeId` (don't forget this!)
   - `auto-accrue-all` does NOT require `employeeId` (processes all employees)

