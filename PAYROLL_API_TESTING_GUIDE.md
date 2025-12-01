# Payroll Execution API Testing Guide - Thunder Client

## 📋 Prerequisites

1. **Base URL**: `http://localhost:5000` (or your server URL)
2. **Global Prefix**: All routes are prefixed with `/api/v1`
3. **Full Base URL**: `http://localhost:5000/api/v1`
4. **Authentication**: All endpoints require JWT token in Authorization header
5. **Format**: `Authorization: Bearer <your-jwt-token>`

### Getting JWT Token
First, authenticate to get a JWT token:
```
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "employeeNumber": "EMP-001",
  "password": "password123"
}
```

**⚠️ IMPORTANT**: The login endpoint uses `employeeNumber` (not `email`)!

---

## 🔐 Role-Based Access

- **PAYROLL_SPECIALIST**: Most payroll operations
- **PAYROLL_MANAGER**: Review, approval, lock/unlock operations
- **FINANCE_STAFF**: Finance approval operations

---

## 📝 API Test Examples

### 1. Payroll Initiation & Processing

#### 1.1 Process Payroll Initiation✅
**Endpoint**: `POST http://localhost:5000/api/v1/payroll/process-initiation`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Create a new payroll run for a period

**Normal Case:**
```json
{
  "payrollPeriod": "2025-01-31T00:00:00.000Z",
  "entity": "Main Office",
  "payrollSpecialistId": "507f1f77bcf86cd799439011",
  "currency": "USD"
}
```

**Edge Cases:**
```json
// Without currency (defaults to USD)
{
  "payrollPeriod": "2025-01-31T00:00:00.000Z",
  "entity": "Main Office",
  "payrollSpecialistId": "507f1f77bcf86cd799439011"
}

// Multi-currency (EUR)
{
  "payrollPeriod": "2025-01-31T00:00:00.000Z",
  "entity": "European Branch",
  "payrollSpecialistId": "507f1f77bcf86cd799439011",
  "currency": "EUR"
}

// Future date (should fail if > 3 months)
{
  "payrollPeriod": "2026-01-31T00:00:00.000Z",
  "entity": "Main Office",
  "payrollSpecialistId": "507f1f77bcf86cd799439011"
}

// Invalid date format (should fail)
{
  "payrollPeriod": "invalid-date",
  "entity": "Main Office",
  "payrollSpecialistId": "507f1f77bcf86cd799439011"
}
```

---

#### 1.2 Review Payroll Initiation✅
**Endpoint**: `POST http://localhost:5000/api/v1/payroll/review-initiation/:runId`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Approve or reject payroll initiation

**Approve Case:**
```json
{
  "approved": true,
  "reviewerId": "507f1f77bcf86cd799439011",
  "rejectionReason": null
}
```

**Reject Case:**
```json
{
  "approved": false,
  "reviewerId": "507f1f77bcf86cd799439011",
  "rejectionReason": "Invalid payroll period - contract violations detected"
}
```

**Edge Cases:**
```json
// Missing rejection reason (should still work)
{
  "approved": false,
  "reviewerId": "507f1f77bcf86cd799439011"
}

// Invalid runId (should return 404)
// Use: POST /payroll/review-initiation/invalid-id
```

---

#### 1.3 Edit Payroll Initiation✅
**Endpoint**: `PUT /payroll/edit-initiation/:runId`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Edit payroll initiation details (only for DRAFT or REJECTED)

**Normal Case:**
```json
{
  "payrollPeriod": "2025-02-28T00:00:00.000Z",
  "entity": "Updated Entity Name"
}
```

**Edge Cases:**
```json
// Edit only entity
{
  "entity": "New Entity Name"
}

// Edit only period
{
  "payrollPeriod": "2025-02-28T00:00:00.000Z"
}

// Try to edit locked payroll (should fail)
// Use a runId of a LOCKED payroll run
```

---

### 2. Signing Bonus Operations

#### 2.1 Process Signing Bonuses✅
**Endpoint**: `POST http://localhost:5000/api/v1/payroll/process-signing-bonuses`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Automatically process signing bonuses for new hires

**Request Body**: None (empty body)

**Test Cases:**
- Call with no new hires (should return empty array)
- Call with new hires in last 30 days (should process)
- Call multiple times (should skip already processed)

---

#### 2.2 Create Employee Signing Bonus✅
**Endpoint**: `POST http://localhost:5000/api/v1/payroll/create-signing-bonus`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Manually create an employee signing bonus record

**Normal Case:**
```json
{
  "employeeId": "692b6728af00a04b192f953e",
  "signingBonusId": "692e0313010cf76cf697c5a2",
  "givenAmount": 5000,
  "status": "pending",
  "paymentDate": "2025-02-15T00:00:00.000Z"
}
```

