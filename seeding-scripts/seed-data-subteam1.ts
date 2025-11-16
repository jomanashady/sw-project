/* eslint-disable @typescript-eslint/no-unused-vars */
// src/seed-data.ts
import { NestFactory } from '@nestjs/core';
import { Types } from 'mongoose';
import { AppModule } from '../src/app.module';
import { EmployeeProfileService } from '../src/employee-profile/employee-profile.service';
import { OrganizationStructureService } from '../src/organization-structure/organization-structure.service';

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const employeeService = app.get(EmployeeProfileService);
  const orgService = app.get(OrganizationStructureService);

  try {
    // 1. Create Departments
    console.log('📁 Creating departments...');
    const engDept = await orgService.createDepartment({
      departmentId: 'DEPT-001',
      departmentCode: 'ENG',
      departmentName: 'Engineering',
      description: 'Software Development Department',
      isActive: true,
    });
    console.log('✅ Created: Engineering\n');

    const hrDept = await orgService.createDepartment({
      departmentId: 'DEPT-002',
      departmentCode: 'HR',
      departmentName: 'Human Resources',
      description: 'HR Department',
      isActive: true,
    });
    console.log('✅ Created: Human Resources\n');

    // 2. Create Positions
    console.log('💼 Creating positions...');
    const seniorEngPos = await orgService.createPosition({
      positionId: 'POS-001',
      positionCode: 'SSE',
      positionTitle: 'Senior Software Engineer',
      departmentId: engDept._id as Types.ObjectId,
      payGrade: 'L3',
      jobDescription: 'Senior developer role',
      jobLevel: 3,
      maxHeadcount: 5,
      isActive: true,
    });
    console.log('✅ Created: Senior Software Engineer\n');

    const hrManagerPos = await orgService.createPosition({
      positionId: 'POS-002',
      positionCode: 'HRM',
      positionTitle: 'HR Manager',
      departmentId: hrDept._id as Types.ObjectId,
      payGrade: 'M1',
      jobDescription: 'HR management role',
      jobLevel: 5,
      maxHeadcount: 2,
      isActive: true,
    });
    console.log('✅ Created: HR Manager\n');

    // 3. Create Employees
    console.log('👤 Creating employees...');
    const emp1 = await employeeService.createEmployee({
      employeeId: 'EMP-001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      phone: '+20 123 456 7890',
      hireDate: new Date('2020-01-15'),
      contractType: 'Permanent',
      employmentStatus: 'Active',
      departmentId: engDept._id as Types.ObjectId,
      positionId: seniorEngPos._id as Types.ObjectId,
      payGrade: 'L3',
      isActive: true,
    });
    console.log('✅ Created: John Doe (EMP-001)\n');

    const emp2 = await employeeService.createEmployee({
      employeeId: 'EMP-002',
      firstName: 'Sarah',
      lastName: 'Ahmed',
      email: 'sarah.ahmed@company.com',
      phone: '+20 111 222 3333',
      hireDate: new Date('2021-03-01'),
      contractType: 'Permanent',
      employmentStatus: 'Active',
      departmentId: engDept._id as Types.ObjectId,
      positionId: seniorEngPos._id as Types.ObjectId,
      payGrade: 'L2',
      managerId: emp1._id as Types.ObjectId,
      isActive: true,
    });
    console.log('✅ Created: Sarah Ahmed (EMP-002)\n');

    const emp3 = await employeeService.createEmployee({
      employeeId: 'EMP-003',
      firstName: 'Mohamed',
      lastName: 'Hassan',
      email: 'mohamed.hassan@company.com',
      phone: '+20 100 111 2222',
      hireDate: new Date('2019-06-15'),
      contractType: 'Permanent',
      employmentStatus: 'Active',
      departmentId: hrDept._id as Types.ObjectId,
      positionId: hrManagerPos._id as Types.ObjectId,
      payGrade: 'M1',
      isActive: true,
    });
    console.log('✅ Created: Mohamed Hassan (EMP-003)\n');

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📋 Test integration with:');
    console.log(
      '   GET http://localhost:3000/performance/test-integration/EMP-001\n',
    );
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await app.close();
  }
}

seedDatabase();
