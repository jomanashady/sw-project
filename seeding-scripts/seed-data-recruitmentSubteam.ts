/* eslint-disable @typescript-eslint/no-unused-vars */
// seeding-scripts/recruitment.seed.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { RecruitmentService } from '../src/recruitment/recruitment.service';

async function seedRecruitment() {
  console.log('🌱 Starting HR seeding for Recruitment + Onboarding + Offboarding...\n');

  // 1️⃣ Boot NestJS in "CLI mode" (no HTTP server)
  const app = await NestFactory.createApplicationContext(AppModule);

  // 2️⃣ Get our RecruitmentService from the Nest container
  const recruitmentService = app.get(RecruitmentService);

  try {
    // =====================================================
    // 0️⃣ Clear old data (recruitment + onboarding + offboarding)
    // =====================================================
    console.log('🧹 Clearing old data...');

    if (recruitmentService.clearAllRecruitmentData) {
      await recruitmentService.clearAllRecruitmentData();
      console.log('✅ Cleared recruitment collections (jobs, candidates, applications)');
    }

    if (recruitmentService.clearAllOnboardingData) {
      await recruitmentService.clearAllOnboardingData();
      console.log('✅ Cleared onboarding collections (processes, checklists, docs, notifications, equipment)');
    }

    if (recruitmentService.clearAllOffboardingData) {
      await recruitmentService.clearAllOffboardingData();
      console.log('✅ Cleared offboarding collections (requests, instances, tasks, templates)');
    }

    console.log('');

    // =====================================================
    // 1️⃣ Create Jobs (Recruitment)
    // =====================================================
    console.log('💼 Creating jobs...');

    const backendJob = await recruitmentService.createJob({
      title: 'Junior Backend Developer',
      description:
        'Work with the engineering team to build and maintain backend services.',
      departmentId: 'DEPT-001', // external Org Structure
      positionId: 'POS-001',    // external Org Structure
      location: 'Cairo',
      requiredSkills: ['Node.js', 'TypeScript', 'MongoDB'],
      numberOfOpenings: 2,
      isTemplate: false,
      status: 'Posted',         // Draft, Approved, Posted, Closed
      createdBy: 'EMP-001',     // external Employee Profile (employeeId string)
    });

    console.log('✅ Created job: Junior Backend Developer');

    const hrJob = await recruitmentService.createJob({
      title: 'HR Specialist',
      description:
        'Support HR operations including recruitment, onboarding, and employee relations.',
      departmentId: 'DEPT-002', // Human Resources
      positionId: 'POS-002',    // HR Specialist
      location: 'Cairo',
      requiredSkills: ['Recruitment', 'Communication', 'HRIS'],
      numberOfOpenings: 1,
      isTemplate: false,
      status: 'Posted',
      createdBy: 'EMP-003',
    });

    console.log('✅ Created job: HR Specialist\n');

    // =====================================================
    // 2️⃣ Create Candidates (Recruitment)
    // =====================================================
    console.log('👤 Creating candidates...');

    const cand1 = await recruitmentService.createCandidate({
      firstName: 'Menna',
      lastName: 'Ali',
      email: 'menna.candidate@example.com',
      phone: '+20 100 000 0001',
      cvUrl: 'https://example.com/cv/menna-ali.pdf',
      source: 'Website',
      referralFlag: false,
      consentGiven: true,
      consentTimestamp: new Date(),
    });

    console.log('✅ Created candidate: Menna Ali');

    const cand2 = await recruitmentService.createCandidate({
      firstName: 'Karma',
      lastName: 'Kandil',
      email: 'karma.candidate@example.com',
      phone: '+20 100 000 0002',
      cvUrl: 'https://example.com/cv/karma-kandil.pdf',
      source: 'Referral',
      referralFlag: true,
      referralSource: 'Employee Referral',
      consentGiven: true,
      consentTimestamp: new Date(),
    });

    console.log('✅ Created candidate: Karma Kandil\n');

    // =====================================================
    // 3️⃣ Create Applications (link candidates → jobs)
    // =====================================================
    console.log('📝 Creating applications...');

    const app1 = await recruitmentService.createApplication({
      candidate: cand1,
      job: backendJob,
      currentStage: 'Screening',
      status: 'InProgress',
      tags: ['Backend', 'Junior'],
    });

    console.log(
      '✅ Menna Ali applied to Junior Backend Developer (Screening, InProgress)',
    );

    const app2 = await recruitmentService.createApplication({
      candidate: cand2,
      job: hrJob,
      currentStage: 'Interview',
      status: 'InProgress',
      tags: ['HR', 'Referral'],
    });

    console.log(
      '✅ Karma Kandil applied to HR Specialist (Interview, InProgress)\n',
    );

    // =====================================================
    // 4️⃣ Mark one application as Hired (for onboarding)
    // =====================================================
    console.log('🎯 Marking one application as Hired to trigger onboarding scenario...');

    // app1._id may be typed as unknown from the createApplication result; cast to any to satisfy the service signature
    const hiredApp = await recruitmentService.updateApplicationStatus((app1 as any)._id, {
      currentStage: 'Offer',
      status: 'Hired',
      hiredAt: new Date(),
    });

    console.log('✅ Updated Menna application to Hired\n');

    // For simplicity, we pretend Menna is now an employee with ID EMP-1001 in Employee Profile
    const newEmployeeId = 'EMP-1001';

    // =====================================================
    // 5️⃣ Create Onboarding Checklist (template of tasks)
    // =====================================================
    console.log('📋 Creating onboarding checklist...');

    const engineeringChecklist = await recruitmentService.createOnboardingChecklist({
      checklistName: 'Engineering New Hire Checklist',
      description: 'Standard onboarding tasks for new engineers.',
      department: 'Engineering',
      // createdByEmployeeId is external employee id (HR)
      createdByEmployeeId: 'EMP-003',
      isActive: true,
      tasks: [
        {
          taskName: 'Sign employment contract',
          description: 'New hire signs the contract.',
          assignedTo: 'new_hire',
          dueOffset: 0,
          requiresDocument: true,
          isMandatory: true,
          order: 1,
        },
        {
          taskName: 'HR orientation session',
          description: 'Overview of company policies and benefits.',
          assignedTo: 'hr',
          dueOffset: 1,
          requiresDocument: false,
          isMandatory: true,
          order: 2,
        },
        {
          taskName: 'Create system accounts',
          description: 'IT creates email, VPN, and internal accounts.',
          assignedTo: 'system_admin',
          dueOffset: 1,
          requiresDocument: false,
          isMandatory: true,
          order: 3,
        },
      ],
    });

    console.log('✅ Created onboarding checklist\n');

    // =====================================================
    // 6️⃣ Create Onboarding Process for the hired candidate
    // =====================================================
    console.log('🚀 Creating onboarding process for Menna (EMP-1001)...');

    const onboardingProcess = await recruitmentService.createOnboardingProcess({
      candidate: cand1,
      checklist: engineeringChecklist,
      startDate: new Date(),
      assignedHREmployeeId: 'EMP-003', // HR owner of onboarding
    });

    console.log('✅ Created OnboardingProcess linked to candidate and checklist\n');

    // =====================================================
    // 7️⃣ Create Onboarding Document (e.g. signed contract)
    // =====================================================
    console.log('📄 Creating onboarding document (contract)...');

    const onboardingDoc = await recruitmentService.createOnboardingDocument({
      onboardingProcess,
      candidate: cand1,
      documentType: 'contract',
      documentName: 'Signed Employment Contract',
      documentUrl: 'https://example.com/docs/contract-menna.pdf',
      uploadedByEmployeeId: 'EMP-003', // HR uploaded
    });

    console.log('✅ Created OnboardingDocument (contract)\n');

    // =====================================================
    // 8️⃣ Create Onboarding Notification (welcome email)
    // =====================================================
    console.log('📧 Creating onboarding notification (welcome email)...');

    const onboardingNotification =
      await recruitmentService.createOnboardingNotification({
        onboardingProcess,
        candidate: cand1,
        notificationType: 'welcome_email',
        subject: 'Welcome to the company!',
        message:
          'Hi Menna, welcome to the engineering team! Your first day is soon. Please review your onboarding tasks.',
        channel: 'email',
        scheduledFor: new Date(), // send now
      });

    console.log('✅ Created OnboardingNotification (welcome email)\n');

    // =====================================================
    // 9️⃣ Create Equipment Assignment (laptop, badge)
    // =====================================================
    console.log('💻 Creating equipment assignment...');

    const equipmentAssignment =
      await recruitmentService.createEquipmentAssignment({
        onboardingProcess,
        candidate: cand1,
        assignedByEmployeeId: 'EMP-005', // e.g. IT/Admin employee
        items: [
          {
            itemType: 'Laptop',
            itemName: 'Dell Latitude 5420',
            serialNumber: 'LAP-123456',
            assignedDate: new Date(),
            status: 'assigned',
          },
          {
            itemType: 'Badge',
            itemName: 'RFID Access Card',
            serialNumber: 'CARD-987654',
            assignedDate: new Date(),
            status: 'assigned',
          },
        ],
        notes: 'All equipment assigned on first day.',
      });

    console.log('✅ Created EquipmentAssignment with 2 items\n');

    // =====================================================
    // 🔟 Create Offboarding Checklist Template
    // =====================================================
    console.log('📚 Creating offboarding checklist template...');

    const offboardingTemplate =
      await recruitmentService.createOffboardingChecklistTemplate({
        name: 'Standard Office Offboarding',
        description:
          'Checklist for standard office-based employees (laptop, email, access revocation, payroll settlement).',
        applicableFor: 'All',
        isActive: true,
      });

    console.log('✅ Created OffboardingChecklistTemplate\n');

    // =====================================================
    // 1️⃣1️⃣ Create Offboarding Request (just for testing)
    // =====================================================
    console.log('📤 Creating offboarding request for the same employee (test scenario)...');

    const offboardingRequest =
      await recruitmentService.createOffboardingRequest({
        employeeId: newEmployeeId, // EMP-1001
        initiatedBy: 'EMP-004',    // maybe line manager
        type: 'Resignation',
        reasonCode: 'RES-PERS',
        reasonDescription: 'Employee resigned for personal reasons.',
        effectiveDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 days
        performanceRecordId: 'PERF-2025-0001',
      });

    console.log('✅ Created OffboardingRequest\n');

    // =====================================================
    // 1️⃣2️⃣ Create Offboarding Instance + Tasks
    // =====================================================
    console.log('⚙️ Creating offboarding instance + tasks...');

    const offboardingInstance =
      await recruitmentService.createOffboardingInstance({
        offboardingRequest,
        employeeId: newEmployeeId,
        checklistTemplate: offboardingTemplate,
      });

    console.log('✅ Created OffboardingInstance linked to OffboardingRequest and ChecklistTemplate');

    // Create some offboarding tasks
    await recruitmentService.createOffboardingTask({
      offboardingInstance,
      departmentRole: 'IT',
      title: 'Revoke email and VPN access',
      description: 'Disable all accounts on last working day.',
      assignedToUserId: 'EMP-005', // IT admin
    });

    await recruitmentService.createOffboardingTask({
      offboardingInstance,
      departmentRole: 'Facilities',
      title: 'Collect laptop and access badge',
      description: 'Collect all company assets.',
      assignedToUserId: 'EMP-006', // Facilities staff
    });

    await recruitmentService.createOffboardingTask({
      offboardingInstance,
      departmentRole: 'Finance',
      title: 'Finalize payroll settlement',
      description: 'Calculate final salary, encashment of unused leaves, etc.',
      assignedToUserId: 'EMP-007', // Finance staff
    });

    console.log('✅ Created 3 OffboardingTasks\n');

    // =====================================================
    // ✅ Done
    // =====================================================
    console.log('\n🎉 HR seeding completed successfully!\n');
    console.log('📌 You can now test queries on collections:');
    console.log('   Recruitment: candidates, jobs, applications');
    console.log('   Onboarding : onboardingprocesses, onboardingchecklists, onboardingdocuments, onboardingnotifications, equipmentassignments');
    console.log('   Offboarding: offboardingrequests, offboardinginstances, offboardingtasks, offboardingchecklisttemplates\n');
  } catch (error) {
    console.error('❌ Error seeding HR subsystems:', error);
  } finally {
    // 6️⃣ Always close the Nest app context
    await app.close();
  }
}

// 7️⃣ Run the function when this file is executed
seedRecruitment();
