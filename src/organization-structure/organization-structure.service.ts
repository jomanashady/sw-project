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
    @InjectModel('Position') private positionModel: Model<PositionDocument>,
  ) {}

  // ✅ Department Methods
  async findDepartmentById(
    departmentId: string,
  ): Promise<DepartmentDocument | null> {
    console.log(`[ORG SERVICE] Finding department: ${departmentId}`);
    return this.departmentModel.findOne({ departmentId }).exec();
  }

  async findAllDepartments(): Promise<DepartmentDocument[]> {
    console.log(`[ORG SERVICE] Finding all departments`);
    return this.departmentModel.find({ isActive: true }).exec();
  }

  async createDepartment(
    deptData: Partial<Department>,
  ): Promise<DepartmentDocument> {
    const newDept = new this.departmentModel({
      ...deptData,
      departmentId: deptData.departmentId || `DEPT-${Date.now()}`,
    });
    return newDept.save(); // returns DepartmentDocument, _id is Types.ObjectId
  }

  // ✅ Position Methods
  async findPositionById(positionId: string): Promise<PositionDocument | null> {
    console.log(`[ORG SERVICE] Finding position: ${positionId}`);
    return this.positionModel
      .findOne({ positionId })
      .populate('departmentId')
      .exec();
  }

  async findAllPositions(): Promise<PositionDocument[]> {
    console.log(`[ORG SERVICE] Finding all positions`);
    return this.positionModel.find({ isActive: true }).exec();
  }

  async createPosition(posData: Partial<Position>): Promise<PositionDocument> {
    console.log(`[ORG SERVICE] Creating position: ${posData.positionTitle}`);
    const newPos = new this.positionModel({
      ...posData,
      positionId: posData.positionId || `POS-${Date.now()}`,
    });
    return newPos.save();
  }

  async findPositionsByDepartment(
    departmentId: string,
  ): Promise<PositionDocument[]> {
    console.log(
      `[ORG SERVICE] Finding positions for department: ${departmentId}`,
    );
    return this.positionModel.find({ departmentId, isActive: true }).exec();
  }
}
