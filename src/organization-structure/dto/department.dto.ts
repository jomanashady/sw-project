import { IsString, IsOptional, IsBoolean, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'DEPT-001' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Human Resources' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Handles all HR operations' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  headPositionId?: string;
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ example: 'DEPT-001' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ example: 'Human Resources' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Handles all HR operations' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  headPositionId?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class DepartmentResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  headPositionId?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}