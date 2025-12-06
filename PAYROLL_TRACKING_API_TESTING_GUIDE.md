# Payroll Tracking API Testing Guide

Complete guide for testing all Payroll Tracking APIs using Thunder Client or any REST client.

## Base URL
```
http://localhost:3000/api/v1/payroll-tracking
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📋 Table of Contents

1. [Claims APIs](#claims-apis)
2. [Disputes APIs](#disputes-apis)
3. [Refunds APIs](#refunds-apis)
4. [Employee Self-Service APIs](#employee-self-service-apis)
5. [Reports APIs](#reports-apis)

---

## Claims APIs

### 1. Create Claim (Employee)✅
**POST** `/claims`

**Role Required:** `DEPARTMENT_EMPLOYEE` or `SYSTEM_ADMIN`

**Request Body:**
```json
{
  "description": "Business trip expenses for client meeting in Cairo",
  "claimType": "travel",
  "employeeId": "507f1f77bcf86cd799439011",
  "amount": 2500.00,
  "financeStaffId": "507f1f77bcf86cd799439012"
}
```

**Example Response:**
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "claimId": "CLM-2025-0001",
  "description": "Business trip expenses for client meeting in Cairo",
  "claimType": "travel",
  "employeeId": {...},
  "amount": 2500.00,
  "status": "UNDER_REVIEW",
  "createdAt": "2025-01-15T10:00:00.000Z"
}
```

---

### 2. Get Pending Claims ✅
**GET** `/claims/pending`

**Role Required:** `PAYROLL_SPECIALIST` or `SYSTEM_ADMIN`

**No Request Body**

