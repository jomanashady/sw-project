# Payroll API Role Authorization Guide

This guide shows which role is required for each endpoint, so you know which user to authenticate as to get the appropriate JWT token.

**Base URL:** `http://localhost:5000/api/v1`

---

## 🔐 Available Roles

- **DEPARTMENT_EMPLOYEE** - Regular employees
- **PAYROLL_SPECIALIST** - Payroll specialists who handle day-to-day operations
- **PAYROLL_MANAGER** - Payroll managers who approve/reject configurations and lock payrolls
- **FINANCE_STAFF** - Finance staff who approve payroll disbursements and handle refunds
- **HR_MANAGER** - HR managers who approve insurance brackets
- **LEGAL_POLICY_ADMIN** - Legal/policy admins who manage tax rules
- **SYSTEM_ADMIN** - System administrators (can access most endpoints)

---

## 1. PAYROLL CONFIGURATION APIs

### Pay Grades

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| GET✅ | `/payroll-configuration/pay-grades` | Any authenticated user | Any user |
| GET✅ | `/payroll-configuration/pay-grades/:id` | Any authenticated user | Any user |
| POST✅ | `/payroll-configuration/pay-grades` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| PUT✅ | `/payroll-configuration/pay-grades/:id` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| DELETE✅ | `/payroll-configuration/pay-grades/:id` | `PAYROLL_MANAGER` | Payroll Manager user |
| POST✅ | `/payroll-configuration/pay-grades/:id/approve` | `PAYROLL_MANAGER` | Payroll Manager user |
| POST✅ | `/payroll-configuration/pay-grades/:id/reject` | `PAYROLL_MANAGER` | Payroll Manager user |

### Allowances

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| GET ✅| `/payroll-configuration/allowances` | Any authenticated user | Any user |
| POST✅ | `/payroll-configuration/allowances` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| PUT✅ | `/payroll-configuration/allowances/:id` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| POST✅ | `/payroll-configuration/allowances/:id/approve` | `PAYROLL_MANAGER` | Payroll Manager user |
| POST🚩(m3mlthesh bas) | `/payroll-configuration/allowances/:id/reject` | `PAYROLL_MANAGER` | Payroll Manager user |

### Pay Types

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| GET ✅| `/payroll-configuration/pay-types` | Any authenticated user | Any user |
| POST✅ | `/payroll-configuration/pay-types` | `PAYROLL_SPECIALIST` | Payroll Specialist user |

### Tax Rules (ay haga fyha 🚩 hena magarbthesh bas faa hakhalas w harg3lha)

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| GET ✅| `/payroll-configuration/tax-rules` | Any authenticated user | Any user |
| POST ✅| `/payroll-configuration/tax-rules` | `LEGAL_POLICY_ADMIN` | Legal/Policy Admin user |
| PUT🚩 | `/payroll-configuration/tax-rules/:id` | `LEGAL_POLICY_ADMIN` | Legal/Policy Admin user |
| POST🚩 | `/payroll-configuration/tax-rules/:id/approve` | `PAYROLL_MANAGER` | Payroll Manager user |
| POST🚩 | `/payroll-configuration/tax-rules/:id/reject` | `PAYROLL_MANAGER` | Payroll Manager user |

### Insurance Brackets

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| GET✅ | `/payroll-configuration/insurance-brackets` | Any authenticated user | Any user |
| POST✅ | `/payroll-configuration/insurance-brackets` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| POST✅ | `/payroll-configuration/insurance-brackets/:id/approve` | `HR_MANAGER` | HR Manager user |
| POST🚩 (magrbtesh) | `/payroll-configuration/insurance-brackets/:id/reject` | `HR_MANAGER` | HR Manager user |

### Signing Bonuses

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| GET✅ | `/payroll-configuration/signing-bonuses` | Any authenticated user | Any user |
| POST✅ | `/payroll-configuration/signing-bonuses` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| POST🚩 | `/payroll-configuration/signing-bonuses/:id/approve` | `PAYROLL_MANAGER` | Payroll Manager user |
| POST🚩 | `/payroll-configuration/signing-bonuses/:id/reject` | `PAYROLL_MANAGER` | Payroll Manager user |

### Termination Benefits
 
| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| GET✅ | `/payroll-configuration/termination-benefits` | Any authenticated user | Any user |
| POST✅ | `/payroll-configuration/termination-benefits` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| POST🚩 | `/payroll-configuration/termination-benefits/:id/approve` | `PAYROLL_MANAGER` | Payroll Manager user |
| POST🚩 | `/payroll-configuration/termination-benefits/:id/reject` | `PAYROLL_MANAGER` | Payroll Manager user |

