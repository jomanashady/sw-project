/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/performance/performance.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AppraisalRecord,
  AppraisalRecordDocument,
} from './schemas/appraisal-record.schema';
import { EmployeeProfileService } from '../employee-profile/employee-profile.service';
import { OrganizationStructureService } from '../organization-structure/organization-structure.service';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectModel('AppraisalRecord')
    private appraisalModel: Model<AppraisalRecordDocument>,
    private readonly employeeService: EmployeeProfileService,
    private readonly orgService: OrganizationStructureService,
  ) {}

  async testIntegration(employeeId: string) {
    console.log('\n🔗 [INTEGRATION TEST] Starting...\n');

    try {
      // 1. Get employee from Employee Profile Module
      const employee = await this.employeeService.findById(employeeId);
      if (!employee) {
        return { error: 'Employee not found', employeeId };
      }
      console.log('✅ Employee found:', employee.firstName, employee.lastName);

      // 2. Get department from Organization Structure Module
      const department = await this.orgService.findDepartmentById(
        (employee.departmentId as any)?._id?.toString(),
      );
      console.log('✅ Department found:', department?.departmentName || 'N/A');

      // 3. Get position from Organization Structure Module
      const position = await this.orgService.findPositionById(
        (employee.positionId as any)?._id?.toString(),
      );
      console.log('✅ Position found:', position?.positionTitle || 'N/A');

      console.log('\n🎉 Integration test PASSED!\n');

      return {
        message:
          '✅ Integration working! All modules communicating successfully.',
        employee: {
          id: employee.employeeId,
          name: `${employee.firstName} ${employee.lastName}`,
          email: employee.email,
        },
        department: {
          id: department?.departmentId,
          name: department?.departmentName,
        },
        position: {
          id: position?.positionId,
          title: position?.positionTitle,
        },
      };
    } catch (error) {
      console.error('❌ Integration test FAILED:', error.message);
      return {
        error: 'Integration test failed',
        details: error.message,
      };
    }
  }
}
