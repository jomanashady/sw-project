// src/database/seeders/seed.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';
import { employeeSeedData } from './data/employees.seed.js';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(EmployeeProfile.name)
    private employeeModel: Model<EmployeeProfile>,
  ) {}

  async run() {
    this.logger.log('🌱 Starting database seeding...');

    try {
      // Clear only employees collection
      await this.employeeModel.deleteMany({});
      this.logger.log('✔ Employees collection cleared.');

      // Insert employees only
      const result = await this.employeeModel.insertMany(employeeSeedData);
      this.logger.log(`✔ Inserted ${result.length} employees.`);

      this.logger.log('🎉 Employee seeding completed successfully.');
    } catch (error) {
      this.logger.error('❌ Seeding failed:', error);
      throw error;
    }
  }
}
