import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeOrganizationPerformanceController } from './employee-organization-performance.controller';

describe('EmployeeOrganizationPerformanceController', () => {
  let controller: EmployeeOrganizationPerformanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeOrganizationPerformanceController],
    }).compile();

    controller = module.get<EmployeeOrganizationPerformanceController>(EmployeeOrganizationPerformanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
