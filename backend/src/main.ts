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
    
    // Use cors package for reliable CORS handling at Express level
    // This MUST run before NestJS processes anything
    expressApp.use(cors({
      origin: (origin, callback) => {
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
