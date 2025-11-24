import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreateJobRequisitionDto {
  @IsString()
  title: string;

  @IsString()
  department: string;

  @IsString()
  description: string;

  @IsArray()
  requiredSkills: string[];

  @IsNumber()
  openings: number;
}

export class UpdateJobRequisitionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  requiredSkills?: string[];

  @IsOptional()
  @IsNumber()
  openings?: number;
}
