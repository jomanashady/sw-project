import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// Suppress excessive logging in production to avoid Railway rate limits
if (process.env.NODE_ENV === 'production') {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  
  let logCount = 0;
  let lastLogReset = Date.now();
  const MAX_LOGS_PER_MINUTE = 10; // Limit to 10 logs per minute to avoid Railway rate limits
  
  // Throttle console.log
  console.log = (...args: any[]) => {
    const now = Date.now();
    if (now - lastLogReset > 60000) {
      logCount = 0;
      lastLogReset = now;
    }
    if (logCount < MAX_LOGS_PER_MINUTE) {
      originalLog(...args);
      logCount++;
    }
  };
  
  // Throttle console.error (keep errors but limit them)
  let errorCount = 0;
  let lastErrorReset = Date.now();
  const MAX_ERRORS_PER_MINUTE = 20;
  
  console.error = (...args: any[]) => {
    const now = Date.now();
    if (now - lastErrorReset > 60000) {
      errorCount = 0;
      lastErrorReset = now;
    }
    if (errorCount < MAX_ERRORS_PER_MINUTE) {
      originalError(...args);
      errorCount++;
    }
  };
  
  // Throttle console.warn
  let warnCount = 0;
  let lastWarnReset = Date.now();
  const MAX_WARNS_PER_MINUTE = 20;
  
  console.warn = (...args: any[]) => {
    const now = Date.now();
    if (now - lastWarnReset > 60000) {
      warnCount = 0;
      lastWarnReset = now;
    }
    if (warnCount < MAX_WARNS_PER_MINUTE) {
      originalWarn(...args);
      warnCount++;
    }
  };
}

async function bootstrap() {
  try {
    // Disable verbose NestJS logging in production to avoid Railway rate limits
    const logger = process.env.NODE_ENV === 'production' 
      ? ['error', 'warn'] // Only log errors and warnings in production
      : ['log', 'error', 'warn', 'debug', 'verbose']; // Full logging in development
    
    const app = await NestFactory.create(AppModule, {
      logger: logger as any,
    });

    // -----------------------------------
    // CORS CONFIGURATION
    // -----------------------------------
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Build allowed origins list
    const allowedOrigins = [
      frontendUrl,
      'http://localhost:3000',
      'http://localhost:3001',
      'https://hr-systemm.netlify.app',
    ];
    
    // Remove duplicates and filter out undefined
    const uniqueOrigins = [...new Set(allowedOrigins.filter(Boolean))];
    
    // Only log in development to avoid Railway rate limits
    if (process.env.NODE_ENV !== 'production') {
      console.log('🌐 CORS Allowed Origins:', uniqueOrigins);
      console.log('🌐 Frontend URL from env:', frontendUrl);
    }
    
    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, or curl requests)
        if (!origin) {
          return callback(null, true);
        }

        // Ensure the origin is in the allowed list
        if (uniqueOrigins.includes(origin)) {
          return callback(null, true);
        }

        // Allow all Netlify domains (including preview deployments)
        if (origin.endsWith('.netlify.app')) {
          return callback(null, true);
        }

        // Allow all Railway domains (for frontend deployment)
        if (origin.endsWith('.up.railway.app') || origin.includes('.railway.app')) {
          return callback(null, true);
        }

        // Allow localhost for development
        if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
          return callback(null, true);
        }

        // Block other origins
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
      ],
      exposedHeaders: ['Authorization'],
      maxAge: 86400, // 24 hours
    });

    // -----------------------------------
    // GLOBAL VALIDATION PIPE
    // -----------------------------------
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // remove unexpected fields
        forbidNonWhitelisted: true, // throw error for invalid fields
        transform: true, // transforms payloads to dto classes
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // -----------------------------------
    // GLOBAL API PREFIX
    // -----------------------------------
    app.setGlobalPrefix('api/v1');

    // -----------------------------------
    // START SERVER
    // -----------------------------------
    const port = process.env.PORT || 6000;
    await app.listen(port);

    // Only log startup info in development to avoid Railway rate limits
    if (process.env.NODE_ENV !== 'production') {
      console.log('='.repeat(50));
      console.log(`🚀 HR System API`);
      console.log('='.repeat(50));
      console.log(`📍 Local: http://localhost:${port}/api/v1`);
      console.log(`🌐 Frontend: ${frontendUrl}`);
      console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Database: ${process.env.DATABASE_NAME || 'hr_system'}`);
      console.log(
        `🔐 JWT: ${process.env.JWT_SECRET ? 'Configured ✓' : 'NOT SET!'}`,
      );
      console.log('='.repeat(50));
    } else {
      // Minimal production logging
      console.log(`🚀 HR System API started on port ${port}`);
    }
  } catch (error) {
    console.error('❌ Error starting application:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections (throttled logging)
let lastRejectionLog = 0;
process.on('unhandledRejection', (reason, promise) => {
  const now = Date.now();
  // Only log once per 10 seconds to avoid rate limits
  if (now - lastRejectionLog > 10000) {
    console.error('❌ Unhandled Rejection:', reason instanceof Error ? reason.message : String(reason));
    lastRejectionLog = now;
  }
  // Don't exit - keep the server running
});

// Handle uncaught exceptions (throttled logging)
let lastExceptionLog = 0;
process.on('uncaughtException', (error) => {
  const now = Date.now();
  // Only log once per 10 seconds to avoid rate limits
  if (now - lastExceptionLog > 10000) {
    console.error('❌ Uncaught Exception:', error.message);
    lastExceptionLog = now;
  }
  // Don't exit - keep the server running
});

// Handle SIGTERM gracefully
process.on('SIGTERM', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('SIGTERM received, shutting down gracefully...');
  }
  process.exit(0);
});

bootstrap();
