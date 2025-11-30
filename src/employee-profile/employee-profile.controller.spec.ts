import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeProfileController } from './employee-profile.controller';
import { EmployeeProfileService } from './employee-profile.service';
import { SystemRole } from './enums/employee-profile.enums';
import { Reflector } from '@nestjs/core';

describe('EmployeeProfileController', () => {
  let controller: EmployeeProfileController;
  let service: EmployeeProfileService;
  let reflector: Reflector;

  const mockEmployeeProfileService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateSelfService: jest.fn(),
    remove: jest.fn(),
    assignSystemRoles: jest.fn(),
    getSystemRoles: jest.fn(),
    findByDepartment: jest.fn(),
    getEmployeeStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeProfileController],
      providers: [
        {
          provide: EmployeeProfileService,
          useValue: mockEmployeeProfileService,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<EmployeeProfileController>(
      EmployeeProfileController,
    );
    service = module.get<EmployeeProfileService>(EmployeeProfileService);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Route Definitions', () => {
    it('should have POST /employee-profile route', () => {
      const metadata = Reflect.getMetadata('path', controller.create);
      expect(metadata).toBeDefined();
    });

    it('should have GET /employee-profile route', () => {
      const metadata = Reflect.getMetadata('path', controller.findAll);
      expect(metadata).toBeDefined();
    });

    it('should have GET /employee-profile/me route', () => {
      const metadata = Reflect.getMetadata('path', controller.getMyProfile);
      expect(metadata).toBeDefined();
    });

    it('should have PATCH /employee-profile/me route', () => {
      const metadata = Reflect.getMetadata('path', controller.updateMyProfile);
      expect(metadata).toBeDefined();
    });

    it('should have GET /employee-profile/stats route', () => {
      const metadata = Reflect.getMetadata('path', controller.getStats);
      expect(metadata).toBeDefined();
    });

    it('should have GET /employee-profile/department/:departmentId route', () => {
      const metadata = Reflect.getMetadata('path', controller.findByDepartment);
      expect(metadata).toBeDefined();
    });

    it('should have GET /employee-profile/:id route', () => {
      const metadata = Reflect.getMetadata('path', controller.findOne);
      expect(metadata).toBeDefined();
    });

    it('should have PATCH /employee-profile/:id route', () => {
      const metadata = Reflect.getMetadata('path', controller.update);
      expect(metadata).toBeDefined();
    });

    it('should have DELETE /employee-profile/:id route', () => {
      const metadata = Reflect.getMetadata('path', controller.remove);
      expect(metadata).toBeDefined();
    });

    it('should have POST /employee-profile/assign-roles route', () => {
      const metadata = Reflect.getMetadata('path', controller.assignRoles);
      expect(metadata).toBeDefined();
    });

    it('should have GET /employee-profile/:id/roles route', () => {
      const metadata = Reflect.getMetadata('path', controller.getEmployeeRoles);
      expect(metadata).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create an employee', async () => {
      const createDto = {
        firstName: 'John',
        lastName: 'Doe',
        nationalId: '12345678901234',
        dateOfHire: new Date(),
      };

      const mockEmployee = {
        _id: '507f1f77bcf86cd799439011',
        ...createDto,
        employeeNumber: 'EMP-2024-0001',
      };

      mockEmployeeProfileService.create.mockResolvedValue(mockEmployee);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(mockEmployee);
    });
  });

  describe('findAll', () => {
    it('should return paginated employees', async () => {
      const queryDto = { page: 1, limit: 10 };
      const mockResult = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      mockEmployeeProfileService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(queryDto);

      expect(service.findAll).toHaveBeenCalledWith(queryDto, undefined);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
    });
  });

  describe('getMyProfile', () => {
    it('should throw unauthorized error when auth not configured', async () => {
      await expect(controller.getMyProfile()).rejects.toThrow('Authentication not configured');
    });
  });

  describe('updateMyProfile', () => {
    it('should throw unauthorized error when auth not configured', async () => {
      const updateDto = { personalEmail: 'new@example.com' };
      await expect(controller.updateMyProfile(updateDto)).rejects.toThrow('Authentication not configured');
    });
  });

  describe('findOne', () => {
    it('should return employee by ID', async () => {
      const employeeId = '507f1f77bcf86cd799439011';
      const mockEmployee = {
        _id: employeeId,
        firstName: 'John',
        lastName: 'Doe',
      };

      mockEmployeeProfileService.findOne.mockResolvedValue(mockEmployee);

      const result = await controller.findOne(employeeId);

      expect(service.findOne).toHaveBeenCalledWith(employeeId);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
    });
  });

  describe('update', () => {
    it('should update employee', async () => {
      const employeeId = '507f1f77bcf86cd799439011';
      const updateDto = { firstName: 'Updated' };
      const mockEmployee = {
        _id: employeeId,
        ...updateDto,
      };

      mockEmployeeProfileService.update.mockResolvedValue(mockEmployee);

      const result = await controller.update(employeeId, updateDto);

      expect(service.update).toHaveBeenCalledWith(employeeId, updateDto);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
    });
  });

  describe('remove', () => {
    it('should soft delete employee', async () => {
      const employeeId = '507f1f77bcf86cd799439011';

      mockEmployeeProfileService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(employeeId);

      expect(service.remove).toHaveBeenCalledWith(employeeId);
      expect(result).toHaveProperty('message');
    });
  });

  describe('assignRoles', () => {
    it('should assign roles to employee', async () => {
      const assignDto = {
        employeeProfileId: '507f1f77bcf86cd799439011',
        roles: [SystemRole.HR_EMPLOYEE],
        permissions: [],
      };

      const mockSystemRole = {
        _id: '507f1f77bcf86cd799439012',
        ...assignDto,
      };

      mockEmployeeProfileService.assignSystemRoles.mockResolvedValue(
        mockSystemRole,
      );

      const result = await controller.assignRoles(assignDto);

      expect(service.assignSystemRoles).toHaveBeenCalledWith(
        assignDto.employeeProfileId,
        assignDto.roles,
        assignDto.permissions,
      );
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
    });
  });

  describe('getEmployeeRoles', () => {
    it('should return employee roles', async () => {
      const employeeId = '507f1f77bcf86cd799439011';
      const mockRoles = {
        _id: '507f1f77bcf86cd799439012',
        roles: [SystemRole.HR_EMPLOYEE],
      };

      mockEmployeeProfileService.getSystemRoles.mockResolvedValue(mockRoles);

      const result = await controller.getEmployeeRoles(employeeId);

      expect(service.getSystemRoles).toHaveBeenCalledWith(employeeId);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
    });
  });

  describe('Response Structure Consistency', () => {
    it('should return consistent response structure for all routes', async () => {
      const mockData = { _id: '507f1f77bcf86cd799439011' };
      mockEmployeeProfileService.findOne.mockResolvedValue(mockData);

      const result = await controller.findOne('507f1f77bcf86cd799439011');

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(typeof result.message).toBe('string');
    });
  });
});
