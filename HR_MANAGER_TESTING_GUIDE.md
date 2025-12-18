# HR Manager Features - Testing Guide

## Prerequisites
- ✅ You are logged in as HR Manager
- ✅ You have access to the Leaves Management dashboard

---

## 🎯 Testing Checklist Overview

### 1. Auto Accrual Management
### 2. Carry-Forward Management  
### 3. Accrual Adjustment & Suspension

---

## 📍 **STEP 1: Navigate to Leaves Management**

1. Go to: **`/dashboard/leaves`**
2. You should see the "Leaves Management" page with multiple cards
3. Look for the **HR Admin section** (or HR Manager section if visible)
4. You should see these cards:
   - "Auto Accrual Management"
   - "Carry-Forward Management"
   - "Accrual Adjustment"

---

## 🧪 **TEST 1: Auto Accrual Management**

### **Access:**
- Click **"Auto Accrual Management"** card → `/dashboard/leaves/accrual`

### **What to Verify in UI:**

#### ✅ **Single Employee Accrual Form (Left Card):**
- [ ] Employee ID input field (required)
- [ ] Leave Type dropdown (populated with leave types)
- [ ] Accrual Amount input (number, accepts decimals)
- [ ] Accrual Type dropdown with options:
  - Monthly
  - Yearly
  - Per Term
- [ ] Notes textarea (optional)
- [ ] "Accrue Leave" button

#### ✅ **Bulk Accrual Form (Right Card):**
- [ ] Leave Type dropdown (required)
- [ ] Accrual Amount input (required)
- [ ] Accrual Type dropdown (Monthly/Yearly/Per Term)
- [ ] Department ID input (optional, with placeholder text)
- [ ] "Accrue for All Employees" button

### **How to Test Logic:**

#### **Test 1.1: Single Employee Accrual**
1. **Get a valid Employee ID:**
   - Go to Employee Profile search page
   - Copy an employee's ID (MongoDB ObjectId format)
   
2. **Fill the form:**
   - Employee ID: `[paste employee ID]`
   - Leave Type: Select any leave type (e.g., "Annual Leave")
   - Accrual Amount: `2.5`
   - Accrual Type: `Monthly`
   - Notes: `Test accrual`
   
3. **Click "Accrue Leave"**
   
4. **Expected Results:**
   - ✅ Success message appears: "Leave accrued successfully. New balance: X days"
   - ✅ Form resets after success
   - ✅ Check employee's leave balance increased by 2.5 days
   
5. **Verify Balance Update:**
   - Go to `/dashboard/leaves/balance` (as that employee)
   - OR use API/backend to check the employee's leave entitlement

#### **Test 1.2: Bulk Accrual**
1. **Fill the bulk form:**
   - Leave Type: Select a leave type
   - Accrual Amount: `1.0`
   - Accrual Type: `Monthly`
   - Department ID: Leave empty (for all employees) OR enter a department ID
   
2. **Click "Accrue for All Employees"**
   
3. **Expected Results:**
   - ✅ Success message: "Bulk accrual completed. Successful: X, Failed: Y, Skipped: Z"
   - ✅ Form resets
   - ✅ Check that multiple employees' balances were updated

#### **Test 1.3: Error Handling**
1. **Test with invalid Employee ID:**
   - Enter invalid ID: `invalid123`
   - Submit form
   - ✅ Should show error message
   
2. **Test with missing required fields:**
   - Leave Employee ID empty
   - Submit form
   - ✅ Should show validation error

---

## 🧪 **TEST 2: Carry-Forward Management**

### **Access:**
- Click **"Carry-Forward Management"** card → `/dashboard/leaves/carry-forward`

### **What to Verify in UI:**

#### ✅ **Form Fields:**
- [ ] Leave Type dropdown (required, populated)
- [ ] Employee ID input (optional, with placeholder)
- [ ] As Of Date date picker (optional)
- [ ] Department ID input (optional, with placeholder)
- [ ] "Run Carry-Forward" button