**Minimal Case (only required fields):**
```json
{
  "employeeId": "692b6728af00a04b192f953e",
  "signingBonusId": "692e0313010cf76cf697c5a2",
  "givenAmount": 5000
}
```

**Edge Cases:**
```json
// With approved status
{
  "employeeId": "692b6728af00a04b192f953e",
  "signingBonusId": "692e0313010cf76cf697c5a2",
  "givenAmount": 5000,
  "status": "approved"
}

// Zero amount (should fail validation)
{
  "employeeId": "692b6728af00a04b192f953e",
  "signingBonusId": "692e0313010cf76cf697c5a2",
  "givenAmount": 0
}

// Negative amount (should fail validation)
{
  "employeeId": "692b6728af00a04b192f953e",
  "signingBonusId": "692e0313010cf76cf697c5a2",
  "givenAmount": -1000
}

// Invalid employeeId (should return error)
{
  "employeeId": "000000000000000000000000",
  "signingBonusId": "692e0313010cf76cf697c5a2",
  "givenAmount": 5000
}

// Invalid signingBonusId (should return error)
{
  "employeeId": "692b6728af00a04b192f953e",
  "signingBonusId": "000000000000000000000000",
  "givenAmount": 5000
}

// Duplicate (same employee + signingBonusId) (should fail)
// Call twice with same employeeId and signingBonusId
```

**Field Descriptions:**
- `employeeId` (required): MongoDB ObjectId of the employee who will receive the signing bonus
- `signingBonusId` (required): MongoDB ObjectId of the signing bonus configuration (from `signingbonus` collection)
- `givenAmount` (required): The amount to be given to this employee (must be > 0)
- `status` (optional): Status of the bonus. Options: `"pending"`, `"approved"`, `"rejected"`, `"paid"`. Defaults to `"pending"` if not provided
- `paymentDate` (optional): ISO 8601 date string for when the bonus will be paid

**Response Example:**
```json
{
  "_id": "692e1234567890abcdef1234",
  "employeeId": "692b6728af00a04b192f953e",
  "signingBonusId": "692e0313010cf76cf697c5a2",
  "givenAmount": 5000,
  "status": "pending",
  "createdAt": "2025-12-01T21:30:00.000Z",
  "updatedAt": "2025-12-01T21:30:00.000Z"
}
```

---

#### 2.3 Review Signing Bonus✅
**Endpoint**: `POST http://localhost:5000/api/v1/payroll/review-signing-bonus`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Approve or reject a signing bonus

**⚠️ IMPORTANT**: Use the `_id` from the `employeesigningbonus` collection (created via `create-signing-bonus` or `process-signing-bonuses`), NOT the `signingBonusId` from the `signingbonus` configuration collection.

**Approve Case:**
```json
{
  "employeeSigningBonusId": "507f1f77bcf86cd799439011",
  "status": "approved",
  "paymentDate": "2025-02-15T00:00:00.000Z"
}
```

**Reject Case:**
```json
{
  "employeeSigningBonusId": "507f1f77bcf86cd799439011",
  "status": "rejected"
}
```

**Edge Cases:**
```json
// Without paymentDate
{
  "employeeSigningBonusId": "507f1f77bcf86cd799439011",
  "status": "approved"
}

// Invalid status (should fail)
{
  "employeeSigningBonusId": "507f1f77bcf86cd799439011",
  "status": "invalid_status"
}

// Invalid employeeSigningBonusId (should return 404)
{
  "employeeSigningBonusId": "000000000000000000000000",
  "status": "approved"
}
```

---

#### 2.4 Edit Signing Bonus✅
**Endpoint**: `PUT http://localhost:5000/api/v1/payroll/edit-signing-bonus`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Manually edit signing bonus details

**Normal Case:**
```json
{
  "employeeSigningBonusId": "507f1f77bcf86cd799439011",
  "givenAmount": 5000,
  "status": "approved",
  "paymentDate": "2025-02-15T00:00:00.000Z"
}
```

**Edge Cases:**
```json
// Edit only amount
{
  "employeeSigningBonusId": "507f1f77bcf86cd799439011",
  "givenAmount": 7500
}

// Edit only status
{
  "employeeSigningBonusId": "507f1f77bcf86cd799439011",
  "status": "paid"
}

// Negative amount (should fail)
{
  "employeeSigningBonusId": "507f1f77bcf86cd799439011",
  "givenAmount": -1000
}

// Switch to different signing bonus config
{
  "employeeSigningBonusId": "507f1f77bcf86cd799439011",
  "signingBonusId": "507f1f77bcf86cd799439012"
}

// Try to edit bonus part of locked payroll (should fail)
```

---

### 3. Termination/Resignation Benefits

#### 3.1 Process Termination Benefits
**Endpoint**: `POST http://localhost:5000/api/v1/payroll/process-termination-benefits`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Automatically process benefits for approved terminations

