import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<SystemRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const headers = request?.headers || {};

    const headerRoles: string[] = [];
    if (headers['x-roles']) {
      headerRoles.push(
        ...String(headers['x-roles'])
          .split(',')
          .map((r) => r.trim()),
      );
    }
    if (headers['x-role']) {
      headerRoles.push(String(headers['x-role']).trim());
    }

    const userRoles: string[] = Array.isArray(request?.user?.roles)
      ? request.user.roles
      : [];

    const roles = new Set<string>([...headerRoles, ...userRoles]);
    return requiredRoles.some((r) => roles.has(r));
  }
}

