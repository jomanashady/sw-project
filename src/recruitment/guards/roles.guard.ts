import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

/**
 * RolesGuard checks if the authenticated user has the required role(s)
 * to access a specific endpoint.
 * 
 * Usage: @UseGuards(RolesGuard) @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
 * 
 * Expected user object structure in request.user:
 * { id: string, email: string, role: SystemRole }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<SystemRole[]>('roles', context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) {
      // If no roles specified, allow all authenticated users
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!user.role) {
      throw new ForbiddenException('User role not found in token');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `   Access denied. Required roles: ${requiredRoles.join(', ')}. Your role: ${user.role}`
      );
    }

    return true;
  }
}