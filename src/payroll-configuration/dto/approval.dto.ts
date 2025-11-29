import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsMongoId } from 'class-validator';

export class ApprovalDto {
  @ApiProperty({ description: 'User ID who is approving' })
  @IsString()
  @IsMongoId()
  approvedBy: string;
}

export class RejectionDto {
  @ApiProperty({ description: 'User ID who is rejecting' })
  @IsString()
  @IsMongoId()
  rejectedBy: string;
}
