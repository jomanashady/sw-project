import { IsString, IsOptional, IsMongoId, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StructureRequestType, StructureRequestStatus } from '../enums/organization-structure.enums';

export class CreateStructureChangeRequestDto {
  @ApiProperty()
  @IsMongoId()
  requestedByEmployeeId: string;

  @ApiProperty({ enum: StructureRequestType })
  @IsEnum(StructureRequestType)
  requestType: StructureRequestType;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  targetDepartmentId?: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  targetPositionId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  details?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateStructureChangeRequestDto {
  @ApiPropertyOptional({ enum: StructureRequestType })
  @IsEnum(StructureRequestType)
  @IsOptional()
  requestType?: StructureRequestType;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  targetDepartmentId?: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  targetPositionId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  details?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason?: string;
}

export class SubmitChangeRequestDto {
  @ApiProperty()
  @IsMongoId()
  submittedByEmployeeId: string;
}

export class StructureChangeRequestResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  requestNumber: string;

  @ApiProperty()
  requestedByEmployeeId: string;

  @ApiProperty({ enum: StructureRequestType })
  requestType: StructureRequestType;

  @ApiPropertyOptional()
  targetDepartmentId?: string;

  @ApiPropertyOptional()
  targetPositionId?: string;

  @ApiPropertyOptional()
  details?: string;

  @ApiPropertyOptional()
  reason?: string;

  @ApiProperty({ enum: StructureRequestStatus })
  status: StructureRequestStatus;

  @ApiPropertyOptional()
  submittedByEmployeeId?: string;

  @ApiPropertyOptional()
  submittedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}