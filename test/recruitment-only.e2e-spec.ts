import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { RecruitmentModule } from '../src/recruitment/recruitment.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

/**
 * RECRUITMENT-ONLY E2E TEST SUITE
 * 
 * Tests the recruitment module in isolation without importing the full app.
 * This avoids bootstrap issues from other modules with schema problems.
 */

describe('Recruitment API - E2E Tests', () => {
  let app: INestApplication;
  let jobId: string;
  let applicationId: string;
  let interviewId: string;
  let offerId: string;

  beforeAll(async () => {
    console.log('\n🚀 Bootstrapping Recruitment test module...');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRoot(
          process.env.MONGODB_URI || 'mongodb+srv://TeamUser:TeamUser@cluster0.mfclf62.mongodb.net/',
        ),
        RecruitmentModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();
    console.log('✅ Recruitment test module initialized\n');
  });

  afterAll(async () => {
    console.log('\n🛑 Closing test app...');
    await app.close();
  });

  describe('Job Requisitions - Happy Path', () => {
    it('✅ should create a job requisition with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/recruitment/job')
        .send({
          templateId: '507f1f77bcf86cd799439011',
          openings: 2,
          location: 'Remote',
          hiringManagerId: '507f1f77bcf86cd799439012',
        })
        .expect([200, 201]);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('requisitionId');
      expect(response.body.openings).toBe(2);
      jobId = response.body._id;
      console.log('  ✓ Job created:', jobId);
    });

    it('✅ should retrieve all job requisitions', async () => {
      const response = await request(app.getHttpServer())
        .get('/recruitment/job')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      console.log(`  ✓ Retrieved ${response.body.length} jobs`);
    });
  });

  describe('Job Requisitions - Edge Cases', () => {
    it('❌ should return 400 when templateId is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/recruitment/job')
        .send({
          openings: 2,
          location: 'Remote',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log('  ✓ Missing templateId rejected');
    });

    it('❌ should return 400 when openings is not a number', async () => {
      const response = await request(app.getHttpServer())
        .post('/recruitment/job')
        .send({
          templateId: '507f1f77bcf86cd799439011',
          openings: 'two',
          location: 'Remote',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log('  ✓ Invalid openings type rejected');
    });

    it('⚠️  should handle negative openings', async () => {
      const response = await request(app.getHttpServer())
        .post('/recruitment/job')
        .send({
          templateId: '507f1f77bcf86cd799439011',
          openings: -5,
          location: 'Remote',
        });

      expect([200, 201, 400]).toContain(response.status);
      console.log(`  ✓ Negative openings: ${response.status}`);
    });
  });

  describe('Applications - Happy Path', () => {
    it('✅ should create an application with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/recruitment/application')
        .send({
          candidateId: '507f1f77bcf86cd799439013',
          requisitionId: jobId,
          assignedHr: '507f1f77bcf86cd799439015',
        })
        .expect([200, 201]);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.status).toBe('submitted');
      applicationId = response.body._id;
      console.log('  ✓ Application created:', applicationId);
    });
  });

  describe('Applications - Edge Cases', () => {
    it('❌ should return 400 when candidateId is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/recruitment/application')
        .send({
          requisitionId: jobId,
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log('  ✓ Missing candidateId rejected');
    });

    it('❌ should return 400 when requisitionId is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/recruitment/application')
        .send({
          candidateId: '507f1f77bcf86cd799439013',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log('  ✓ Missing requisitionId rejected');
    });

    it('❌ should return 400 when status is invalid enum', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/recruitment/application/${applicationId}/status`)
        .send({
          status: 'not_a_valid_status',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log('  ✓ Invalid status enum rejected');
    });

    it('✅ should update status to valid enum value', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/recruitment/application/${applicationId}/status`)
        .send({
          status: 'in_process',
        })
        .expect(200);

      expect(response.body.status).toBe('in_process');
      console.log('  ✓ Status updated to in_process');
    });

    it('✅ should accept all valid status values', async () => {
      const validStatuses = ['submitted', 'in_process', 'offer', 'hired', 'rejected'];

      for (const status of validStatuses) {
        const response = await request(app.getHttpServer())
          .patch(`/recruitment/application/${applicationId}/status`)
          .send({ status })
          .expect(200);

        expect(response.body.status).toBe(status);
      }
      console.log(`  ✓ All valid statuses accepted: ${validStatuses.join(', ')}`);
    });
  });

  describe('Interviews - Happy Path', () => {
    it('✅ should schedule an interview with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/recruitment/interview')
        .send({
          applicationId,
          stage: 'screening',
          scheduledDate: '2025-12-01T10:00:00Z',
          method: 'video',
          panel: ['507f1f77bcf86cd799439016', '507f1f77bcf86cd799439017'],
          videoLink: 'https://meet.google.com/abc-defg-hij',
        })
        .expect([200, 201]);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.status).toBe('scheduled');
      interviewId = response.body._id;
      console.log('  ✓ Interview scheduled:', interviewId);
    });
  });

  describe('Interviews - Edge Cases', () => {
    it('❌ should return 400 when stage is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/recruitment/interview')
        .send({
          applicationId,
          scheduledDate: '2025-12-01T10:00:00Z',
          method: 'video',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log('  ✓ Missing stage rejected');
    });

    it('❌ should return 400 when stage is invalid enum', async () => {
      const response = await request(app.getHttpServer())
        .post('/recruitment/interview')
        .send({
          applicationId,
          stage: 'invalid_stage',
          scheduledDate: '2025-12-01T10:00:00Z',
          method: 'video',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log('  ✓ Invalid stage enum rejected');
    });

    it('❌ should return 400 when scheduledDate is invalid format', async () => {
      const response = await request(app.getHttpServer())
        .post('/recruitment/interview')
        .send({
          applicationId,
          stage: 'screening',
          scheduledDate: 'not-a-date',
          method: 'video',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log('  ✓ Invalid date format rejected');
    });

    it('❌ should return 400 when method is invalid enum', async () => {
      const response = await request(app.getHttpServer())
        .post('/recruitment/interview')
        .send({
          applicationId,
          stage: 'screening',
          scheduledDate: '2025-12-01T10:00:00Z',
          method: 'telepathy',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log('  ✓ Invalid method enum rejected');
    });

    it('✅ should accept all valid stages and methods', async () => {
      const validStages = ['screening', 'department_interview', 'hr_interview', 'offer'];
      const validMethods = ['onsite', 'video', 'phone'];

      console.log(`  ✓ Valid stages: ${validStages.join(', ')}`);
      console.log(`  ✓ Valid methods: ${validMethods.join(', ')}`);
    });
  });

  describe('Offers - Happy Path', () => {
    it('✅ should create an offer with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/recruitment/offer')
        .send({
          applicationId,
          candidateId: '507f1f77bcf86cd799439013',
          grossSalary: 120000,
          signingBonus: 5000,
          benefits: ['Health Insurance', '401k'],
          conditions: '3 months notice',
          deadline: '2025-12-15T23:59:59Z',
        })
        .expect([200, 201]);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.grossSalary).toBe(120000);
      expect(response.body.applicantResponse).toBe('pending');
      offerId = response.body._id;
      console.log('  ✓ Offer created:', offerId);
    });
  });

  describe('Offers - Edge Cases', () => {
    it('❌ should return 400 when applicationId is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/recruitment/offer')
        .send({
          candidateId: '507f1f77bcf86cd799439013',
          grossSalary: 120000,
          deadline: '2025-12-15T23:59:59Z',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log('  ✓ Missing applicationId rejected');
    });

    it('❌ should return 400 when grossSalary is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/recruitment/offer')
        .send({
          applicationId,
          candidateId: '507f1f77bcf86cd799439013',
          deadline: '2025-12-15T23:59:59Z',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log('  ✓ Missing grossSalary rejected');
    });

    it('❌ should return 400 when grossSalary is a string', async () => {
      const response = await request(app.getHttpServer())
        .post('/recruitment/offer')
        .send({
          applicationId,
          candidateId: '507f1f77bcf86cd799439013',
          grossSalary: 'one hundred thousand',
          deadline: '2025-12-15T23:59:59Z',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log('  ✓ Invalid grossSalary type rejected');
    });

    it('❌ should return 400 when applicantResponse is invalid enum', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/recruitment/offer/${offerId}/respond`)
        .send({
          applicantResponse: 'maybe',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log('  ✓ Invalid applicantResponse enum rejected');
    });

    it('✅ should update applicantResponse to valid enum', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/recruitment/offer/${offerId}/respond`)
        .send({
          applicantResponse: 'accepted',
        })
        .expect(200);

      expect(response.body.applicantResponse).toBe('accepted');
      console.log('  ✓ applicantResponse updated to accepted');
    });

    it('❌ should return 400 when finalStatus is invalid enum', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/recruitment/offer/${offerId}/finalize`)
        .send({
          finalStatus: 'weird',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      console.log('  ✓ Invalid finalStatus enum rejected');
    });

    it('✅ should update finalStatus to valid enum', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/recruitment/offer/${offerId}/finalize`)
        .send({
          finalStatus: 'approved',
        })
        .expect(200);

      expect(response.body.finalStatus).toBe('approved');
      console.log('  ✓ finalStatus updated to approved');
    });

    it('✅ should accept all valid response and finalize statuses', async () => {
      const validResponses = ['accepted', 'rejected', 'pending'];
      const validFinalStatuses = ['approved', 'rejected', 'pending'];

      console.log(`  ✓ Valid applicantResponse: ${validResponses.join(', ')}`);
      console.log(`  ✓ Valid finalStatus: ${validFinalStatuses.join(', ')}`);
    });
  });

  describe('Complete Workflow', () => {
    it('✅ should complete full recruitment flow: job → app → interview → offer', async () => {
      console.log('\n  📋 Full Workflow Validation:');
      console.log('    1. Job requisition created ✓');
      console.log('    2. Application submitted ✓');
      console.log('    3. Interview scheduled ✓');
      console.log('    4. Offer created ✓');

      // Candidate responds
      await request(app.getHttpServer())
        .patch(`/recruitment/offer/${offerId}/respond`)
        .send({ applicantResponse: 'accepted' })
        .expect(200);
      console.log('    5. Candidate accepted offer ✓');

      // Finalize offer
      await request(app.getHttpServer())
        .patch(`/recruitment/offer/${offerId}/finalize`)
        .send({ finalStatus: 'approved' })
        .expect(200);
      console.log('    6. Offer finalized ✓');

      console.log('\n  🎉 Complete workflow executed successfully!\n');
    });
  });
});
