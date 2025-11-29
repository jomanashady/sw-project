import { NestFactory } from '@nestjs/core';
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

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Payroll Configuration API')
    .setDescription('HR2 System - Payroll Configuration Backend')
    .setVersion('1.0')
    .addTag('payroll-configuration')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
  console.log(`🚀 Application running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);
}
bootstrap();