**Request Body**: None (empty body)

**Test Cases:**
- Call with no approved terminations (should return empty array)
- Call with approved terminations (should process)
- Call multiple times (should skip already processed)

---

#### 3.2 Create Employee Termination Benefit✅
**Endpoint**: `POST http://localhost:5000/api/v1/payroll/create-termination-benefit`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Manually create an employee termination benefit record

**Normal Case:**
```json
{
  "employeeId": "692b6728af00a04b192f953e",
  "benefitId": "692e0336010cf76cf697c5a9",
  "terminationId": "692e1234567890abcdef1234",
  "givenAmount": 10000,
  "status": "pending"
}
```

**Minimal Case (only required fields):**
```json
{
  "employeeId": "692b6728af00a04b192f953e",
  "benefitId": "692e0336010cf76cf697c5a9",
  "terminationId": "692e1234567890abcdef1234",
  "givenAmount": 10000
}
```

**Edge Cases:**
```json
// With approved status
{
  "employeeId": "692b6728af00a04b192f953e",
  "benefitId": "692e0336010cf76cf697c5a9",
  "terminationId": "692e1234567890abcdef1234",
  "givenAmount": 10000,
  "status": "approved"
}

// Zero amount (should fail validation)
{
  "employeeId": "692b6728af00a04b192f953e",
  "benefitId": "692e0336010cf76cf697c5a9",
  "terminationId": "692e1234567890abcdef1234",
  "givenAmount": 0
}

// Negative amount (should fail validation)
{
  "employeeId": "692b6728af00a04b192f953e",
  "benefitId": "692e0336010cf76cf697c5a9",
  "terminationId": "692e1234567890abcdef1234",
  "givenAmount": -5000
}

// Invalid employeeId (should return error)
{
  "employeeId": "000000000000000000000000",
  "benefitId": "692e0336010cf76cf697c5a9",
  "terminationId": "692e1234567890abcdef1234",
  "givenAmount": 10000
}

// Invalid benefitId (should return error)
{
  "employeeId": "692b6728af00a04b192f953e",
  "benefitId": "000000000000000000000000",
  "terminationId": "692e1234567890abcdef1234",
  "givenAmount": 10000
}

// Invalid terminationId (should return error)
{
  "employeeId": "692b6728af00a04b192f953e",
  "benefitId": "692e0336010cf76cf697c5a9",
  "terminationId": "000000000000000000000000",
  "givenAmount": 10000
}

// Duplicate (same employee + benefitId + terminationId) (should fail)
// Call twice with same combination
```

**Field Descriptions:**
- `employeeId` (required): MongoDB ObjectId of the employee who will receive the termination benefit
- `benefitId` (required): MongoDB ObjectId of the termination/resignation benefit configuration (from `terminationandresignationbenefits` collection)
- `terminationId` (required): MongoDB ObjectId of the termination request (from `terminationrequests` collection)
- `givenAmount` (required): The amount to be given to this employee (must be > 0)
- `status` (optional): Status of the benefit. Options: `"pending"`, `"approved"`, `"rejected"`, `"paid"`. Defaults to `"pending"` if not provided

**Response Example:**
```json
{
  "_id": "692e1234567890abcdef1234",
  "employeeId": "692b6728af00a04b192f953e",
  "benefitId": "692e0336010cf76cf697c5a9",
  "terminationId": "692e1234567890abcdef1234",
  "givenAmount": 10000,
  "status": "pending",
  "createdAt": "2025-12-01T21:30:00.000Z",
  "updatedAt": "2025-12-01T21:30:00.000Z"
}
```

---

#### 3.3 Review Termination Benefit✅
**Endpoint**: `POST http://localhost:5000/api/v1/payroll/review-termination-benefit`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Approve or reject a termination benefit

**⚠️ IMPORTANT**: Use the `_id` from the `employeeterminationresignations` collection (created via `create-termination-benefit` or `process-termination-benefits`), NOT the `benefitId` from the `terminationandresignationbenefits` configuration collection.

**Approve Case:**
```json
{
  "employeeTerminationResignationId": "507f1f77bcf86cd799439011",
  "status": "approved"
}
```

**Reject Case:**
```json
{
  "employeeTerminationResignationId": "507f1f77bcf86cd799439011",
  "status": "rejected"
}
```

**Edge Cases:**
```json
// Invalid status (should fail)
{
  "employeeTerminationResignationId": "507f1f77bcf86cd799439011",
  "status": "invalid"
}

// Non-existent ID (should return 404)
{
  "employeeTerminationResignationId": "000000000000000000000000",
  "status": "approved"
}
```

---

#### 3.4 Edit Termination Benefit
**Endpoint**: `PUT http://localhost:5000/api/v1/payroll/edit-termination-benefit`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Manually edit termination benefit details

