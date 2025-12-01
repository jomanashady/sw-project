# Application Creation - Testing Guide

## Problem Fixed ✅

**Issue**: Getting `401 Unauthorized - Invalid or missing token` when creating applications.

**Root Cause**: 
- Candidates are NOT employees yet, so they cannot authenticate
- Application creation endpoint required `JOB_CANDIDATE` role, but candidates can't login
- Endpoint needs JWT authentication token

**Solution**:
- ✅ Changed endpoint to allow **HR Employees/Managers** to create applications
- ✅ Added explicit `JwtAuthGuard` for JWT token validation
- ✅ HR creates applications on behalf of candidates using `candidateNumber`

---

## Authentication Flow

### Step 1: Login as HR Employee/Manager

**Endpoint**: `POST /api/v1/auth/login`

**Request**:
```json
{
  "employeeNumber": "EMP-2025-0001",  // HR Employee's employee number
  "password": "your_password"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "employeeNumber": "EMP-2025-0001",
    "fullName": "John Doe",
    "workEmail": "john.doe@company.com",
    "roles": ["HR Employee"]
  }
}
```

**Save the `access_token`** - you'll need it for the next step!

---

### Step 2: Create Application

**Endpoint**: `POST /api/v1/recruitment/application`

**Request Headers**:
```
Authorization: Bearer <access_token_from_step_1>
Content-Type: application/json
```

**Request Body**:
```json
{
  "candidateNumber": "CAN-2025-0001",        // Candidate's number (NOT ID)
  "requisitionId": "507f1f77bcf86cd799439012", // Job requisition ID
  "consentGiven": true,                       // Must be true (REC-028)
  "assignedHr": "507f1f77bcf86cd799439013"    // Optional - if not provided, uses hiringManagerId from requisition
}
```

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "candidateId": "507f1f77bcf86cd799439015",
  "requisitionId": "507f1f77bcf86cd799439012",
  "assignedHr": "507f1f77bcf86cd799439013",
  "currentStage": "screening",
  "status": "submitted",
  "createdAt": "2025-02-10T10:00:00.000Z",
  "updatedAt": "2025-02-10T10:00:00.000Z"
}
```

---

## Key Points

### ✅ What You Need:
1. **HR Employee/Manager credentials** (employeeNumber + password)
2. **Candidate's candidateNumber** (e.g., `CAN-2025-0001`) - NOT their ID
3. **Job Requisition ID** (from requisition you created)
4. **Consent must be given** (`consentGiven: true`)

### ✅ How It Works:
1. **HR logs in** → Gets JWT token
2. **HR creates application** using:
   - `candidateNumber` → System looks up candidate
   - `requisitionId` → System validates requisition is published
   - `assignedHr` → Optional, if not provided, uses `hiringManagerId` from requisition
   - `consentGiven: true` → Required for GDPR compliance

### ✅ Automatic Behaviors:
- System resolves `candidateNumber` to `candidateId` (ObjectId)
- System validates requisition is published and not expired
- System checks if all positions are filled
- System prevents duplicate applications
- Application starts at `SCREENING` stage
- Application status is `SUBMITTED`

---

## Testing in Postman

### 1. Login Request
```
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "employeeNumber": "EMP-2025-0001",
  "password": "password123"
}
```

### 2. Create Application Request
```
POST http://localhost:5000/api/v1/recruitment/application
Authorization: Bearer <paste_access_token_here>
Content-Type: application/json

{
  "candidateNumber": "CAN-2025-0001",
  "requisitionId": "507f1f77bcf86cd799439012",
  "consentGiven": true
}
```

---

## Why This Design?

1. **Candidates can't authenticate** - They're not employees yet, so they don't have employee profiles or system access
2. **HR creates applications** - HR employees/managers have system access and can create applications on behalf of candidates
3. **Uses candidateNumber** - Candidates are identified by their `candidateNumber` (e.g., `CAN-2025-0001`), not their MongoDB `_id`
4. **Hiring Manager auto-assigned** - If `assignedHr` is not provided, system automatically uses `hiringManagerId` from the requisition

---

## Required Roles

The endpoint accepts these roles:
- ✅ `HR_EMPLOYEE`
- ✅ `HR_MANAGER`
- ✅ `RECRUITER`
- ✅ `SYSTEM_ADMIN`

---

## Error Handling

### 401 Unauthorized
- **Cause**: Missing or invalid JWT token
- **Solution**: Login first to get a valid token

### 403 Forbidden
- **Cause**: User doesn't have required role (HR_EMPLOYEE, HR_MANAGER, etc.)
- **Solution**: Login with an HR employee/manager account

### 400 Bad Request
- **Cause**: Missing `candidateNumber`, invalid `requisitionId`, or `consentGiven: false`
- **Solution**: Check request body format

### 404 Not Found
- **Cause**: Candidate with that `candidateNumber` doesn't exist, or requisition not found
- **Solution**: Verify candidate number and requisition ID are correct

---

## Summary

✅ **Fixed**: Application creation now works with HR authentication  
✅ **Uses**: `candidateNumber` instead of `candidateId`  
✅ **Auth**: JWT token from HR employee/manager login  
✅ **Auto-assigns**: Hiring manager if `assignedHr` not provided  

**Ready for testing!** 🚀

