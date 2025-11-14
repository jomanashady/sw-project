import { Test, TestingModule } from '@nestjs/testing';
import { PayrollProcessingAndExecutionController } from './payroll-processing-and-execution.controller';

describe('PayrollProcessingAndExecutionController', () => {
  let controller: PayrollProcessingAndExecutionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollProcessingAndExecutionController],
    }).compile();

    controller = module.get<PayrollProcessingAndExecutionController>(PayrollProcessingAndExecutionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
