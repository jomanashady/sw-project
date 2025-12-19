import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn'],
    });

    // -----------------------------------
    // CORS CONFIGURATION
    // -----------------------------------
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const allowedOrigins = [
      frontendUrl,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5000',
      'https://hr-syst.netlify.app',
    ].filter(Boolean);

    console.log('🌐 CORS Allowed Origins:', allowedOrigins);
    console.log('🌐 Frontend URL from env:', frontendUrl);

    app.enableCors({
      origin: (origin, callback) => {
        if (!origin) {
          // Allow requests with no origin (mobile apps, Postman, curl)
          return callback(null, true);
        }

        const isAllowed =
          allowedOrigins.includes(origin) ||
          origin.endsWith('.netlify.app') ||
          origin.startsWith('http://localhost:') ||
          origin.startsWith('https://localhost:');

        if (isAllowed) {
          console.log(`✅ CORS: Allowing origin: ${origin}`);
          return callback(null, true);
        }

        console.log(`❌ CORS: Blocking origin: ${origin}`);
        return callback(new Error('Origin not allowed by CORS'), false);
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
    });

    // -----------------------------------
    // GLOBAL VALIDATION PIPE
    // -----------------------------------
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
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
    console.log(`✅ Readiness endpoint: http://0.0.0.0:${port}/api/v1/ready`);
    console.log('✅ Server is READY - Railway can now health check');
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
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error('Stack:', error.stack);
});

// Handle SIGTERM gracefully (Railway sends this to stop containers)
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

bootstrap();
