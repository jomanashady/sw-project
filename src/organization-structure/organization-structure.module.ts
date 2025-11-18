/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/organization-structure/organization-structure.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // ✅ ADD THIS
import { OrganizationStructureService } from './organization-structure.service';
import { OrganizationStructureController } from './organization-structure.controller';
import { Department, DepartmentSchema } from './schemas/department.schema'; // ✅ ADD THIS
import { Position, PositionSchema } from './schemas/position.schema'; // ✅ ADD THIS
import {
  StructureChangeRequest,
  StructureChangeRequestSchema,
} from './schemas/structure-change-request.schema'; // ✅ ADD THIS

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
      { name: Position.name, schema: PositionSchema },
      {
        name: StructureChangeRequest.name,
        schema: StructureChangeRequestSchema,
      },
    ]),
  ],
  controllers: [OrganizationStructureController],
  providers: [OrganizationStructureService],
  exports: [OrganizationStructureService],
})
export class OrganizationStructureModule {}
