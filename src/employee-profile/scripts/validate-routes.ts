/**
 * Route Validation Script
<<<<<<< HEAD
 *
=======
 * 
>>>>>>> karma
 * This script validates consistency between:
 * - Controller routes and their DTOs
 * - DTOs and Mongoose schemas
 * - Route parameters and service methods
<<<<<<< HEAD
 *
=======
 * 
>>>>>>> karma
 * Run with: ts-node src/employee-profile/scripts/validate-routes.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface RouteInfo {
  method: string;
  path: string;
  dto?: string;
  roles?: string[];
  description?: string;
}

interface ValidationIssue {
  severity: 'error' | 'warning';
  message: string;
  location: string;
}

class RouteValidator {
  private issues: ValidationIssue[] = [];

  // Expected routes from controller
  private expectedRoutes: RouteInfo[] = [
    {
      method: 'POST',
      path: '/api/v1/employee-profile',
      dto: 'CreateEmployeeDto',
      roles: ['SYSTEM_ADMIN', 'HR_MANAGER', 'HR_EMPLOYEE'],
    },
    {
      method: 'GET',
      path: '/api/v1/employee-profile',
      dto: 'QueryEmployeeDto',
      roles: ['SYSTEM_ADMIN', 'HR_MANAGER', 'HR_EMPLOYEE', 'DEPARTMENT_HEAD'],
    },
    {
      method: 'GET',
      path: '/api/v1/employee-profile/me',
      dto: null,
      roles: [],
    },
    {
      method: 'PATCH',
      path: '/api/v1/employee-profile/me',
      dto: 'UpdateEmployeeSelfServiceDto',
      roles: [],
    },
    {
      method: 'GET',
      path: '/api/v1/employee-profile/stats',
      dto: null,
      roles: ['SYSTEM_ADMIN', 'HR_MANAGER'],
    },
    {
      method: 'GET',
      path: '/api/v1/employee-profile/department/:departmentId',
      dto: null,
      roles: ['SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_HEAD'],
    },
    {
      method: 'GET',
      path: '/api/v1/employee-profile/:id',
      dto: null,
      roles: [],
    },
    {
      method: 'PATCH',
      path: '/api/v1/employee-profile/:id',
      dto: 'UpdateEmployeeDto',
      roles: ['SYSTEM_ADMIN', 'HR_MANAGER', 'HR_EMPLOYEE'],
    },
    {
      method: 'DELETE',
      path: '/api/v1/employee-profile/:id',
      dto: null,
      roles: ['SYSTEM_ADMIN', 'HR_MANAGER'],
    },
    {
      method: 'POST',
      path: '/api/v1/employee-profile/assign-roles',
      dto: 'AssignSystemRoleDto',
      roles: ['SYSTEM_ADMIN'],
    },
    {
      method: 'GET',
      path: '/api/v1/employee-profile/:id/roles',
      dto: null,
      roles: ['SYSTEM_ADMIN', 'HR_MANAGER'],
    },
  ];

  validate() {
    console.log('🔍 Starting Route Validation...\n');

    this.validateDTOs();
    this.validateSchemas();
    this.validateEnums();
    this.validateServiceMethods();

    this.printReport();
  }

  private validateDTOs() {
    console.log('📋 Validating DTOs...');

    const dtoPath = join(__dirname, '../dto');
    const dtoFiles = [
      'create-employee.dto.ts',
      'update-employee.dto.ts',
      'query-employee.dto.ts',
      'assign-system-role.dto.ts',
    ];

    for (const file of dtoFiles) {
      try {
        const content = readFileSync(join(dtoPath, file), 'utf-8');
<<<<<<< HEAD

        // Check for required validators
        if (file === 'create-employee.dto.ts') {
          if (
            !content.includes('@IsString()') ||
            !content.includes('firstName')
          ) {
            this.addIssue(
              'error',
              `CreateEmployeeDto missing required validators`,
              file,
            );
          }
          if (
            !content.includes('nationalId') ||
            !content.includes('@Matches')
          ) {
            this.addIssue(
              'error',
              `CreateEmployeeDto missing nationalId validation`,
              file,
            );
=======
        
        // Check for required validators
        if (file === 'create-employee.dto.ts') {
          if (!content.includes('@IsString()') || !content.includes('firstName')) {
            this.addIssue('error', `CreateEmployeeDto missing required validators`, file);
          }
          if (!content.includes('nationalId') || !content.includes('@Matches')) {
            this.addIssue('error', `CreateEmployeeDto missing nationalId validation`, file);
>>>>>>> karma
          }
        }

        if (file === 'query-employee.dto.ts') {
          if (!content.includes('@IsOptional()')) {
<<<<<<< HEAD
            this.addIssue(
              'warning',
              `QueryEmployeeDto should have optional validators`,
              file,
            );
=======
            this.addIssue('warning', `QueryEmployeeDto should have optional validators`, file);
>>>>>>> karma
          }
        }
      } catch (error) {
        this.addIssue('error', `Cannot read DTO file: ${file}`, file);
      }
    }
  }

  private validateSchemas() {
    console.log('📊 Validating Schemas...');

    const schemaPath = join(__dirname, '../models');
<<<<<<< HEAD

=======
    
>>>>>>> karma
    try {
      // Read both schema files
      const employeeProfileContent = readFileSync(
        join(schemaPath, 'employee-profile.schema.ts'),
        'utf-8',
      );
      const userSchemaContent = readFileSync(
        join(schemaPath, 'user-schema.ts'),
        'utf-8',
      );

      // Check EmployeeProfile schema structure
<<<<<<< HEAD
      const employeeProfileFields = ['employeeNumber', 'dateOfHire', 'status'];
=======
      const employeeProfileFields = [
        'employeeNumber',
        'dateOfHire',
        'status',
      ];
>>>>>>> karma

      for (const field of employeeProfileFields) {
        if (!employeeProfileContent.includes(field)) {
          this.addIssue(
            'error',
            `EmployeeProfile schema missing required field: ${field}`,
            'employee-profile.schema.ts',
          );
        }
      }

      // Check UserProfileBase schema structure (base class)
      const baseClassFields = ['firstName', 'lastName', 'nationalId'];

      for (const field of baseClassFields) {
        if (!userSchemaContent.includes(field)) {
          this.addIssue(
            'error',
            `UserProfileBase schema missing required field: ${field}`,
            'user-schema.ts',
          );
        }
      }

      // Check enum usage in EmployeeProfile
      if (
        !employeeProfileContent.includes('EmployeeStatus') ||
        !employeeProfileContent.includes('enum:')
      ) {
        this.addIssue(
          'warning',
          `Schema should use enum for status field`,
          'employee-profile.schema.ts',
        );
      }

      // Verify EmployeeProfile extends UserProfileBase
      if (!employeeProfileContent.includes('extends UserProfileBase')) {
        this.addIssue(
          'error',
          `EmployeeProfile should extend UserProfileBase`,
          'employee-profile.schema.ts',
        );
      }
    } catch (error) {
      this.addIssue(
        'error',
        `Cannot read schema files: ${error}`,
        'schema validation',
      );
    }
  }

  private validateEnums() {
    console.log('🔢 Validating Enums...');

    const enumPath = join(__dirname, '../enums/employee-profile.enums.ts');
<<<<<<< HEAD

    try {
      const content = readFileSync(enumPath, 'utf-8');

=======
    
    try {
      const content = readFileSync(enumPath, 'utf-8');
      
>>>>>>> karma
      const requiredEnums = [
        'EmployeeStatus',
        'SystemRole',
        'Gender',
        'MaritalStatus',
        'ContractType',
        'WorkType',
      ];

      for (const enumName of requiredEnums) {
        if (!content.includes(`enum ${enumName}`)) {
<<<<<<< HEAD
          this.addIssue(
            'error',
            `Missing required enum: ${enumName}`,
            enumPath,
          );
=======
          this.addIssue('error', `Missing required enum: ${enumName}`, enumPath);
>>>>>>> karma
        }
      }

      // Validate SystemRole values match controller usage
      const systemRoleValues = [
        'SYSTEM_ADMIN',
        'HR_MANAGER',
        'HR_EMPLOYEE',
        'DEPARTMENT_HEAD',
        'DEPARTMENT_EMPLOYEE',
      ];

      for (const role of systemRoleValues) {
        if (!content.includes(role)) {
<<<<<<< HEAD
          this.addIssue(
            'warning',
            `SystemRole enum may be missing: ${role}`,
            enumPath,
          );
=======
          this.addIssue('warning', `SystemRole enum may be missing: ${role}`, enumPath);
>>>>>>> karma
        }
      }
    } catch (error) {
      this.addIssue('error', `Cannot read enum file`, enumPath);
    }
  }

  private validateServiceMethods() {
    console.log('⚙️  Validating Service Methods...');

    const servicePath = join(__dirname, '../employee-profile.service.ts');
<<<<<<< HEAD

    try {
      const content = readFileSync(servicePath, 'utf-8');

=======
    
    try {
      const content = readFileSync(servicePath, 'utf-8');
      
>>>>>>> karma
      const requiredMethods = [
        'create',
        'findAll',
        'findOne',
        'update',
        'updateSelfService',
        'remove',
        'assignSystemRoles',
        'getSystemRoles',
        'findByDepartment',
        'getEmployeeStats',
      ];

      for (const method of requiredMethods) {
        if (!content.includes(`async ${method}(`)) {
<<<<<<< HEAD
          this.addIssue(
            'error',
            `Service missing required method: ${method}`,
            servicePath,
          );
=======
          this.addIssue('error', `Service missing required method: ${method}`, servicePath);
>>>>>>> karma
        }
      }

      // Check for proper error handling
<<<<<<< HEAD
      if (
        !content.includes('NotFoundException') ||
        !content.includes('BadRequestException')
      ) {
        this.addIssue(
          'warning',
          `Service should use proper exception types`,
          servicePath,
        );
=======
      if (!content.includes('NotFoundException') || !content.includes('BadRequestException')) {
        this.addIssue('warning', `Service should use proper exception types`, servicePath);
>>>>>>> karma
      }
    } catch (error) {
      this.addIssue('error', `Cannot read service file`, servicePath);
    }
  }

  private validateDTOSchemaConsistency() {
    console.log('🔗 Validating DTO-Schema Consistency...');

    // This would require parsing TypeScript AST
    // For now, we'll do basic checks
<<<<<<< HEAD

    const dtoPath = join(__dirname, '../dto/create-employee.dto.ts');
    const schemaPath = join(__dirname, '../models/employee-profile.schema.ts');

    try {
      const dtoContent = readFileSync(dtoPath, 'utf-8');
      const schemaContent = readFileSync(schemaPath, 'utf-8');

      // Check common fields
      const commonFields = [
        'firstName',
        'lastName',
        'nationalId',
        'dateOfHire',
      ];

      for (const field of commonFields) {
        const inDto = dtoContent.includes(field);
        const inSchema = schemaContent.includes(field);

        if (inDto && !inSchema) {
          this.addIssue(
            'error',
            `Field ${field} in DTO but not in schema`,
            'DTO-Schema',
          );
        }
        if (inSchema && !inDto && field !== 'employeeNumber') {
          // employeeNumber is auto-generated, so it's OK to not be in DTO
          this.addIssue(
            'warning',
            `Field ${field} in schema but not in DTO`,
            'DTO-Schema',
          );
        }
      }
    } catch (error) {
      this.addIssue(
        'error',
        `Cannot validate DTO-Schema consistency`,
        'DTO-Schema',
      );
    }
  }

  private addIssue(
    severity: 'error' | 'warning',
    message: string,
    location: string,
  ) {
=======
    
    const dtoPath = join(__dirname, '../dto/create-employee.dto.ts');
    const schemaPath = join(__dirname, '../models/employee-profile.schema.ts');
    
    try {
      const dtoContent = readFileSync(dtoPath, 'utf-8');
      const schemaContent = readFileSync(schemaPath, 'utf-8');
      
      // Check common fields
      const commonFields = ['firstName', 'lastName', 'nationalId', 'dateOfHire'];
      
      for (const field of commonFields) {
        const inDto = dtoContent.includes(field);
        const inSchema = schemaContent.includes(field);
        
        if (inDto && !inSchema) {
          this.addIssue('error', `Field ${field} in DTO but not in schema`, 'DTO-Schema');
        }
        if (inSchema && !inDto && field !== 'employeeNumber') {
          // employeeNumber is auto-generated, so it's OK to not be in DTO
          this.addIssue('warning', `Field ${field} in schema but not in DTO`, 'DTO-Schema');
        }
      }
    } catch (error) {
      this.addIssue('error', `Cannot validate DTO-Schema consistency`, 'DTO-Schema');
    }
  }

  private addIssue(severity: 'error' | 'warning', message: string, location: string) {
>>>>>>> karma
    this.issues.push({ severity, message, location });
  }

  private printReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 VALIDATION REPORT');
    console.log('='.repeat(60) + '\n');

<<<<<<< HEAD
    const errors = this.issues.filter((i) => i.severity === 'error');
    const warnings = this.issues.filter((i) => i.severity === 'warning');
=======
    const errors = this.issues.filter(i => i.severity === 'error');
    const warnings = this.issues.filter(i => i.severity === 'warning');
>>>>>>> karma

    if (errors.length > 0) {
      console.log(`❌ ERRORS (${errors.length}):`);
      errors.forEach((issue, index) => {
        console.log(`  ${index + 1}. [${issue.location}] ${issue.message}`);
      });
      console.log('');
    }

    if (warnings.length > 0) {
      console.log(`⚠️  WARNINGS (${warnings.length}):`);
      warnings.forEach((issue, index) => {
        console.log(`  ${index + 1}. [${issue.location}] ${issue.message}`);
      });
      console.log('');
    }

    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ All validations passed!\n');
    }

    console.log('='.repeat(60));
<<<<<<< HEAD
    console.log(
      `Total Issues: ${this.issues.length} (${errors.length} errors, ${warnings.length} warnings)`,
    );
=======
    console.log(`Total Issues: ${this.issues.length} (${errors.length} errors, ${warnings.length} warnings)`);
>>>>>>> karma
    console.log('='.repeat(60) + '\n');

    if (errors.length > 0) {
      process.exit(1);
    }
  }
}

// Run validation
if (require.main === module) {
  const validator = new RouteValidator();
  validator.validate();
}

export { RouteValidator };
<<<<<<< HEAD
=======

>>>>>>> karma
