import { Test, TestingModule } from '@nestjs/testing';
import { LeavesManagementService } from './leaves-management.service';

describe('LeavesManagementService', () => {
  let service: LeavesManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeavesManagementService],
    }).compile();

    service = module.get<LeavesManagementService>(LeavesManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
