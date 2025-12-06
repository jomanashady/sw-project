# Fix Payroll Policy MongoDB Index Issue

## Problem
MongoDB has an old unique index on `name` field (`name_1`), but the current schema uses `policyName` field. This causes duplicate key errors when creating payroll policies.

## Solution: Drop the Old Index

You need to drop the old `name_1` index from the `payrollpolicies` collection in MongoDB.

### Option 1: Using MongoDB Compass (GUI)
1. Open MongoDB Compass
2. Connect to your database (`hr_system`)
3. Navigate to the `payrollpolicies` collection
4. Go to the "Indexes" tab
5. Find the index named `name_1`
6. Click the "Drop" button next to it

### Option 2: Using MongoDB Shell (mongosh)
```javascript
// Connect to your database
use hr_system

// List all indexes to confirm
db.payrollpolicies.getIndexes()

// Drop the old name_1 index
db.payrollpolicies.dropIndex("name_1")

// Verify it's gone
db.payrollpolicies.getIndexes()
```

### Option 3: Using MongoDB Shell (mongo - if using older version)
```javascript
// Connect to your database
use hr_system

// Drop the old name_1 index
db.payrollpolicies.dropIndex("name_1")
```

### Option 4: Using Node.js Script
Create a file `fix-payroll-policy-index.js`:
```javascript
const { MongoClient } = require('mongodb');

async function fixIndex() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('hr_system');
    const collection = db.collection('payrollpolicies');

    // List current indexes
    console.log('Current indexes:', await collection.indexes());

    // Drop the old name_1 index
    try {
      await collection.dropIndex('name_1');
      console.log('✅ Successfully dropped name_1 index');
    } catch (error) {
      if (error.codeName === 'IndexNotFound') {
        console.log('ℹ️  name_1 index does not exist (already fixed)');
      } else {
        throw error;
      }
    }

    // Verify
    console.log('Updated indexes:', await collection.indexes());
  } finally {
    await client.close();
  }
}

fixIndex().catch(console.error);
```

Run it:
```bash
node fix-payroll-policy-index.js
```

## After Fixing

After dropping the old index, try creating the payroll policy again:

```http
POST http://localhost:5000/api/v1/payroll-configuration/policies
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

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

## Expected Indexes After Fix

The `payrollpolicies` collection should have:
- `_id_` (default MongoDB index)
- `policyName_1` (unique index on policyName field - if Mongoose creates it automatically)

## Note

The schema correctly uses `policyName` field. The old `name_1` index is leftover from a previous schema version and needs to be manually removed.

## Quick Fix All Index Issues

If you want to fix all similar index issues at once, you can run:

```javascript
use hr_system

// Fix pay grades
db.paygrades.dropIndex("name_1")

// Fix payroll policies
db.payrollpolicies.dropIndex("name_1")

// Check for any other collections with old name_1 indexes
db.getCollectionNames().forEach(function(collection) {
  var indexes = db[collection].getIndexes();
  indexes.forEach(function(index) {
    if (index.name === "name_1") {
      print("Found name_1 index in: " + collection);
    }
  });
});
```

