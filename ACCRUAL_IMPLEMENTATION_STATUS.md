# Accrual System Implementation Status

## ✅ **IMPLEMENTED Features**

### 1. **Rounding Methods** ✅
- **Location:** `backend/src/leaves/enums/rounding-rule.enum.ts`
- **Methods Available:**
  - `NONE` - No Rounding
  - `ROUND` - Rounded Arithmetically (Math.round)
  - `ROUND_UP` - Always Rounded Up (Math.ceil)
  - `ROUND_DOWN` - Always Rounded Down (Math.floor)
- **Implementation:** `backend/src/leaves/leaves.service.ts` - `applyRoundingRule()` method (lines 1095-1112)

### 2. **Both Pre-Rounded and Rounded Values Stored** ✅
- **Location:** `backend/src/leaves/models/leave-entitlement.schema.ts`
- **Fields:**
  - `accruedActual` (line 23) - Pre-rounded value (actual accrued before rounding)
  - `accruedRounded` (line 27) - Rounded value (used for UI & calculations)
- **Implementation:** Both values are saved in the database and updated correctly during accrual operations

### 3. **Carry-Over Rules** ✅
- **Location:** `backend/src/leaves/models/leave-policy.schema.ts`
- **Fields:**
  - `carryForwardAllowed` (line 23) - Boolean flag
  - `maxCarryForward` (line 26) - Maximum days that can be carried forward
- **Implementation:** Enforced in `runCarryForward()` method (lines 2711-2809)

### 4. **Expiration Dates** ✅
- **Location:** `backend/src/leaves/models/leave-policy.schema.ts`
- **Field:** `expiryAfterMonths` (line 29) - Optional expiration period
- **Note:** Field exists in schema but expiration logic may need verification

### 5. **Caps** ✅
- **Location:** `backend/src/leaves/models/leave-policy.schema.ts`
- **Field:** `maxCarryForward` (line 26) - Cap on carry-forward amount
- **Additional:** `maxConsecutiveDays` (line 38) - Cap on consecutive leave days

### 6. **Accrual Methods** ✅
- **Location:** `backend/src/leaves/enums/accrual-method.enum.ts`
- **Methods:**
  - `MONTHLY` - Monthly accrual
  - `YEARLY` - Yearly accrual
  - `PER_TERM` - Per term accrual
- **Policy Fields:**
  - `monthlyRate` (line 17 in leave-policy.schema.ts)
  - `yearlyRate` (line 20 in leave-policy.schema.ts)

### 7. **Employment Type Eligibility** ✅
- **Location:** `backend/src/leaves/models/leave-policy.schema.ts`
- **Field:** `eligibility` (lines 40-47)
  - `minTenureMonths` - Minimum tenure required
  - `positionsAllowed` - Allowed positions
  - `contractTypesAllowed` - Allowed contract types

---

## ⚠️ **PARTIALLY IMPLEMENTED / NEEDS VERIFICATION**

### 1. **Monthly Accrual Formula: (Eligible Months Worked) × (Monthly Rate)** ⚠️

**Status:** Helper function exists but may not be used in automatic calculation

**What's Implemented:**
- ✅ Helper function `calculateMonthsWorked()` exists (lines 1084-1093)
- ✅ `monthlyRate` field exists in LeavePolicy schema
- ✅ Accrual methods (monthly/yearly/per_term) are defined

**What's Missing/Unclear:**
- ❓ The `autoAccrueLeave()` and `autoAccrueAllEmployees()` functions take `accrualAmount` as a **parameter** rather than **calculating** it automatically
- ❓ Need to verify if there's automatic calculation based on:
  - Number of eligible months worked since hire date
  - Monthly rate from policy
  - Formula: `accrualAmount = eligibleMonths × monthlyRate`

**Current Implementation:**
```typescript
// Current: HR manually specifies accrual amount
async autoAccrueLeave(
  employeeId: string,
  leaveTypeId: string,
  accrualAmount: number,  // ← Manual input, not calculated
  accrualType: string,
  ...
)
```

