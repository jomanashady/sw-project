# Review Payroll Initiation - Expected Output

## Endpoint
**POST** `/api/v1/payroll/review-initiation/:runId`

## Request Body
```json
{
  "approved": true,
  "reviewerId": "507f1f77bcf86cd799439017",
  "rejectionReason": null
}
```

---

## Expected Output (When Approved: `approved: true`)

### Status Code
- **200 OK** (or **201 Created** if new)

### Response Body
The response returns the complete `payrollRuns` object with all calculated totals after draft generation:

```json
{
  "_id": "507f1f77bcf86cd799439019",
  "runId": "PR-2025-0001",
  "payrollPeriod": "2025-02-28T00:00:00.000Z",
  "status": "DRAFT",
  "entity": "Company Name|USD",
  "employees": 50,
  "exceptions": 2,
  "totalnetpay": 500000.00,
  "payrollSpecialistId": {
    "_id": "507f1f77bcf86cd799439017",
    "firstName": "John",
    "lastName": "Doe",
    "employeeNumber": "EMP001"
  },
  "paymentStatus": "PENDING",
  "payrollManagerId": {
    "_id": "507f1f77bcf86cd799439018",
    "firstName": "Jane",
    "lastName": "Smith",
    "employeeNumber": "EMP002"
  },
  "financeStaffId": null,
  "rejectionReason": null,
  "unlockReason": null,
  "managerApprovalDate": null,
  "financeApprovalDate": null,
  "createdAt": "2025-02-01T10:00:00.000Z",
  "updatedAt": "2025-02-01T10:15:00.000Z"
}
```

### Key Points:
1. **Status remains `DRAFT`** - The status stays as DRAFT after initiation review (it will move to UNDER_REVIEW when sent for approval)
2. **Draft generation triggered** - If approved, the system automatically:
   - Processes all active employees
   - Calculates payroll for each employee
   - Updates `employees` count
   - Updates `exceptions` count (if any irregularities found)
   - Updates `totalnetpay` (sum of all employee netPay)
3. **Payment Status is `PENDING`** - Will remain PENDING until Finance approves
4. **Updated timestamps** - `updatedAt` will reflect the review time

---

## Expected Output (When Rejected: `approved: false`)

### Request Body
```json
{
  "approved": false,
  "reviewerId": "507f1f77bcf86cd799439017",
  "rejectionReason": "Payroll period does not match current cycle"
}
```

### Response Body
```json
{
  "_id": "507f1f77bcf86cd799439019",
  "runId": "PR-2025-0001",
  "payrollPeriod": "2025-02-28T00:00:00.000Z",
  "status": "REJECTED",
  "entity": "Company Name|USD",
  "employees": 0,
  "exceptions": 0,
  "totalnetpay": 0,
  "payrollSpecialistId": {
    "_id": "507f1f77bcf86cd799439017",
    "firstName": "John",
    "lastName": "Doe",
    "employeeNumber": "EMP001"
  },
  "paymentStatus": "PENDING",
  "payrollManagerId": {
    "_id": "507f1f77bcf86cd799439018",
    "firstName": "Jane",
    "lastName": "Smith",
    "employeeNumber": "EMP002"
  },
  "financeStaffId": null,
  "rejectionReason": "Payroll period does not match current cycle",
  "unlockReason": null,
  "managerApprovalDate": null,
  "financeApprovalDate": null,
  "createdAt": "2025-02-01T10:00:00.000Z",
  "updatedAt": "2025-02-01T10:15:00.000Z"
}
```

### Key Points:
1. **Status is `REJECTED`** - The payroll run is marked as rejected
2. **Rejection reason stored** - The `rejectionReason` field contains the reason
3. **No draft generation** - Draft details are NOT generated (or cleared if they existed)
4. **Can be re-edited** - The payroll can be edited and re-reviewed after rejection

---

## What Happens Behind the Scenes (When Approved)

1. **Validates payroll run exists** and is in DRAFT status
2. **Approves the initiation** (status remains DRAFT)
3. **Automatically triggers draft generation**:
   - Processes signing bonuses for new hires
   - Processes termination benefits for terminated/resigned employees
   - Fetches all active employees
   - Calculates payroll for each employee:
     - Base salary from PayGrade
     - Allowances
     - Taxes (% of base salary)
     - Insurance
     - Penalties (missing hours, unpaid leave)
     - Refunds
     - Net Pay = Net Salary - Penalties + Refunds
     - Adds approved bonuses and benefits
   - Updates totals:
     - `employees`: Count of employees processed
     - `exceptions`: Count of exceptions/irregularities
     - `totalnetpay`: Sum of all employee netPay
4. **Returns updated payroll run** with all calculated values

---

## Important Notes

1. **Draft generation is automatic** - When you approve, the system automatically generates the draft (you don't need to call `/generate-draft` separately)

2. **Status workflow**:
   - Before review: `DRAFT`
   - After approval: `DRAFT` (stays DRAFT until sent for approval)
   - After rejection: `REJECTED`

3. **Draft details created** - After approval, you can check:
   - `employeePayrollDetails` collection for individual employee calculations
   - Use `/preview/:payrollRunId` to see the full breakdown

4. **Time taken** - Draft generation may take some time depending on number of employees (you'll see console logs in the terminal)

5. **Error handling** - If draft generation fails, the endpoint will return an error and the payroll run status will remain DRAFT

---

## Example Response Fields Explained

- **`employees`**: Number of active employees processed in this payroll run
- **`exceptions`**: Number of exceptions/irregularities found (e.g., missing bank accounts, negative net pay)
- **`totalnetpay`**: Total net pay for all employees (sum of all employee netPay amounts)
- **`status`**: Current status of the payroll run (DRAFT after approval)
- **`paymentStatus`**: Payment status (PENDING until Finance approves)

