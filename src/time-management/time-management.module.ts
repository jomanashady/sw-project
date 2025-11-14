import { Module } from '@nestjs/common';
import { TimeManagementService } from './time-management.service';
import { TimeManagementController } from './time-management.controller';

@Module({
  providers: [TimeManagementService],
  controllers: [TimeManagementController]
})
export class TimeManagementModule {}
