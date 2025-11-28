import { IsString, IsOptional, IsBoolean, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePositionDto {
  @ApiProperty({ example: 'POS-001' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Senior Developer' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Lead development team' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsMongoId()
  departmentId: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  reportsToPositionId?: string;
}

export class UpdatePositionDto {
  @ApiPropertyOptional({ example: 'POS-001' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ example: 'Senior Developer' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Lead development team' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  reportsToPositionId?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class PositionResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  departmentId: string;

  @ApiPropertyOptional()
  reportsToPositionId?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}