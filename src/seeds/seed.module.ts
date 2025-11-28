// src/database/seeders/seed.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import {
  EmployeeProfile,
  EmployeeProfileSchema,
} from '../employee-profile/models/employee-profile.schema';

import { SeedService } from './seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb+srv://TeamUser:TeamUser@cluster0.mfclf62.mongodb.net/hr_system',
    ),
    MongooseModule.forFeature([
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      // Removed Candidate schema since we're only seeding employees
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
