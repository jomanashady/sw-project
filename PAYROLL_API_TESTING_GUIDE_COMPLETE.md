# Complete Payroll API Testing Guide

This guide contains all API endpoints for the three payroll modules with Thunder Client examples.

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 1. PAYROLL CONFIGURATION APIs

### Pay Grades

#### Get All Pay Grades
```http
GET /payroll-configuration/pay-grades?status=draft&page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Pay Grade by ID
```http
GET /payroll-configuration/pay-grades/{{payGradeId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create Pay Grade (DRAFT) - PAYROLL_SPECIALIST
```http
POST /payroll-configuration/pay-grades
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "grade": "Senior Developer",
  "baseSalary": 15000,
  "grossSalary": 18000
}
```

#### Update Pay Grade (DRAFT only) - PAYROLL_SPECIALIST
```http
PUT /payroll-configuration/pay-grades/{{payGradeId}}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "baseSalary": 16000,
  "grossSalary": 19000
}
```

#### Approve Pay Grade - PAYROLL_MANAGER
```http
POST /payroll-configuration/pay-grades/{{payGradeId}}/approve
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "comment": "Approved by Payroll Manager"
}
```

#### Reject Pay Grade - PAYROLL_MANAGER
```http
POST /payroll-configuration/pay-grades/{{payGradeId}}/reject
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "comment": "Gross salary does not meet requirements"
}
```

#### Delete Pay Grade (DRAFT only) - PAYROLL_MANAGER
```http
DELETE /payroll-configuration/pay-grades/{{payGradeId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### Allowances

#### Get All Allowances
```http
GET /payroll-configuration/allowances?status=approved&page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Allowance by ID
```http
GET /payroll-configuration/allowances/{{allowanceId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create Allowance (DRAFT) - PAYROLL_SPECIALIST
```http
POST /payroll-configuration/allowances
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Transportation Allowance",
  "amount": 500
}
```

#### Update Allowance (DRAFT only) - PAYROLL_SPECIALIST
```http
PUT /payroll-configuration/allowances/{{allowanceId}}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "amount": 600
}
```

#### Approve Allowance - PAYROLL_MANAGER
```http
POST /payroll-configuration/allowances/{{allowanceId}}/approve
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "comment": "Approved"
}
```

#### Reject Allowance - PAYROLL_MANAGER
```http
POST /payroll-configuration/allowances/{{allowanceId}}/reject
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "comment": "Amount too high"
}
```

#### Delete Allowance (DRAFT only) - PAYROLL_MANAGER
```http
DELETE /payroll-configuration/allowances/{{allowanceId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### Pay Types

#### Get All Pay Types
```http
GET /payroll-configuration/pay-types?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Pay Type by ID
```http
GET /payroll-configuration/pay-types/{{payTypeId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create Pay Type (DRAFT) - PAYROLL_SPECIALIST
```http
POST /payroll-configuration/pay-types
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "type": "Monthly",
  "amount": 0
}
```

#### Update Pay Type (DRAFT only) - PAYROLL_SPECIALIST
```http
PUT /payroll-configuration/pay-types/{{payTypeId}}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "type": "Weekly"
}
```

#### Approve Pay Type - PAYROLL_MANAGER
```http
POST /payroll-configuration/pay-types/{{payTypeId}}/approve
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "comment": "Approved"
}
```

#### Reject Pay Type - PAYROLL_MANAGER
```http
POST /payroll-configuration/pay-types/{{payTypeId}}/reject
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "comment": "Rejected"
}
```

#### Delete Pay Type (DRAFT only) - PAYROLL_MANAGER
```http
DELETE /payroll-configuration/pay-types/{{payTypeId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### Tax Rules

#### Get All Tax Rules
```http
GET /payroll-configuration/tax-rules?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Tax Rule by ID
```http
GET /payroll-configuration/tax-rules/{{taxRuleId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create Tax Rule (DRAFT) - LEGAL_POLICY_ADMIN
```http
POST /payroll-configuration/tax-rules
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Income Tax - 20%",
  "description": "Standard income tax rate",
  "rate": 0.20
}
```

#### Update Tax Rule (Can edit APPROVED for legal updates) - LEGAL_POLICY_ADMIN
```http
PUT /payroll-configuration/tax-rules/{{taxRuleId}}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "rate": 0.22
}
```

#### Approve Tax Rule - PAYROLL_MANAGER
```http
POST /payroll-configuration/tax-rules/{{taxRuleId}}/approve
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "comment": "Approved"
}
```

#### Reject Tax Rule - PAYROLL_MANAGER
```http
POST /payroll-configuration/tax-rules/{{taxRuleId}}/reject
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "comment": "Rejected"
}
```

#### Delete Tax Rule (DRAFT only) - PAYROLL_MANAGER
```http
DELETE /payroll-configuration/tax-rules/{{taxRuleId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### Insurance Brackets

#### Get All Insurance Brackets
```http
GET /payroll-configuration/insurance-brackets?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Insurance Bracket by ID
```http
GET /payroll-configuration/insurance-brackets/{{insuranceBracketId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create Insurance Bracket (DRAFT) - PAYROLL_SPECIALIST
```http
POST /payroll-configuration/insurance-brackets
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Social Insurance - Tier 1",
  "minSalary": 6000,
  "maxSalary": 15000,
  "employeeRate": 0.11,
  "employerRate": 0.18
}
```

#### Update Insurance Bracket (DRAFT only) - PAYROLL_SPECIALIST
```http
PUT /payroll-configuration/insurance-brackets/{{insuranceBracketId}}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "maxSalary": 16000,
  "employeeRate": 0.12
}
```

#### Approve Insurance Bracket - HR_MANAGER
```http
POST /payroll-configuration/insurance-brackets/{{insuranceBracketId}}/approve
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "comment": "Approved by HR Manager"
}
```

#### Reject Insurance Bracket - HR_MANAGER
```http
POST /payroll-configuration/insurance-brackets/{{insuranceBracketId}}/reject
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "comment": "Rejected"
}
```

#### Delete Insurance Bracket (DRAFT only) - HR_MANAGER
```http
DELETE /payroll-configuration/insurance-brackets/{{insuranceBracketId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### Signing Bonuses

#### Get All Signing Bonuses
```http
GET /payroll-configuration/signing-bonuses?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Signing Bonus by ID
```http
GET /payroll-configuration/signing-bonuses/{{signingBonusId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create Signing Bonus (DRAFT) - PAYROLL_SPECIALIST
```http
POST /payroll-configuration/signing-bonuses
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "positionName": "Senior Developer",
  "amount": 5000
}
```

#### Update Signing Bonus (DRAFT only) - PAYROLL_SPECIALIST
```http
PUT /payroll-configuration/signing-bonuses/{{signingBonusId}}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "amount": 6000
}
```

#### Approve Signing Bonus - PAYROLL_MANAGER
```http
POST /payroll-configuration/signing-bonuses/{{signingBonusId}}/approve
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "comment": "Approved"
}
```

#### Reject Signing Bonus - PAYROLL_MANAGER
```http
POST /payroll-configuration/signing-bonuses/{{signingBonusId}}/reject
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "comment": "Rejected"
}
```

#### Delete Signing Bonus (DRAFT only) - PAYROLL_MANAGER
```http
DELETE /payroll-configuration/signing-bonuses/{{signingBonusId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### Termination Benefits

#### Get All Termination Benefits
```http
GET /payroll-configuration/termination-benefits?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Termination Benefit by ID
```http
GET /payroll-configuration/termination-benefits/{{terminationBenefitId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create Termination Benefit (DRAFT) - PAYROLL_SPECIALIST
```http
POST /payroll-configuration/termination-benefits
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "benefitType": "Severance Pay",
  "amount": 10000,
  "description": "Standard severance package"
}
```

#### Update Termination Benefit (DRAFT only) - PAYROLL_SPECIALIST
```http
PUT /payroll-configuration/termination-benefits/{{terminationBenefitId}}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "amount": 12000
}
```

#### Approve Termination Benefit - PAYROLL_MANAGER
```http
POST /payroll-configuration/termination-benefits/{{terminationBenefitId}}/approve
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "comment": "Approved"
}
```

#### Reject Termination Benefit - PAYROLL_MANAGER
```http
POST /payroll-configuration/termination-benefits/{{terminationBenefitId}}/reject
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "comment": "Rejected"
}
```

#### Delete Termination Benefit (DRAFT only) - PAYROLL_MANAGER
```http
DELETE /payroll-configuration/termination-benefits/{{terminationBenefitId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### Payroll Policies

#### Get All Payroll Policies
```http
GET /payroll-configuration/policies?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Payroll Policy by ID
```http
GET /payroll-configuration/policies/{{policyId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create Payroll Policy (DRAFT) - PAYROLL_SPECIALIST
```http
POST /payroll-configuration/policies
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "policyName": "Late Arrival Penalty",
  "policyType": "Misconduct",
  "description": "Deduction for late arrivals",
  "effectiveDate": "2025-01-01T00:00:00.000Z",
  "ruleDefinition": {
    "ruleType": "Fixed Amount",
    "thresholdAmount": 50
  },
  "applicability": "All Employees"
}
```

#### Update Payroll Policy (DRAFT only) - PAYROLL_SPECIALIST
```http
PUT /payroll-configuration/policies/{{policyId}}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "description": "Updated description"
}
```

#### Approve Payroll Policy - PAYROLL_MANAGER
```http
POST /payroll-configuration/policies/{{policyId}}/approve
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "comment": "Approved"
}
```

#### Reject Payroll Policy - PAYROLL_MANAGER
```http
POST /payroll-configuration/policies/{{policyId}}/reject
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "comment": "Rejected"
}
```

#### Delete Payroll Policy (DRAFT only) - PAYROLL_MANAGER
```http
DELETE /payroll-configuration/policies/{{policyId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### Company Settings

#### Get Company Settings
```http
GET /payroll-configuration/company-settings
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create Company Settings - SYSTEM_ADMIN
```http
POST /payroll-configuration/company-settings
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "payDate": 25,
  "timeZone": "Africa/Cairo",
  "currency": "EGP"
}
```

#### Update Company Settings - SYSTEM_ADMIN
```http
PUT /payroll-configuration/company-settings
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "payDate": 28,
  "currency": "USD"
}
```

---

### Dashboard & Utilities

#### Get Configuration Stats - PAYROLL_MANAGER
```http
GET /payroll-configuration/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Pending Approvals - PAYROLL_MANAGER
```http
GET /payroll-configuration/pending-approvals?userId={{userId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 2. PAYROLL EXECUTION APIs

### Payroll Run Management

#### Create Payroll Run - PAYROLL_SPECIALIST
```http
POST /payroll/create
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "runId": "PR-2025-0001",
  "payrollPeriod": "2025-01-31T00:00:00.000Z",
  "entity": "Main Office",
  "employees": 50,
  "totalnetpay": 0,
  "payrollSpecialistId": "{{payrollSpecialistId}}",
  "payrollManagerId": "{{payrollManagerId}}"
}
```

#### Process Payroll Initiation - PAYROLL_SPECIALIST
```http
POST /payroll/process-initiation
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "payrollPeriod": "2025-01-31T00:00:00.000Z",
  "entity": "Main Office|EGP",
  "payrollSpecialistId": "{{payrollSpecialistId}}",
  "currency": "EGP",
  "payrollManagerId": "{{payrollManagerId}}"
}
```

#### Review Payroll Initiation - PAYROLL_SPECIALIST
```http
POST /payroll/review-initiation/{{runId}}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "approved": true,
  "reviewerId": "{{reviewerId}}",
  "rejectionReason": null
}
```

#### Review Payroll Period - PAYROLL_SPECIALIST
```http
POST /payroll/review-payroll-period
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "payrollRunId": "{{payrollRunId}}",
  "status": "under review",
  "rejectionReason": null
}
```

#### Edit Payroll Period - PAYROLL_SPECIALIST
```http
PUT /payroll/edit-payroll-period
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "payrollRunId": "{{payrollRunId}}",
  "payrollPeriod": "2025-02-28T00:00:00.000Z"
}
```

#### Edit Payroll Initiation - PAYROLL_SPECIALIST
```http
PUT /payroll/edit-initiation/{{runId}}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "payrollPeriod": "2025-02-28T00:00:00.000Z",
  "entity": "Main Office|USD"
}
```

---

### Signing Bonuses

#### Process Signing Bonuses - PAYROLL_SPECIALIST
```http
POST /payroll/process-signing-bonuses
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create Employee Signing Bonus - PAYROLL_SPECIALIST
```http
POST /payroll/create-signing-bonus
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "employeeId": "{{employeeId}}",
  "signingBonusId": "{{signingBonusId}}",
  "givenAmount": 5000
}
```

