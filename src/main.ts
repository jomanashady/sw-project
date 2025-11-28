import { NestFactory } from '@nestjs/core';

import { SeedModule } from './seeds/seed.module';
import { SeedService } from './seeds/seed.service';
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule);
  const seedService = app.get(SeedService);
  await seedService.run();
  await app.close();
}

void bootstrap();
