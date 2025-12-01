import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// Import schemas
import { ShiftType } from '../models/shift-type.schema';
import { Shift } from '../models/shift.schema';
import { ShiftAssignment } from '../models/shift-assignment.schema';
import { ScheduleRule } from '../models/schedule-rule.schema';

@Injectable()
export class ShiftScheduleService {
  constructor(
    @InjectModel(ShiftType.name) private shiftTypeModel: Model<ShiftType>,
    @InjectModel(Shift.name) private shiftModel: Model<Shift>,
    @InjectModel(ShiftAssignment.name)
    private shiftAssignmentModel: Model<ShiftAssignment>,
    @InjectModel(ScheduleRule.name)
    private scheduleRuleModel: Model<ScheduleRule>,
  ) {}

  // ===== SHIFT SERVICE METHODS =====

  // 1. Create a new shift type
  async createShiftType(createShiftTypeDto: any, currentUserId: string) {
    const newShiftType = new this.shiftTypeModel({
      ...createShiftTypeDto,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return newShiftType.save();
  }

  // // 2. Update an existing shift type
  // async updateShiftType(id: string, updateShiftTypeDto: any, currentUserId: string) {
  //   return this.shiftTypeModel.findByIdAndUpdate(id, {
  //     ...updateShiftTypeDto,
  //     updatedBy: currentUserId,
  //   }, { new: true });
  // }

  // // 3. Get all shift types
  // async getShiftTypes(currentUserId: string) {
  //   return this.shiftTypeModel.find().exec();
  // }

  // 4. Create a new shift
  async createShift(createShiftDto: any, currentUserId: string) {
    const newShift = new this.shiftModel({
      ...createShiftDto,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return newShift.save();
  }

  // 5. Update an existing shift
  async updateShift(id: string, updateShiftDto: any, currentUserId: string) {
    return this.shiftModel.findByIdAndUpdate(
      id,
      {
        ...updateShiftDto,
        updatedBy: currentUserId,
      },
      { new: true },
    );
  }

  // // 6. Get shifts by type
  // async getShiftsByType(shiftType: string, currentUserId: string) {
  //   return this.shiftModel.find({ shiftType }).exec();
  // }

  // 7. Assign a shift to an employee
  async assignShiftToEmployee(
    assignShiftToEmployeeDto: any,
    currentUserId: string,
  ) {
    const newShiftAssignment = new this.shiftAssignmentModel({
      ...assignShiftToEmployeeDto,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return newShiftAssignment.save();
  }

  // // 8. Update a shift assignment
  // async updateShiftAssignment(id: string, updateShiftAssignmentDto: any, currentUserId: string) {
  //   return this.shiftAssignmentModel.findByIdAndUpdate(id, {
  //     ...updateShiftAssignmentDto,
  //     updatedBy: currentUserId,
  //   }, { new: true });
  // }

  // // 9. Get all shift assignments for an employee
  // async getEmployeeShiftAssignments(employeeId: string, currentUserId: string) {
  //   return this.shiftAssignmentModel.find({ employeeId }).exec();
  // }

  // // 10. Get the status of a shift assignment
  // async getShiftAssignmentStatus(shiftAssignmentId: string, currentUserId: string) {
  //   const assignment = await this.shiftAssignmentModel.findById(shiftAssignmentId).exec();

  //   if (!assignment) {
  //     throw new Error('Shift assignment not found');
  //   }

  //   return assignment.status;
  // }

  // ===== SCHEDULE SERVICE METHODS =====

  // 11. Create a new schedule rule
  async createScheduleRule(createScheduleRuleDto: any, currentUserId: string) {
    const newScheduleRule = new this.scheduleRuleModel({
      ...createScheduleRuleDto,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return newScheduleRule.save();
  }

  // // 12. Get all schedule rules
  // async getScheduleRules(getScheduleRulesDto: any, currentUserId: string) {
  //   const { active } = getScheduleRulesDto;
  //   const query: any = {};

  //   if (active !== undefined) {
  //     query.active = active;
  //   }

  //   return this.scheduleRuleModel.find(query).exec();
  // }

  // // 13. Assign a schedule rule to an employee
  // async assignScheduleRuleToEmployee(assignScheduleRuleToEmployeeDto: any, currentUserId: string) {
  //   const newScheduleAssignment = new this.scheduleRuleModel({
  //     ...assignScheduleRuleToEmployeeDto,
  //     createdBy: currentUserId,
  //     updatedBy: currentUserId,
  //   });
  //   return newScheduleAssignment.save();
  // }

  // 14. Define flexible scheduling rules
  async defineFlexibleSchedulingRules(
    defineFlexibleSchedulingRulesDto: any,
    currentUserId: string,
  ) {
    const newFlexibleSchedule = new this.scheduleRuleModel({
      ...defineFlexibleSchedulingRulesDto,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return newFlexibleSchedule.save();
  }
}
