// src/performance/performance.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { PerformanceService } from './performance.service';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('test-integration/:employeeId')
  async testIntegration(@Param('employeeId') employeeId: string) {
    return this.performanceService.testIntegration(employeeId);
  }

  @Get('test-schemas/:employeeId')
  async testSchemas(@Param('employeeId') employeeId: string) {
    return this.performanceService.testPerformanceSchemas(employeeId);
  }
}
