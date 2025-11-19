import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PayrollTrackingService } from './payroll-tracking.service';

describe('PayrollTrackingService', () => {
  let service: PayrollTrackingService;

  // Simple generic mock for Mongoose models
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
        PayrollTrackingService,

        // ✅ Mock all @InjectModel() dependencies from PayrollTrackingService
        { provide: getModelToken('PayrollReport'), useValue: mockModel },
        { provide: getModelToken('PayrollDispute'), useValue: mockModel },
        { provide: getModelToken('ReimbursementClaim'), useValue: mockModel },
      ],
    }).compile();

    service = module.get<PayrollTrackingService>(PayrollTrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
