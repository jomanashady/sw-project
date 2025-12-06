# Payslip Saving Issues and Fixes

## Issue: Payslips Not Getting Saved in MongoDB

### Root Causes Identified:

#### 1. **Validation Check Fails (Most Likely Cause)**
The `generateAndDistributePayslips` method has a strict validation check (lines 3500-3507):

```typescript
if (
  payrollRun.status !== PayRollStatus.LOCKED ||
  payrollRun.paymentStatus !== PayRollPaymentStatus.PAID
) {
  throw new Error(
    'Payroll run must be approved by Finance and locked before generating payslips',
  );
}
```

**This means payslips will NOT be saved if:**
- Payroll run status is NOT `LOCKED`
- Payment status is NOT `PAID`

**Required Workflow:**
1. ✅ Payroll run must be in `LOCKED` status
2. ✅ Payment status must be `PAID`

**To fix:** Ensure the payroll run has gone through the complete approval workflow:
1. Send for approval
2. Manager approval → Status: `PENDING_FINANCE_APPROVAL`
3. Finance approval → Status: `APPROVED`, Payment Status: `PAID`
4. Lock payroll → Status: `LOCKED`

---

#### 2. **Schema Field Mismatch**
The service tries to set `createdBy` and `updatedBy` (lines 3798-3799), but the payslip schema doesn't have these fields.

**Current Schema:**
```typescript
@Schema({ timestamps: true })
export class paySlip {
  // ... other fields
  // NO createdBy or updatedBy fields
}
```

**Service Code:**
```typescript
const payslip = new this.paySlipModel({
  // ... other fields
  createdBy: currentUserId,  // ❌ Field doesn't exist in schema
  updatedBy: currentUserId,  // ❌ Field doesn't exist in schema
});
```

**Impact:** These fields will be silently ignored (Mongoose doesn't throw errors for extra fields), but they won't be saved.

**Fix:** Either:
- Add `createdBy` and `updatedBy` to the schema, OR
- Remove them from the service code

---

#### 3. **Schema Typo: `totaDeductions`**
The schema has a typo: `totaDeductions` instead of `totalDeductions` (line 90).

**Current:**
```typescript
@Prop({ required: true })
totaDeductions?: number;  // Typo + contradictory (required but optional?)
```

**Issue:** The field is marked as `required: true` but also has `?` (optional), which is contradictory.

**Fix:** Should be:
```typescript
@Prop({ required: true })
totalDeductions: number;  // Fixed typo + consistent (required, not optional)
```

---

## How to Verify Payslips Are Being Saved

### Check 1: Verify Payroll Run Status
```json
GET /api/v1/payroll/preview/{payrollRunId}
```

Check the response:
- `status` must be `"locked"` (or `"LOCKED"`)
- `paymentStatus` must be `"paid"` (or `"PAID"`)

### Check 2: Check MongoDB Directly
Query the `payslips` collection:
```javascript
db.payslips.find({ payrollRunId: ObjectId("69339b197de4966abb00a2b6") })
```

### Check 3: Check for Errors
Look in the terminal/console for:
- Validation errors
- Schema errors
- Save errors

---

## Required Workflow Before Generating Payslips

### Step-by-Step Process:

1. **Generate Draft** (or Review Initiation with approval)
   ```
   POST /generate-draft
   OR
   POST /review-initiation/:runId (with approved: true)
   ```

2. **Send for Approval**
   ```
   POST /send-for-approval
   ```
   Status: `UNDER_REVIEW`

3. **Manager Approval**
   ```
   POST /manager-approval
   ```
   Status: `PENDING_FINANCE_APPROVAL`

4. **Finance Approval**
   ```
   POST /finance-approval (with decision: "approve")
   ```
   Status: `APPROVED`, Payment Status: `PAID`

5. **Lock Payroll**
   ```
   POST /:id/lock
   ```
   Status: `LOCKED`

6. **Generate Payslips** (NOW it will work)
   ```
   POST /generate-payslips
   ```
   ✅ Payslips will be saved

---

## Fixes Needed

### Fix 1: Remove Invalid Fields from Service
Remove `createdBy` and `updatedBy` from payslip creation since schema doesn't have them:

```typescript
const payslip = new this.paySlipModel({
  employeeId: detail.employeeId,
  payrollRunId: new mongoose.Types.ObjectId(payrollRunId) as any,
  earningsDetails: { ... },
  deductionsDetails: { ... },
  totalGrossSalary: totalGrossSalary,
  totaDeductions: totaDeductions,
  netPay: detail.netPay,
  paymentStatus: PaySlipPaymentStatus.PENDING,
  // Remove these lines:
  // createdBy: currentUserId,
  // updatedBy: currentUserId,
});
```

### Fix 2: Fix Schema Typo (Optional but Recommended)
Fix the typo in the schema:

```typescript
@Prop({ required: true })
totalDeductions: number;  // Fixed: removed typo and optional marker
```

And update the service to use the correct name:
```typescript
totalDeductions: totaDeductions,  // Use correct field name
```

---

## Expected Response When Payslips Are Saved

### Success Response:
```json
{
  "message": "Generated 50 payslips via PORTAL",
  "payslips": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "employeeId": "507f1f77bcf86cd799439011",
      "payrollRunId": "507f1f77bcf86cd799439019",
      "earningsDetails": { ... },
      "deductionsDetails": { ... },
      "totalGrossSalary": 12000,
      "totaDeductions": 2000,
      "netPay": 10000,
      "paymentStatus": "PENDING",
      "createdAt": "2025-02-15T10:00:00.000Z",
      "updatedAt": "2025-02-15T10:00:00.000Z"
    },
    // ... more payslips
  ],
  "distributionMethod": "PORTAL"
}
```

---

## Troubleshooting Checklist

- [ ] Is payroll run status = `LOCKED`?
- [ ] Is payment status = `PAID`?
- [ ] Are there any errors in the terminal/console?
- [ ] Are employee payroll details generated? (payslips are created per employee)
- [ ] Check MongoDB `payslips` collection directly
- [ ] Verify the payslip model is registered in the module (✅ It is - line 50)

---

## Most Common Issue

**The most common reason payslips aren't saved is that the validation check fails** because:
- Payroll run is not `LOCKED`
- Payment status is not `PAID`

**Solution:** Complete the full approval workflow before generating payslips.

