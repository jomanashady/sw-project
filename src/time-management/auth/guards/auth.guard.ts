import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

type RequestUser = {
  id: string;
  roles: string[];
  [key: string]: unknown;
};

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (request.user) {
      this.ensureRolesArray(request.user);
      return true;
    }

    const headerUser = this.parseUserFromHeaders(request);
    if (headerUser) {
      request.user = headerUser;
      return true;
    }

    throw new UnauthorizedException('Authentication required');
  }

  private parseUserFromHeaders(request: any): RequestUser | null {
    const userHeader = request.headers['x-user'];
    const userRolesHeader = request.headers['x-user-roles'];
    const userIdHeader = request.headers['x-user-id'];

    try {
      if (userHeader) {
        const decoded = decodeURIComponent(userHeader);
        const parsed = JSON.parse(decoded);
        this.ensureRolesArray(parsed);
        return parsed;
      }

      if (userIdHeader || userRolesHeader) {
        const roles = userRolesHeader
          ? String(userRolesHeader)
              .split(',')
              .map((role) => role.trim())
              .filter(Boolean)
          : [];

        return {
          id: String(userIdHeader ?? ''),
          roles,
        };
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid authentication headers');
    }

    return null;
  }

  private ensureRolesArray(user: RequestUser) {
    if (!Array.isArray(user.roles)) {
      user.roles = [];
    }
  }
}

