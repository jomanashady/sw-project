import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApplicationStatus } from '../enums/application-status.enum';

export class CreateApplicationDto {
  @IsString() candidateNumber: string; // Candidate number (e.g., CAN-2025-0001) - candidates use this instead of ID
  @IsString() requisitionId: string; // ObjectId of JobRequisition as string
  @IsOptional() @IsString() assignedHr?: string; // Optional: ObjectId of HR Employee to assign. If not provided, uses hiringManagerId from requisition
}

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus) status: ApplicationStatus; // Must be one of: submitted, in_process, offer, hired, rejected
}