**Example Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "claimId": "CLM-2025-0001",
    "description": "Business trip expenses",
    "status": "UNDER_REVIEW",
    "employeeId": {...},
    "amount": 2500.00
  }
]
```

---

### 3. Get Approved Claims for Finance✅
**GET** `/claims/approved`

**Role Required:** `FINANCE_STAFF` or `SYSTEM_ADMIN`

**No Request Body**

---

### 4. Get Claims by Employee ID✅
**GET** `/claims/employee/:employeeId`

**Role Required:** `DEPARTMENT_EMPLOYEE`, `PAYROLL_SPECIALIST`, `FINANCE_STAFF`, or `SYSTEM_ADMIN`

**URL Parameters:**
- `employeeId`: MongoDB ObjectId of the employee

**Example:** `/claims/employee/507f1f77bcf86cd799439011`

---

### 5. Get Claim by ID✅
**GET** `/claims/:claimId`

**Role Required:** `DEPARTMENT_EMPLOYEE`, `PAYROLL_SPECIALIST`, `FINANCE_STAFF`, or `SYSTEM_ADMIN`

**URL Parameters:**
- `claimId`: MongoDB ObjectId of the claim

**Example:** `/claims/507f1f77bcf86cd799439020`

---

### 6. Update Claim✅
**PUT** `/claims/:claimId`

**Role Required:** `DEPARTMENT_EMPLOYEE` or `SYSTEM_ADMIN`

**Request Body (all fields optional):**
```json
{
  "description": "Updated: Business trip expenses - Updated amount",
  "amount": 2800.00,
  "claimType": "travel"
}
```

---

### 7. Approve Claim by Specialist✅
**PUT** `/claims/:claimId/approve-by-specialist`

**Role Required:** `PAYROLL_SPECIALIST` or `SYSTEM_ADMIN`

**Request Body:**
```json
{
  "payrollSpecialistId": "507f1f77bcf86cd799439013",
  "approvedAmount": 2500.00,
  "resolutionComment": "All receipts verified. Approved for full amount."
}
```

---

### 8. Reject Claim by Specialist✅
**PUT** `/claims/:claimId/reject-by-specialist`

**Role Required:** `PAYROLL_SPECIALIST` or `SYSTEM_ADMIN`

**Request Body:**
```json
{
  "payrollSpecialistId": "507f1f77bcf86cd799439013",
  "rejectionReason": "Missing receipts for expenses over $500. Please provide all required documentation."
}
```

---

### 9. Confirm Claim Approval (Manager)✅
**PUT** `/claims/:claimId/confirm-approval`

**Role Required:** `PAYROLL_SPECIALIST` or `SYSTEM_ADMIN` (Manager role)

**Request Body:**
```json
{
  "payrollManagerId": "507f1f77bcf86cd799439014",
  "resolutionComment": "Manager confirmation: Approved and ready for finance processing."
}
```

---

## Disputes APIs

### 10. Create Dispute (Employee)✅
**POST** `/disputes`

**Role Required:** `DEPARTMENT_EMPLOYEE` or `SYSTEM_ADMIN`

**Request Body:**
```json
{
  "description": "I believe my overtime hours were not included in my payslip. I worked 15 extra hours this month.",
  "employeeId": "507f1f77bcf86cd799439011",
  "payslipId": "507f1f77bcf86cd799439030"
}
```

**Example Response:**
```json
{
  "_id": "507f1f77bcf86cd799439040",
  "disputeId": "DISP-2025-0001",
  "description": "I believe my overtime hours were not included...",
  "employeeId": {...},
  "payslipId": {...},
  "status": "UNDER_REVIEW",
  "createdAt": "2025-01-15T10:00:00.000Z"
}
```

---

### 11. Get Pending Disputes (Payroll Specialist)✅
**GET** `/disputes/pending`

**Role Required:** `PAYROLL_SPECIALIST` or `SYSTEM_ADMIN`

**No Request Body**

---

### 12. Get Approved Disputes for Finance✅
**GET** `/disputes/approved`

**Role Required:** `FINANCE_STAFF` or `SYSTEM_ADMIN`

**No Request Body**

---

### 13. Get Disputes by Employee ID✅
**GET** `/disputes/employee/:employeeId`

**Role Required:** `DEPARTMENT_EMPLOYEE`, `PAYROLL_SPECIALIST`, `FINANCE_STAFF`, or `SYSTEM_ADMIN`

**URL Parameters:**
- `employeeId`: MongoDB ObjectId of the employee

**Example:** `/disputes/employee/507f1f77bcf86cd799439011`

---

### 14. Get Dispute by ID✅
**GET** `/disputes/:disputeId`

**Role Required:** `DEPARTMENT_EMPLOYEE`, `PAYROLL_SPECIALIST`, `FINANCE_STAFF`, or `SYSTEM_ADMIN`

**URL Parameters:**
- `disputeId`: MongoDB ObjectId of the dispute

**Example:** `/disputes/507f1f77bcf86cd799439040`

---

### 15. Update Dispute✅
**PUT** `/disputes/:disputeId`

**Role Required:** `DEPARTMENT_EMPLOYEE` or `SYSTEM_ADMIN`

**Request Body (all fields optional):**
```json
{
  "description": "Updated: I believe my overtime hours (15 hours) were not included in my payslip. I have timesheet records to support this.",
  "resolutionComment": "Added supporting documentation"
}
```

---

### 16. Approve Dispute by Specialist✅
**PUT** `/disputes/:disputeId/approve-by-specialist`

**Role Required:** `PAYROLL_SPECIALIST` or `SYSTEM_ADMIN`

**Request Body:**
```json
{
  "payrollSpecialistId": "507f1f77bcf86cd799439013",
  "resolutionComment": "Timesheet verified. Overtime hours confirmed. Dispute is valid."
}
```

---

### 17. Reject Dispute by Specialist✅
**PUT** `/disputes/:disputeId/reject-by-specialist`

**Role Required:** `PAYROLL_SPECIALIST` or `SYSTEM_ADMIN`

**Request Body:**
```json
{
  "payrollSpecialistId": "507f1f77bcf86cd799439013",
  "rejectionReason": "Timesheet records do not match. Overtime hours were already included in the payslip."
}
```

---

### 18. Confirm Dispute Approval (Manager)✅
**PUT** `/disputes/:disputeId/confirm-approval`

**Role Required:** `PAYROLL_SPECIALIST` or `SYSTEM_ADMIN` (Manager role)

**Request Body:**
```json
{
  "payrollManagerId": "507f1f77bcf86cd799439014",
  "resolutionComment": "Manager confirmation: Dispute approved. Finance can proceed with refund."
}
```

---

## Refunds APIs

### 19. Create Refund (Finance)✅
**POST** `/refunds`

**Role Required:** `FINANCE_STAFF` or `SYSTEM_ADMIN`

**Request Body:**
```json
{
  "refundDetails": {
    "description": "Refund for approved expense claim - Business trip expenses",
    "amount": 2500.00
  },
  "employeeId": "507f1f77bcf86cd799439011",
  "financeStaffId": "507f1f77bcf86cd799439012",
  "claimId": "507f1f77bcf86cd799439020"
}
```

**Note:** Either `claimId` or `disputeId` should be provided, not both.

---

### 20. Get Pending Refunds (Finance)✅
**GET** `/refunds/pending`

**Role Required:** `FINANCE_STAFF` or `SYSTEM_ADMIN`

**No Request Body**

---

### 21. Get Refunds by Employee ID✅
**GET** `/refunds/employee/:employeeId`

**Role Required:** `DEPARTMENT_EMPLOYEE`, `FINANCE_STAFF`, or `SYSTEM_ADMIN`

**URL Parameters:**
- `employeeId`: MongoDB ObjectId of the employee

**Example:** `/refunds/employee/507f1f77bcf86cd799439011`

---

### 22. Get Refund by ID✅
**GET** `/refunds/:refundId`

**Role Required:** `DEPARTMENT_EMPLOYEE`, `FINANCE_STAFF`, or `SYSTEM_ADMIN`

**URL Parameters:**
- `refundId`: MongoDB ObjectId of the refund

**Example:** `/refunds/507f1f77bcf86cd799439050`

---

### 23. Update Refund✅
**PUT** `/refunds/:refundId`

**Role Required:** `FINANCE_STAFF` or `SYSTEM_ADMIN`

**Request Body (all fields optional):**
```json
{
  "refundDetails": {
    "description": "Updated: Refund for approved expense claim - Business trip expenses (corrected amount)",
    "amount": 2800.00
  }
}
```

---

### 24. Process Refund (Mark as Paid)✅
**PUT** `/refunds/:refundId/process`

**Role Required:** `FINANCE_STAFF` or `SYSTEM_ADMIN`

**Request Body:**
```json
{
  "paidInPayrollRunId": "507f1f77bcf86cd799439060"
}
```

**Note:** This is typically called automatically by Payroll Execution Service after payslip generation.

---

### 25. Generate Refund for Dispute✅
**POST** `/refunds/dispute/:disputeId`

**Role Required:** `FINANCE_STAFF` or `SYSTEM_ADMIN`

**URL Parameters:**
- `disputeId`: MongoDB ObjectId of the approved dispute

**Request Body:**
```json
{
  "financeStaffId": "507f1f77bcf86cd799439012",
  "refundDetails": {
    "description": "Refund for approved dispute - Overtime hours compensation",
    "amount": 1500.00
  }
}
```

**Example:** `/refunds/dispute/507f1f77bcf86cd799439040`

---

### 26. Generate Refund for Claim✅
**POST** `/refunds/claim/:claimId`

**Role Required:** `FINANCE_STAFF` or `SYSTEM_ADMIN`

**URL Parameters:**
- `claimId`: MongoDB ObjectId of the approved claim

**Request Body:**
```json
{
  "financeStaffId": "507f1f77bcf86cd799439012",
  "refundDetails": {
    "description": "Refund for approved expense claim - Business trip expenses",
    "amount": 2500.00
  }
}
```

**Example:** `/refunds/claim/507f1f77bcf86cd799439020`

---

## Employee Self-Service APIs

### 27. Get Payslips by Employee ID✅
**GET** `/employee/:employeeId/payslips`

**Role Required:** `DEPARTMENT_EMPLOYEE` or `SYSTEM_ADMIN`

**URL Parameters:**
- `employeeId`: MongoDB ObjectId of the employee

**Example:** `/employee/507f1f77bcf86cd799439011/payslips`

**Example Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439030",
    "employeeId": {...},
    "payrollRunId": {...},
    "totalGrossSalary": 10000.00,
    "netPay": 8000.00,
    "paymentStatus": "paid",
    "isDisputed": false,
    "hasActiveDispute": false,
    "status": "paid",
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
]
```

