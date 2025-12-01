# Specific APIs for Requirements 1-5

**Base URL:** `http://localhost:6000/api/v1`

---

## **Requirement 1: Shift Assignment Management**
*BR-TM-02, BR-TM-05, BR-TM-03, BR-TM-04*

### Assign Shift to Employee (Individual)
- **POST** `/shift-schedule/shift/assign`
- **Roles:** `SYSTEM_ADMIN`, `HR_ADMIN`
- **Body:**
  ```json
  {
    "employeeId": "string (required)",
    "shiftId": "string (required)",
    "startDate": "2025-01-01T00:00:00.000Z (required, ISO date)",
    "endDate": "2025-12-31T23:59:59.000Z (required, ISO date, >= startDate)",
    "status": "APPROVED | PENDING | CANCELLED | EXPIRED (required)",
    "departmentId": "string (optional)",
    "positionId": "string (optional)",
    "scheduleRuleId": "string (optional)"
  }
  ```

### Assign Shift to Department
- **POST** `/shift-schedule/shift/assign/department`
- **Roles:** `SYSTEM_ADMIN`, `HR_ADMIN`, `HR_MANAGER`
- **Body:**
  ```json
  {
    "departmentId": "string (required)",
    "shiftId": "string (required)",
    "includePositions": ["position-id-1", "position-id-2"] (optional),
    "startDate": "2025-01-01T00:00:00.000Z (optional)",
    "endDate": "2025-12-31T23:59:59.000Z (optional, >= startDate)"
  }
  ```

### Assign Shift to Position
- **POST** `/shift-schedule/shift/assign/position`
- **Roles:** `SYSTEM_ADMIN`, `HR_ADMIN`, `HR_MANAGER`
- **Body:**
  ```json
  {
    "positionId": "string (required)",
    "shiftId": "string (required)",
    "startDate": "2025-01-01T00:00:00.000Z (optional)",
    "endDate": "2025-12-31T23:59:59.000Z (optional, >= startDate)"
  }
  ```

### Update Shift Assignment
- **PUT** `/shift-schedule/shift/assignment/:id`
- **Roles:** `SYSTEM_ADMIN`, `HR_ADMIN`, `HR_MANAGER`
- **Body:**
  ```json
  {
    "status": "APPROVED | PENDING | CANCELLED | EXPIRED (required)",
    "startDate": "2025-01-01T00:00:00.000Z (required)",
    "endDate": "2025-12-31T23:59:59.000Z (required, >= startDate)",
    "employeeId": "string (optional)",
    "departmentId": "string (optional)",
    "positionId": "string (optional)",
    "shiftId": "string (optional)",
    "scheduleRuleId": "string (optional)"
  }
  ```

### Get All Shift Assignments (with filters)
- **GET** `/shift-schedule/shift/assignments`
- **Query Parameters:**
  - `status` (optional): `APPROVED | PENDING | CANCELLED | EXPIRED`
  - `employeeId` (optional): string
  - `departmentId` (optional): string
  - `positionId` (optional): string
  - `shiftId` (optional): string
- **Roles:** `SYSTEM_ADMIN`, `HR_ADMIN`, `HR_MANAGER`, `DEPARTMENT_HEAD`

### Get Shift Assignment by ID
- **GET** `/shift-schedule/shift/assignment/:id`
- **Roles:** `SYSTEM_ADMIN`, `HR_ADMIN`, `HR_MANAGER`, `DEPARTMENT_HEAD`, `DEPARTMENT_EMPLOYEE`

### Get Employee Shift Assignments
- **GET** `/shift-schedule/shift/assignments/employee/:employeeId`
- **Roles:** `SYSTEM_ADMIN`, `HR_ADMIN`, `HR_MANAGER`, `DEPARTMENT_HEAD`, `DEPARTMENT_EMPLOYEE`

### Get Department Shift Assignments
- **GET** `/shift-schedule/shift/assignments/department/:departmentId`
- **Roles:** `SYSTEM_ADMIN`, `HR_ADMIN`, `HR_MANAGER`, `DEPARTMENT_HEAD`

### Get Position Shift Assignments
- **GET** `/shift-schedule/shift/assignments/position/:positionId`
- **Roles:** `SYSTEM_ADMIN`, `HR_ADMIN`, `HR_MANAGER`, `DEPARTMENT_HEAD`

### Get Shift Assignment Status
- **GET** `/shift-schedule/shift/assignment/:id/status`
- **Roles:** `SYSTEM_ADMIN`, `HR_ADMIN`, `HR_MANAGER`, `DEPARTMENT_HEAD`, `DEPARTMENT_EMPLOYEE`

