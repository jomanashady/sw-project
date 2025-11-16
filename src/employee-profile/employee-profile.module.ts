/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/employee-profile/employee-profile.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeProfileService } from './employee-profile.service';
import { EmployeeProfileController } from './employee-profile.controller';
import { Employee, EmployeeSchema } from './schemas/employee.schema';
import {
  ChangeRequest,
  ChangeRequestSchema,
} from './schemas/change-request.schema';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: ChangeRequest.name, schema: ChangeRequestSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [EmployeeProfileController],
  providers: [EmployeeProfileService],
  exports: [EmployeeProfileService],
})
export class EmployeeProfileModule {}