#### ✅ **Results Card (appears after execution):**
- [ ] Processed Date display
- [ ] Total Processed count
- [ ] Successful count (green)
- [ ] Failed count (red)
- [ ] Details section with employee results (if available)

### **How to Test Logic:**

#### **Test 2.1: Basic Carry-Forward**
1. **Fill the form:**
   - Leave Type: Select a leave type (e.g., "Annual Leave")
   - Employee ID: Leave empty (for all employees)
   - As Of Date: Leave empty OR select a date
   - Department ID: Leave empty
   
2. **Click "Run Carry-Forward"**
   
3. **Expected Results:**
   - ✅ Success message: "Carry-forward completed. Successful: X, Failed: Y, Total: Z"
   - ✅ Results card appears on the right
   - ✅ Shows processed date, counts, and details
   - ✅ Check that unused leave days were carried forward

#### **Test 2.2: Single Employee Carry-Forward**
1. **Fill the form:**
   - Leave Type: Select a leave type
   - Employee ID: Enter a specific employee ID
   - As Of Date: Select a date (e.g., end of last year)
   - Department ID: Leave empty
   
2. **Click "Run Carry-Forward"**
   
3. **Expected Results:**
   - ✅ Only that employee's leave is processed
   - ✅ Results show 1 total processed
   - ✅ Details show that employee's carry-forward amount

#### **Test 2.3: Department-Specific Carry-Forward**
1. **Get a Department ID:**
   - Go to Organization Structure
   - Copy a department ID
   
2. **Fill the form:**
   - Leave Type: Select a leave type
   - Employee ID: Leave empty
   - As Of Date: Leave empty
   - Department ID: `[paste department ID]`
   
3. **Click "Run Carry-Forward"**
   
4. **Expected Results:**
   - ✅ Only employees in that department are processed
   - ✅ Results show count matching department size

#### **Test 2.4: Error Handling**
1. **Test without Leave Type:**
   - Leave Leave Type empty
   - Submit form
   - ✅ Should show error: "Leave Type is required"

---

## 🧪 **TEST 3: Accrual Adjustment & Suspension**

### **Access:**
- Click **"Accrual Adjustment"** card → `/dashboard/leaves/accrual-adjustment`

### **What to Verify in UI:**

#### ✅ **Form Fields:**
- [ ] Employee ID input (required)
- [ ] Leave Type dropdown (required, populated)
- [ ] Adjustment Type dropdown with 4 options:
  - Suspension (Reduce accrued)
  - Reduction (Reduce remaining)
  - Adjustment (Increase remaining)
  - Restoration (Restore accrued)
- [ ] Help text explaining each adjustment type
- [ ] Adjustment Amount input (number, required)
- [ ] From Date date picker (required)
- [ ] To Date date picker (optional)
- [ ] Reason input (optional, with placeholder)
- [ ] Notes textarea (optional)
- [ ] "Apply Adjustment" button

### **How to Test Logic:**

#### **Test 3.1: Suspension (Unpaid Leave)**
1. **Get Employee ID and current balance:**
   - Note an employee's current leave balance
   
2. **Fill the form:**
   - Employee ID: `[employee ID]`
   - Leave Type: Select a leave type
   - Adjustment Type: `Suspension (Reduce accrued)`
   - Adjustment Amount: `5.0`
   - From Date: Select a date (e.g., today)
   - To Date: Select a future date (e.g., 30 days later)
   - Reason: `Unpaid leave`
   - Notes: `Employee on unpaid leave`
   
3. **Click "Apply Adjustment"**
   
4. **Expected Results:**
   - ✅ Success message: "Accrual adjustment applied successfully"
   - ✅ Form resets
   - ✅ Employee's accrued balance should decrease by 5 days
   - ✅ Check employee's leave balance reflects the suspension

#### **Test 3.2: Reduction (Reduce Remaining)**
1. **Fill the form:**
   - Employee ID: `[employee ID]`
   - Leave Type: Select a leave type
   - Adjustment Type: `Reduction (Reduce remaining)`
   - Adjustment Amount: `2.0`
   - From Date: Select a date
   - To Date: Leave empty
   - Reason: `Manual adjustment`
   