### Renew Shift Assignment
- **POST** `/shift-schedule/shift/assignment/renew`
- **Roles:** `SYSTEM_ADMIN`, `HR_ADMIN`, `HR_MANAGER`
- **Body:**
  ```json
  {
    "assignmentId": "string (required)",
    "newEndDate": "2026-12-31T23:59:59.000Z (optional)",
    "note": "string (optional)"
  }
  ```

### Cancel Shift Assignment
- **POST** `/shift-schedule/shift/assignment/cancel`
- **Roles:** `SYSTEM_ADMIN`, `HR_ADMIN`, `HR_MANAGER`
- **Body:**
  ```json
  {
    "assignmentId": "string (required)",
    "reason": "string (optional)"
  }
  ```

### Postpone Shift Assignment
- **POST** `/shift-schedule/shift/assignment/postpone`
- **Roles:** `SYSTEM_ADMIN`, `HR_ADMIN`, `HR_MANAGER`
- **Body:**
  ```json
  {
    "assignmentId": "string (required)",
    "postponeUntil": "2025-06-01T00:00:00.000Z (required)"
  }
  ```

### Check and Update Expired Assignments
- **POST** `/shift-schedule/shift/assignments/check-expired`
- **Roles:** `SYSTEM_ADMIN`, `HR_ADMIN`
- **Body:** None

---

## **Requirement 2: Shift Configuration & Types**
*BR-TM-03, BR-TM-04*

### Shift Type Management

#### Create Shift Type
- **POST** `/shift-schedule/shift/type`
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`
- **Body:**
  ```json
  {
    "name": "Normal | Split | Overnight | Rotational | Mission (required)",
    "active": true (required, boolean)
  }
  ```

#### Get All Shift Types
- **GET** `/shift-schedule/shift/types`
- **Query Parameters:**
  - `active` (optional): `true | false`
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`, `HR_ADMIN`, `DEPARTMENT_HEAD`

#### Get Shift Type by ID
- **GET** `/shift-schedule/shift/type/:id`
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`, `HR_ADMIN`, `DEPARTMENT_HEAD`

#### Update Shift Type
- **PUT** `/shift-schedule/shift/type/:id`
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`
- **Body:**
  ```json
  {
    "name": "string (required)",
    "active": true (required, boolean)
  }
  ```

#### Delete Shift Type
- **DELETE** `/shift-schedule/shift/type/:id`
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`

### Shift Management

#### Create Shift
- **POST** `/shift-schedule/shift`
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`
- **Body:**
  ```json
  {
    "name": "string (required)",
    "shiftType": "shift-type-id (required)",
    "startTime": "09:00 (required, HH:mm format)",
    "endTime": "17:00 (required, HH:mm format)",
    "punchPolicy": "FIRST_LAST | MULTIPLE | ONLY_FIRST (required)",
    "graceInMinutes": 15 (required, number, >= 0),
    "graceOutMinutes": 15 (required, number, >= 0),
    "requiresApprovalForOvertime": true (required, boolean),
    "active": true (required, boolean)
  }
  ```

#### Get All Shifts
- **GET** `/shift-schedule/shifts`
- **Query Parameters:**
  - `active` (optional): `true | false`
  - `shiftType` (optional): shift-type-id
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`, `HR_ADMIN`, `DEPARTMENT_HEAD`

#### Get Shift by ID
- **GET** `/shift-schedule/shift/:id`
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`, `HR_ADMIN`, `DEPARTMENT_HEAD`, `DEPARTMENT_EMPLOYEE`

#### Get Shifts by Type
- **GET** `/shift-schedule/shifts/type/:shiftTypeId`
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`, `HR_ADMIN`, `DEPARTMENT_HEAD`

#### Update Shift
- **PUT** `/shift-schedule/shift/:id`
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`
- **Body:**
  ```json
  {
    "name": "string (required)",
    "shiftType": "shift-type-id (required)",
    "startTime": "09:00 (required, HH:mm format)",
    "endTime": "17:00 (required, HH:mm format)",
    "punchPolicy": "FIRST_LAST | MULTIPLE | ONLY_FIRST (required)",
    "graceInMinutes": 15 (required, number, >= 0),
    "graceOutMinutes": 15 (required, number, >= 0),
    "requiresApprovalForOvertime": true (required, boolean),
    "active": true (required, boolean)
  }
  ```

#### Delete Shift
- **DELETE** `/shift-schedule/shift/:id`
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`

---

## **Requirement 3: Custom Scheduling Rules**
*BR-TM-04, BR-TM-10*

### Create Schedule Rule
- **POST** `/shift-schedule/schedule`
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`
- **Body:**
  ```json
  {
    "name": "string (required)",
    "pattern": "Mon-Fri | 4 days on, 3 days off | Flex-in: 7-10 AM, Flex-out: 4-7 PM (required)",
    "active": true (required, boolean)
  }
  ```

