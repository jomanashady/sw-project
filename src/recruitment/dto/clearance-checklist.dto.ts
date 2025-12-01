// src/recruitment/dto/clearance-checklist.dto.ts
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApprovalStatus } from '../enums/approval-status.enum';

export class CreateClearanceChecklistDto {
  @IsString()
  terminationId: string;         // maps to ClearanceChecklist.terminationId (ObjectId as string)

  // simple "auth"
  @IsString()
  actorRole: string;             // must be 'HR_MANAGER'
}

export class UpdateClearanceItemStatusDto {
  @IsString()
  department: string;            // department name in items.department (e.g. 'HR', 'IT', 'FINANCE')

  @IsEnum(ApprovalStatus)
  status: ApprovalStatus;        // maps to items.status

  @IsOptional()
  @IsString()
  comments?: string;             // maps to items.comments

  // for audit
  @IsString()
  actorId: string;               // will go to items.updatedBy

  @IsString()
  actorRole: string;             // must match department or be 'HR_MANAGER'

  // When Facilities reports equipment returns, the controller may pass these
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EquipmentReturnDto)
  equipmentReturns?: EquipmentReturnDto[];
}

export class EquipmentReturnDto {
  @IsString()
  equipmentId: string;

  @IsOptional()
  @IsString()
  condition?: string;
}