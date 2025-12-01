import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';
import { EmployeeSystemRole } from '../employee-profile/models/employee-system-role.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(EmployeeProfile.name)
    private employeeModel: Model<EmployeeProfile>,
    @InjectModel(EmployeeSystemRole.name)
    private systemRoleModel: Model<EmployeeSystemRole>,
    private jwtService: JwtService,
  ) {}

  async validateUser(employeeNumber: string, password: string): Promise<any> {
    const employee = await this.employeeModel
      .findOne({ employeeNumber })
      .exec();

    if (!employee || !employee.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const systemRole = await this.systemRoleModel
      .findOne({ employeeProfileId: employee._id })
      .exec();

    const { password: _, ...result } = employee.toObject();

    return {
      ...result,
      roles: systemRole?.roles || [],
      permissions: systemRole?.permissions || [],
    };
  }

  async login(user: any) {
    const payload = {
      username: user.employeeNumber,
      sub: user._id,
      roles: user.roles,
      permissions: user.permissions,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        employeeNumber: user.employeeNumber,
        fullName: user.fullName,
        workEmail: user.workEmail,
        roles: user.roles,
      },
    };
  }
}
