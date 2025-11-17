import { Controller, Get } from '@nestjs/common';
import { LeavesService } from '../leaves-management/leaves-management.service';

@Controller('leaves')
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Get('health')
  healthCheck() {
    return this.leavesService.healthCheck();
  }
}
