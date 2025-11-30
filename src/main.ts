import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

//zawedt di
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //3shan myghayarsh el schemas
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(process.env.PORT ?? 5000);
  console.log(`Application is running on port ${process.env.PORT ?? 5000}`);
}
bootstrap();
