# Recruitment Phase Workflow Implementation Guide

## Overview
This guide outlines the complete recruitment workflow using **candidateNumber** (not candidateId) since candidates are not employees yet. All implementations use existing models, schemas, and enums without modifications.

---

## Complete Workflow Steps

### **STEP 1: Candidate Registration** (REC-007)
**User Story**: As a Candidate, I want to upload my CV and apply for positions.

**Implementation**:
- Candidate creates profile via `EmployeeProfileService.createCandidate()`
- System auto-generates `candidateNumber` (format: `CAN-YYYY-NNNN`, e.g., `CAN-2025-0001`)
- Candidate receives their `candidateNumber` (this is their identifier, NOT an ObjectId)

**Endpoint**: `POST /employee-profile/candidate` (Employee Profile Service)
**Returns**: Candidate object with `candidateNumber`

---

### **STEP 2: CV Upload** (REC-007) - Optional, can be done anytime
**User Story**: As a Candidate, I want to upload my CV.

**Implementation**:
- Candidate uploads CV using their `candidateNumber`
- CV stored in `candidate.resumeUrl`
- Creates talent pool (BR: Storage/upload of applications with resumes)

**Endpoint**: `POST /recruitment/candidate/:candidateNumber/upload-cv`
**Request**: 
- Path param: `candidateNumber` (e.g., `CAN-2025-0001`)
- Form data: `file` (PDF, DOC, DOCX, max 5MB)

**Response**:
```json
{
  "message": "CV uploaded successfully",
  "candidateNumber": "CAN-2025-0001",
  "candidateId": "507f1f77bcf86cd799439011",
  "resumeUrl": "/uploads/cv/..."
}
```

---

### **STEP 3: Consent for Data Processing** (REC-028)
**User Story**: As a Candidate, I want to give consent for personal-data processing.

**Implementation**:
- Candidate must provide consent before applying (BR: GDPR compliance)
- Consent logged in candidate's notes field
- Required before application submission

**Endpoint**: `POST /recruitment/candidate/:candidateNumber/consent`
**Request**:
- Path param: `candidateNumber`
- Body:
```json
{
  "consentGiven": true,
  "consentType": "data_processing",
  "notes": "Optional notes"
}
```

**Response**:
```json
{
  "candidateNumber": "CAN-2025-0001",
  "candidateId": "507f1f77bcf86cd799439011",
  "consentGiven": true,
  "consentType": "data_processing"
}
```

---

### **STEP 4: Application Submission** (REC-007, REC-028)
**User Story**: As an HR Employee, I want to create applications for candidates.