**Normal Case:**
```json
{
  "employeeTerminationResignationId": "507f1f77bcf86cd799439011",
  "givenAmount": 10000,
  "benefitId": "507f1f77bcf86cd799439012",
  "terminationId": "507f1f77bcf86cd799439013"
}
```

**Edge Cases:**
```json
// Edit only amount
{
  "employeeTerminationResignationId": "507f1f77bcf86cd799439011",
  "givenAmount": 15000
}

// Negative amount (should fail)
{
  "employeeTerminationResignationId": "507f1f77bcf86cd799439011",
  "givenAmount": -5000
}

// Try to edit benefit part of locked payroll (should fail)
```

---

### 4. Payroll Calculation

#### 4.1 Calculate Payroll
**Endpoint**: `POST /payroll/calculate-payroll`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Calculate payroll for a specific employee

**Normal Case (with baseSalary):**
```json
{
  "employeeId": "507f1f77bcf86cd799439011",
  "payrollRunId": "507f1f77bcf86cd799439012",
  "baseSalary": 5000
}
```

**Normal Case (auto-fetch from PayGrade):**
```json
{
  "employeeId": "507f1f77bcf86cd799439011",
  "payrollRunId": "507f1f77bcf86cd799439012"
}
```

**Edge Cases:**
```json
// Zero baseSalary (should flag exception)
{
  "employeeId": "507f1f77bcf86cd799439011",
  "payrollRunId": "507f1f77bcf86cd799439012",
  "baseSalary": 0
}

// Negative baseSalary (should fail validation)
{
  "employeeId": "507f1f77bcf86cd799439011",
  "payrollRunId": "507f1f77bcf86cd799439012",
  "baseSalary": -1000
}

// Invalid employeeId (should return 404)
{
  "employeeId": "000000000000000000000000",
  "payrollRunId": "507f1f77bcf86cd799439012"
}

// Invalid payrollRunId (should return 404)
{
  "employeeId": "507f1f77bcf86cd799439011",
  "payrollRunId": "000000000000000000000000"
}
```

---

#### 4.2 Calculate Prorated Salary
**Endpoint**: `POST /payroll/calculate-prorated-salary`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Calculate prorated salary for partial periods

**Normal Case (Mid-month hire):**
```json
{
  "employeeId": "507f1f77bcf86cd799439011",
  "baseSalary": 5000,
  "startDate": "2025-01-15T00:00:00.000Z",
  "endDate": "2025-01-31T23:59:59.999Z",
  "payrollPeriodEnd": "2025-01-31T23:59:59.999Z"
}
```

**Normal Case (Mid-month termination):**
```json
{
  "employeeId": "507f1f77bcf86cd799439011",
  "baseSalary": 5000,
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-01-15T23:59:59.999Z",
  "payrollPeriodEnd": "2025-01-31T23:59:59.999Z"
}
```

**Edge Cases:**
```json
// Full month (should return full salary)
{
  "employeeId": "507f1f77bcf86cd799439011",
  "baseSalary": 5000,
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-01-31T23:59:59.999Z",
  "payrollPeriodEnd": "2025-01-31T23:59:59.999Z"
}

// Single day
{
  "employeeId": "507f1f77bcf86cd799439011",
  "baseSalary": 5000,
  "startDate": "2025-01-31T00:00:00.000Z",
  "endDate": "2025-01-31T23:59:59.999Z",
  "payrollPeriodEnd": "2025-01-31T23:59:59.999Z"
}

// Invalid date range (startDate > endDate) (should fail)
{
  "employeeId": "507f1f77bcf86cd799439011",
  "baseSalary": 5000,
  "startDate": "2025-01-31T00:00:00.000Z",
  "endDate": "2025-01-01T00:00:00.000Z",
  "payrollPeriodEnd": "2025-01-31T23:59:59.999Z"
}

// Zero baseSalary (should return 0)
{
  "employeeId": "507f1f77bcf86cd799439011",
  "baseSalary": 0,
  "startDate": "2025-01-15T00:00:00.000Z",
  "endDate": "2025-01-31T23:59:59.999Z",
  "payrollPeriodEnd": "2025-01-31T23:59:59.999Z"
}
```

---

#### 4.3 Apply Statutory Rules
**Endpoint**: `POST /payroll/apply-statutory-rules`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Calculate taxes and insurance deductions

**Normal Case:**
```json
{
  "baseSalary": 5000,
  "employeeId": "507f1f77bcf86cd799439011"
}
```

**Edge Cases:**
```json
// High salary (should apply higher tax brackets)
{
  "baseSalary": 50000,
  "employeeId": "507f1f77bcf86cd799439011"
}

// Low salary (minimum wage)
{
  "baseSalary": 6000,
  "employeeId": "507f1f77bcf86cd799439011"
}

// Zero salary (should fail)
{
  "baseSalary": 0,
  "employeeId": "507f1f77bcf86cd799439011"
}

// Negative salary (should fail)
{
  "baseSalary": -1000,
  "employeeId": "507f1f77bcf86cd799439011"
}
```

