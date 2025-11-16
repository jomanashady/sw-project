// src/organization-structure/organization-structure.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { Position, PositionDocument } from './schemas/position.schema';

@Injectable()
export class OrganizationStructureService {
  constructor(
    @InjectModel('Department')
    private departmentModel: Model<DepartmentDocument>,

    @InjectModel('Position')
    private positionModel: Model<PositionDocument>,
  ) {}

  // =============================
  // DEPARTMENT
  // =============================
  async findDepartmentById(_id: string): Promise<DepartmentDocument | null> {
    console.log(`[ORG SERVICE] Finding department by _id: ${_id}`);
    return this.departmentModel.findById(_id).exec();
  }

  async findAllDepartments(): Promise<DepartmentDocument[]> {
    return this.departmentModel.find({ isActive: true }).exec();
  }

  async createDepartment(
    deptData: Partial<Department>,
  ): Promise<DepartmentDocument> {
    return new this.departmentModel({
      ...deptData,
      departmentId: deptData.departmentId || `DEPT-${Date.now()}`,
    }).save();
  }

  // =============================
  // POSITION
  // =============================
  async findPositionById(_id: string): Promise<PositionDocument | null> {
    console.log(`[ORG SERVICE] Finding position by _id: ${_id}`);
    return this.positionModel.findById(_id).populate('departmentId').exec();
  }

  async findAllPositions(): Promise<PositionDocument[]> {
    return this.positionModel.find({ isActive: true }).exec();
  }

  async createPosition(posData: Partial<Position>): Promise<PositionDocument> {
    return new this.positionModel({
      ...posData,
      positionId: posData.positionId || `POS-${Date.now()}`,
    }).save();
  }

  async findPositionsByDepartment(departmentId: string) {
    return this.positionModel.find({ departmentId, isActive: true }).exec();
  }
}