### Payroll Policies

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| GET✅ | `/payroll-configuration/policies` | Any authenticated user | Any user |
| POST✅ | `/payroll-configuration/policies` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| POST🚩 | `/payroll-configuration/policies/:id/approve` | `PAYROLL_MANAGER` | Payroll Manager user |
| POST🚩 | `/payroll-configuration/policies/:id/reject` | `PAYROLL_MANAGER` | Payroll Manager user |

### Company Settings

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| GET✅ | `/payroll-configuration/company-settings` | Any authenticated user | Any user |
| POST✅ | `/payroll-configuration/company-settings` | `SYSTEM_ADMIN` | System Admin user |
| PUT✅ | `/payroll-configuration/company-settings` | `SYSTEM_ADMIN` | System Admin user |

### Other Configuration Endpoints

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| GET✅ | `/payroll-configuration/stats` | `PAYROLL_MANAGER` | payroll manager |
| GET✅ | `/payroll-configuration/pending-approvals` | Any authenticated user | Any user |

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## 2. PAYROLL EXECUTION APIs

### Payroll Run Management

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| POST | `/payroll/create` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| POST | `/payroll/process-initiation` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| POST | `/payroll/review-initiation/:runId` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| PUT | `/payroll/edit-initiation/:runId` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| POST | `/payroll/review-payroll-period` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| PUT | `/payroll/edit-payroll-period` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| POST | `/payroll/:id/review` | `PAYROLL_MANAGER` | Payroll Manager user |
| POST | `/payroll/generate-draft` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| GET | `/payroll/preview/:payrollRunId` | `PAYROLL_SPECIALIST`, `PAYROLL_MANAGER` | Payroll Specialist or Manager |
| GET | `/payroll/pre-initiation-validation` | `PAYROLL_SPECIALIST`, `PAYROLL_MANAGER` | Payroll Specialist or Manager |

### Signing Bonuses

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| POST | `/payroll/process-signing-bonuses` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| POST | `/payroll/create-signing-bonus` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| POST | `/payroll/review-signing-bonus` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| PUT | `/payroll/edit-signing-bonus` | `PAYROLL_SPECIALIST` | Payroll Specialist user |

### Termination Benefits

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| POST | `/payroll/process-termination-benefits` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| POST | `/payroll/create-termination-benefit` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| POST | `/payroll/review-termination-benefit` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| PUT | `/payroll/edit-termination-benefit` | `PAYROLL_SPECIALIST` | Payroll Specialist user |

### Payroll Calculations

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| POST | `/payroll/calculate-payroll` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| POST | `/payroll/calculate-prorated-salary` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| POST | `/payroll/apply-statutory-rules` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| POST | `/payroll/generate-details` | `PAYROLL_SPECIALIST` | Payroll Specialist user |

### Payroll Exceptions & Irregularities

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| POST | `/payroll/flag-exception` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| POST | `/payroll/detect-irregularities/:payrollRunId` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| POST | `/payroll/resolve-irregularity` | `PAYROLL_MANAGER` | Payroll Manager user |
| GET | `/payroll/employee-exceptions/:employeeId/:payrollRunId` | `PAYROLL_SPECIALIST`, `PAYROLL_MANAGER` | Payroll Specialist or Manager |
| GET | `/payroll/payroll-exceptions/:payrollRunId` | `PAYROLL_SPECIALIST`, `PAYROLL_MANAGER` | Payroll Specialist or Manager |

### Payroll Approval Workflow

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| POST | `/payroll/send-for-approval` | `PAYROLL_SPECIALIST` | Payroll Specialist user |
| POST | `/payroll/manager-approval` | `PAYROLL_MANAGER` | Payroll Manager user |
| POST | `/payroll/finance-approval` | `FINANCE_STAFF` | Finance Staff user |

### Payroll Lock/Freeze

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| POST | `/payroll/:id/lock` | `PAYROLL_MANAGER` | Payroll Manager user |
| POST | `/payroll/:id/unlock` | `PAYROLL_MANAGER` | Payroll Manager user |
| POST | `/payroll/:id/freeze` | `PAYROLL_MANAGER` | Payroll Manager user |
| POST | `/payroll/:id/unfreeze` | `PAYROLL_MANAGER` | Payroll Manager user |

### Payslip Generation

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| POST | `/payroll/generate-payslips` | `PAYROLL_SPECIALIST` | Payroll Specialist user |

---

## 3. PAYROLL TRACKING APIs

