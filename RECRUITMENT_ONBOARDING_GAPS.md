# RECRUITMENT & ONBOARDING - MISSING INTEGRATIONS & UNIMPLEMENTED LOGIC

## ⚠️ MISSING INTEGRATIONS (Excluding Time Management & Payroll Execution)

### 1. ❌ Panel Member Email Notifications (REC-011) - PARTIALLY IMPLEMENTED

**Location**: `scheduleInterview()` method (lines 768-786)

**Current Implementation**:
- ✅ Candidate receives interview notification email
- ❌ Panel members do NOT receive email notifications
- ❌ Code only logs: `console.log('Calendar invites should be sent to panel members...')`
- ❌ TODO comment mentions "User service" which doesn't exist

**Missing Logic**:
- Panel member IDs are provided in `dto.panel` array
- Should use **EmployeeProfileService** (which exists and is integrated) to fetch panel member emails
- Should call `sendNotification('panel_invitation', ...)` for each panel member
- `sendNotification()` method already has `'panel_invitation'` type implemented (line 1209)

**Fix Required**:
```typescript
// In scheduleInterview() method, replace the console.log with:
if (dto.panel && dto.panel.length > 0) {
  for (const panelMemberId of dto.panel) {
    try {
      const panelMember = await this.employeeProfileService.findOne(panelMemberId);
      if (panelMember && panelMember.workEmail) {
        await this.sendNotification('panel_invitation', panelMember.workEmail, {
          interviewDate: interviewDate,
          method: methodText,
          videoLink: dto.videoLink,
          candidateName: candidate.fullName,
          position: jobRequisition.title,
        }, { nonBlocking: true });
      } else if (panelMember && panelMember.personalEmail) {
        // Fallback to personal email if work email not available
        await this.sendNotification('panel_invitation', panelMember.personalEmail, {
          interviewDate: interviewDate,
          method: methodText,
          videoLink: dto.videoLink,
          candidateName: candidate.fullName,
          position: jobRequisition.title,
        }, { nonBlocking: true });
      }
    } catch (error) {
      console.warn(`Failed to send panel invitation to ${panelMemberId}:`, error);
      // Non-blocking - continue with other panel members
    }
  }
}
```

**Impact**: 
- Panel members are not notified about interviews they need to attend
- Violates REC-011 requirement: "Interviewers must receive automatic calendar invites, and candidates must be notified automatically"
- Email notification infrastructure exists, just needs to be called

**Status**: ⚠️ PARTIALLY IMPLEMENTED - Infrastructure exists, logic missing

---

### 2. ❌ IT Service Integration (Expected - Service Doesn't Exist)

**Locations**: 
- `provisionSystemAccess()` - ONB-009 (lines 2659-2685)
- `scheduleAccessProvisioning()` - ONB-013 (lines 2834-2849)

**Current Implementation**:
- ✅ Task status updated to COMPLETED
- ✅ Notes logged in onboarding tasks
- ❌ Actual system provisioning not performed (email, SSO, hardware)

**Missing**:
- Email account provisioning
- SSO access setup
- Internal system access granting
- Hardware allocation

**Note**: IT Service does NOT exist in HR system, so this is expected. The code is properly commented out and ready for integration when service is available.

**Status**: ⏳ PENDING - Service doesn't exist, cannot integrate

---

### 3. ❌ Calendar Service Integration (Expected - Service Doesn't Exist)

**Location**: `scheduleInterview()` - REC-011 (line 766)

**Current Implementation**:
- ✅ Email notifications sent to candidate
- ❌ Calendar invites not sent (no calendar API integration)

**Missing**:
- Calendar invite generation (iCal format)
- Calendar API integration (Google Calendar, Outlook, etc.)

**Note**: Calendar Service does NOT exist in HR system, so this is expected. The code properly notes this limitation.

**Status**: ⏳ PENDING - Service doesn't exist, cannot integrate

---

## ✅ IMPLEMENTED CORRECTLY (No Issues)

### Active Integrations
1. ✅ **Employee Profile Service** - Fully integrated and working
   - Used in: `createEmployeeFromContract()`, `createOnboarding()`
   - Status: ✅ ACTIVE

2. ✅ **Organization Structure Service** - Fully integrated and working
   - Used in: `createEmployeeFromContract()` for department/position validation
   - Status: ✅ ACTIVE

### Notification System
1. ✅ **Centralized Notification Method** - Fully implemented
   - `sendNotification()` handles all notification types
   - Types: `application_status`, `interview_scheduled`, `offer_letter`, `onboarding_welcome`, `onboarding_reminder`, `panel_invitation`
   - Status: ✅ ACTIVE

---

## 📊 SUMMARY

### Missing Integrations (Can Be Fixed Now)
1. ⚠️ **Panel Member Email Notifications** - Can use existing EmployeeProfileService
   - **Priority**: HIGH
   - **Effort**: LOW (just need to call existing service and notification method)
   - **Impact**: Panel members not notified about interviews

### Missing Integrations (Cannot Fix - Services Don't Exist)
1. ⏳ **IT Service** - Service doesn't exist
2. ⏳ **Calendar Service** - Service doesn't exist

### Unimplemented Logic
1. ❌ **Panel Member Email Lookup** - Should use EmployeeProfileService.findOne() to get panel member emails
2. ❌ **Panel Invitation Email Sending** - Should call sendNotification('panel_invitation', ...) for each panel member

---

## 🔧 RECOMMENDED FIXES

### High Priority (Can Fix Now)

**Fix Panel Member Notifications (REC-011)**
- Use existing `EmployeeProfileService.findOne()` to get panel member details
- Use existing `sendNotification('panel_invitation', ...)` to send emails
- Handle cases where panel member doesn't have work email (use personal email)
- Make it non-blocking so one failure doesn't stop others

**Code Location**: `recruitment.service.ts` - `scheduleInterview()` method, lines 768-786

---

## ✅ VERIFICATION

All other recruitment and onboarding functionality is correctly implemented:
- ✅ Job templates and requisitions
- ✅ Applications and consent
- ✅ Referrals and tracking
- ✅ Interview scheduling (except panel notifications)
- ✅ Assessment and scoring
- ✅ Offer management
- ✅ Employee creation from contract
- ✅ Onboarding task management
- ✅ Document upload/download
- ✅ Equipment reservation
- ✅ Reminders and notifications (except panel invitations)
- ✅ All business rules satisfied
- ✅ All workflows complete

**Conclusion**: The only missing piece that can be fixed now is panel member email notifications. All other gaps are due to non-existent services (IT, Calendar) which are properly documented and ready for integration when available.