---

### 28. Get Payslip by ID✅
**GET** `/employee/:employeeId/payslips/:payslipId`

**Role Required:** `DEPARTMENT_EMPLOYEE` or `SYSTEM_ADMIN`

**URL Parameters:**
- `employeeId`: MongoDB ObjectId of the employee
- `payslipId`: MongoDB ObjectId of the payslip

**Example:** `/employee/507f1f77bcf86cd799439011/payslips/507f1f77bcf86cd799439030`

**Example Response:**
```json
{
  "_id": "507f1f77bcf86cd799439030",
  "employeeId": {...},
  "payrollRunId": {...},
  "earningsDetails": {...},
  "deductionsDetails": {...},
  "totalGrossSalary": 10000.00,
  "netPay": 8000.00,
  "paymentStatus": "paid",
  "isDisputed": false,
  "hasActiveDispute": false,
  "disputeCount": 0,
  "status": "paid",
  "latestDispute": null
}
```

---

### 29. Get Employee Base Salary
**GET** `/employee/:employeeId/base-salary`

**Role Required:** `DEPARTMENT_EMPLOYEE` or `SYSTEM_ADMIN`

**URL Parameters:**
- `employeeId`: MongoDB ObjectId of the employee

**Example:** `/employee/507f1f77bcf86cd799439011/base-salary`

