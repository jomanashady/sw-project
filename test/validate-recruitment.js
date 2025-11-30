#!/usr/bin/env node

/**
 * RECRUITMENT API - MANUAL VALIDATION SCRIPT
 * 
 * Run this after starting the server (npm run start:dev) to validate
 * all recruitment endpoints and edge cases.
 * 
 * Usage: node test/validate-recruitment.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
const ENDPOINTS = {
  JOB: '/recruitment/job',
  APP: '/recruitment/application',
  INTERVIEW: '/recruitment/interview',
  OFFER: '/recruitment/offer',
};

let testsPassed = 0;
let testsFailed = 0;
let jobId = '';
let applicationId = '';
let offerId = '';

// Helper to make HTTP requests
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test assertion
async function test(name, fn, expectedStatus) {
  try {
    const result = await fn();
    const passed = expectedStatus.includes(result.status);

    if (passed) {
      console.log(`  ✓ ${name}`);
      testsPassed++;
    } else {
      console.log(
        `  ✗ ${name} - Expected ${expectedStatus}, got ${result.status}`,
      );
      if (result.body?.message) console.log(`    Message: ${result.body.message}`);
      testsFailed++;
    }
    return result;
  } catch (error) {
    console.log(`  ✗ ${name} - ${error.message}`);
    testsFailed++;
    return null;
  }
}

// Main test suite
async function runTests() {
  console.log('\n🚀 RECRUITMENT API VALIDATION SUITE\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  // Job Requisitions - Happy Path
  console.log('📋 Job Requisitions - Happy Path');
  let res = await test(
    'Create job requisition',
    () =>
      request('POST', ENDPOINTS.JOB, {
        templateId: '507f1f77bcf86cd799439011',
        openings: 2,
        location: 'Remote',
        hiringManagerId: '507f1f77bcf86cd799439012',
      }),
    [200, 201],
  );
  if (res?.body?._id) jobId = res.body._id;

  await test('Get all jobs', () => request('GET', ENDPOINTS.JOB), [200]);

  // Job Requisitions - Edge Cases
  console.log('\n⚠️  Job Requisitions - Edge Cases');
  await test(
    'Missing templateId returns 400',
    () =>
      request('POST', ENDPOINTS.JOB, {
        openings: 2,
        location: 'Remote',
      }),
    [400],
  );

  await test(
    'Invalid openings type returns 400',
    () =>
      request('POST', ENDPOINTS.JOB, {
        templateId: '507f1f77bcf86cd799439011',
        openings: 'two',
        location: 'Remote',
      }),
    [400],
  );

  // Applications - Happy Path
  console.log('\n📋 Applications - Happy Path');
  res = await test(
    'Create application',
    () =>
      request('POST', ENDPOINTS.APP, {
        candidateId: '507f1f77bcf86cd799439013',
        requisitionId: jobId,
        assignedHr: '507f1f77bcf86cd799439015',
      }),
    [200, 201],
  );
  if (res?.body?._id) applicationId = res.body._id;

  // Applications - Edge Cases
  console.log('\n⚠️  Applications - Edge Cases');
  await test(
    'Missing candidateId returns 400',
    () =>
      request('POST', ENDPOINTS.APP, {
        requisitionId: jobId,
      }),
    [400],
  );

  await test(
    'Missing requisitionId returns 400',
    () =>
      request('POST', ENDPOINTS.APP, {
        candidateId: '507f1f77bcf86cd799439013',
      }),
    [400],
  );

  await test(
    'Invalid status enum returns 400',
    () =>
      request('PATCH', `${ENDPOINTS.APP}/${applicationId}/status`, {
        status: 'not_a_valid_status',
      }),
    [400],
  );

  await test(
    'Valid status update returns 200',
    () =>
      request('PATCH', `${ENDPOINTS.APP}/${applicationId}/status`, {
        status: 'in_process',
      }),
    [200],
  );

  // Interviews - Happy Path
  console.log('\n📋 Interviews - Happy Path');
  await test(
    'Schedule interview',
    () =>
      request('POST', ENDPOINTS.INTERVIEW, {
        applicationId,
        stage: 'screening',
        scheduledDate: '2025-12-01T10:00:00Z',
        method: 'video',
        panel: ['507f1f77bcf86cd799439016'],
      }),
    [200, 201],
  );

  // Interviews - Edge Cases
  console.log('\n⚠️  Interviews - Edge Cases');
  await test(
    'Missing stage returns 400',
    () =>
      request('POST', ENDPOINTS.INTERVIEW, {
        applicationId,
        scheduledDate: '2025-12-01T10:00:00Z',
        method: 'video',
      }),
    [400],
  );

  await test(
    'Invalid stage enum returns 400',
    () =>
      request('POST', ENDPOINTS.INTERVIEW, {
        applicationId,
        stage: 'invalid_stage',
        scheduledDate: '2025-12-01T10:00:00Z',
        method: 'video',
      }),
    [400],
  );

  await test(
    'Invalid date format returns 400',
    () =>
      request('POST', ENDPOINTS.INTERVIEW, {
        applicationId,
        stage: 'screening',
        scheduledDate: 'not-a-date',
        method: 'video',
      }),
    [400],
  );

  await test(
    'Invalid method enum returns 400',
    () =>
      request('POST', ENDPOINTS.INTERVIEW, {
        applicationId,
        stage: 'screening',
        scheduledDate: '2025-12-01T10:00:00Z',
        method: 'telepathy',
      }),
    [400],
  );

  // Offers - Happy Path
  console.log('\n📋 Offers - Happy Path');
  res = await test(
    'Create offer',
    () =>
      request('POST', ENDPOINTS.OFFER, {
        applicationId,
        candidateId: '507f1f77bcf86cd799439013',
        grossSalary: 120000,
        signingBonus: 5000,
        benefits: ['Health Insurance'],
        deadline: '2025-12-15T23:59:59Z',
      }),
    [200, 201],
  );
  if (res?.body?._id) offerId = res.body._id;

  // Offers - Edge Cases
  console.log('\n⚠️  Offers - Edge Cases');
  await test(
    'Missing applicationId returns 400',
    () =>
      request('POST', ENDPOINTS.OFFER, {
        candidateId: '507f1f77bcf86cd799439013',
        grossSalary: 120000,
        deadline: '2025-12-15T23:59:59Z',
      }),
    [400],
  );

  await test(
    'Missing grossSalary returns 400',
    () =>
      request('POST', ENDPOINTS.OFFER, {
        applicationId,
        candidateId: '507f1f77bcf86cd799439013',
        deadline: '2025-12-15T23:59:59Z',
      }),
    [400],
  );

  await test(
    'Invalid grossSalary type returns 400',
    () =>
      request('POST', ENDPOINTS.OFFER, {
        applicationId,
        candidateId: '507f1f77bcf86cd799439013',
        grossSalary: 'one hundred',
        deadline: '2025-12-15T23:59:59Z',
      }),
    [400],
  );

  await test(
    'Invalid applicantResponse enum returns 400',
    () =>
      request('PATCH', `${ENDPOINTS.OFFER}/${offerId}/respond`, {
        applicantResponse: 'maybe',
      }),
    [400],
  );

  await test(
    'Valid applicantResponse update returns 200',
    () =>
      request('PATCH', `${ENDPOINTS.OFFER}/${offerId}/respond`, {
        applicantResponse: 'accepted',
      }),
    [200],
  );

  await test(
    'Invalid finalStatus enum returns 400',
    () =>
      request('PATCH', `${ENDPOINTS.OFFER}/${offerId}/finalize`, {
        finalStatus: 'weird',
      }),
    [400],
  );

  await test(
    'Valid finalStatus update returns 200',
    () =>
      request('PATCH', `${ENDPOINTS.OFFER}/${offerId}/finalize`, {
        finalStatus: 'approved',
      }),
    [200],
  );

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✓ Passed: ${testsPassed}`);
  console.log(`✗ Failed: ${testsFailed}`);
  console.log(`Total:   ${testsPassed + testsFailed}`);
  console.log(`${'='.repeat(60)}\n`);

  if (testsFailed === 0) {
    console.log('🎉 All tests passed!\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
