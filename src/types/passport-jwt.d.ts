declare module 'passport-jwt' {
  import { Strategy } from 'passport';

  export interface StrategyOptions {
    jwtFromRequest?: (request: any) => string | null;
    secretOrKey: string | Buffer;
    secretOrKeyProvider?: (
      request: any,
      rawJwtToken: any,
      done: (err: any, secretOrKey?: string | Buffer) => void,
    ) => void;
    issuer?: string;
    audience?: string;
    algorithms?: string[];
    ignoreExpiration?: boolean;
    passReqToCallback?: boolean;
    jsonWebTokenOptions?: any;
  }

  export interface VerifyCallback {
    (payload: any, done: (error: any, user?: any, info?: any) => void): void;
  }

  export class Strategy extends Strategy {
    constructor(options: StrategyOptions, verify: VerifyCallback);
  }

  export namespace ExtractJwt {
    function fromHeader(header_name: string): (request: any) => string | null;
    function fromBodyField(field_name: string): (request: any) => string | null;
    function fromUrlQueryParameter(param_name: string): (
      request: any,
    ) => string | null;
    function fromAuthHeaderAsBearerToken(): (request: any) => string | null;
    function fromExtractors(
      extractors: Array<(request: any) => string | null>,
    ): (request: any) => string | null;
  }
}

