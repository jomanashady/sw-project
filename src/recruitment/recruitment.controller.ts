import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
} from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';

// OFFBOARDING DTOs
import {
  CreateTerminationRequestDto,
  UpdateTerminationStatusDto,
  UpdateTerminationDetailsDto,
} from './dto/termination-request.dto';

import {
  CreateClearanceChecklistDto,
  UpdateClearanceItemStatusDto,
} from './dto/clearance-checklist.dto';

@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly service: RecruitmentService) {}

  // ============== OFFBOARDING ==============

  // 1) Termination / Resignation

  @Post('offboarding/termination')
  createTerminationRequest(
    @Body() dto: CreateTerminationRequestDto,
  ) {
    return this.service.createTerminationRequest(dto);
  }

  @Get('offboarding/termination/:id')
  getTerminationRequest(@Param('id') id: string) {
    return this.service.getTerminationRequestById(id);
  }

  @Patch('offboarding/termination/:id/status')
  updateTerminationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTerminationStatusDto,
  ) {
    return this.service.updateTerminationStatus(id, dto);
  }

  @Patch('offboarding/termination/:id')
  updateTerminationDetails(
    @Param('id') id: string,
    @Body() dto: UpdateTerminationDetailsDto,
  ) {
    return this.service.updateTerminationDetails(id, dto);
  }

  // 2) Clearance checklist

  @Post('offboarding/clearance')
  createClearanceChecklist(
    @Body() dto: CreateClearanceChecklistDto,
  ) {
    return this.service.createClearanceChecklist(dto);
  }

  @Get('offboarding/clearance/employee/:employeeId')
  getChecklistByEmployee(
    @Param('employeeId') employeeId: string,
  ) {
    return this.service.getChecklistByEmployee(employeeId);
  }

  @Patch('offboarding/clearance/:id/item')
  updateClearanceItem(
    @Param('id') checklistId: string,
    @Body() dto: UpdateClearanceItemStatusDto,
  ) {
    return this.service.updateClearanceItemStatus(
      checklistId,
      dto,
    );
  }

  @Patch('offboarding/clearance/:id/complete')
  markChecklistCompleted(@Param('id') checklistId: string) {
    return this.service.markChecklistCompleted(checklistId);
  }
}