---

### 30. Get Leave Encashment
**GET** `/employee/:employeeId/leave-encashment`

**Role Required:** `DEPARTMENT_EMPLOYEE` or `SYSTEM_ADMIN`

**URL Parameters:**
- `employeeId`: MongoDB ObjectId of the employee

**Query Parameters (Optional):**
- `payrollRunId`: MongoDB ObjectId of the payroll run

**Example:** `/employee/507f1f77bcf86cd799439011/leave-encashment?payrollRunId=507f1f77bcf86cd799439060`

---

### 31. Get Transportation Allowance
**GET** `/employee/:employeeId/transportation-allowance`

**Role Required:** `DEPARTMENT_EMPLOYEE` or `SYSTEM_ADMIN`

**URL Parameters:**
- `employeeId`: MongoDB ObjectId of the employee

**Query Parameters (Optional):**
- `payslipId`: MongoDB ObjectId of the payslip

**Example:** `/employee/507f1f77bcf86cd799439011/transportation-allowance?payslipId=507f1f77bcf86cd799439030`

---

### 32. Get Tax Deductions
**GET** `/employee/:employeeId/tax-deductions`

**Role Required:** `DEPARTMENT_EMPLOYEE` or `SYSTEM_ADMIN`

**URL Parameters:**
- `employeeId`: MongoDB ObjectId of the employee

**Query Parameters (Optional):**
- `payslipId`: MongoDB ObjectId of the payslip

**Example:** `/employee/507f1f77bcf86cd799439011/tax-deductions?payslipId=507f1f77bcf86cd799439030`

---

### 33. Get Insurance Deductions
**GET** `/employee/:employeeId/insurance-deductions`

**Role Required:** `DEPARTMENT_EMPLOYEE` or `SYSTEM_ADMIN`

**URL Parameters:**
- `employeeId`: MongoDB ObjectId of the employee

**Query Parameters (Optional):**
- `payslipId`: MongoDB ObjectId of the payslip

**Example:** `/employee/507f1f77bcf86cd799439011/insurance-deductions?payslipId=507f1f77bcf86cd799439030`

---

### 34. Get Misconduct Deductions
**GET** `/employee/:employeeId/misconduct-deductions`

**Role Required:** `DEPARTMENT_EMPLOYEE` or `SYSTEM_ADMIN`

**URL Parameters:**
- `employeeId`: MongoDB ObjectId of the employee

**Query Parameters (Optional):**
- `payslipId`: MongoDB ObjectId of the payslip

**Example:** `/employee/507f1f77bcf86cd799439011/misconduct-deductions?payslipId=507f1f77bcf86cd799439030`

---

### 35. Get Unpaid Leave Deductions
**GET** `/employee/:employeeId/unpaid-leave-deductions`

**Role Required:** `DEPARTMENT_EMPLOYEE` or `SYSTEM_ADMIN`

**URL Parameters:**
- `employeeId`: MongoDB ObjectId of the employee

**Query Parameters (Optional):**
- `payslipId`: MongoDB ObjectId of the payslip

**Example:** `/employee/507f1f77bcf86cd799439011/unpaid-leave-deductions?payslipId=507f1f77bcf86cd799439030`

---

### 36. Get Salary History
**GET** `/employee/:employeeId/salary-history`

**Role Required:** `DEPARTMENT_EMPLOYEE` or `SYSTEM_ADMIN`

**URL Parameters:**
- `employeeId`: MongoDB ObjectId of the employee

**Query Parameters (Optional):**
- `limit`: Number of records to return (default: 12)

**Example:** `/employee/507f1f77bcf86cd799439011/salary-history?limit=6`

---

### 37. Get Employer Contributions
**GET** `/employee/:employeeId/employer-contributions`

**Role Required:** `DEPARTMENT_EMPLOYEE` or `SYSTEM_ADMIN`

**URL Parameters:**
- `employeeId`: MongoDB ObjectId of the employee

**Query Parameters (Optional):**
- `payslipId`: MongoDB ObjectId of the payslip

**Example:** `/employee/507f1f77bcf86cd799439011/employer-contributions?payslipId=507f1f77bcf86cd799439030`

---

