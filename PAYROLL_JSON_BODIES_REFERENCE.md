# Payroll API JSON Request Bodies - Quick Reference

All JSON request bodies formatted for easy copy-paste during testing.

**Base URL:** `http://localhost:5000/api/v1`

---

## 1. PAYROLL CONFIGURATION

### Create Pay Grade✅
```json
{
  "grade": "Senior Developer",
  "baseSalary": 15000,
  "grossSalary": 18000
}
```

### Update Pay Grade✅
```json
{
  "baseSalary": 16000,
  "grossSalary": 19000
}
```

### Approve Pay Grade By Payroll Manager✅
```json
{
  "comment": "Approved by Payroll Manager"
}
```
//3andy moshkela en approve or reject mesh byrda 3ala old paygrades fel database bas byrda 3ala el gedyd kolo
### Reject Pay Grade✅
```json
{
  "comment": "Gross salary does not meet requirements"
}
```
-------------------------------------------------------------------------
### Create Allowance✅
```json
{
  "name": "Transportation Allowance",
  "amount": 500
}
```

### Update Allowance✅
```json
{
  "amount": 600
}
```

### Approve Allowance✅
```json
{
  "comment": "Approved"
}
```
------------------------------------------------------------------------------
### Create Pay Type✅
```json
{
  "type": "Monthly",
  "amount": 0
}
```
-----------------------------------------------------------------------------
### Create Tax Rule✅
```json
{
  "name": "Income Tax - 20%",
  "description": "Standard income tax rate",
  "rate": 0.20
}
```

### Update Tax Rule✅
```json
{
  "rate": 0.22
}
```
------------------------------------------------------------------------------
### Create Insurance Bracket✅
```json
{
  "name": "Social Insurance - Tier 1",
  "minSalary": 6000,
  "maxSalary": 15000,
  "employeeRate": 0.11,
  "employerRate": 0.18
}
```

### Approve Insurance Bracket✅
```json
{
  "comment": "Approved by HR Manager"
}
```
------------------------------------------------------------------------
### Create Signing Bonus✅
```json
{
  "positionName": "Senior Developer",
  "amount": 5000
}
```
------------------------------------------------------------------------
### Create Termination Benefit✅
```json
{
  "name": "Severance Pay",
  "amount": 10000,
  "terms": "Standard severance package"
}
```
-------------------------------------------------------------------------
### Create Payroll Policy✅
```json
{
  "policyName": "Late Arrival Penalty",
  "policyType": "Misconduct",
  "description": "Deduction for late arrivals",
  "effectiveDate": "2025-01-01T00:00:00.000Z",
  "ruleDefinition": {
    "percentage": 0,
    "fixedAmount": 50,
    "thresholdAmount": 50
  },
  "applicability": "All Employees"
}
```

### Create Company Settings✅
```json
{
  "payDate": "2025-02-28T00:00:00.000Z",
  "timeZone": "Africa/Cairo",
  "currency": "EGP"
}
```

**Note:** If company settings already exist, you'll get a conflict error. Use the update endpoint instead, or delete the existing settings first.

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## 2. PAYROLL EXECUTION

### Create Payroll Run✅
```json
{
  "runId": "PR-2025-0001",
  "payrollPeriod": "2025-01-31T00:00:00.000Z",
  "entity": "Main Office",
  "employees": 50,
  "exceptions": 0,
  "totalnetpay": 0,
  "payrollSpecialistId": "{{payrollSpecialistId}}",
  "payrollManagerId": "{{payrollManagerId}}"
}
```

### Process Payroll Initiation✅
```json
{
  "payrollPeriod": "2025-01-31T00:00:00.000Z",
  "entity": "Main Office|EGP",
  "payrollSpecialistId": "{{payrollSpecialistId}}",
  "currency": "EGP",
  "payrollManagerId": "{{payrollManagerId}}"
}
```

### Review Payroll Initiation✅
```json
{
  "approved": true,
  "reviewerId": "{{reviewerId}}",
  "rejectionReason": null
}
```

### Review Payroll Period✅
```json
{
  "payrollRunId": "{{payrollRunId}}",
  "status": "approved",
  "rejectionReason": null
}
```

### Edit Payroll Period✅
```json
{
  "payrollRunId": "{{payrollRunId}}",
  "payrollPeriod": "2025-02-28T00:00:00.000Z"
}
```

### Edit Payroll Initiation✅
```json
{
  "payrollPeriod": "2025-02-28T00:00:00.000Z",
  "entity": "Main Office|USD"
}
```

### Process Signing Bonuses✅
```json
{}
```

### Create Employee Signing Bonus✅
```json
{
  "employeeId": "{{employeeId}}",
  "signingBonusId": "{{signingBonusId}}",
  "givenAmount": 5000
}
```

### Review Signing Bonus✅
```json
{
  "employeeSigningBonusId": "{{employeeSigningBonusId}}",
  "status": "approved",
  "paymentDate": "2025-02-01T00:00:00.000Z"
}
```

### Edit Signing Bonus✅
```json
{
  "employeeSigningBonusId": "{{employeeSigningBonusId}}",
  "givenAmount": 6000
}
```

### Process Termination Benefits✅
```json
{}
```

### Create Employee Termination Benefit✅
```json
{
  "employeeId": "{{employeeId}}",
  "benefitId": "{{benefitId}}",
  "terminationId": "{{terminationId}}",
  "givenAmount": 10000,
  "status": "pending"
}
```

