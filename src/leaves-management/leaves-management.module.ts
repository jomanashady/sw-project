import { Module } from '@nestjs/common';
import { LeavesManagementService } from './leaves-management.service';
import { LeavesManagementController } from './leaves-management.controller';

@Module({
  providers: [LeavesManagementService],
  controllers: [LeavesManagementController]
})
export class LeavesModule {}
