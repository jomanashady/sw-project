// src/recruitment/dto/system-access.dto.ts
import { IsString } from 'class-validator';

export class RevokeSystemAccessDto {
  @IsString()
  employeeId: string; // employeeNumber: "EMP-001"
}
