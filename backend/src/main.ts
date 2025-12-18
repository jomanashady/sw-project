import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as Express from 'express';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // -----------------------------------
    // CORS CONFIGURATION - MUST BE FIRST
    // -----------------------------------
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Build allowed origins list - use function to allow all Netlify domains
    const allowedOrigins = [
      frontendUrl,
      'http://localhost:3000',
      'http://localhost:3001',
      'https://hr-systemm.netlify.app',
      'https://hr-syst.netlify.app',
    ].filter(Boolean);
    
    console.log('🌐 CORS Allowed Origins:', allowedOrigins);
    console.log('🌐 Frontend URL from env:', frontendUrl);
    
    // Get the underlying Express app to add middleware BEFORE NestJS processing
    const expressApp = app.getHttpAdapter().getInstance();
    
    // CRITICAL: Handle CORS at Express level BEFORE any other middleware or guards
    // This must be the FIRST middleware to ensure OPTIONS requests are handled correctly
    expressApp.use((req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
      const origin = req.headers.origin as string | undefined;
      
      // Check if origin should be allowed
      let allowOrigin = false;
      if (!origin) {
        // Allow requests with no origin (like mobile apps, Postman, curl)
        allowOrigin = true;
      } else if (allowedOrigins.includes(origin)) {
        allowOrigin = true;
      } else if (origin.endsWith('.netlify.app')) {
        allowOrigin = true;
        console.log(`✅ CORS: Allowing Netlify domain: ${origin}`);
      } else if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
        allowOrigin = true;
      }
      
      // Set CORS headers for allowed origins
      if (allowOrigin) {
        if (origin) {
          // For browser requests with origin, echo back the origin
          res.setHeader('Access-Control-Allow-Origin', origin);
        }
        // Note: We don't set '*' when credentials are true (browser restriction)
        
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Max-Age', '86400');
        res.setHeader('Access-Control-Expose-Headers', 'Authorization');
      }
      
      // Handle preflight OPTIONS requests
      if (req.method === 'OPTIONS') {
        if (allowOrigin) {
          console.log(`✅ CORS Preflight ALLOWED: ${origin || 'no origin'}`);
          return res.status(204).end();
        } else {
          console.log(`❌ CORS Preflight BLOCKED: ${origin || 'no origin'}`);
          return res.status(403).json({ message: 'CORS policy: Origin not allowed' });
        }
      }
      
      next();
    });
    
    // NestJS CORS configuration (backup/secondary)
    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, or curl requests)
        if (!origin) {
          return callback(null, true);
        }

        // Check if origin is in the explicit allowed list
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // Allow all Netlify domains (including preview deployments)
        if (origin.endsWith('.netlify.app')) {
          return callback(null, true);
        }

        // Allow localhost for development
        if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
          return callback(null, true);
        }

        // Block other origins
        callback(null, false);
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
      preflightContinue: false,
      optionsSuccessStatus: 204,
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
    // Use PORT from environment (Railway sets this automatically)
    // Default to 3001 for local development (6000 is blocked by browsers)
    const port = process.env.PORT || 3001;
    await app.listen(port);

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
  } catch (error) {
    console.error('❌ Error starting application:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  // Don't exit - keep the server running
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error('Stack:', error.stack);
  // Don't exit - keep the server running
});

// Handle SIGTERM gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

bootstrap();
