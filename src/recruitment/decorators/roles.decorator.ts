import { SetMetadata } from '@nestjs/common';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

/**
 * Metadata key used by RolesGuard to retrieve required roles
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles are allowed to access an endpoint.
 * 
 * Usage:
 * @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
 * @Get('some-endpoint')
 * someMethod() { ... }
 * 
 * This decorator works in conjunction with RolesGuard:
 * @UseGuards(RolesGuard)
 * @Roles(SystemRole.HR_MANAGER)
 * 
 * @param roles - One or more SystemRole values that are allowed to access the endpoint
 * @returns A decorator that sets the 'roles' metadata
 */
export const Roles = (...roles: SystemRole[]) => SetMetadata(ROLES_KEY, roles);

