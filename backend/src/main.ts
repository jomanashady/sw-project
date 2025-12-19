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
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000' || 'http://localhost:5000';

    // Build allowed origins list - explicitly include all Netlify domains
    const allowedOrigins = [
      frontendUrl,
      'http://localhost:5000',
      'http://localhost:3000',
      //'https://hr-systemm.netlify.app',  // ensure this is correct
      'https://hr-syst.netlify.app',     // ensure this is correct
    ].filter(Boolean);

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

// Start the application
bootstrap();
