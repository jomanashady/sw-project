// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
  try {
    const candidates = [
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), 'src', '.env'),
    ];
    for (const envPath of candidates) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content
          .split(/\r?\n/)
          .filter((line) => line && !line.startsWith('#'))
          .forEach((line) => {
            const idx = line.indexOf('=');
            if (idx > -1) {
              const key = line.slice(0, idx).trim();
              const val = line.slice(idx + 1).trim();
              if (!(key in process.env)) {
                process.env[key] = val;
              }
            }
          });
        break;
      }
    }
  } catch {}
}

async function bootstrap() {
  loadEnv();
  const app = await NestFactory.create(AppModule);

  // -----------------------------------
  // CORS CONFIGURATION
  // -----------------------------------
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // -----------------------------------
  // GLOBAL VALIDATION PIPE
  // -----------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,               // remove unexpected fields
      forbidNonWhitelisted: true,    // throw error for invalid fields
      transform: true,               // transforms payloads to dto classes
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
  // SWAGGER CONFIGURATION
  // -----------------------------------
  const config = new DocumentBuilder()
    .setTitle('HR Management System API')
    .setDescription('API documentation for HR Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication')
    .addTag('Employee Profile', 'Employee information & related operations')
    .addTag('Organization Structure', 'Departments & Positions')
    .addTag('Performance Management', 'Appraisals, cycles, templates, records')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  // -----------------------------------
  // START SERVER
  // -----------------------------------
  const port = process.env.PORT || 5000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
