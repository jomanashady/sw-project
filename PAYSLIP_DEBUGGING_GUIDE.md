# Payslip Debugging Guide

## Issue: Payslips Not Being Saved in MongoDB

I've added comprehensive logging and error handling to help identify the issue. Here's how to debug:

---

## Step 1: Check Terminal/Console Logs

After calling `POST /api/v1/payroll/generate-payslips`, check your terminal for these log messages:

### Expected Log Flow:
```
[Generate Payslips] Found X employee payroll details for payroll run {payrollRunId}
[Generate Payslips] Creating payslip for employee {employeeId}...
[Generate Payslips] Saving payslip for employee {employeeId}...
[Generate Payslips] Successfully saved payslip {payslipId} for employee {employeeId}
[Generate Payslips] Completed. Generated X payslips out of Y employees via PORTAL
```

### If You See Errors:
- **"No employee payroll details found"** → The payroll draft hasn't been generated yet
- **"Validation errors"** → Schema validation failed (check the error details)
- **"Error creating/saving payslip"** → Something went wrong during save (check error message)

---

## Step 2: Verify Prerequisites

### Check 1: Payroll Run Status
```json
GET /api/v1/payroll/preview/{payrollRunId}
```

**Required:**
- `status`: `"locked"` (or `"LOCKED"`)
- `paymentStatus`: `"paid"` (or `"PAID"`)

### Check 2: Employee Payroll Details Exist
```json
GET /api/v1/payroll/preview/{payrollRunId}
```

Look for `employeePayrollDetails` array - it should have entries for each employee.

**OR check MongoDB directly:**
```javascript
db.employeepayrolldetails.find({ payrollRunId: ObjectId("your-payroll-run-id") }).count()
```

This should return a number > 0.

---

## Step 3: Common Issues and Solutions

### Issue 1: "No employee payroll details found"

**Cause:** The payroll draft hasn't been generated yet.

**Solution:**
1. Generate draft first:
   ```
   POST /api/v1/payroll/generate-draft
   ```
   OR
2. Review and approve payroll initiation (which auto-generates draft):
   ```
   POST /api/v1/payroll/review-initiation/:runId
   Body: { "approved": true, ... }
   ```

---

### Issue 2: Validation Errors in Terminal

**Example Error:**
```
[Generate Payslips] Validation errors: {
  "earningsDetails.baseSalary": {
    "message": "Path `baseSalary` is required.",
    "name": "ValidatorError"
  }
}
```

**Cause:** The payslip data doesn't match the schema requirements.

**Solution:**
- Check that `employeePayrollDetails` have valid `baseSalary` values
- Check that required fields are not null/undefined
- Verify the schema matches the data structure

---

### Issue 3: Schema Validation Fails Silently

**Cause:** Mongoose validation errors might not be logged properly.

**Solution:**
- Check the terminal logs for validation error details
- Verify the payslip schema matches what's being saved
- Check MongoDB for any partial saves (they might exist but be invalid)

---

### Issue 4: Loop Doesn't Execute

**Cause:** `payrollDetails` array is empty.

**Check:**
```javascript
// In MongoDB shell
db.employeepayrolldetails.find({ 
  payrollRunId: ObjectId("your-payroll-run-id") 
}).count()
```

**Solution:**
- Generate payroll draft first
- Ensure employees are included in the payroll run

---

## Step 4: Check MongoDB Directly

### Query 1: Check if Payslips Were Created
```javascript
db.payslips.find({ payrollRunId: ObjectId("your-payroll-run-id") })
```

### Query 2: Count Payslips
```javascript
db.payslips.find({ payrollRunId: ObjectId("your-payroll-run-id") }).count()
```

### Query 3: Check Latest Payslips
```javascript
db.payslips.find().sort({ createdAt: -1 }).limit(10)
```

---

## Step 5: Verify Collection Name

MongoDB collection names are typically lowercase and pluralized. Check:

- Collection name might be: `payslips` (lowercase, plural)
- Model name: `paySlip` (camelCase, singular)

**Check your MongoDB:**
```javascript
show collections
// Look for: payslips or payslip
```

---

## Step 6: Test with Single Employee

If you have many employees, test with a payroll run that has only 1 employee to isolate the issue.

---

## Step 7: Check API Response

After calling `POST /api/v1/payroll/generate-payslips`, check the response:

### Success Response:
```json
{
  "message": "Generated 50 payslips via PORTAL",
  "payslips": [
    {
      "_id": "...",
      "employeeId": "...",
      "payrollRunId": "...",
      // ... other fields
    }
  ],
  "distributionMethod": "PORTAL",
  "totalEmployees": 50,
  "successful": 50,
  "failed": 0
}
```

### If `failed > 0`:
- Check terminal logs for specific error messages
- Some employees might have validation errors

### If `payslips` array is empty:
- Check terminal logs for errors
- Verify employee payroll details exist

---

## Step 8: Manual MongoDB Check

If payslips still aren't appearing, manually check:

1. **Check if collection exists:**
   ```javascript
   show collections
   ```

2. **Check if any payslips exist:**
   ```javascript
   db.payslips.find().count()
   ```

3. **Check for recent payslips:**
   ```javascript
   db.payslips.find().sort({ createdAt: -1 }).limit(5)
   ```

4. **Check for payslips with specific payroll run:**
   ```javascript
   db.payslips.find({ 
     payrollRunId: ObjectId("your-payroll-run-id") 
   })
   ```

---

## What I've Added

1. **Comprehensive Logging:**
   - Logs when payroll details are found
   - Logs when creating each payslip
   - Logs when saving each payslip
   - Logs success/failure for each employee
   - Logs validation errors with details

2. **Better Error Handling:**
   - Catches errors during payslip creation/saving
   - Continues processing other employees if one fails
   - Flags exceptions for failed payslips
   - Returns detailed success/failure counts

3. **Validation:**
   - Checks if payroll details exist before processing
   - Throws clear error if no details found
   - Validates that at least one payslip was generated

---

## Next Steps

1. **Run the API again** and check terminal logs
2. **Share the terminal output** so we can identify the specific issue
3. **Check MongoDB directly** using the queries above
4. **Verify the payroll run status** meets requirements

The logs will now tell us exactly where the process is failing!

