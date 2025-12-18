// src/main.ts
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
    
    // Build allowed origins list
    const allowedOrigins = [
      frontendUrl,
      'http://localhost:3000',
      'http://localhost:3001',
      'https://hr-systemm.netlify.app',
    ];
    
    // Remove duplicates and filter out undefined
    const uniqueOrigins = [...new Set(allowedOrigins.filter(Boolean))];
    
    console.log('🌐 CORS Allowed Origins:', uniqueOrigins);
    console.log('🌐 Frontend URL from env:', frontendUrl);
    
    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, or curl requests)
        if (!origin) {
          console.log('✅ CORS: Allowing request with no origin');
          return callback(null, true);
        }
        
        // Check if origin is in allowed list
        if (uniqueOrigins.includes(origin)) {
          console.log(`✅ CORS: Allowing origin: ${origin}`);
          return callback(null, true);
        }
        
        // Allow all Netlify domains (including preview deployments)
        if (origin.endsWith('.netlify.app')) {
          console.log(`✅ CORS: Allowing Netlify domain: ${origin}`);
          return callback(null, true);
        }
        
        // Allow localhost for development
        if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
          console.log(`✅ CORS: Allowing localhost: ${origin}`);
          return callback(null, true);
        }
        
        // Log blocked origins for debugging
        console.log(`❌ CORS: Blocking origin: ${origin}`);
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
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit, just log the error
});

// Handle SIGTERM gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

bootstrap();