**Expected Implementation:**
```typescript
// Expected: Automatic calculation
const eligibleMonths = calculateEligibleMonthsWorked(employee, policy);
const accrualAmount = eligibleMonths * policy.monthlyRate;
```

---

## 📋 **Implementation Details**

### **Rounding Implementation:**
```typescript
// Location: backend/src/leaves/leaves.service.ts:1095-1112
private applyRoundingRule(amount: number, roundingRule: RoundingRule): number {
  switch (roundingRule) {
    case RoundingRule.NONE: return amount;
    case RoundingRule.ROUND: return Math.round(amount);
    case RoundingRule.ROUND_UP: return Math.ceil(amount);
    case RoundingRule.ROUND_DOWN: return Math.floor(amount);
  }
}
```

### **Accrual Process:**
1. Increment `accruedActual` (pre-rounded)
2. Calculate `accruedRounded` by applying rounding rule to total `accruedActual`
3. Recalculate `remaining` balance
4. Both values saved to database

### **Database Schema:**
```typescript
// LeaveEntitlement Schema
{
  accruedActual: number;    // Pre-rounded value
  accruedRounded: number;    // Rounded value
  carryForward: number;      // Carried forward days
  remaining: number;         // Available balance
}
```

### **Policy Schema:**
```typescript
// LeavePolicy Schema
{
  accrualMethod: AccrualMethod;  // monthly/yearly/per_term
  monthlyRate: number;            // Monthly accrual rate
  yearlyRate: number;             // Yearly accrual rate
  roundingRule: RoundingRule;      // Rounding method
  carryForwardAllowed: boolean;    // Allow carry-over
  maxCarryForward: number;         // Cap on carry-over
  expiryAfterMonths?: number;      // Expiration period
}
```

---

## 🔍 **What Needs to Be Verified/Implemented**

### **1. Automatic Monthly Accrual Calculation**
**Question:** Does the system automatically calculate accrual as `eligibleMonths × monthlyRate`, or does HR manually enter the amount?

**To Check:**
- Review `autoAccrueAllEmployees()` function
- Check if it calculates accrual based on:
  - Employee hire date
  - Policy monthly rate
  - Eligible months worked
  - Formula: `months × rate`

### **2. Eligible Months Calculation**
**Question:** Does the system correctly calculate eligible months considering:
- Employee hire date
- Unpaid leave periods (should be excluded)
- Suspension periods (should be excluded)
- Probation period (may or may not count)

**Current Helper:**
- `calculateMonthsWorked()` exists but may not account for unpaid leave/suspension

### **3. Employment Type Based Accrual**
**Question:** Does accrual vary by:
- Contract type (Full-time vs Part-time)
- Work type
- Position
- As defined in policy `eligibility` field

---

## ✅ **Summary**

| Feature | Status | Notes |
|---------|--------|-------|
| Rounding Methods (4 types) | ✅ Implemented | All 4 methods available |
| Pre-rounded & Rounded Storage | ✅ Implemented | Both `accruedActual` and `accruedRounded` saved |
| Carry-Over Rules | ✅ Implemented | `carryForwardAllowed` and `maxCarryForward` |
| Expiration Dates | ✅ Schema exists | `expiryAfterMonths` field present |
| Caps | ✅ Implemented | `maxCarryForward` and `maxConsecutiveDays` |
| Accrual Methods | ✅ Implemented | Monthly/Yearly/Per-term |
| Monthly Rate Field | ✅ Implemented | `monthlyRate` in policy |
| **Auto Calculation Formula** | ⚠️ **Needs Verification** | Helper exists but calculation may be manual |
| **Eligible Months Logic** | ⚠️ **Needs Verification** | May not account for unpaid leave/suspension |

---

## 🎯 **Recommendation**

**To fully implement the requirement:**
1. **Verify** if `autoAccrueAllEmployees()` automatically calculates accrual based on months worked × monthly rate
2. **Enhance** `calculateMonthsWorked()` to exclude:
   - Unpaid leave periods
   - Suspension periods
   - Other non-eligible periods
3. **Add** automatic calculation in accrual functions if currently manual
4. **Test** the formula: `accrualAmount = eligibleMonths × monthlyRate`

---

**Last Updated:** Based on code review of current implementation

