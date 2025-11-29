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
    @InjectModel(ShiftAssignment.name) private shiftAssignmentModel: Model<ShiftAssignment>,
    @InjectModel(ScheduleRule.name) private scheduleRuleModel: Model<ScheduleRule>,
  ) {}

  // ===== SHIFT SERVICE METHODS =====

  // 1. Create a new shift type
  async createShiftType(createShiftTypeDto: any) {
    const newShiftType = new this.shiftTypeModel(createShiftTypeDto);
    return newShiftType.save();
  }

  // // 2. Update an existing shift type
  // async updateShiftType(id: string, updateShiftTypeDto: any) {
  //   return this.shiftTypeModel.findByIdAndUpdate(id, updateShiftTypeDto, { new: true });
  // }

  // // 3. Get all shift types
  // async getShiftTypes() {
  //   return this.shiftTypeModel.find().exec();
  // }

  // 4. Create a new shift
  async createShift(createShiftDto: any) {
    const newShift = new this.shiftModel(createShiftDto);
    return newShift.save();
  }

  // 5. Update an existing shift
  async updateShift(id: string, updateShiftDto: any) {
    return this.shiftModel.findByIdAndUpdate(id, updateShiftDto, { new: true });
  }

  // // 6. Get shifts by type
  // async getShiftsByType(shiftType: string) {
  //   return this.shiftModel.find({ shiftType }).exec();
  // }

  // 7. Assign a shift to an employee
  async assignShiftToEmployee(assignShiftToEmployeeDto: any) {
    const newShiftAssignment = new this.shiftAssignmentModel(assignShiftToEmployeeDto);
    return newShiftAssignment.save();
  }

  // // 8. Update a shift assignment
  // async updateShiftAssignment(id: string, updateShiftAssignmentDto: any) {
  //   return this.shiftAssignmentModel.findByIdAndUpdate(id, updateShiftAssignmentDto, { new: true });
  // }

  // // 9. Get all shift assignments for an employee
  // async getEmployeeShiftAssignments(employeeId: string) {
  //   return this.shiftAssignmentModel.find({ employeeId }).exec();
  // }

  // // 10. Get the status of a shift assignment
  // async getShiftAssignmentStatus(shiftAssignmentId: string) {
  //   const assignment = await this.shiftAssignmentModel.findById(shiftAssignmentId).exec();

  //   if (!assignment) {
  //     throw new Error('Shift assignment not found');
  //   }

  //   return assignment.status;
  // }

  // ===== SCHEDULE SERVICE METHODS =====

  // 11. Create a new schedule rule
  async createScheduleRule(createScheduleRuleDto: any) {
    const newScheduleRule = new this.scheduleRuleModel(createScheduleRuleDto);
    return newScheduleRule.save();
  }

  // // 12. Get all schedule rules
  // async getScheduleRules(getScheduleRulesDto: any) {
  //   const { active } = getScheduleRulesDto;
  //   const query: any = {};

  //   if (active !== undefined) {
  //     query.active = active;
  //   }

  //   return this.scheduleRuleModel.find(query).exec();
  // }

  // // 13. Assign a schedule rule to an employee
  // async assignScheduleRuleToEmployee(assignScheduleRuleToEmployeeDto: any) {
  //   const newScheduleAssignment = new this.scheduleRuleModel(assignScheduleRuleToEmployeeDto);
  //   return newScheduleAssignment.save();
  // }

  // 14. Define flexible scheduling rules //leave this or createScheduleRule not both 
  async defineFlexibleSchedulingRules(defineFlexibleSchedulingRulesDto: any) {
    const newFlexibleSchedule = new this.scheduleRuleModel(defineFlexibleSchedulingRulesDto);
    return newFlexibleSchedule.save();
  }
}

