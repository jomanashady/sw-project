import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // -----------------------------------
    // CORS CONFIGURATION
    // -----------------------------------
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Build allowed origins list - include all possible Netlify URLs
    const allowedOrigins = [
      frontendUrl,
      'http://localhost:3000',
      'http://localhost:3001',
      'https://hr-systemm.netlify.app',
      'https://hr-syst.netlify.app',
    ].filter(Boolean);
    
    // Log CORS configuration only once at startup (reduced logging for Railway rate limits)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🌐 CORS configured for:', allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'default origins');
    }
    
    // Use a function to check origins dynamically (no logging to avoid Railway rate limits)
    const corsOptions = {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps, Postman, or curl requests)
        if (!origin) {
          return callback(null, true);
        }

        // Check if origin is in the allowed list
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

        // Block other origins - only log in development (rare case)
        if (process.env.NODE_ENV !== 'production') {
          console.warn('❌ CORS: Blocking origin:', origin);
        }
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
    };
    
    app.enableCors(corsOptions);

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

    // Reduced logging for Railway rate limits - only log essential startup info
    console.log(`🚀 HR System API started on port ${port}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📍 Local: http://localhost:${port}/api/v1`);
      console.log(`🌐 Frontend: ${frontendUrl}`);
    }
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
