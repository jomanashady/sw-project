import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TimeManagementModule } from './time-management/time-management.module';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { LeavesModule } from './leaves/leaves.module';

import { PayrollTrackingModule } from './payroll-tracking/payroll-tracking.module';
import { EmployeeProfileModule } from './employee-profile/employee-profile.module';
import { OrganizationStructureModule } from './organization-structure/organization-structure.module';
import { PerformanceModule } from './performance/performance.module';
import { PayrollConfigurationModule } from './payroll-configuration/payroll-configuration.module';
import { PayrollExecutionModule } from './payroll-execution/payroll-execution.module';
// ===== EXTRA IMPORT ADDED BY STUDENT =====
// MongooseModule.forRoot() is required for database connection
// This was added to fix the "DatabaseConnection" dependency injection error
// Needs TA approval before use
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    // ===== EXTRA DATABASE CONNECTION ADDED BY STUDENT =====
    // This MongooseModule.forRoot() is required for all Mongoose models to work
    // Using MongoDB Atlas connection string (can also use environment variable: process.env.MONGODB_URI)
    // This was added to fix the dependency injection error and needs TA approval
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb+srv://TeamUser:TeamUser@cluster0.mfclf62.mongodb.net/time-management'),
    
    TimeManagementModule, RecruitmentModule, LeavesModule,
     PayrollExecutionModule, PayrollConfigurationModule, PayrollTrackingModule, 
     EmployeeProfileModule, OrganizationStructureModule, PerformanceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
