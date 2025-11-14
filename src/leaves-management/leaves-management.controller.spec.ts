import { Test, TestingModule } from '@nestjs/testing';
import { LeavesManagementController } from './leaves-management.controller';

describe('LeavesManagementController', () => {
  let controller: LeavesManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeavesManagementController],
    }).compile();

    controller = module.get<LeavesManagementController>(LeavesManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