### 38. Get Tax Documents
**GET** `/employee/:employeeId/tax-documents`

**Role Required:** `DEPARTMENT_EMPLOYEE` or `SYSTEM_ADMIN`

**URL Parameters:**
- `employeeId`: MongoDB ObjectId of the employee

**Query Parameters (Optional):**
- `year`: Year for tax documents (e.g., 2025)

**Example:** `/employee/507f1f77bcf86cd799439011/tax-documents?year=2025`

---

## Reports APIs

### 39. Get Payroll Report by Department
**GET** `/reports/department/:departmentId`

**Role Required:** `PAYROLL_SPECIALIST` or `SYSTEM_ADMIN`

**URL Parameters:**
- `departmentId`: MongoDB ObjectId of the department

**Query Parameters (Optional):**
- `payrollRunId`: MongoDB ObjectId of the payroll run

**Example:** `/reports/department/507f1f77bcf86cd799439070?payrollRunId=507f1f77bcf86cd799439060`

---

### 40. Get Payroll Summary
**GET** `/reports/payroll-summary`

**Role Required:** `FINANCE_STAFF` or `SYSTEM_ADMIN`

**Query Parameters (Required):**
- `period`: `"month"` or `"year"`

**Query Parameters (Optional):**
- `date`: Date string (e.g., "2025-01-15")
- `departmentId`: MongoDB ObjectId of the department

**Examples:**
- `/reports/payroll-summary?period=month&date=2025-01-15`
- `/reports/payroll-summary?period=year&date=2025-01-15`
- `/reports/payroll-summary?period=month&date=2025-01-15&departmentId=507f1f77bcf86cd799439070`

---

### 41. Get Tax Insurance Benefits Report
**GET** `/reports/tax-insurance-benefits`

**Role Required:** `FINANCE_STAFF` or `SYSTEM_ADMIN`

**Query Parameters (Required):**
- `period`: `"month"` or `"year"`

**Query Parameters (Optional):**
- `date`: Date string (e.g., "2025-01-15")
- `departmentId`: MongoDB ObjectId of the department

**Examples:**
- `/reports/tax-insurance-benefits?period=month&date=2025-01-15`
- `/reports/tax-insurance-benefits?period=year&date=2025-01-15`
- `/reports/tax-insurance-benefits?period=month&date=2025-01-15&departmentId=507f1f77bcf86cd799439070`

---

### 42. Get Active Departments
**GET** `/departments`

**Role Required:** `PAYROLL_SPECIALIST`, `FINANCE_STAFF`, or `SYSTEM_ADMIN`

**No Request Body**

---

### 43. Get Payroll Summary by All Departments
**GET** `/reports/departments-summary`

**Role Required:** `PAYROLL_SPECIALIST`, `FINANCE_STAFF`, or `SYSTEM_ADMIN`

**Query Parameters (Required):**
- `period`: `"month"` or `"year"`

**Query Parameters (Optional):**
- `date`: Date string (e.g., "2025-01-15")

**Examples:**
- `/reports/departments-summary?period=month&date=2025-01-15`
- `/reports/departments-summary?period=year&date=2025-01-15`

---

## Testing Tips

1. **JWT Token**: Make sure you have a valid JWT token. You can get one by logging in through your authentication endpoint.

2. **Role-Based Access**: Each endpoint requires specific roles. Make sure your JWT token contains the correct role.

3. **MongoDB ObjectIds**: Replace all example ObjectIds (`507f1f77bcf86cd799439011`) with actual IDs from your database.

4. **Base URL**: Update the base URL if your server is running on a different port or domain.

5. **Testing Workflow**: 
   - Create a claim/dispute → Approve by Specialist → Confirm by Manager → Generate Refund → Process Refund

6. **Error Handling**: Check the response status codes:
   - `200 OK`: Success
   - `201 Created`: Resource created successfully
   - `400 Bad Request`: Invalid request data
   - `401 Unauthorized`: Missing or invalid JWT token
   - `403 Forbidden`: Insufficient permissions
   - `404 Not Found`: Resource not found

---

## Importing to Thunder Client

1. Open Thunder Client in VS Code
2. Click on "Collections" tab
3. Click "Import" button
4. Select `thunder-client-payroll-tracking-complete.json`
5. All 58 requests will be imported with proper folders and examples

---

## Environment Variables

Set up environment variables in Thunder Client:
- `baseUrl`: `http://localhost:3000` (or your server URL)
- `jwt_token`: Your JWT authentication token

---

**Total Endpoints: 58**

**Last Updated:** January 2025

