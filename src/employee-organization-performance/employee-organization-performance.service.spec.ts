import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeOrganizationPerformanceService } from './employee-organization-performance.service';

describe('EmployeeOrganizationPerformanceService', () => {
  let service: EmployeeOrganizationPerformanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeOrganizationPerformanceService],
    }).compile();

    service = module.get<EmployeeOrganizationPerformanceService>(EmployeeOrganizationPerformanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