### Get All Schedule Rules
- **GET** `/shift-schedule/schedules`
- **Query Parameters:**
  - `active` (optional): `true | false`
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`, `HR_ADMIN`, `DEPARTMENT_HEAD`

### Get Schedule Rule by ID
- **GET** `/shift-schedule/schedule/:id`
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`, `HR_ADMIN`, `DEPARTMENT_HEAD`

### Update Schedule Rule
- **PUT** `/shift-schedule/schedule/:id`
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`
- **Body:**
  ```json
  {
    "name": "string (required)",
    "pattern": "string (required)",
    "active": true (required, boolean)
  }
  ```

### Delete Schedule Rule
- **DELETE** `/shift-schedule/schedule/:id`
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`

### Define Flexible Scheduling Rules
- **POST** `/shift-schedule/schedule/flexible`
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`
- **Body:**
  ```json
  {
    "name": "string (required)",
    "pattern": "string (required, e.g., 'Flex-in: 7-10 AM, Flex-out: 4-7 PM' or '4 days on, 3 days off')",
    "active": true (required, boolean)
  }
  ```

### Validate Schedule Rule
- **POST** `/shift-schedule/schedule/validate`
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`, `HR_ADMIN`
- **Body:**
  ```json
  {
    "scheduleRuleId": "string (required)",
    "assignmentDate": "2025-01-15T00:00:00.000Z (optional)"
  }
  ```

### Apply Schedule Rule to Shift Assignment
- **POST** `/shift-schedule/schedule/apply-to-assignment`
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`, `HR_ADMIN`
- **Body:**
  ```json
  {
    "shiftAssignmentId": "string (required)",
    "scheduleRuleId": "string (required)"
  }
  ```

### Get Shift Assignments by Schedule Rule
- **GET** `/shift-schedule/schedule/:id/assignments`
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`, `HR_ADMIN`, `DEPARTMENT_HEAD`

### Check Working Day per Schedule Rule
- **POST** `/shift-schedule/schedule/check-working-day`
- **Roles:** `HR_MANAGER`, `SYSTEM_ADMIN`, `HR_ADMIN`, `DEPARTMENT_HEAD`, `DEPARTMENT_EMPLOYEE`
- **Body:**
  ```json
  {
    "scheduleRuleId": "string (required)",
    "checkDate": "2025-01-15T00:00:00.000Z (required)",
    "cycleStartDate": "2025-01-01T00:00:00.000Z (optional)"
  }
  ```

---

## **Requirement 4: Shift Expiry Notifications**
*BR-TM-05*

### Send Shift Expiry Notification
- **POST** `/notification-sync/shift-expiry/notify`
- **Roles:** `HR_ADMIN`, `SYSTEM_ADMIN`
- **Body:**
  ```json
  {
    "recipientId": "string (required)",
    "shiftAssignmentId": "string (required)",
    "employeeId": "string (required)",
    "endDate": "2025-12-31T23:59:59.000Z (required)",
    "daysRemaining": 30 (required, number)
  }
  ```

### Send Bulk Shift Expiry Notifications
- **POST** `/notification-sync/shift-expiry/notify-bulk`
- **Roles:** `HR_ADMIN`, `SYSTEM_ADMIN`
- **Body:**
  ```json
  {
    "hrAdminIds": ["hr-admin-id-1", "hr-admin-id-2"] (required, array),
    "expiringAssignments": [
      {
        "assignmentId": "string (required)",
        "employeeId": "string (required)",
        "employeeName": "string (optional)",
        "shiftName": "string (optional)",
        "endDate": "2025-12-31T23:59:59.000Z (required)",
        "daysRemaining": 30 (required, number)
      }
    ] (required, array)
  }
  ```

### Get Shift Expiry Notifications
- **GET** `/notification-sync/shift-expiry/:hrAdminId`
- **Roles:** `HR_ADMIN`, `SYSTEM_ADMIN`, `HR_MANAGER`

### Send Shift Renewal Confirmation
- **POST** `/notification-sync/shift-renewal/confirm`
- **Roles:** `HR_ADMIN`, `SYSTEM_ADMIN`, `HR_MANAGER`
- **Body:**
  ```json
  {
    "recipientId": "string (required)",
    "shiftAssignmentId": "string (required)",
    "newEndDate": "2026-12-31T23:59:59.000Z (required)"
  }
  ```

### Send Shift Archive Notification
- **POST** `/notification-sync/shift-archive/notify`
- **Roles:** `HR_ADMIN`, `SYSTEM_ADMIN`
- **Body:**
  ```json
  {
    "recipientId": "string (required)",
    "shiftAssignmentId": "string (required)",
    "employeeId": "string (required)"
  }
  ```

