import { IsString, IsOptional, IsMongoId, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApprovalDecision } from '../enums/organization-structure.enums';

export class CreateStructureApprovalDto {
  @ApiProperty()
  @IsMongoId()
  changeRequestId: string;

  @ApiProperty()
  @IsMongoId()
  approverEmployeeId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  comments?: string;
}

export class UpdateApprovalDecisionDto {
  @ApiProperty({ enum: ApprovalDecision })
  @IsEnum(ApprovalDecision)
  decision: ApprovalDecision;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  comments?: string;
}

export class StructureApprovalResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  changeRequestId: string;

  @ApiProperty()
  approverEmployeeId: string;

  @ApiProperty({ enum: ApprovalDecision })
  decision: ApprovalDecision;

  @ApiPropertyOptional()
  decidedAt?: Date;

  @ApiPropertyOptional()
  comments?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}