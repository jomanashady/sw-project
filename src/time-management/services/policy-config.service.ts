import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// Import schemas
import { OvertimeRule } from '../models/overtime-rule.schema';
import { LatenessRule } from '../models/lateness-rule.schema';
import { Holiday } from '../models/holiday.schema';
// Import DTOs
import {
  CreateOvertimeRuleDto,
  UpdateOvertimeRuleDto,
  CreateLatenessRuleDto,
  UpdateLatenessRuleDto,
  CreateHolidayDto,
  UpdateHolidayDto,
  GetHolidaysDto,
  GetPoliciesDto,
  CheckHolidayDto,
  ValidateAttendanceHolidayDto,
} from '../DTOs/policy-config.dtos';

@Injectable()
export class PolicyConfigService {
  constructor(
    @InjectModel(OvertimeRule.name)
    private overtimeRuleModel: Model<OvertimeRule>,
    @InjectModel(LatenessRule.name)
    private latenessRuleModel: Model<LatenessRule>,
    @InjectModel(Holiday.name) private holidayModel: Model<Holiday>,
  ) {}

  // ===== OVERTIME RULE METHODS =====

  // Create a new overtime rule
  async createOvertimeRule(
    createOvertimeRuleDto: CreateOvertimeRuleDto,
    currentUserId: string,
  ) {
    const newOvertimeRule = new this.overtimeRuleModel({
      ...createOvertimeRuleDto,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return newOvertimeRule.save();
  }

  // Get all overtime rules with optional filters
  async getOvertimeRules(
    getPoliciesDto: GetPoliciesDto,
    currentUserId: string,
  ) {
    const query: any = {};

    if (getPoliciesDto.active !== undefined) {
      query.active = getPoliciesDto.active;
    }

    if (getPoliciesDto.approved !== undefined) {
      query.approved = getPoliciesDto.approved;
    }

    return this.overtimeRuleModel.find(query).exec();
  }

  // Get a single overtime rule by ID
  async getOvertimeRuleById(id: string, currentUserId: string) {
    return this.overtimeRuleModel.findById(id).exec();
  }

  // Update an overtime rule
  async updateOvertimeRule(
    id: string,
    updateOvertimeRuleDto: UpdateOvertimeRuleDto,
    currentUserId: string,
  ) {
    return this.overtimeRuleModel
      .findByIdAndUpdate(
        id,
        {
          ...updateOvertimeRuleDto,
          updatedBy: currentUserId,
        },
        { new: true },
      )
      .exec();
  }

  // Delete an overtime rule
  async deleteOvertimeRule(id: string, currentUserId: string) {
    return this.overtimeRuleModel.findByIdAndDelete(id).exec();
  }

  // ===== LATENESS RULE METHODS =====

  // Create a new lateness rule
  async createLatenessRule(
    createLatenessRuleDto: CreateLatenessRuleDto,
    currentUserId: string,
  ) {
    const newLatenessRule = new this.latenessRuleModel({
      ...createLatenessRuleDto,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return newLatenessRule.save();
  }

  // Get all lateness rules with optional filters
  async getLatenessRules(
    getPoliciesDto: GetPoliciesDto,
    currentUserId: string,
  ) {
    const query: any = {};

    if (getPoliciesDto.active !== undefined) {
      query.active = getPoliciesDto.active;
    }

    return this.latenessRuleModel.find(query).exec();
  }

  // Get a single lateness rule by ID
  async getLatenessRuleById(id: string, currentUserId: string) {
    return this.latenessRuleModel.findById(id).exec();
  }

  // Update a lateness rule
  async updateLatenessRule(
    id: string,
    updateLatenessRuleDto: UpdateLatenessRuleDto,
    currentUserId: string,
  ) {
    return this.latenessRuleModel
      .findByIdAndUpdate(
        id,
        {
          ...updateLatenessRuleDto,
          updatedBy: currentUserId,
        },
        { new: true },
      )
      .exec();
  }

  // Delete a lateness rule
  async deleteLatenessRule(id: string, currentUserId: string) {
    return this.latenessRuleModel.findByIdAndDelete(id).exec();
  }

  // ===== HOLIDAY METHODS =====

  // Create a new holiday
  async createHoliday(
    createHolidayDto: CreateHolidayDto,
    currentUserId: string,
  ) {
    const newHoliday = new this.holidayModel({
      ...createHolidayDto,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return newHoliday.save();
  }

  // Get all holidays with optional filters
  async getHolidays(getHolidaysDto: GetHolidaysDto, currentUserId: string) {
    const query: any = {};

    if (getHolidaysDto.type) {
      query.type = getHolidaysDto.type;
    }

    if (getHolidaysDto.active !== undefined) {
      query.active = getHolidaysDto.active;
    }

    // Filter by date range if provided
    if (getHolidaysDto.startDate && getHolidaysDto.endDate) {
      query.$or = [
        {
          startDate: {
            $gte: getHolidaysDto.startDate,
            $lte: getHolidaysDto.endDate,
          },
        },
        {
          endDate: {
            $gte: getHolidaysDto.startDate,
            $lte: getHolidaysDto.endDate,
          },
        },
        {
          $and: [
            { startDate: { $lte: getHolidaysDto.startDate } },
            { endDate: { $gte: getHolidaysDto.endDate } },
          ],
        },
      ];
    }

    return this.holidayModel.find(query).sort({ startDate: 1 }).exec();
  }

  // Get a single holiday by ID
  async getHolidayById(id: string, currentUserId: string) {
    return this.holidayModel.findById(id).exec();
  }

  // Update a holiday
  async updateHoliday(
    id: string,
    updateHolidayDto: UpdateHolidayDto,
    currentUserId: string,
  ) {
    return this.holidayModel
      .findByIdAndUpdate(
        id,
        {
          ...updateHolidayDto,
          updatedBy: currentUserId,
        },
        { new: true },
      )
      .exec();
  }

  // Delete a holiday
  async deleteHoliday(id: string, currentUserId: string) {
    return this.holidayModel.findByIdAndDelete(id).exec();
  }

  // ===== HOLIDAY VALIDATION METHODS =====

  // Check if a specific date is a holiday
  async checkHoliday(checkHolidayDto: CheckHolidayDto, currentUserId: string) {
    const date = new Date(checkHolidayDto.date);
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const holiday = await this.holidayModel
      .findOne({
        active: true,
        $or: [
          // Single day holiday
          {
            startDate: { $gte: date, $lt: nextDay },
            endDate: { $exists: false },
          },
          // Multi-day holiday that covers this date
          {
            startDate: { $lte: date },
            endDate: { $gte: date },
          },
          // Single day holiday with same start and end
          {
            startDate: { $gte: date, $lt: nextDay },
            endDate: { $gte: date, $lt: nextDay },
          },
        ],
      })
      .exec();

    return {
      isHoliday: !!holiday,
      holiday: holiday || null,
    };
  }

  // Validate attendance against holidays (suppress penalty if holiday)
  async validateAttendanceHoliday(
    validateAttendanceHolidayDto: ValidateAttendanceHolidayDto,
    currentUserId: string,
  ) {
    const { employeeId, date, suppressPenalty } = validateAttendanceHolidayDto;

    const holidayCheck = await this.checkHoliday({ date }, currentUserId);

    if (holidayCheck.isHoliday && suppressPenalty) {
      return {
        employeeId,
        date,
        isHoliday: true,
        holidayName: holidayCheck.holiday?.name || 'Holiday',
        holidayType: holidayCheck.holiday?.type,
        penaltySuppressed: true,
        message: 'Attendance penalty suppressed due to holiday',
      };
    }

    return {
      employeeId,
      date,
      isHoliday: holidayCheck.isHoliday,
      holidayName: holidayCheck.holiday?.name || null,
      holidayType: holidayCheck.holiday?.type || null,
      penaltySuppressed: false,
      message: holidayCheck.isHoliday
        ? 'Date is a holiday but penalty suppression not requested'
        : 'Date is not a holiday',
    };
  }

  // Get upcoming holidays (next N days)
  async getUpcomingHolidays(days: number = 30, currentUserId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    return this.holidayModel
      .find({
        active: true,
        startDate: { $gte: today, $lte: futureDate },
      })
      .sort({ startDate: 1 })
      .exec();
  }
}