#### Review Signing Bonus - PAYROLL_SPECIALIST
```http
POST /payroll/review-signing-bonus
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "employeeSigningBonusId": "{{employeeSigningBonusId}}",
  "status": "approved",
  "paymentDate": "2025-02-01T00:00:00.000Z"
}
```

#### Edit Signing Bonus - PAYROLL_SPECIALIST
```http
PUT /payroll/edit-signing-bonus
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "employeeSigningBonusId": "{{employeeSigningBonusId}}",
  "givenAmount": 6000
}
```

---

### Termination Benefits

#### Process Termination Benefits - PAYROLL_SPECIALIST
```http
POST /payroll/process-termination-benefits
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create Employee Termination Benefit - PAYROLL_SPECIALIST
```http
POST /payroll/create-termination-benefit
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "employeeId": "{{employeeId}}",
  "terminationBenefitId": "{{terminationBenefitId}}",
  "benefitType": "resignation",
  "givenAmount": 10000
}
```

#### Review Termination Benefit - PAYROLL_SPECIALIST
```http
POST /payroll/review-termination-benefit
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "employeeTerminationBenefitId": "{{employeeTerminationBenefitId}}",
  "status": "approved",
  "paymentDate": "2025-02-01T00:00:00.000Z"
}
```

#### Edit Termination Benefit - PAYROLL_SPECIALIST
```http
PUT /payroll/edit-termination-benefit
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "employeeTerminationBenefitId": "{{employeeTerminationBenefitId}}",
  "givenAmount": 12000
}
```

---

### Payroll Calculations

#### Calculate Payroll - PAYROLL_SPECIALIST
```http
POST /payroll/calculate-payroll
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "employeeId": "{{employeeId}}",
  "payrollRunId": "{{payrollRunId}}",
  "baseSalary": 15000
}
```

#### Calculate Prorated Salary - PAYROLL_SPECIALIST
```http
POST /payroll/calculate-prorated-salary
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "employeeId": "{{employeeId}}",
  "baseSalary": 15000,
  "startDate": "2025-01-15T00:00:00.000Z",
  "endDate": "2025-01-31T00:00:00.000Z",
  "payrollPeriodEnd": "2025-01-31T00:00:00.000Z"
}
```

#### Apply Statutory Rules - PAYROLL_SPECIALIST
```http
POST /payroll/apply-statutory-rules
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "baseSalary": 15000,
  "employeeId": "{{employeeId}}"
}
```

---

### Draft Generation

#### Generate Draft Payroll Run - PAYROLL_SPECIALIST
```http
POST /payroll/generate-draft
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "payrollPeriod": "2025-01-31T00:00:00.000Z",
  "entity": "Main Office|EGP",
  "payrollSpecialistId": "{{payrollSpecialistId}}",
  "currency": "EGP",
  "payrollManagerId": "{{payrollManagerId}}"
}
```

#### Get Payroll Preview - PAYROLL_SPECIALIST, PAYROLL_MANAGER
```http
GET /payroll/preview/{{payrollRunId}}?currency=USD
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Pre-Initiation Validation Status - PAYROLL_SPECIALIST, PAYROLL_MANAGER
```http
GET /payroll/pre-initiation-validation
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### Exceptions & Irregularities

#### Flag Payroll Exception - PAYROLL_SPECIALIST
```http
POST /payroll/flag-exception
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "payrollRunId": "{{payrollRunId}}",
  "code": "MISSING_BANK_ACCOUNT",
  "message": "Employee missing bank account information",
  "employeeId": "{{employeeId}}"
}
```

#### Detect Irregularities - PAYROLL_SPECIALIST
```http
POST /payroll/detect-irregularities/{{payrollRunId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Employee Exceptions - PAYROLL_SPECIALIST, PAYROLL_MANAGER
```http
GET /payroll/employee-exceptions/{{employeeId}}/{{payrollRunId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get All Payroll Exceptions - PAYROLL_SPECIALIST, PAYROLL_MANAGER
```http
GET /payroll/payroll-exceptions/{{payrollRunId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Resolve Irregularity - PAYROLL_MANAGER
```http
POST /payroll/resolve-irregularity
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "payrollRunId": "{{payrollRunId}}",
  "employeeId": "{{employeeId}}",
  "exceptionCode": "MISSING_BANK_ACCOUNT",
  "resolution": "Bank account added",
  "managerId": "{{managerId}}"
}
```

---

### Approval Workflow

#### Review Payroll - PAYROLL_MANAGER
```http
POST /payroll/{{payrollRunId}}/review
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "status": "under review",
  "comments": "Ready for manager review"
}
```

#### Send for Approval - PAYROLL_SPECIALIST
```http
POST /payroll/send-for-approval
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "payrollRunId": "{{payrollRunId}}",
  "managerId": "{{managerId}}",
  "financeStaffId": "{{financeStaffId}}"
}
```

#### Manager Approval - PAYROLL_MANAGER
```http
POST /payroll/manager-approval
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "payrollRunId": "{{payrollRunId}}",
  "status": "approved",
  "managerComments": "Approved by manager",
  "managerDecision": "approved"
}
```

#### Finance Approval - FINANCE_STAFF
```http
POST /payroll/finance-approval
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "payrollRunId": "{{payrollRunId}}",
  "approved": true,
  "financeStaffId": "{{financeStaffId}}",
  "comments": "Approved by finance"
}
```

---

### Lock/Freeze Management

#### Lock Payroll - PAYROLL_MANAGER
```http
POST /payroll/{{payrollRunId}}/lock
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Freeze Payroll - PAYROLL_MANAGER
```http
POST /payroll/{{payrollRunId}}/freeze
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Unlock Payroll - PAYROLL_MANAGER
```http
POST /payroll/{{payrollRunId}}/unlock
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "unlockReason": "Correction needed for employee salary"
}
```

#### Unfreeze Payroll - PAYROLL_MANAGER
```http
POST /payroll/{{payrollRunId}}/unfreeze
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "unlockReason": "Correction needed"
}
```

---

### Payslip Generation

#### Generate and Distribute Payslips - PAYROLL_SPECIALIST
```http
POST /payroll/generate-payslips
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "payrollRunId": "{{payrollRunId}}",
  "distributionMethod": "PORTAL"
}
```

---

## 3. PAYROLL TRACKING APIs

### Claims Management

#### Create Claim - DEPARTMENT_EMPLOYEE
```http
POST /payroll-tracking/claims
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "description": "Business travel expenses",
  "claimType": "Travel",
  "employeeId": "{{employeeId}}",
  "amount": 1500
}
```

#### Get Pending Claims - PAYROLL_SPECIALIST
```http
GET /payroll-tracking/claims/pending
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Approved Claims for Finance - FINANCE_STAFF
```http
GET /payroll-tracking/claims/approved
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Claims by Employee
```http
GET /payroll-tracking/claims/employee/{{employeeId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Claim by ID
```http
GET /payroll-tracking/claims/{{claimId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Update Claim - DEPARTMENT_EMPLOYEE
```http
PUT /payroll-tracking/claims/{{claimId}}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "description": "Updated business travel expenses",
  "amount": 1600
}
```

#### Approve Claim by Specialist - PAYROLL_SPECIALIST
```http
PUT /payroll-tracking/claims/{{claimId}}/approve-by-specialist
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "approvedAmount": 1500,
  "resolutionComment": "Approved by specialist"
}
```

#### Reject Claim by Specialist - PAYROLL_SPECIALIST
```http
PUT /payroll-tracking/claims/{{claimId}}/reject-by-specialist
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "rejectionReason": "Insufficient documentation"
}
```

#### Confirm Claim Approval (Manager) - PAYROLL_MANAGER
```http
PUT /payroll-tracking/claims/{{claimId}}/confirm-approval
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "managerId": "{{managerId}}",
  "approved": true,
  "comments": "Confirmed by manager"
}
```

---

### Disputes Management

#### Create Dispute - DEPARTMENT_EMPLOYEE
```http
POST /payroll-tracking/disputes
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "description": "Incorrect tax deduction on payslip",
  "employeeId": "{{employeeId}}",
  "payslipId": "{{payslipId}}"
}
```

#### Get Pending Disputes - PAYROLL_SPECIALIST
```http
GET /payroll-tracking/disputes/pending
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Approved Disputes for Finance - FINANCE_STAFF
```http
GET /payroll-tracking/disputes/approved
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Disputes by Employee
```http
GET /payroll-tracking/disputes/employee/{{employeeId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Dispute by ID
```http
GET /payroll-tracking/disputes/{{disputeId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Update Dispute - DEPARTMENT_EMPLOYEE
```http
PUT /payroll-tracking/disputes/{{disputeId}}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "description": "Updated dispute description"
}
```

#### Approve Dispute by Specialist - PAYROLL_SPECIALIST
```http
PUT /payroll-tracking/disputes/{{disputeId}}/approve-by-specialist
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "resolutionComment": "Dispute is valid, will be processed"
}
```

#### Reject Dispute by Specialist - PAYROLL_SPECIALIST
```http
PUT /payroll-tracking/disputes/{{disputeId}}/reject-by-specialist
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "rejectionReason": "Tax deduction is correct according to tax rules"
}
```

#### Confirm Dispute Approval (Manager) - PAYROLL_MANAGER
```http
PUT /payroll-tracking/disputes/{{disputeId}}/confirm-approval
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "managerId": "{{managerId}}",
  "approved": true,
  "comments": "Confirmed by manager"
}
```

---

### Refunds Management

#### Create Refund - FINANCE_STAFF
```http
POST /payroll-tracking/refunds
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "employeeId": "{{employeeId}}",
  "refundDetails": {
    "description": "Refund for approved dispute",
    "amount": 500
  },
  "financeStaffId": "{{financeStaffId}}"
}
```

#### Get Pending Refunds - FINANCE_STAFF
```http
GET /payroll-tracking/refunds/pending
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Refunds by Employee
```http
GET /payroll-tracking/refunds/employee/{{employeeId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Refund by ID
```http
GET /payroll-tracking/refunds/{{refundId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Update Refund - FINANCE_STAFF
```http
PUT /payroll-tracking/refunds/{{refundId}}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "refundDetails": {
    "description": "Updated refund description",
    "amount": 600
  }
}
```

#### Process Refund (Mark as Paid) - FINANCE_STAFF
```http
PUT /payroll-tracking/refunds/{{refundId}}/process
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "paidInPayrollRunId": "{{payrollRunId}}"
}
```

#### Generate Refund for Dispute - FINANCE_STAFF
```http
POST /payroll-tracking/refunds/dispute/{{disputeId}}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "refundDetails": {
    "description": "Refund for approved dispute",
    "amount": 500
  },
  "financeStaffId": "{{financeStaffId}}"
}
```

#### Generate Refund for Claim - FINANCE_STAFF
```http
POST /payroll-tracking/refunds/claim/{{claimId}}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "refundDetails": {
    "description": "Refund for approved claim",
    "amount": 1500
  },
  "financeStaffId": "{{financeStaffId}}"
}
```

---

### Employee Self-Service

#### Get Payslips by Employee - DEPARTMENT_EMPLOYEE
```http
GET /payroll-tracking/employee/{{employeeId}}/payslips
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Payslip by ID - DEPARTMENT_EMPLOYEE
```http
GET /payroll-tracking/employee/{{employeeId}}/payslips/{{payslipId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Employee Base Salary - DEPARTMENT_EMPLOYEE
```http
GET /payroll-tracking/employee/{{employeeId}}/base-salary
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Leave Encashment - DEPARTMENT_EMPLOYEE
```http
GET /payroll-tracking/employee/{{employeeId}}/leave-encashment?payrollRunId={{payrollRunId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Transportation Allowance - DEPARTMENT_EMPLOYEE
```http
GET /payroll-tracking/employee/{{employeeId}}/transportation-allowance?payslipId={{payslipId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Tax Deductions - DEPARTMENT_EMPLOYEE
```http
GET /payroll-tracking/employee/{{employeeId}}/tax-deductions?payslipId={{payslipId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Insurance Deductions - DEPARTMENT_EMPLOYEE
```http
GET /payroll-tracking/employee/{{employeeId}}/insurance-deductions?payslipId={{payslipId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Misconduct Deductions - DEPARTMENT_EMPLOYEE
```http
GET /payroll-tracking/employee/{{employeeId}}/misconduct-deductions?payslipId={{payslipId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Unpaid Leave Deductions - DEPARTMENT_EMPLOYEE
```http
GET /payroll-tracking/employee/{{employeeId}}/unpaid-leave-deductions?payslipId={{payslipId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Salary History - DEPARTMENT_EMPLOYEE
```http
GET /payroll-tracking/employee/{{employeeId}}/salary-history?limit=12
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Employer Contributions - DEPARTMENT_EMPLOYEE
```http
GET /payroll-tracking/employee/{{employeeId}}/employer-contributions?payslipId={{payslipId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Tax Documents - DEPARTMENT_EMPLOYEE
```http
GET /payroll-tracking/employee/{{employeeId}}/tax-documents?year=2024
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### Reports

#### Get Payroll Report by Department - PAYROLL_SPECIALIST
```http
GET /payroll-tracking/reports/department/{{departmentId}}?payrollRunId={{payrollRunId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Payroll Summary - FINANCE_STAFF
```http
GET /payroll-tracking/reports/payroll-summary?period=month&date=2025-01-31&departmentId={{departmentId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Tax Insurance Benefits Report - FINANCE_STAFF
```http
GET /payroll-tracking/reports/tax-insurance-benefits?period=year&date=2025-01-31&departmentId={{departmentId}}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Active Departments
```http
GET /payroll-tracking/departments
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Payroll Summary by All Departments
```http
GET /payroll-tracking/reports/departments-summary?period=month&date=2025-01-31
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Notes

1. **Replace Placeholders**: Replace all `{{placeholder}}` values with actual IDs from your database
2. **JWT Token**: Get your JWT token from the authentication endpoint and use it in all requests
3. **Roles**: Ensure your user has the required role for each endpoint
4. **Base URL**: Adjust the base URL if your server runs on a different port
5. **Date Format**: Use ISO 8601 format for all dates: `YYYY-MM-DDTHH:mm:ss.sssZ`

## Testing Workflow

### Recommended Testing Order:

1. **Configuration Phase**:
   - Create pay grades, allowances, tax rules, insurance brackets (all in DRAFT)
   - Approve them (as Payroll Manager or HR Manager for insurance)
   - Create company settings

2. **Execution Phase**:
   - Process payroll initiation
   - Review and approve initiation
   - Generate draft
   - Review draft
   - Send for approval
   - Manager approval
   - Finance approval
   - Lock payroll
   - Generate payslips

3. **Tracking Phase**:
   - Employee views payslips
   - Employee creates disputes/claims
   - Specialist reviews and approves
   - Manager confirms
   - Finance generates refunds
   - Generate reports

