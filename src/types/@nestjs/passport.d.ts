declare module '@nestjs/passport' {
  import { Type } from '@nestjs/common';
  import { Strategy } from 'passport';
  import { ExecutionContext } from '@nestjs/common';

  export function PassportStrategy<T extends Strategy>(
    strategy: Type<T>,
    name?: string,
  ): Type<any>;

  export class PassportModule {
    static register(options?: { defaultStrategy?: string }): any;
  }

  export interface AuthGuard {
    canActivate(context: ExecutionContext): boolean | Promise<boolean>;
    handleRequest?(err: any, user: any, info: any, context?: ExecutionContext): any;
  }

  interface AuthGuardConstructor {
    new (strategy?: string | string[]): AuthGuard;
  }

  interface AuthGuardFunction {
    (strategy?: string | string[]): AuthGuardConstructor;
  }

  export const AuthGuard: AuthGuardFunction & AuthGuardConstructor;
}

