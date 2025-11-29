import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

const PRIVILEGED_ROLES = [
  'SystemAdmin',
  'HrAdmin',
  'HrManager',
  'LineManager',
  'PayrollOfficer',
];

@Injectable()
export class SelfAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User context missing');
    }

    if (this.isPrivileged(user.roles)) {
      return true;
    }

    const targetId = this.resolveTargetEmployeeId(request);
    if (!targetId) {
      return true;
    }

    if (user.id && String(user.id) === String(targetId)) {
      return true;
    }

    throw new ForbiddenException(
      'Employees can only access their own records.',
    );
  }

  private isPrivileged(roles: string[] = []): boolean {
    return roles.some((role) => PRIVILEGED_ROLES.includes(role));
  }

  private resolveTargetEmployeeId(request: any): string | null {
    const { params, body, query } = request;

    return (
      params?.employeeId ??
      params?.id ??
      body?.employeeId ??
      query?.employeeId ??
      null
    );
  }
}

