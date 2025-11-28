import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Onboarding, OnboardingDocument } from './models/onboarding.schema';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { UpdateOnboardingTaskDto } from './dto/update-task.dto';
import { OnboardingTaskStatus } from './enums/onboarding-task-status.enum';

@Injectable()
export class RecruitmentService {
  constructor(
    @InjectModel(Onboarding.name) 
    private readonly onboardingModel: Model<OnboardingDocument>,
  ) {}

  // ============= ONBOARDING METHODS =============

  /**
   * ONB-001: Create onboarding checklist for a new hire
   */
  async createOnboarding(createOnboardingDto: CreateOnboardingDto): Promise<any> {
    try {
      const existingOnboarding = await this.onboardingModel.findOne({
        employeeId: createOnboardingDto.employeeId,
      }).lean();

      if (existingOnboarding) {
        throw new BadRequestException('Onboarding checklist already exists for this employee');
      }

      const onboarding = new this.onboardingModel({
        ...createOnboardingDto,
        completed: false,
      });

      const saved = await onboarding.save();
      return saved.toObject();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create onboarding: ' + error.message);
    }
  }

  /**
   * Get all onboarding records (for HR Manager)
   */
  async getAllOnboardings(): Promise<any[]> {
    try {
      // Use lean() to get plain JavaScript objects without mongoose document features
      // This avoids triggering populate
      const onboardings = await this.onboardingModel
        .find()
        .select('-__v') // Exclude version key
        .lean()
        .exec();
      
      return onboardings;
    } catch (error) {
      throw new BadRequestException('Failed to fetch onboarding records: ' + error.message);
    }
  }

  /**
   * ONB-004: Get onboarding tracker for a new hire
   */
  async getOnboardingByEmployeeId(employeeId: string): Promise<any> {
  try {
    console.log('Searching for employeeId:', employeeId);
    
    // Try both as string and ObjectId
    const onboarding = await this.onboardingModel
      .findOne({ 
        $or: [
          { employeeId: employeeId },
          { employeeId: new Types.ObjectId(employeeId) }
        ]
      })
      .select('-__v')
      .lean()
      .exec();

    console.log('Result:', onboarding);

    if (!onboarding) {
      throw new NotFoundException('Onboarding checklist not found for this employee');
    }

    return onboarding;
  } catch (error) {
    console.error('Error details:', error);
    if (error instanceof NotFoundException) {
      throw error;
    }
    throw new BadRequestException('Failed to fetch onboarding: ' + error.message);
  }
}

  /**
   * Get onboarding by ID
   */
  async getOnboardingById(id: string): Promise<any> {
    try {
      const onboarding = await this.onboardingModel
        .findById(id)
        .select('-__v')
        .lean()
        .exec();

      if (!onboarding) {
        throw new NotFoundException('Onboarding not found');
      }

      return onboarding;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch onboarding: ' + error.message);
    }
  }

  /**
   * Update entire onboarding checklist
   */
  async updateOnboarding(
    id: string,
    updateOnboardingDto: UpdateOnboardingDto,
  ): Promise<any> {
    try {
      const onboarding = await this.onboardingModel
        .findByIdAndUpdate(
          id,
          { $set: updateOnboardingDto },
          { new: true }
        )
        .select('-__v')
        .lean()
        .exec();

      if (!onboarding) {
        throw new NotFoundException('Onboarding not found');
      }

      return onboarding;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update onboarding: ' + error.message);
    }
  }

  /**
   * Update a specific task within onboarding
   */
  async updateOnboardingTask(
    onboardingId: string,
    taskIndex: number,
    updateTaskDto: UpdateOnboardingTaskDto,
  ): Promise<any> {
    try {
      // Don't use lean() here because we need to modify and save
      const onboarding = await this.onboardingModel.findById(onboardingId);

      if (!onboarding) {
        throw new NotFoundException('Onboarding not found');
      }

      if (taskIndex < 0 || taskIndex >= onboarding.tasks.length) {
        throw new BadRequestException('Invalid task index');
      }

      // Update the specific task
      Object.assign(onboarding.tasks[taskIndex], updateTaskDto);

      // If status is completed, set completedAt
      if (updateTaskDto.status === OnboardingTaskStatus.COMPLETED) {
        onboarding.tasks[taskIndex].completedAt = new Date();
      }

      // Check if all tasks are completed
      const allCompleted = onboarding.tasks.every(
        (task) => task.status === OnboardingTaskStatus.COMPLETED,
      );

      if (allCompleted) {
        onboarding.completed = true;
        onboarding.completedAt = new Date();
      }

      const saved = await onboarding.save();
      return saved.toObject();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update task: ' + error.message);
    }
  }

  /**
   * Add a new task to existing onboarding
   */
  async addTaskToOnboarding(
    onboardingId: string,
    taskDto: any,
  ): Promise<any> {
    try {
      const onboarding = await this.onboardingModel.findById(onboardingId);

      if (!onboarding) {
        throw new NotFoundException('Onboarding not found');
      }

      onboarding.tasks.push({
        ...taskDto,
        status: taskDto.status || OnboardingTaskStatus.PENDING,
      });

      const saved = await onboarding.save();
      return saved.toObject();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to add task: ' + error.message);
    }
  }

  /**
   * Delete a task from onboarding
   */
  async removeTaskFromOnboarding(
    onboardingId: string,
    taskIndex: number,
  ): Promise<any> {
    try {
      const onboarding = await this.onboardingModel.findById(onboardingId);

      if (!onboarding) {
        throw new NotFoundException('Onboarding not found');
      }

      if (taskIndex < 0 || taskIndex >= onboarding.tasks.length) {
        throw new BadRequestException('Invalid task index');
      }

      onboarding.tasks.splice(taskIndex, 1);
      const saved = await onboarding.save();
      return saved.toObject();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to remove task: ' + error.message);
    }
  }

  /**
   * Delete onboarding checklist
   */
  async deleteOnboarding(id: string): Promise<void> {
    try {
      const result = await this.onboardingModel.findByIdAndDelete(id);

      if (!result) {
        throw new NotFoundException('Onboarding not found');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete onboarding: ' + error.message);
    }
  }

  /**
   * Get onboarding statistics (for dashboard)
   */
  async getOnboardingStats() {
    try {
      const total = await this.onboardingModel.countDocuments();
      const completed = await this.onboardingModel.countDocuments({ completed: true });
      const inProgress = total - completed;

      return {
        total,
        completed,
        inProgress,
        completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) + '%' : '0%',
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch stats: ' + error.message);
    }
  }
}