---

### 5. Draft Generation

#### 5.1 Generate Draft Payroll Run
**Endpoint**: `POST /payroll/generate-draft`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Generate complete draft payroll for all employees

**Normal Case:**
```json
{
  "payrollPeriod": "2025-01-31T00:00:00.000Z",
  "entity": "Main Office",
  "payrollSpecialistId": "507f1f77bcf86cd799439011",
  "currency": "USD"
}
```

**Edge Cases:**
```json
// Without currency
{
  "payrollPeriod": "2025-01-31T00:00:00.000Z",
  "entity": "Main Office",
  "payrollSpecialistId": "507f1f77bcf86cd799439011"
}

// Duplicate period (should fail)
// Call twice with same period

// No active employees (should fail)
// Use period where no employees exist

// With pending signing bonuses (should fail validation)
// Create pending signing bonuses first, then try to generate draft
```

---

### 6. Irregularity Detection & Flagging

#### 6.1 Flag Payroll Exception
**Endpoint**: `POST /payroll/flag-exception`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Manually flag a payroll exception

**Normal Case (with employeeId):**
```json
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "employeeId": "507f1f77bcf86cd799439012",
  "code": "MISSING_BANK_ACCOUNT",
  "message": "Employee bank account details are missing"
}
```

**Normal Case (without employeeId - general exception):**
```json
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "code": "SYSTEM_ERROR",
  "message": "Database connection timeout during calculation"
}
```

**Edge Cases:**
```json
// Empty message (should still work)
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "code": "WARNING",
  "message": ""
}

// Very long message
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "code": "DETAILED_ERROR",
  "message": "A very long error message that contains detailed information about what went wrong during the payroll calculation process..."
}

// Invalid payrollRunId (should return 404)
{
  "payrollRunId": "000000000000000000000000",
  "code": "TEST",
  "message": "Test exception"
}
```

---

#### 6.2 Detect Irregularities
**Endpoint**: `POST /payroll/detect-irregularities/:payrollRunId`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Auto-detect irregularities (salary spikes, missing bank accounts, negative net pay)

**Normal Case:**
```
POST /payroll/detect-irregularities/507f1f77bcf86cd799439011
Body: (empty)
```

**Edge Cases:**
```
// Invalid payrollRunId
POST /payroll/detect-irregularities/invalid-id

// Payroll run with no employees
POST /payroll/detect-irregularities/507f1f77bcf86cd799439011

// Payroll run with all employees having issues
```

---

### 7. Preview & Validation

#### 7.1 Get Payroll Preview
**Endpoint**: `GET /payroll/preview/:payrollRunId`  
**Role**: `PAYROLL_SPECIALIST`, `PAYROLL_MANAGER`  
**Description**: Preview payroll results with optional currency conversion

**Normal Case:**
```
GET /payroll/preview/507f1f77bcf86cd799439011
```

**With Currency Conversion:**
```
GET /payroll/preview/507f1f77bcf86cd799439011?currency=EUR
GET /payroll/preview/507f1f77bcf86cd799439011?currency=GBP
GET /payroll/preview/507f1f77bcf86cd799439011?currency=AED
```

**Edge Cases:**
```
// Invalid payrollRunId
GET /payroll/preview/000000000000000000000000

// Invalid currency code (should use default)
GET /payroll/preview/507f1f77bcf86cd799439011?currency=INVALID

// Same currency (should return without conversion)
GET /payroll/preview/507f1f77bcf86cd799439011?currency=USD
```

---

#### 7.2 Get Pre-Initiation Validation Status
**Endpoint**: `GET /payroll/pre-initiation-validation`  
**Role**: `PAYROLL_SPECIALIST`, `PAYROLL_MANAGER`  
**Description**: Check if payroll can be initiated (checks for pending signing bonuses/benefits)

**Request**: None (empty)

**Test Cases:**
- Call when no pending items (should return canInitiate: true)
- Call with pending signing bonuses (should return canInitiate: false)
- Call with pending termination benefits (should return canInitiate: false)
- Call with both pending (should return canInitiate: false)

---

### 8. Approval Workflow

#### 8.1 Send for Approval
**Endpoint**: `POST /payroll/send-for-approval`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Send payroll run to Manager and Finance for approval

**Normal Case:**
```json
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "managerId": "507f1f77bcf86cd799439012",
  "financeStaffId": "507f1f77bcf86cd799439013"
}
```

