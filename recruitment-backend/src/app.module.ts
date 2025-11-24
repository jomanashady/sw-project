/*import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}*/

import { Module } from '@nestjs/common';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
   imports: [
    // Read .env variables globally (MONGODB_URI, PORT, etc.)
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Connect to MongoDB using env
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI,
      }),
    }),
  RecruitmentModule,
   ],
    controllers: [AppController],
  providers: [AppService],

})
export class AppModule {}

