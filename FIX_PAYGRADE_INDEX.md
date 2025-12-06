# Fix PayGrade MongoDB Index Issue

## Problem
MongoDB has an old unique index on `name` field (`name_1`), but the current schema uses `grade` field. This causes duplicate key errors when creating pay grades.

## Solution: Drop the Old Index

You need to drop the old `name_1` index from the `paygrades` collection in MongoDB.

### Option 1: Using MongoDB Compass (GUI)
1. Open MongoDB Compass
2. Connect to your database (`hr_system`)
3. Navigate to the `paygrades` collection
4. Go to the "Indexes" tab
5. Find the index named `name_1`
6. Click the "Drop" button next to it

### Option 2: Using MongoDB Shell (mongosh)
```javascript
// Connect to your database
use hr_system

// List all indexes to confirm
db.paygrades.getIndexes()

// Drop the old name_1 index
db.paygrades.dropIndex("name_1")

// Verify it's gone
db.paygrades.getIndexes()
```

### Option 3: Using MongoDB Shell (mongo - if using older version)
```javascript
// Connect to your database
use hr_system

// Drop the old name_1 index
db.paygrades.dropIndex("name_1")
```

### Option 4: Using Node.js Script
Create a file `fix-paygrade-index.js`:
```javascript
const { MongoClient } = require('mongodb');

async function fixIndex() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('hr_system');
    const collection = db.collection('paygrades');

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
node fix-paygrade-index.js
```

## After Fixing

After dropping the old index, try creating the pay grade again:

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

## Expected Indexes After Fix

The `paygrades` collection should have:
- `_id_` (default MongoDB index)
- `grade_1` (unique index on grade field - created automatically by Mongoose)

## Note

The schema correctly uses `grade` field with `unique: true`. Mongoose will automatically create a `grade_1` index when you save a document. The old `name_1` index is leftover from a previous schema version and needs to be manually removed.