**Edge Cases:**
```json
// Invalid payrollRunId (should return 404)
{
  "payrollRunId": "000000000000000000000000",
  "managerId": "507f1f77bcf86cd799439012",
  "financeStaffId": "507f1f77bcf86cd799439013"
}

// Try to send non-DRAFT payroll (should fail)
// Use a payroll run that's already UNDER_REVIEW
```

---

#### 8.2 Manager Approval
**Endpoint**: `POST /payroll/manager-approval`  
**Role**: `PAYROLL_MANAGER`  
**Description**: Manager approves or rejects payroll run

**Approve Case:**
```json
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "managerDecision": "approved",
  "managerComments": "All calculations verified, approved for finance review",
  "payrollManagerId": "507f1f77bcf86cd799439012",
  "managerApprovalDate": "2025-02-01T10:00:00.000Z"
}
```

**Reject Case:**
```json
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "managerDecision": "rejected",
  "managerComments": "Multiple irregularities detected, needs correction"
}
```

**Edge Cases:**
```json
// Without comments
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "managerDecision": "approved"
}

// Future approval date (should fail)
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "managerDecision": "approved",
  "managerApprovalDate": "2026-01-01T00:00:00.000Z"
}

// Invalid decision (should fail)
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "managerDecision": "invalid"
}

// Try to approve non-UNDER_REVIEW payroll (should fail)
```

---

#### 8.3 Finance Approval
**Endpoint**: `POST /payroll/finance-approval`  
**Role**: `FINANCE_STAFF`  
**Description**: Finance staff approves or rejects payroll disbursement

**Approve Case:**
```json
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "decision": "approve",
  "financeStaffId": "507f1f77bcf86cd799439012",
  "decisionDate": "2025-02-02T10:00:00.000Z"
}
```

**Reject Case:**
```json
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "decision": "reject",
  "reason": "Insufficient funds in payroll account"
}
```

**Edge Cases:**
```json
// Without reason (should still work)
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "decision": "reject"
}

// Future decision date (should fail)
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "decision": "approve",
  "decisionDate": "2026-01-01T00:00:00.000Z"
}

// Invalid decision (should fail)
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "decision": "maybe"
}

// Try to approve non-PENDING_FINANCE_APPROVAL payroll (should fail)
```

---

### 9. Lock/Freeze Operations

#### 9.1 Lock Payroll
**Endpoint**: `POST /payroll/:id/lock`  
**Role**: `PAYROLL_MANAGER`  
**Description**: Lock finalized payroll to prevent changes

**Normal Case:**
```
POST /payroll/507f1f77bcf86cd799439011/lock
Body: (empty)
```

**Edge Cases:**
```
// Try to lock non-APPROVED payroll (should fail)
// Use a DRAFT payroll run ID

// Try to lock already LOCKED payroll (should fail)
// Use a LOCKED payroll run ID

// Invalid ID
POST /payroll/invalid-id/lock
```

---

#### 9.2 Unlock Payroll
**Endpoint**: `POST /payroll/:id/unlock`  
**Role**: `PAYROLL_MANAGER`  
**Description**: Unlock payroll with reason

**Normal Case:**
```json
{
  "unlockReason": "Correction needed for employee EMP-001 salary calculation"
}
```

**Edge Cases:**
```json
// Empty reason (should fail)
{
  "unlockReason": ""
}

// Very short reason
{
  "unlockReason": "Fix"
}

// Very long reason
{
  "unlockReason": "This is a very detailed reason explaining why we need to unlock this payroll run. It contains multiple paragraphs of information about the specific corrections that need to be made..."
}

// Try to unlock non-LOCKED payroll (should fail)
// Use a DRAFT payroll run ID

// Missing unlockReason (should fail validation)
{}
```

---

#### 9.3 Freeze Payroll
**Endpoint**: `POST /payroll/:id/freeze`  
**Role**: `PAYROLL_MANAGER`  
**Description**: Freeze payroll (same as lock)

**Normal Case:**
```
POST /payroll/507f1f77bcf86cd799439011/freeze
Body: (empty)
```

**Edge Cases**: Same as Lock Payroll

---

#### 9.4 Unfreeze Payroll
**Endpoint**: `POST /payroll/:id/unfreeze`  
**Role**: `PAYROLL_MANAGER`  
**Description**: Unfreeze payroll with reason (same as unlock)

**Normal Case:**
```json
{
  "unlockReason": "Need to correct termination benefit amount"
}
```

**Edge Cases**: Same as Unlock Payroll

---

### 10. Exception Management

#### 10.1 Resolve Irregularity
**Endpoint**: `POST /payroll/resolve-irregularity`  
**Role**: `PAYROLL_MANAGER`  
**Description**: Resolve escalated payroll irregularities

**Normal Case:**
```json
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "employeeId": "507f1f77bcf86cd799439012",
  "exceptionCode": "MISSING_BANK_ACCOUNT",
  "resolution": "Bank account details updated, issue resolved",
  "managerId": "507f1f77bcf86cd799439013"
}
```

