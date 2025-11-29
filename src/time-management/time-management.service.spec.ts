import { Test, TestingModule } from '@nestjs/testing';
import { TimeManagementService } from './Services/TimeManagementService';

describe('TimeManagementService', () => {
  let service: TimeManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimeManagementService],
    }).compile();

    service = module.get<TimeManagementService>(TimeManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