### Review Termination Benefit✅
```json
{
  "employeeTerminationBenefitId": "{{employeeTerminationBenefitId}}",
  "status": "approved",
  "paymentDate": "2025-02-01T00:00:00.000Z"
}
```

### Calculate Payroll✅
```json
{
  "employeeId": "{{employeeId}}",
  "payrollRunId": "{{payrollRunId}}",
  "baseSalary": 15000
}
```

### Calculate Prorated Salary✅
```json
{
  "employeeId": "{{employeeId}}",
  "baseSalary": 15000,
  "startDate": "2025-01-15T00:00:00.000Z",
  "endDate": "2025-01-31T00:00:00.000Z",
  "payrollPeriodEnd": "2025-01-31T00:00:00.000Z"
}
```

### Apply Statutory Rules✅
```json
{
  "baseSalary": 15000,
  "employeeId": "{{employeeId}}"
}
```

### Generate Draft Payroll Run✅
```json
{
  "payrollPeriod": "2025-01-31T00:00:00.000Z",
  "entity": "Main Office|EGP",
  "payrollSpecialistId": "{{payrollSpecialistId}}",
  "currency": "EGP",
  "payrollManagerId": "{{payrollManagerId}}"
}
```

### Flag Payroll Exception✅
```json
{
  "payrollRunId": "{{payrollRunId}}",
  "code": "MISSING_BANK_ACCOUNT",
  "message": "Employee missing bank account information",
  "employeeId": "{{employeeId}}"
}
```

### Detect Irregularities✅
```json
{}
```

### Review Payroll✅
```json
{
  "status": "under review",
  "comments": "Ready for manager review"
}
```

### Send for Approval✅
```json
{
  "payrollRunId": "{{payrollRunId}}",
  "managerId": "{{managerId}}",
  "financeStaffId": "{{financeStaffId}}"
}
```

### Manager Approval✅
```json
{
  "payrollRunId": "{{payrollRunId}}",
  "status": "approved",
  "managerComments": "Approved by manager",
  "managerDecision": "approved"
}
```

### Finance Approval✅
```json
{
  "payrollRunId": "{{payrollRunId}}",
  "approved": true,
  "financeStaffId": "{{financeStaffId}}",
  "comments": "Approved by finance"
}
```

### Lock Payroll✅
```json
{}
```

### Freeze Payroll✅
```json
{}
```

### Unlock Payroll✅
```json
{
  "unlockReason": "Correction needed for employee salary"
}
```

### Unfreeze Payroll✅
```json
{
  "unlockReason": "Correction needed"
}
```

### Resolve Irregularity✅
```json
{
  "payrollRunId": "{{payrollRunId}}",
  "employeeId": "{{employeeId}}",
  "exceptionCode": "MISSING_BANK_ACCOUNT",
  "resolution": "Bank account added",
  "managerId": "{{managerId}}"
}
```

### Generate and Distribute Payslips✅
```json
{
  "payrollRunId": "{{payrollRunId}}",
  "distributionMethod": "PORTAL"
}
```

---

## 3. PAYROLL TRACKING

### Create Claim
```json
{
  "description": "Business travel expenses",
  "claimType": "Travel",
  "employeeId": "{{employeeId}}",
  "amount": 1500
}
```

### Update Claim
```json
{
  "description": "Updated business travel expenses",
  "amount": 1600
}
```

### Approve Claim by Specialist
```json
{
  "approvedAmount": 1500,
  "resolutionComment": "Approved by specialist"
}
```

### Reject Claim by Specialist
```json
{
  "rejectionReason": "Insufficient documentation"
}
```

### Confirm Claim Approval (Manager)
```json
{
  "managerId": "{{managerId}}",
  "approved": true,
  "comments": "Confirmed by manager"
}
```

### Create Dispute
```json
{
  "description": "Incorrect tax deduction on payslip",
  "employeeId": "{{employeeId}}",
  "payslipId": "{{payslipId}}"
}
```

### Update Dispute
```json
{
  "description": "Updated dispute description"
}
```

### Approve Dispute by Specialist
```json
{
  "resolutionComment": "Dispute is valid, will be processed"
}
```

### Reject Dispute by Specialist
```json
{
  "rejectionReason": "Tax deduction is correct according to tax rules"
}
```

### Confirm Dispute Approval (Manager)
```json
{
  "managerId": "{{managerId}}",
  "approved": true,
  "comments": "Confirmed by manager"
}
```

### Create Refund
```json
{
  "employeeId": "{{employeeId}}",
  "refundDetails": {
    "description": "Refund for approved dispute",
    "amount": 500
  },
  "financeStaffId": "{{financeStaffId}}"
}
```

### Update Refund
```json
{
  "refundDetails": {
    "description": "Updated refund description",
    "amount": 600
  }
}
```

### Process Refund (Mark as Paid)
```json
{
  "paidInPayrollRunId": "{{payrollRunId}}"
}
```

### Generate Refund for Dispute
```json
{
  "refundDetails": {
    "description": "Refund for approved dispute",
    "amount": 500
  },
  "financeStaffId": "{{financeStaffId}}"
}
```

### Generate Refund for Claim
```json
{
  "refundDetails": {
    "description": "Refund for approved claim",
    "amount": 1500
  },
  "financeStaffId": "{{financeStaffId}}"
}
```

---

## Notes

- Replace all `{{variableName}}` placeholders with actual values from your database
- All dates should be in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Empty bodies `{}` are for endpoints that don't require request data
- All endpoints require JWT authentication in the Authorization header: `Bearer YOUR_JWT_TOKEN`