**Implementation Flow**:
1. **HR Employee/Manager must login first** to get JWT token (candidates can't authenticate)
2. HR creates application using:
   - `candidateNumber`: Candidate's number (e.g., CAN-2025-0001)
   - `requisitionId`: Job requisition ID
   - `consentGiven`: true (candidate must have given consent)
   - `assignedHr`: Optional - if not provided, uses hiringManagerId from requisition
3. System looks up candidate by `candidateNumber` (not ID)
4. Validates consent was given
5. Validates job requisition is published and not expired
6. Checks if all positions are filled
7. Creates Application record with:
   - `candidateId`: Resolved from candidateNumber lookup
   - `assignedHr`: Uses provided assignedHr or hiringManagerId from requisition
   - `currentStage`: `SCREENING` (BR: Applications tracked through defined stages)
   - `status`: `SUBMITTED`

**Endpoint**: `POST /api/v1/recruitment/application`

**Authentication Required**: 
- **Login first**: `POST /api/v1/auth/login` with HR employee credentials
- **Get JWT token** from login response
- **Use token**: Include in request header: `Authorization: Bearer <jwt_token>`

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "candidateNumber": "CAN-2025-0001",
  "requisitionId": "507f1f77bcf86cd799439012",
  "consentGiven": true,
  "assignedHr": "507f1f77bcf86cd799439013" // Optional - if not provided, uses hiringManagerId from requisition
}
```

**Response**: Application object with `_id`, `candidateId`, `requisitionId`, `currentStage: "screening"`, `status: "submitted"`

**Validation Rules**:
- ✅ Candidate must exist (by candidateNumber)
- ✅ Consent must be given
- ✅ Job requisition must be published
- ✅ Job requisition must not be expired
- ✅ Job requisition must not be closed
- ✅ Positions must not be all filled
- ✅ Candidate must not have already applied

---

### **STEP 5: Screening Stage** (REC-008)
**User Story**: As an HR Employee, I want to track candidates through each stage.

**Current Stage**: `SCREENING` (ApplicationStage.SCREENING)
**Status Options**: `SUBMITTED`, `IN_PROCESS`, `REJECTED`

**HR Actions**:
1. **View Applications**: `GET /recruitment/application?requisitionId=...`
   - Referrals are automatically prioritized (REC-030)
   - Applications sorted: Referrals first, then by date

2. **Update Status**: `PATCH /recruitment/application/:id/status`
   - Move to `IN_PROCESS` → Advances to `DEPARTMENT_INTERVIEW` stage
   - Reject → Status becomes `REJECTED`, stage stays `SCREENING`
   - Automatic notification sent to candidate (REC-017)

**Automatic Behaviors**:
- Status change logged in `ApplicationStatusHistory` (BR: Communication logs stored)
- Email notification sent to candidate (REC-017)
- Job requisition progress updated automatically

---

### **STEP 6: Interview Scheduling** (REC-010, REC-011, REC-021)
**User Story**: As an HR Employee, I want to schedule and manage interview invitations.

**Current Stage**: `DEPARTMENT_INTERVIEW` or `HR_INTERVIEW`
**Status**: `IN_PROCESS`

**HR Actions**:
1. **Schedule Interview**: `POST /recruitment/interview`
   ```json
   {
     "applicationId": "507f1f77bcf86cd799439014",
     "stage": "department_interview", // or "hr_interview"
     "scheduledDate": "2025-02-15T10:00:00Z",
     "method": "video", // or "onsite", "phone"
     "panel": ["507f1f77bcf86cd799439015", "507f1f77bcf86cd799439016"],
     "videoLink": "https://meet.example.com/..." // Optional
   }
   ```

**Automatic Behaviors**:
- Interview record created
- Email notifications sent to:
  - Candidate (REC-011)
  - All panel members (REC-011, REC-021)
- Calendar invites (pending integration, but email notifications work)

---

### **STEP 7: Interview Feedback & Scoring** (REC-011, REC-020)
**User Story**: As an HR Employee, I want to provide feedback/interview score for filtration.

**Current Stage**: `DEPARTMENT_INTERVIEW` or `HR_INTERVIEW`
**Status**: `IN_PROCESS`

**Panel Member Actions**:
1. **Submit Feedback**: `POST /recruitment/interview/:id/feedback`
   ```json
   {
     "score": 85, // 0-100
     "comments": "Strong technical skills, good communication",
     "assessmentTool": "Technical Assessment" // Optional
   }
   ```

**Automatic Behaviors**:
- AssessmentResult record created
- Average score calculated for ranking
- Used in `getRankedApplications()` for tie-breaking

**HR Actions**:
- **Get Average Score**: `GET /recruitment/interview/:id/average-score`
- **Get Ranked Applications**: `GET /recruitment/application/:requisitionId/ranked`
  - Ranking: 1) Referrals, 2) Interview scores, 3) Application date

---

### **STEP 8: Status Updates & Notifications** (REC-017, REC-022)
**User Story**: As a Candidate, I want to receive updates about my application status.

**Automatic Notifications Sent**:
- ✅ Status changes (REC-017)
- ✅ Interview scheduled (REC-011)
- ✅ Rejection (REC-022) - with template
- ✅ Offer sent (REC-018)

**Email Templates** (stored in `sendNotification()` method):
- `application_status`: Status update template
- `interview_scheduled`: Interview invitation template
- `offer_letter`: Offer notification template
- `panel_invitation`: Panel member invitation template
- Rejection template with respectful messaging

**Communication Logs**: All status changes stored in `ApplicationStatusHistory`

---

### **STEP 9: Offer Management** (REC-014, REC-018)
**User Story**: As an HR Manager, I want to manage job offers and approvals.

**Current Stage**: `OFFER` (ApplicationStage.OFFER)
**Status**: `OFFER`

**HR Manager Actions**:
1. **Create Offer**: `POST /recruitment/offer`
   ```json
   {
     "applicationId": "507f1f77bcf86cd799439014",
     "candidateId": "507f1f77bcf86cd799439011",
     "grossSalary": 50000,
     "signingBonus": 5000,
     "benefits": ["Health Insurance", "401k"],
     "conditions": "Standard employment terms",
     "insurances": "Full coverage",
     "content": "Customizable offer letter content",
     "role": "Software Engineer",
     "deadline": "2025-02-28T23:59:59Z"
   }
   ```

2. **Add Approvers**: Offer includes `approvers` array (BR: Approval before sending)

3. **Finalize Offer**: `POST /recruitment/offer/:id/finalize`
   - Requires all approvers to approve
   - Sends offer to candidate

**Candidate Actions**:
1. **Respond to Offer**: `POST /recruitment/offer/:id/respond`
   ```json
   {
     "applicantResponse": "accepted" // or "rejected"
   }
   ```

**Automatic Behaviors**:
- Electronic signature tracked (`candidateSignedAt`, `hrSignedAt`, `managerSignedAt`)
- Offer acceptance triggers onboarding (REC-029)

---

### **STEP 10: Pre-Boarding Trigger** (REC-029)
**User Story**: As an HR Employee, I want to trigger pre-boarding tasks after offer acceptance.

**Current Stage**: `OFFER`
**Status**: `HIRED` (after offer acceptance and employee creation)

**Automatic Flow**:
1. Candidate accepts offer → `applicantResponse: "accepted"`
2. HR creates employee from contract: `POST /recruitment/offer/:id/create-employee`
3. System automatically:
   - Creates EmployeeProfile from Candidate data (ONB-002)
   - Creates Onboarding record (REC-029)
   - Triggers pre-boarding tasks
   - Schedules access provisioning (ONB-013)
   - Initiates payroll (ONB-018) - if service available
   - Processes signing bonus (ONB-019) - if service available

**Endpoint**: `POST /recruitment/offer/:id/create-employee`
**Request**:
```json
{
  "dateOfHire": "2025-03-01",
  "workEmail": "john.doe@company.com",
  "primaryDepartmentId": "507f1f77bcf86cd799439017",
  "primaryPositionId": "507f1f77bcf86cd799439018"
}
```

---

### **STEP 11: Monitoring & Reports** (REC-009)
**User Story**: As an HR Manager, I want to monitor recruitment progress.

**Endpoints**:
1. **Recruitment Progress Dashboard**: `GET /recruitment/recruitment/progress`
   - Real-time visualization
   - Status breakdowns
   - Stage distribution

2. **Time-to-Hire Report**: `GET /recruitment/reports/time-to-hire?requisitionId=...&startDate=...&endDate=...`

3. **Source Effectiveness Report**: `GET /recruitment/reports/source-effectiveness?startDate=...&endDate=...`

---

## Key Implementation Details

### **Candidate Number Usage**
- ✅ All candidate-facing endpoints use `candidateNumber` (not `candidateId`)
- ✅ Internal Application records still use `candidateId` (ObjectId) for database relationships
- ✅ Lookup pattern: `candidateModel.findOne({ candidateNumber: ... })`

### **Stage Progression**
```
SCREENING → DEPARTMENT_INTERVIEW → HR_INTERVIEW → OFFER
```

**Status Mapping**:
- `SUBMITTED` → Stage: `SCREENING`
- `IN_PROCESS` → Stage: `DEPARTMENT_INTERVIEW` or `HR_INTERVIEW`
- `OFFER` → Stage: `OFFER`
- `HIRED` → Stage: `OFFER` (final stage)
- `REJECTED` → Can happen at any stage

### **Progress Calculation**
Automatic progress percentage based on stage:
- `screening`: 20%
- `department_interview`: 50%
- `hr_interview`: 60%
- `offer`: 80%
- `hired`: 100%

### **Referral Priority** (REC-030)
- Referrals automatically prioritized in application lists
- Tag candidate: `POST /recruitment/candidate/:candidateId/referral`
- Used in ranking: Referrals ranked first, then by interview scores

### **Integration Points**
- ✅ **Employee Profile Service**: Active - Creates employees from candidates
- ✅ **Organization Structure Service**: Active - Validates departments/positions
- ✅ **Time Management Service**: Active - Provisions clock access
- ✅ **Leaves Service**: Active - Final settlement calculations
- ⏳ **Calendar Service**: Pending - Email notifications work, calendar API pending

---

## Testing Workflow

### **Complete Test Flow**:
1. Create candidate → Get `candidateNumber`
2. Upload CV using `candidateNumber`
3. Give consent using `candidateNumber`
4. Apply using `candidateNumber` + `requisitionId` + `consentGiven: true`
5. HR views applications (referrals prioritized)
6. HR updates status → `IN_PROCESS` (advances to `DEPARTMENT_INTERVIEW`)
7. HR schedules interview
8. Panel members submit feedback
9. HR views ranked applications
10. HR creates offer
11. Candidate accepts offer
12. HR creates employee → Onboarding triggered automatically

---

## Summary

✅ **All user stories implemented** using `candidateNumber` workflow
✅ **No schema/enum changes** - uses existing structures
✅ **Logical flow** from candidate registration to onboarding
✅ **Integration working** with Employee Profile, Org Structure, Time Management, Leaves
✅ **Notifications automated** at each stage
✅ **Reports available** for monitoring

The recruitment phase is **complete and ready for testing**!

