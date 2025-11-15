// recruitment-backend/src/onboarding/onboarding.controller.ts

import { Controller } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  // Endpoints will be added here
}