### Claims Management

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| POST | `/payroll-tracking/claims` | `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN` | Employee or System Admin |
| GET | `/payroll-tracking/claims/pending` | `PAYROLL_SPECIALIST`, `SYSTEM_ADMIN` | Payroll Specialist or System Admin |
| GET | `/payroll-tracking/claims/approved` | `FINANCE_STAFF`, `SYSTEM_ADMIN` | Finance Staff or System Admin |
| GET | `/payroll-tracking/claims/employee/:employeeId` | `DEPARTMENT_EMPLOYEE`, `PAYROLL_SPECIALIST`, `FINANCE_STAFF`, `SYSTEM_ADMIN` | Employee, Specialist, Finance, or Admin |
| GET | `/payroll-tracking/claims/:claimId` | `DEPARTMENT_EMPLOYEE`, `PAYROLL_SPECIALIST`, `FINANCE_STAFF`, `SYSTEM_ADMIN` | Employee, Specialist, Finance, or Admin |
| PUT | `/payroll-tracking/claims/:claimId` | `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN` | Employee or System Admin |
| PUT | `/payroll-tracking/claims/:claimId/approve-by-specialist` | `PAYROLL_SPECIALIST`, `SYSTEM_ADMIN` | Payroll Specialist or System Admin |
| PUT | `/payroll-tracking/claims/:claimId/reject-by-specialist` | `PAYROLL_SPECIALIST`, `SYSTEM_ADMIN` | Payroll Specialist or System Admin |
| PUT | `/payroll-tracking/claims/:claimId/confirm-approval` | `PAYROLL_SPECIALIST`, `SYSTEM_ADMIN` | Payroll Specialist or System Admin |

### Disputes Management

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| POST | `/payroll-tracking/disputes` | `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN` | Employee or System Admin |
| GET | `/payroll-tracking/disputes/pending` | `PAYROLL_SPECIALIST`, `SYSTEM_ADMIN` | Payroll Specialist or System Admin |
| GET | `/payroll-tracking/disputes/approved` | `FINANCE_STAFF`, `SYSTEM_ADMIN` | Finance Staff or System Admin |
| GET | `/payroll-tracking/disputes/employee/:employeeId` | `DEPARTMENT_EMPLOYEE`, `PAYROLL_SPECIALIST`, `FINANCE_STAFF`, `SYSTEM_ADMIN` | Employee, Specialist, Finance, or Admin |
| GET | `/payroll-tracking/disputes/:disputeId` | `DEPARTMENT_EMPLOYEE`, `PAYROLL_SPECIALIST`, `FINANCE_STAFF`, `SYSTEM_ADMIN` | Employee, Specialist, Finance, or Admin |
| PUT | `/payroll-tracking/disputes/:disputeId` | `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN` | Employee or System Admin |
| PUT | `/payroll-tracking/disputes/:disputeId/approve-by-specialist` | `PAYROLL_SPECIALIST`, `SYSTEM_ADMIN` | Payroll Specialist or System Admin |
| PUT | `/payroll-tracking/disputes/:disputeId/reject-by-specialist` | `PAYROLL_SPECIALIST`, `SYSTEM_ADMIN` | Payroll Specialist or System Admin |
| PUT | `/payroll-tracking/disputes/:disputeId/confirm-approval` | `PAYROLL_SPECIALIST`, `SYSTEM_ADMIN` | Payroll Specialist or System Admin |

### Refunds Management

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| POST | `/payroll-tracking/refunds` | `FINANCE_STAFF`, `SYSTEM_ADMIN` | Finance Staff or System Admin |
| GET | `/payroll-tracking/refunds/pending` | `FINANCE_STAFF`, `SYSTEM_ADMIN` | Finance Staff or System Admin |
| GET | `/payroll-tracking/refunds/employee/:employeeId` | `DEPARTMENT_EMPLOYEE`, `FINANCE_STAFF`, `SYSTEM_ADMIN` | Employee, Finance, or Admin |
| GET | `/payroll-tracking/refunds/:refundId` | `DEPARTMENT_EMPLOYEE`, `FINANCE_STAFF`, `SYSTEM_ADMIN` | Employee, Finance, or Admin |
| PUT | `/payroll-tracking/refunds/:refundId` | `FINANCE_STAFF`, `SYSTEM_ADMIN` | Finance Staff or System Admin |
| PUT | `/payroll-tracking/refunds/:refundId/process` | `FINANCE_STAFF`, `SYSTEM_ADMIN` | Finance Staff or System Admin |
| POST | `/payroll-tracking/refunds/dispute/:disputeId` | `FINANCE_STAFF`, `SYSTEM_ADMIN` | Finance Staff or System Admin |
| POST | `/payroll-tracking/refunds/claim/:claimId` | `FINANCE_STAFF`, `SYSTEM_ADMIN` | Finance Staff or System Admin |