### Get All Shift Notifications
- **GET** `/notification-sync/shift-notifications/:hrAdminId`
- **Roles:** `HR_ADMIN`, `SYSTEM_ADMIN`, `HR_MANAGER`

---

## **Requirement 5: Clock-In/Out**
*BR-TM-06, BR-TM-07, BR-TM-11, BR-TM-12*

### Clock In (Basic)
- **POST** `/time-management/clock-in/:employeeId`
- **Roles:** `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN`, `FINANCE_STAFF`, `HR_MANAGER`, `HR_ADMIN`, `HR_EMPLOYEE`
- **Note:** Employees can only clock in for themselves. Other roles can clock in for any employee.
- **Body:** None

### Clock Out (Basic)
- **POST** `/time-management/clock-out/:employeeId`
- **Roles:** `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN`, `FINANCE_STAFF`, `HR_MANAGER`, `HR_ADMIN`, `HR_EMPLOYEE`
- **Note:** Employees can only clock out for themselves. Other roles can clock out for any employee.
- **Body:** None

### Clock In with Metadata
- **POST** `/time-management/clock-in/:employeeId/metadata`
- **Roles:** `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN`, `HR_ADMIN`
- **Body:**
  ```json
  {
    "source": "BIOMETRIC | WEB | MOBILE | MANUAL (required)",
    "deviceId": "string (optional)",
    "terminalId": "string (optional)",
    "location": "string (optional)",
    "gpsCoordinates": {
      "lat": 24.7136,
      "lng": 46.6753
    } (optional),
    "ipAddress": "string (optional)"
  }
  ```

### Clock Out with Metadata
- **POST** `/time-management/clock-out/:employeeId/metadata`
- **Roles:** `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN`, `HR_ADMIN`
- **Body:**
  ```json
  {
    "source": "BIOMETRIC | WEB | MOBILE | MANUAL (required)",
    "deviceId": "string (optional)",
    "terminalId": "string (optional)",
    "location": "string (optional)",
    "gpsCoordinates": {
      "lat": 24.7136,
      "lng": 46.6753
    } (optional),
    "ipAddress": "string (optional)"
  }
  ```

### Record Punch from Device
- **POST** `/time-management/attendance/punch/device`
- **Roles:** `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN`, `HR_MANAGER`, `HR_ADMIN`, `HR_EMPLOYEE`
- **Body:**
  ```json
  {
    "employeeId": "string (required)",
    "punchType": "IN | OUT (required)",
    "deviceId": "string (optional)",
    "location": "string (optional)",
    "terminalId": "string (optional)"
  }
  ```

### Record Punch with Metadata
- **POST** `/time-management/attendance/punch/metadata`
- **Roles:** `DEPARTMENT_EMPLOYEE`, `DEPARTMENT_HEAD`, `HR_MANAGER`, `HR_ADMIN`, `SYSTEM_ADMIN`
- **Body:** (Check DTO for exact structure)

### Validate Clock-In Against Shift
- **POST** `/time-management/clock-in/:employeeId/validate`
- **Roles:** `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN`, `HR_ADMIN`, `DEPARTMENT_HEAD`
- **Body:** None

### Get Employee Attendance Status
- **GET** `/time-management/attendance/status/:employeeId`
- **Roles:** `DEPARTMENT_EMPLOYEE`, `SYSTEM_ADMIN`, `HR_ADMIN`, `DEPARTMENT_HEAD`, `HR_MANAGER`
- **Note:** Employees can only view their own status unless they are DEPARTMENT_HEAD.

---

## **Common Headers**

All endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## **Status Values**

### Shift Assignment Status
- `PENDING`
- `APPROVED`
- `CANCELLED`
- `EXPIRED`

### Punch Policy
- `FIRST_LAST` - First punch in, last punch out
- `MULTIPLE` - Multiple punches allowed
- `ONLY_FIRST` - Only first punch recorded

### Shift Types (Examples)
- `Normal`
- `Split`
- `Overnight`
- `Rotational`
- `Mission`

### Clock-In Source
- `BIOMETRIC`
- `WEB`
- `MOBILE`
- `MANUAL`

---

## **Important Notes**

1. **Date Format:** All dates must be in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
2. **Time Format:** Times must be in `HH:mm` format (24-hour)
3. **Date Validation:** 
   - `endDate` must be >= `startDate`
   - Invalid calendar dates (e.g., Nov 31) are rejected
4. **Role-Based Access:** Check each endpoint's allowed roles before testing
5. **Self-Access:** Employees can only access their own data unless they have additional roles
6. **ID Format:** All IDs are MongoDB ObjectIds (24-character hex strings)

