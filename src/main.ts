import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
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

  await app.listen(3000);
  console.log('🚀 Application running on: http://localhost:3000');
  console.log('📚 API Documentation: http://localhost:3000/api');
}
bootstrap();