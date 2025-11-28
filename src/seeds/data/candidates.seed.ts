// src/database/seeders/data/candidates.seed.ts
import { Types } from 'mongoose';

export const candidateSeedData = [
  {
    firstName: 'Alice',
    lastName: 'Wong',
    nationalId: 'CAND10001',
    candidateNumber: 'CAND-001',
    departmentId: new Types.ObjectId(),
    positionId: new Types.ObjectId(),
    applicationDate: new Date('2024-01-10'),
    status: 'APPLIED',
    personalEmail: 'alice.wong@example.com', // must be unique
    resumeUrl: 'https://example.com/resume-alice.pdf',
  },
  {
    firstName: 'Tom',
    lastName: 'Henderson',
    nationalId: 'CAND10002',
    candidateNumber: 'CAND-002',
    departmentId: new Types.ObjectId(),
    positionId: new Types.ObjectId(),
    applicationDate: new Date('2024-01-15'),
    status: 'INTERVIEW',
    personalEmail: 'tom.henderson@example.com', // ✅ must be unique
  },
];