### Employee Self-Service

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| GET | `/payroll-tracking/employee/:employeeId/payslips` | `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN` | Employee or System Admin |
| GET | `/payroll-tracking/employee/:employeeId/payslips/:payslipId` | `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN` | Employee or System Admin |
| GET | `/payroll-tracking/employee/:employeeId/base-salary` | `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN` | Employee or System Admin |
| GET | `/payroll-tracking/employee/:employeeId/leave-encashment` | `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN` | Employee or System Admin |
| GET | `/payroll-tracking/employee/:employeeId/transportation-allowance` | `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN` | Employee or System Admin |
| GET | `/payroll-tracking/employee/:employeeId/tax-deductions` | `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN` | Employee or System Admin |
| GET | `/payroll-tracking/employee/:employeeId/insurance-deductions` | `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN` | Employee or System Admin |
| GET | `/payroll-tracking/employee/:employeeId/misconduct-deductions` | `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN` | Employee or System Admin |
| GET | `/payroll-tracking/employee/:employeeId/unpaid-leave-deductions` | `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN` | Employee or System Admin |
| GET | `/payroll-tracking/employee/:employeeId/salary-history` | `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN` | Employee or System Admin |
| GET | `/payroll-tracking/employee/:employeeId/employer-contributions` | `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN` | Employee or System Admin |
| GET | `/payroll-tracking/employee/:employeeId/tax-documents` | `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN` | Employee or System Admin |

### Reports

| Method | Endpoint | Required Role(s) | Authenticate As |
|--------|----------|------------------|-----------------|
| GET | `/payroll-tracking/reports/department/:departmentId` | `PAYROLL_SPECIALIST`, `SYSTEM_ADMIN` | Payroll Specialist or System Admin |
| GET | `/payroll-tracking/reports/payroll-summary` | `FINANCE_STAFF`, `SYSTEM_ADMIN` | Finance Staff or System Admin |
| GET | `/payroll-tracking/reports/tax-insurance-benefits` | `FINANCE_STAFF`, `SYSTEM_ADMIN` | Finance Staff or System Admin |
| GET | `/payroll-tracking/departments` | `PAYROLL_SPECIALIST`, `FINANCE_STAFF`, `SYSTEM_ADMIN` | Payroll Specialist, Finance, or Admin |
| GET | `/payroll-tracking/reports/departments-summary` | `PAYROLL_SPECIALIST`, `FINANCE_STAFF`, `SYSTEM_ADMIN` | Payroll Specialist, Finance, or Admin |

---

## 📝 Quick Reference by Role

### To test as **PAYROLL_SPECIALIST**, you need a token from a user with this role for:
- Creating/updating/processing payroll configurations (pay grades, allowances, signing bonuses, etc.)
- Creating and processing payroll runs
- Calculating payroll
- Reviewing signing bonuses and termination benefits
- Flagging exceptions and detecting irregularities
- Generating payslips
- Viewing pending claims and disputes
- Approving/rejecting claims and disputes

### To test as **PAYROLL_MANAGER**, you need a token from a user with this role for:
- Approving/rejecting payroll configurations
- Reviewing payroll runs
- Locking/unlocking payrolls
- Resolving irregularities
- Confirming claim/dispute approvals

### To test as **FINANCE_STAFF**, you need a token from a user with this role for:
- Approving payroll disbursements
- Viewing approved claims and disputes
- Creating and processing refunds
- Generating payroll summary reports
- Generating tax/insurance/benefits reports

### To test as **DEPARTMENT_EMPLOYEE**, you need a token from a user with this role for:
- Viewing own payslips and salary information
- Creating and updating claims
- Creating and updating disputes
- Viewing own refunds

### To test as **HR_MANAGER**, you need a token from a user with this role for:
- Approving/rejecting insurance brackets

### To test as **LEGAL_POLICY_ADMIN**, you need a token from a user with this role for:
- Creating/updating tax rules

### To test as **SYSTEM_ADMIN**, you need a token from a user with this role for:
- Managing company settings
- Accessing most endpoints (has broad permissions)

---

## 🔑 How to Get Tokens

1. **Login endpoint**: Use your authentication endpoint (e.g., `/auth/login`) with credentials for a user having the required role
2. **Extract token**: The login response should contain a JWT token
3. **Use in requests**: Include the token in the `Authorization` header: `Bearer <token>`

**Example:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "payroll.specialist@company.com",
  "password": "password123"
}
```

Response will contain a token that you can use for all `PAYROLL_SPECIALIST` endpoints.

---

## ⚠️ Important Notes

- **SYSTEM_ADMIN** role typically has access to most endpoints, making it useful for testing
- Some endpoints accept multiple roles (e.g., `PAYROLL_SPECIALIST, PAYROLL_MANAGER`) - you can use a token from any of those roles
- GET endpoints that don't specify a role typically allow any authenticated user
- Always check the response for `403 Forbidden` errors - this indicates you're using the wrong role token

