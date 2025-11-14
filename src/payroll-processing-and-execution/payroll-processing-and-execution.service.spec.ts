import { Test, TestingModule } from '@nestjs/testing';
import { PayrollProcessingAndExecutionService } from './payroll-processing-and-execution.service';

describe('PayrollProcessingAndExecutionService', () => {
  let service: PayrollProcessingAndExecutionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayrollProcessingAndExecutionService],
    }).compile();

    service = module.get<PayrollProcessingAndExecutionService>(PayrollProcessingAndExecutionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
