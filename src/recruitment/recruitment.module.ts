import { Module } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { RecruitmentController } from './recruitment.controller';
import { RecModule } from './rec/rec.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { OffboardingModule } from './offboarding/offboarding.module';

@Module({
  providers: [RecruitmentService],
  controllers: [RecruitmentController],
  imports: [RecruitmentModule, RecModule, OnboardingModule, OffboardingModule]
})
export class RecruitmentModule {}
