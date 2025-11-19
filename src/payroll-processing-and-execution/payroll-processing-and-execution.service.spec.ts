import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PayrollProcessingAndExecutionService } from './payroll-processing-and-execution.service';

describe('PayrollProcessingAndExecutionService', () => {
  let service: PayrollProcessingAndExecutionService;

  // Simple reusable mock for all Mongoose models
  const mockModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollProcessingAndExecutionService,

        // ✅ Mock all models used in the service constructor
        { provide: getModelToken('PayrollPeriod'), useValue: mockModel },
        { provide: getModelToken('PayrollRun'), useValue: mockModel },
        { provide: getModelToken('PayrollRunItem'), useValue: mockModel },
        { provide: getModelToken('Payslip'), useValue: mockModel },
        { provide: getModelToken('EmployeeBankInfo'), useValue: mockModel },
        { provide: getModelToken('Employee'), useValue: mockModel },
        { provide: getModelToken('PayGrade'), useValue: mockModel },
        { provide: getModelToken('Allowance'), useValue: mockModel },
        { provide: getModelToken('Deduction'), useValue: mockModel },
      ],
    }).compile();

    service = module.get<PayrollProcessingAndExecutionService>(
      PayrollProcessingAndExecutionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