2. **Click "Apply Adjustment"**
   
3. **Expected Results:**
   - ✅ Success message appears
   - ✅ Employee's remaining balance should decrease by 2 days

#### **Test 3.3: Adjustment (Increase Remaining)**
1. **Fill the form:**
   - Employee ID: `[employee ID]`
   - Leave Type: Select a leave type
   - Adjustment Type: `Adjustment (Increase remaining)`
   - Adjustment Amount: `3.0`
   - From Date: Select a date
   - Reason: `Bonus leave days`
   
2. **Click "Apply Adjustment"**
   
3. **Expected Results:**
   - ✅ Success message appears
   - ✅ Employee's remaining balance should increase by 3 days

#### **Test 3.4: Restoration (Restore Accrued)**
1. **Fill the form:**
   - Employee ID: `[employee ID]`
   - Leave Type: Select a leave type
   - Adjustment Type: `Restoration (Restore accrued)`
   - Adjustment Amount: `5.0`
   - From Date: Select a date
   - Reason: `Restoring suspended accrual`
   
2. **Click "Apply Adjustment"**
   
3. **Expected Results:**
   - ✅ Success message appears
   - ✅ Employee's accrued balance should increase by 5 days

#### **Test 3.5: Error Handling**
1. **Test with missing required fields:**
   - Leave Employee ID empty
   - Submit form
   - ✅ Should show error: "Please fill in all required fields"
   
2. **Test with invalid Employee ID:**
   - Enter invalid ID
   - Submit form
   - ✅ Should show error message

---

## 🔍 **Backend Verification (Optional)**

### **Check Database/API:**

1. **For Accrual:**
   - Check `LeaveEntitlement` collection
   - Verify `accruedActual` field increased
   - Check `LeaveAccrualHistory` for records

2. **For Carry-Forward:**
   - Check `LeaveEntitlement` collection
   - Verify `carryForward` field updated
   - Check carry-forward history records

3. **For Adjustment:**
   - Check `LeaveEntitlement` collection
   - Verify balance fields changed correctly
   - Check adjustment history records

---

## ✅ **Final Verification Checklist**

### **All Features Working:**
- [ ] Auto Accrual - Single employee works
- [ ] Auto Accrual - Bulk accrual works
- [ ] Auto Accrual - Shows new balance after accrual
- [ ] Carry-Forward - Processes all employees
- [ ] Carry-Forward - Processes single employee
- [ ] Carry-Forward - Processes by department
- [ ] Carry-Forward - Shows results with counts
- [ ] Accrual Adjustment - All 4 adjustment types work
- [ ] Accrual Adjustment - Help text is visible
- [ ] All forms show success/error messages
- [ ] All forms reset after successful submission
- [ ] Error handling works for invalid inputs

---

## 🐛 **Common Issues to Check:**

1. **Leave Types not loading:**
   - Check browser console for API errors
   - Verify `/api/v1/leaves/types` endpoint works

2. **Employee ID not found:**
   - Verify employee exists in database
   - Check ID format (should be MongoDB ObjectId)

3. **Balance not updating:**
   - Check backend logs for errors
   - Verify employee has a leave entitlement record
   - Check if accrual policy exists for that leave type

4. **Department ID not working:**
   - Verify department exists
   - Check ID format

---

## 📝 **Notes:**

- All three pages should be accessible from the main Leaves Management page
- All forms should have proper validation
- Success/error messages should be clear and informative
- Forms should reset after successful submission
- Loading states should show during API calls

---

## 🎯 **Quick Test Path:**

1. **Navigate:** `/dashboard/leaves`
2. **Test Auto Accrual:** Click "Auto Accrual Management" → Test single employee accrual
3. **Test Carry-Forward:** Click "Carry-Forward Management" → Run carry-forward for all
4. **Test Adjustment:** Click "Accrual Adjustment" → Test suspension adjustment
5. **Verify:** Check employee balances updated correctly

---

**Happy Testing! 🚀**

