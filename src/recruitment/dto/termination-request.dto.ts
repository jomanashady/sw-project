// src/recruitment/dto/termination-request.dto.ts
import {
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { TerminationStatus } from '../enums/termination-status.enum';
import { TerminationInitiation } from '../enums/termination-initiation.enum';

export class CreateTerminationRequestDto {
  @IsString()
  employeeId: string;               // maps to TerminationRequest.employeeId (ObjectId as string)

  @IsEnum(TerminationInitiation)
  initiator: TerminationInitiation; // maps to TerminationRequest.initiator

  @IsString()
  reason: string;                   // maps to TerminationRequest.reason

  @IsOptional()
  @IsString()
  employeeComments?: string;        // maps to TerminationRequest.employeeComments

  @IsOptional()
  @IsDateString()
  terminationDate?: string;         // maps to TerminationRequest.terminationDate

@IsOptional()
@IsString()
contractId?: string;
             // maps to TerminationRequest.contractId (ObjectId as string)

  // ---- for simple "authorization" in the service (NOT saved in schema) ----
  @IsString()
  actorId: string;                  // who is sending the request (employee / HR / manager)

  @IsString()
  actorRole: string;                // 'EMPLOYEE' | 'HR_MANAGER' | 'LINE_MANAGER'
}

export class UpdateTerminationStatusDto {
  @IsEnum(TerminationStatus)
  status: TerminationStatus;        // maps to TerminationRequest.status

  @IsOptional()
  @IsString()
  hrComments?: string;              // maps to TerminationRequest.hrComments

  @IsOptional()
  @IsDateString()
  terminationDate?: string;         // maps to TerminationRequest.terminationDate

  // simple auth
  @IsString()
  actorId: string;

  @IsString()
  actorRole: string;                // must be 'HR_MANAGER' in our rule
}

export class UpdateTerminationDetailsDto {
  @IsOptional()
  @IsString()
  reason?: string;                  // TerminationRequest.reason

  @IsOptional()
  @IsString()
  employeeComments?: string;        // TerminationRequest.employeeComments

  @IsOptional()
  @IsDateString()
  terminationDate?: string;         // TerminationRequest.terminationDate
}
