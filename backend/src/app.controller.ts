import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectConnection() private connection: Connection
  ) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  healthCheck() {
    // Always return quickly - don't wait for database
    // Railway needs fast health check responses
    try {
      const dbStatus = this.connection?.readyState === 1 ? 'connected' : 'disconnected';
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbStatus,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
      };
    } catch (error) {
      // Health check should always return quickly, even if there's an error
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'unknown',
        error: 'Health check error',
      };
    }
  }

  @Public()
  @Get('ready')
  readinessCheck() {
    // Simple readiness check - responds immediately
    // Railway uses this to verify service is ready
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }
}