**Edge Cases:**
```json
// Empty resolution (should still work but not recommended)
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "employeeId": "507f1f77bcf86cd799439012",
  "exceptionCode": "MISSING_BANK_ACCOUNT",
  "resolution": "",
  "managerId": "507f1f77bcf86cd799439013"
}

// Invalid exceptionCode (should fail)
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "employeeId": "507f1f77bcf86cd799439012",
  "exceptionCode": "NON_EXISTENT_CODE",
  "resolution": "Test resolution",
  "managerId": "507f1f77bcf86cd799439013"
}

// Try to resolve already resolved exception (should fail)
```

---

#### 10.2 Get Employee Exceptions
**Endpoint**: `GET /payroll/employee-exceptions/:employeeId/:payrollRunId`  
**Role**: `PAYROLL_SPECIALIST`, `PAYROLL_MANAGER`  
**Description**: Get all exceptions for a specific employee in a payroll run

**Normal Case:**
```
GET /payroll/employee-exceptions/507f1f77bcf86cd799439011/507f1f77bcf86cd799439012
```

**Edge Cases:**
```
// Invalid employeeId
GET /payroll/employee-exceptions/000000000000000000000000/507f1f77bcf86cd799439012

// Invalid payrollRunId
GET /payroll/employee-exceptions/507f1f77bcf86cd799439011/000000000000000000000000

// Employee with no exceptions (should return empty arrays)
```

---

#### 10.3 Get All Payroll Exceptions
**Endpoint**: `GET /payroll/payroll-exceptions/:payrollRunId`  
**Role**: `PAYROLL_SPECIALIST`, `PAYROLL_MANAGER`  
**Description**: Get all exceptions across all employees in a payroll run

**Normal Case:**
```
GET /payroll/payroll-exceptions/507f1f77bcf86cd799439011
```

**Edge Cases:**
```
// Invalid payrollRunId
GET /payroll/payroll-exceptions/000000000000000000000000

// Payroll run with no exceptions (should return zeros)
```

---

### 11. Payslip Generation

#### 11.1 Generate and Distribute Payslips
**Endpoint**: `POST /payroll/generate-payslips`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Generate and distribute payslips (PDF, EMAIL, or PORTAL)

**Normal Case (PORTAL):**
```json
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "distributionMethod": "PORTAL"
}
```

**Normal Case (PDF):**
```json
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "distributionMethod": "PDF"
}
```

**Normal Case (EMAIL):**
```json
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "distributionMethod": "EMAIL"
}
```

**Edge Cases:**
```json
// Without distributionMethod (defaults to PORTAL)
{
  "payrollRunId": "507f1f77bcf86cd799439011"
}

// Invalid distributionMethod (should fail)
{
  "payrollRunId": "507f1f77bcf86cd799439011",
  "distributionMethod": "SMS"
}

// Try to generate for non-LOCKED payroll (should fail)
// Use a DRAFT payroll run ID

// Try to generate for non-PAID payroll (should fail)
// Use a payroll run with paymentStatus: PENDING
```

---

### 12. Legacy Endpoints (For Reference)

#### 12.1 Create Payroll Run (Legacy)
**Endpoint**: `POST /payroll/create`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Create payroll run manually (legacy method)

**Normal Case:**
```json
{
  "runId": "PR-2025-0001",
  "payrollPeriod": "2025-01-31T00:00:00.000Z",
  "entity": "Main Office",
  "employees": 50,
  "totalnetpay": 250000,
  "payrollSpecialistId": "507f1f77bcf86cd799439011",
  "status": "draft",
  "paymentStatus": "pending"
}
```

---

#### 12.2 Review Payroll (Legacy)
**Endpoint**: `POST /payroll/:id/review`  
**Role**: `PAYROLL_MANAGER`  
**Description**: Review payroll run (legacy method)

**Normal Case:**
```json
{
  "status": "under review",
  "comments": "Reviewed and ready for finance approval"
}
```

---

#### 12.3 Generate Employee Payroll Details
**Endpoint**: `POST /payroll/generate-details`  
**Role**: `PAYROLL_SPECIALIST`  
**Description**: Generate payroll details for a single employee

**Normal Case:**
```json
{
  "employeeId": "507f1f77bcf86cd799439011",
  "payrollRunId": "507f1f77bcf86cd799439012",
  "baseSalary": 5000,
  "allowances": 1000,
  "deductions": 500,
  "netSalary": 5500,
  "netPay": 5500,
  "bankStatus": "valid"
}
```

---

## 🧪 Test Scenarios by Workflow

### Complete Payroll Workflow Test

1. **Check Pre-Initiation Validation**
   ```
   GET /payroll/pre-initiation-validation
   ```

