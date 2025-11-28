import { IsString, IsOptional, IsMongoId, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePositionAssignmentDto {
  @ApiProperty()
  @IsMongoId()
  employeeProfileId: string;

  @ApiProperty()
  @IsMongoId()
  positionId: string;

  @ApiProperty()
  @IsMongoId()
  departmentId: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  changeRequestId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdatePositionAssignmentDto {
  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class PositionAssignmentResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  employeeProfileId: string;

  @ApiProperty()
  positionId: string;

  @ApiProperty()
  departmentId: string;

  @ApiProperty()
  startDate: Date;

  @ApiPropertyOptional()
  endDate?: Date;

  @ApiPropertyOptional()
  changeRequestId?: string;

  @ApiPropertyOptional()
  reason?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}