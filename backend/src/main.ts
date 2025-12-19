import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as Express from 'express';
import cors from 'cors';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, { 
      logger: ['error', 'warn'], // Only log errors and warnings
    });
    
    // -----------------------------------
    // CORS CONFIGURATION - MUST BE FIRST
    // -----------------------------------
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Build allowed origins list - explicitly include all Netlify domains
    const allowedOrigins = [
      frontendUrl,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5000',
      'https://hr-systemm.netlify.app',
      'https://hr-syst.netlify.app',
    ].filter(Boolean);
    
    console.log('🌐 CORS Allowed Origins:', allowedOrigins);
    console.log('🌐 Frontend URL from env:', frontendUrl);

    // Function to check if origin should be allowed
    const isOriginAllowed = (origin: string | undefined): boolean => {
      if (!origin) {
        return true; // Allow requests with no origin (mobile apps, Postman, curl)
      }
      if (allowedOrigins.includes(origin)) {
        return true;
      }
      if (origin.endsWith('.netlify.app')) {
        console.log(`✅ CORS: Allowing Netlify domain: ${origin}`);
        return true; // Allow ALL Netlify domains
      }
      if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
        return true;
      }
      return false;
    };

    // Get Express app FIRST - before any NestJS configuration
    const expressApp = app.getHttpAdapter().getInstance();

    // CRITICAL: Handle OPTIONS requests FIRST with explicit error handling
    // This ensures OPTIONS never crashes the server and always responds quickly
    expressApp.use((req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
      if (req.method === 'OPTIONS') {
        try {
          const origin = req.headers.origin as string | undefined;
          const isAllowed = isOriginAllowed(origin);
          
          if (isAllowed && origin) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Max-Age', '86400');
            res.setHeader('Access-Control-Expose-Headers', 'Authorization');
            console.log(`✅ OPTIONS Preflight: ${origin} - ALLOWED`);
            return res.status(204).end();
          } else {
            console.log(`❌ OPTIONS Preflight: ${origin || 'no origin'} - BLOCKED`);
            return res.status(403).json({ message: 'CORS policy: Origin not allowed' });
          }
        } catch (error) {
          // Never let OPTIONS crash the server - always return a response
          console.error('❌ Error handling OPTIONS:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
      }
      next();
    });

    // Use cors package for reliable CORS handling at Express level
    // This handles non-OPTIONS requests
    expressApp.use(cors({
      origin: (origin, callback) => {
        try {
          const isAllowed = isOriginAllowed(origin);
          if (isAllowed) {
            if (origin) {
              console.log(`✅ Express CORS: Allowing origin: ${origin}`);
            }
            callback(null, true);
          } else {
            console.log(`❌ Express CORS: Blocking origin: ${origin || 'no origin'}`);
            callback(null, false);
          }
        } catch (error) {
          // Never let CORS callback crash
          console.error('❌ Error in CORS callback:', error);
          callback(null, false);
        }
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
      maxAge: 86400,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    }));

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
    const port = process.env.PORT || 3001;
    
    // Bind to 0.0.0.0 to accept connections from Railway
    await app.listen(port, '0.0.0.0');

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
    console.log('✅ Server started successfully and listening for requests');
    console.log(`✅ Ready to handle requests on port ${port}`);
    console.log(`✅ CORS configured for: ${allowedOrigins.length} origins`);
    console.log(`✅ Health endpoint: http://0.0.0.0:${port}/api/v1/health`);

  } catch (error) {
    console.error('❌ Error starting application:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  // Don't exit - keep the server running, but log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error('Stack:', error.stack);
  // Don't exit - keep the server running
});

// Handle SIGTERM gracefully (Railway sends this to stop containers)
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

// Start the application
bootstrap();