2. **Process Signing Bonuses** (if needed) OR **Create Signing Bonus Manually**
   ```
   POST /payroll/process-signing-bonuses
   ```
   OR
   ```
   POST /payroll/create-signing-bonus
   Body: { "employeeId": "...", "signingBonusId": "...", "givenAmount": 5000 }
   ```

3. **Review Signing Bonuses**
   ```
   POST /payroll/review-signing-bonus
   Body: { "employeeSigningBonusId": "...", "status": "approved" }
   ```
   **Note**: Use the `_id` from the response of step 2, not the `signingBonusId`

4. **Process Termination Benefits** (if needed) OR **Create Termination Benefit Manually**
   ```
   POST /payroll/process-termination-benefits
   ```
   OR
   ```
   POST /payroll/create-termination-benefit
   Body: { "employeeId": "...", "benefitId": "...", "terminationId": "...", "givenAmount": 10000 }
   ```

5. **Review Termination Benefits**
   ```
   POST /payroll/review-termination-benefit
   Body: { "employeeTerminationResignationId": "...", "status": "approved" }
   ```
   **Note**: Use the `_id` from the response of step 4, not the `benefitId`

6. **Process Payroll Initiation**
   ```
   POST /payroll/process-initiation
   Body: { "payrollPeriod": "2025-01-31T00:00:00.000Z", "entity": "...", "payrollSpecialistId": "..." }
   ```

7. **Review Payroll Initiation** (Approve)
   ```
   POST /payroll/review-initiation/{runId}
   Body: { "approved": true, "reviewerId": "..." }
   ```

8. **Preview Payroll**
   ```
   GET /payroll/preview/{payrollRunId}
   ```

9. **Detect Irregularities**
   ```
   POST /payroll/detect-irregularities/{payrollRunId}
   ```

10. **Resolve Irregularities** (if any)
    ```
    POST /payroll/resolve-irregularity
    Body: { "payrollRunId": "...", "employeeId": "...", "exceptionCode": "...", "resolution": "...", "managerId": "..." }
    ```

11. **Send for Approval**
    ```
    POST /payroll/send-for-approval
    Body: { "payrollRunId": "...", "managerId": "...", "financeStaffId": "..." }
    ```

12. **Manager Approval**
    ```
    POST /payroll/manager-approval
    Body: { "payrollRunId": "...", "managerDecision": "approved", ... }
    ```

13. **Finance Approval**
    ```
    POST /payroll/finance-approval
    Body: { "payrollRunId": "...", "decision": "approve", ... }
    ```

14. **Lock Payroll**
    ```
    POST /payroll/{id}/lock
    ```

15. **Generate Payslips**
    ```
    POST /payroll/generate-payslips
    Body: { "payrollRunId": "...", "distributionMethod": "PORTAL" }
    ```

---

## ⚠️ Error Testing

### Authentication Errors
```
// Missing token
Authorization: (empty)

// Invalid token
Authorization: Bearer invalid-token-here

// Expired token
Authorization: Bearer <expired-token>
```

### Authorization Errors
```
// Wrong role (e.g., try PAYROLL_SPECIALIST endpoint with FINANCE_STAFF token)
// Should return 403 Forbidden
```

### Validation Errors
```
// Missing required fields
// Invalid data types
// Invalid enum values
// Invalid date formats
// Negative numbers where not allowed
```

### Business Logic Errors
```
// Invalid status transitions
// Duplicate payroll runs
// Editing locked payrolls
// Approving non-pending items
```

---

## 📊 Expected Response Examples

### Success Response (200/201)
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "runId": "PR-2025-0001",
  "status": "draft",
  "payrollPeriod": "2025-01-31T00:00:00.000Z",
  ...
}
```

### Error Response (400/404/403)
```json
{
  "statusCode": 400,
  "message": "Invalid payroll period. Must be a valid date.",
  "error": "Bad Request"
}
```

---

## 🔍 Testing Tips

1. **Use Real IDs**: Replace placeholder IDs with actual MongoDB ObjectIds from your database
2. **Test Sequences**: Follow the complete workflow for realistic testing
3. **Edge Cases**: Test boundary conditions (empty strings, null values, extreme numbers)
4. **Error Handling**: Verify proper error messages for invalid inputs
5. **Role Testing**: Test with different user roles to verify authorization
6. **State Transitions**: Test valid and invalid status transitions
7. **Concurrency**: Test multiple simultaneous requests
8. **Data Integrity**: Verify audit fields (createdBy, updatedBy) are populated

---

## 📝 Notes

- All dates should be in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- All IDs should be valid MongoDB ObjectIds (24 hex characters)
- Currency codes should be valid ISO 4217 codes (USD, EUR, GBP, etc.)
- Status values must match enum values exactly (case-sensitive)
- Empty request bodies should be `{}` not `null`

