# Payroll Execution API Testing Guide - Thunder Client

## Base URL
```
http://localhost:5000/api/v1/payroll
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Required Roles
- **PAYROLL_SPECIALIST**: Most endpoints
- **PAYROLL_MANAGER**: Approval, lock/unlock, resolve irregularities
- **FINANCE_STAFF**: Finance approval

---

## Phase 0: Pre-Run Reviews & Approvals

### 1. Get Pre-Initiation Validation Status✅
**GET** `/pre-initiation-validation`
- **Role**: PAYROLL_SPECIALIST, PAYROLL_MANAGER
- **Body**: None
- **Response**: Returns pending signing bonuses and termination benefits

### 2. Process Signing Bonuses ✅
**POST** `/process-signing-bonuses`
- **Role**: PAYROLL_SPECIALIST
- **Body**: None (auto-processes for new hires)
- **Response**: List of processed signing bonuses

### 3. Create Employee Signing Bonus✅
**POST** `/create-signing-bonus`
- **Role**: PAYROLL_SPECIALIST
- **Body**:
```json
{
  "employeeId": "507f1f77bcf86cd799439011",
  "signingBonusId": "507f1f77bcf86cd799439012",
  "givenAmount": 5000,
  "status": "PENDING",
  "paymentDate": "2025-02-01T00:00:00.000Z"
}
```

### 4. Review Signing Bonus✅
**POST** `/review-signing-bonus`
- **Role**: PAYROLL_SPECIALIST
- **Body**:
```json
{
  "employeeSigningBonusId": "507f1f77bcf86cd799439013",
  "status": "APPROVED",
  "paymentDate": "2025-02-01T00:00:00.000Z"
}
```
- **Status Options**: `APPROVED`, `REJECTED`, `PENDING`, `PAID`

### 5. Edit Signing Bonus✅
**PUT** `/edit-signing-bonus`
- **Role**: PAYROLL_SPECIALIST
- **Body**:
```json
{
  "employeeSigningBonusId": "507f1f77bcf86cd799439013",
  "givenAmount": 6000,
  "status": "APPROVED"
}
```

### 6. Process Termination Benefits✅
**POST** `/process-termination-benefits`
- **Role**: PAYROLL_SPECIALIST
- **Body**: None (auto-processes for terminated/resigned employees)
- **Response**: List of processed termination benefits

### 7. Create Employee Termination Benefit✅
**POST** `/create-termination-benefit`
- **Role**: PAYROLL_SPECIALIST
- **Body**:
```json
{
  "employeeId": "507f1f77bcf86cd799439011",
  "benefitId": "507f1f77bcf86cd799439014",
  "terminationId": "507f1f77bcf86cd799439015",
  "givenAmount": 10000,
  "status": "PENDING"
}
```

### 8. Review Termination Benefit✅
**POST** `/review-termination-benefit`
- **Role**: PAYROLL_SPECIALIST
- **Body**:
```json
{
  "employeeTerminationResignationId": "507f1f77bcf86cd799439016",
  "status": "APPROVED"
}
```
- **Status Options**: `APPROVED`, `REJECTED`, `PENDING`, `PAID`

### 9. Edit Termination Benefit✅
**PUT** `/edit-termination-benefit`
- **Role**: PAYROLL_SPECIALIST
- **Body**:
```json
{
  "employeeTerminationResignationId": "507f1f77bcf86cd799439016",
  "givenAmount": 12000
}
```

---

## Phase 1: Payroll Initiation

### 10. Process Payroll Initiation✅
**POST** `/process-initiation`
- **Role**: PAYROLL_SPECIALIST
- **Body**:
```json
{
  "payrollPeriod": "2025-02-28T00:00:00.000Z",
  "entity": "Company Name|USD",
  "payrollSpecialistId": "507f1f77bcf86cd799439017",
  "currency": "USD",
  "payrollManagerId": "507f1f77bcf86cd799439018"
}
```
- **Note**: Creates payroll run in DRAFT status✅✅✅

### 11. Review Payroll Initiation✅🚩
**POST** `/review-initiation/:runId`
- **Role**: PAYROLL_SPECIALIST
- **URL Parameter**: `runId` (e.g., `PR-2025-0001`)
- **Body**:
```json
{
  "approved": true,
  "reviewerId": "507f1f77bcf86cd799439017",
  "rejectionReason": null
}
```
- **Note**: If approved, automatically triggers draft generation

### 12. Edit Payroll Initiation✅
**PUT** `/edit-initiation/:runId`
- **Role**: PAYROLL_SPECIALIST
- **URL Parameter**: `runId`
- **Body**:
```json
{
  "payrollPeriod": "2025-02-28T00:00:00.000Z",
  "entity": "Company Name|USD",
  "employees": 50,
  "totalnetpay": 500000
}
```

### 13. Review Payroll Period✅
**POST** `/review-payroll-period`
- **Role**: PAYROLL_SPECIALIST
- **Body**:
```json
{
  "payrollRunId": "507f1f77bcf86cd799439019",
  "status": "UNDER_REVIEW",
  "rejectionReason": null
}
```

### 14. Edit Payroll Period✅
**PUT** `/edit-payroll-period`
- **Role**: PAYROLL_SPECIALIST
- **Body**:
```json
{
  "payrollRunId": "507f1f77bcf86cd799439019",
  "payrollPeriod": "2025-02-28T00:00:00.000Z"
}
```

---

## Phase 1.1: Draft Generation

### 15. Generate Draft Payroll Run✅
**POST** `/generate-draft`
- **Role**: PAYROLL_SPECIALIST
- **Body**:
```json
{
  "payrollPeriod": "2025-02-28T00:00:00.000Z",
  "entity": "Company Name|USD",
  "payrollSpecialistId": "507f1f77bcf86cd799439017",
  "currency": "USD",
  "payrollManagerId": "507f1f77bcf86cd799439018"
}
```
- **Note**: Automatically processes signing bonuses and termination benefits before generating draft

---

## Calculations & Utilities

### 16. Calculate Payroll✅
**POST** `/calculate-payroll`
- **Role**: PAYROLL_SPECIALIST
- **Body**:
```json
{
  "employeeId": "507f1f77bcf86cd799439011",
  "payrollRunId": "507f1f77bcf86cd799439019",
  "baseSalary": 10000
}
```
- **Note**: `baseSalary` is optional - if not provided, fetched from PayGrade

### 17. Calculate Prorated Salary✅
**POST** `/calculate-prorated-salary`
- **Role**: PAYROLL_SPECIALIST
- **Body**:
```json
{
  "employeeId": "507f1f77bcf86cd799439011",
  "baseSalary": 10000,
  "startDate": "2025-02-15T00:00:00.000Z",
  "endDate": "2025-02-28T00:00:00.000Z",
  "payrollPeriodEnd": "2025-02-28T00:00:00.000Z"
}
```

### 18. Apply Statutory Rules✅
**POST** `/apply-statutory-rules`
- **Role**: PAYROLL_SPECIALIST
- **Body**:
```json
{
  "baseSalary": 10000,
  "employeeId": "507f1f77bcf86cd799439011"
}
```
- **Note**: Calculates taxes and insurance based on base salary

---

## Phase 2: Draft Review

### 19. Get Payroll Preview✅
**GET** `/preview/:payrollRunId`
- **Role**: PAYROLL_SPECIALIST, PAYROLL_MANAGER
- **URL Parameter**: `payrollRunId`
- **Query Parameter**: `currency` (optional, e.g., `?currency=USD`)
- **Body**: None
- **Response**: Full payroll preview with breakdown

### 20. Detect Irregularities✅
**POST** `/detect-irregularities/:payrollRunId`
- **Role**: PAYROLL_SPECIALIST
- **URL Parameter**: `payrollRunId`
- **Body**: None
- **Response**: List of detected irregularities (negative net pay, missing bank accounts, salary spikes)

### 21. Flag Payroll Exception✅
**POST** `/flag-exception`
- **Role**: PAYROLL_SPECIALIST
- **Body**:
```json
{
  "payrollRunId": "507f1f77bcf86cd799439019",
  "employeeId": "507f1f77bcf86cd799439011",
  "code": "MISSING_BANK_ACCOUNT",
  "message": "Employee has missing bank account details"
}
```

### 22. Get Employee Exceptions✅
**GET** `/employee-exceptions/:employeeId/:payrollRunId`
- **Role**: PAYROLL_SPECIALIST, PAYROLL_MANAGER
- **URL Parameters**: `employeeId`, `payrollRunId`
- **Body**: None

### 23. Get All Payroll Exceptions✅
**GET** `/payroll-exceptions/:payrollRunId`
- **Role**: PAYROLL_SPECIALIST, PAYROLL_MANAGER
- **URL Parameter**: `payrollRunId`
- **Body**: None

---

## Phase 3: Review & Approval

### 24. Send for Approval✅
**POST** `/send-for-approval`
- **Role**: PAYROLL_SPECIALIST
- **Body**:
```json
{
  "payrollRunId": "507f1f77bcf86cd799439019",
  "managerId": "507f1f77bcf86cd799439018",
  "financeStaffId": "507f1f77bcf86cd799439020"
}
```
- **Note**: Publishes payroll for Manager and Finance review

### 25. Manager Approval✅
**POST** `/manager-approval`
- **Role**: PAYROLL_MANAGER
- **Body**:
```json
{
  "payrollRunId": "507f1f77bcf86cd799439019",
  "status": "PENDING_FINANCE_APPROVAL",
  "managerComments": "Approved by manager",
  "managerDecision": "PENDING_FINANCE_APPROVAL",
  "payrollManagerId": "507f1f77bcf86cd799439018",
  "managerApprovalDate": "2025-02-15T00:00:00.000Z"
}
```

### 26. Resolve Irregularity✅
**POST** `/resolve-irregularity`
- **Role**: PAYROLL_MANAGER
- **Body**:
```json
{
  "payrollRunId": "507f1f77bcf86cd799439019",
  "employeeId": "507f1f77bcf86cd799439011",
  "exceptionCode": "MISSING_BANK_ACCOUNT",
  "resolution": "Bank account details updated",
  "managerId": "507f1f77bcf86cd799439018"
}
```

### 27. Finance Approval✅
**POST** `/finance-approval`
- **Role**: FINANCE_STAFF
- **Body**:
```json
{
  "payrollRunId": "507f1f77bcf86cd799439019",
  "decision": "approve",
  "reason": null,
  "financeStaffId": "507f1f77bcf86cd799439020",
  "decisionDate": "2025-02-15T00:00:00.000Z"
}
```
- **Decision Options**: `approve`, `reject`
- **Note**: If approved, sets `paymentStatus` to `PAID`

### 28. Lock Payroll✅
**POST** `/:id/lock`
- **Role**: PAYROLL_MANAGER
- **URL Parameter**: `id` (payroll run ID)
- **Body**: None
- **Note**: Locks payroll after Finance approval

### 29. Unlock Payroll✅
**POST** `/:id/unlock`
- **Role**: PAYROLL_MANAGER
- **URL Parameter**: `id`
- **Body**:
```json
{
  "payrollRunId": "507f1f77bcf86cd799439019",
  "unlockReason": "Correction needed for employee salary"
}
```

### 30. Freeze Payroll✅
**POST** `/:id/freeze`
- **Role**: PAYROLL_MANAGER
- **URL Parameter**: `id`
- **Body**: None
- **Note**: Functionally same as lock

### 31. Unfreeze Payroll✅
**POST** `/:id/unfreeze`
- **Role**: PAYROLL_MANAGER
- **URL Parameter**: `id`
- **Body**:
```json
{
  "payrollRunId": "507f1f77bcf86cd799439019",
  "unlockReason": "Correction needed for employee salary"
}
```

---

## Phase 5: Execution

### 32. Generate and Distribute Payslips✅
**POST** `/generate-payslips`
- **Role**: PAYROLL_SPECIALIST
- **Body**:
```json
{
  "payrollRunId": "507f1f77bcf86cd799439019",
  "distributionMethod": "PORTAL"
}
```
- **Distribution Methods**: `PDF`, `EMAIL`, `PORTAL`
- **Note**: Only works if payroll is LOCKED and paymentStatus is PAID

---

## Testing Workflow

### Complete Payroll Cycle Testing Flow:

1. **Phase 0 - Pre-Run Reviews:**
   - Get pre-initiation validation status
   - Process signing bonuses
   - Review/Edit signing bonuses
   - Process termination benefits
   - Review/Edit termination benefits

2. **Phase 1 - Initiation:**
   - Process payroll initiation
   - Review payroll initiation (approve to trigger draft)
   - Or edit if rejected

3. **Phase 1.1 - Draft Generation:**
   - Generate draft payroll run (or auto-generated after initiation approval)

4. **Phase 2 - Review:**
   - Get payroll preview
   - Detect irregularities
   - Flag exceptions if needed

5. **Phase 3 - Approval:**
   - Send for approval
   - Manager approval
   - Resolve irregularities (if any)
   - Finance approval
   - Lock payroll

6. **Phase 5 - Execution:**
   - Generate and distribute payslips

---

## Important Notes

1. **Replace Placeholder IDs**: All MongoDB ObjectIds in examples are placeholders. Replace with actual IDs from your database.

2. **JWT Token**: Get JWT token from login endpoint and include in Authorization header.

3. **Date Format**: All dates must be in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`

4. **Currency Format**: Entity field format: `"Entity Name|CURRENCY_CODE"` (e.g., `"Company Name|USD"`)

5. **Status Values**: 
   - Payroll Status: `DRAFT`, `UNDER_REVIEW`, `PENDING_FINANCE_APPROVAL`, `APPROVED`, `REJECTED`, `LOCKED`, `UNLOCKED`
   - Bonus Status: `PENDING`, `APPROVED`, `REJECTED`, `PAID`
   - Benefit Status: `PENDING`, `APPROVED`, `REJECTED`, `PAID`
   - Payment Status: `PENDING`, `PAID`

6. **Error Handling**: All endpoints return appropriate HTTP status codes:
   - `200`: Success
   - `400`: Bad Request (validation errors)
   - `401`: Unauthorized (missing/invalid token)
   - `403`: Forbidden (insufficient role)
   - `404`: Not Found
   - `500`: Internal Server Error

---

## Import to Thunder Client

1. Copy the contents of `thunder-client-payroll-execution-complete.json`
2. Open Thunder Client in VS Code
3. Click "Collections" → "Import"
4. Paste the JSON content
5. Update the JWT token in the Authorization header for all requests
6. Replace placeholder IDs with actual MongoDB ObjectIds

