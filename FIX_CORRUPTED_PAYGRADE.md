# Fix Corrupted Pay Grade Document

## Problem
The pay grade document with ID `69` in your database is corrupted or incomplete:
- Missing `baseSalary` field (required)
- Missing `grade` field (required)  
- Invalid `grossSalary` value (3500, but minimum is 6000)

When you try to approve it, Mongoose validates the entire document and fails.

## Solution: Check and Fix the Document

### Option 1: Check the Document First

Use MongoDB Compass or MongoDB Shell to check the document:

```javascript
// In MongoDB Shell
use hr_system
db.paygrades.findOne({ _id: ObjectId("69") })
```

Or if using the string ID directly:
```javascript
db.paygrades.findById("69")
```

### Option 2: Fix the Document in MongoDB

If the document exists but is incomplete, you can update it:

```javascript
use hr_system

// Update the corrupted pay grade
db.paygrades.updateOne(
  { _id: ObjectId("69") },
  {
    $set: {
      grade: "Senior Developer",  // Add missing grade
      baseSalary: 15000,          // Add missing baseSalary
      grossSalary: 18000,         // Fix invalid grossSalary (was 3500)
      status: "draft"             // Ensure it's in draft status for approval
    }
  }
)
```

### Option 3: Delete and Recreate

If the document is too corrupted, delete it and create a new one:

```javascript
use hr_system

// Delete the corrupted pay grade
db.paygrades.deleteOne({ _id: ObjectId("69") })
```

Then create a new pay grade using the API:

```http
POST http://localhost:5000/api/v1/payroll-configuration/pay-grades
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "grade": "Senior Developer",
  "baseSalary": 15000,
  "grossSalary": 18000
}
```

### Option 4: Use MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect to `hr_system` database
3. Navigate to `paygrades` collection
4. Find the document with ID `69`
5. Either:
   - **Edit it** to add missing fields and fix values
   - **Delete it** and create a new one via API

## After Fixing

Once the document is fixed, try approving it again:

```http
POST http://localhost:5000/api/v1/payroll-configuration/pay-grades/69/approve
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "comment": "Approved by Payroll Manager"
}
```

## Prevention

To avoid this in the future:
1. Always create pay grades using the proper API endpoint with all required fields
2. Ensure `baseSalary` and `grossSalary` are both >= 6000
3. Make sure `grade` field is always provided

## Quick Check Script

Run this to find all corrupted pay grades:

```javascript
use hr_system

// Find pay grades missing required fields or with invalid values
db.paygrades.find({
  $or: [
    { grade: { $exists: false } },
    { baseSalary: { $exists: false } },
    { grossSalary: { $exists: false } },
    { grossSalary: { $lt: 6000 } },
    { baseSalary: { $lt: 6000 } }
  ]
})
```

