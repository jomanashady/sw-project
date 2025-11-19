import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PayrollConfigurationService } from './payroll-configuration.service';

describe('PayrollConfigurationService', () => {
  let service: PayrollConfigurationService;

  // Generic mock object for all mongoose models
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
        PayrollConfigurationService,

        // ✅ VERY IMPORTANT: mock ALL @InjectModel(...) deps from the service constructor
        { provide: getModelToken('Allowance'), useValue: mockModel },
        { provide: getModelToken('PayGrade'), useValue: mockModel },
        { provide: getModelToken('Deduction'), useValue: mockModel },
        { provide: getModelToken('PayrollPolicy'), useValue: mockModel },
        { provide: getModelToken('SigningBonus'), useValue: mockModel },
        { provide: getModelToken('SystemSettings'), useValue: mockModel },
        { provide: getModelToken('TaxRule'), useValue: mockModel },
        { provide: getModelToken('TerminationBenefit'), useValue: mockModel },
      ],
    }).compile();

    service = module.get<PayrollConfigurationService>(PayrollConfigurationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
