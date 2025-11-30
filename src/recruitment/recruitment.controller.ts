// src/recruitment/recruitment.controller.ts
import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';

import {
  CreateTerminationRequestDto,
  UpdateTerminationStatusDto,
  UpdateTerminationDetailsDto,
} from './dto/termination-request.dto';

import {
  CreateClearanceChecklistDto,
  UpdateClearanceItemStatusDto,
} from './dto/clearance-checklist.dto';

import { RevokeSystemAccessDto } from './dto/system-access.dto';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // if you have it

@Controller('recruitment')
@UseGuards(
  // JwtAuthGuard,   // uncomment when you plug the real auth guard
  RolesGuard,
)
export class RecruitmentController {
  constructor(private readonly service: RecruitmentService) {}

  // ============================= OFFBOARDING =============================

  // 1) Termination / Resignation
  //    - Employee can send their own resignation.
  //    - HR Manager can initiate termination.
  // No @Roles here -> any authenticated user can call,
  // then the service will branch based on user.role + initiator
  @Post('offboarding/termination')
  createTerminationRequest(
    @Body() dto: CreateTerminationRequestDto,
    @Req() req: any,
  ) {
    return this.service.createTerminationRequest(dto, req.user);
  }

  @Get('offboarding/termination/:id')
  @Roles(SystemRole.HR_MANAGER) // only HR can view details
  getTerminationRequest(@Param('id') id: string) {
    return this.service.getTerminationRequestById(id);
  }

  @Patch('offboarding/termination/:id/status')
  @Roles(SystemRole.HR_MANAGER)
  updateTerminationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTerminationStatusDto,
    @Req() req: any,
  ) {
    return this.service.updateTerminationStatus(id, dto, req.user);
  }

  @Patch('offboarding/termination/:id')
  @Roles(SystemRole.HR_MANAGER)
  updateTerminationDetails(
    @Param('id') id: string,
    @Body() dto: UpdateTerminationDetailsDto,
    @Req() req: any,
  ) {
    return this.service.updateTerminationDetails(id, dto, req.user);
  }

  // 2) Clearance checklist

  @Post('offboarding/clearance')
  @Roles(SystemRole.HR_MANAGER)
  createClearanceChecklist(
    @Body() dto: CreateClearanceChecklistDto,
    @Req() req: any,
  ) {
    return this.service.createClearanceChecklist(dto, req.user);
  }

  @Get('offboarding/clearance/employee/:employeeId')
  @Roles(SystemRole.HR_MANAGER)
  getChecklistByEmployee(@Param('employeeId') employeeId: string) {
    return this.service.getChecklistByEmployee(employeeId);
  }

  @Patch('offboarding/clearance/:id/item')
  @Roles(SystemRole.HR_MANAGER) // HR updates each dept status
  updateClearanceItem(
    @Param('id') checklistId: string,
    @Body() dto: UpdateClearanceItemStatusDto,
    @Req() req: any,
  ) {
    return this.service.updateClearanceItemStatus(checklistId, dto, req.user);
  }

  @Patch('offboarding/clearance/:id/complete')
  @Roles(SystemRole.HR_MANAGER)
  markChecklistCompleted(@Param('id') checklistId: string, @Req() req: any) {
    return this.service.markChecklistCompleted(checklistId, req.user);
  }

  // 3) Appraisal view for offboarding (latest appraisal of employee)
  @Get('offboarding/appraisal/:employeeId')
  @Roles(SystemRole.HR_MANAGER)
  getLatestAppraisal(@Param('employeeId') employeeId: string) {
    return this.service.getLatestAppraisalForEmployee(employeeId);
  }

  // 4) SYSTEM ACCESS REVOCATION
  @Patch('offboarding/system-revoke')
  @Roles(SystemRole.SYSTEM_ADMIN)
  revokeAccess(@Body() dto: RevokeSystemAccessDto, @Req() req: any) {
    return this.service.revokeSystemAccess(dto, req.user);
  }
}
// ============================= END OFFBOARDING =============================