import { Types } from 'mongoose';

export const employeeSeedData = [
  {
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John E. Doe',
    nationalId: 'NAT001001',
    gender: 'MALE',
    maritalStatus: 'MARRIED',
    personalEmail: 'john.doe@gmail.com',
    mobilePhone: '+1 555 201 1122',
    address: {
      city: 'New York',
      streetAddress: '742 Evergreen Terrace',
      country: 'USA',
    },

    employeeNumber: 'EMP-001',
    dateOfHire: new Date('2021-06-01'),
    workEmail: 'john.doe@company.com',
    biography: 'Senior software engineer.',
    contractStartDate: new Date('2021-06-01'),
    contractType: 'FULL_TIME_CONTRACT',
    workType: 'FULL_TIME',
    status: 'ACTIVE',

    primaryPositionId: new Types.ObjectId(),
    primaryDepartmentId: new Types.ObjectId(),
    supervisorPositionId: new Types.ObjectId(),
    payGradeId: new Types.ObjectId(),
  },

  {
    firstName: 'Sarah',
    lastName: 'Connor',
    fullName: 'Sarah Connor',
    nationalId: 'NAT001002',
    gender: 'FEMALE',
    maritalStatus: 'SINGLE',
    personalEmail: 'sarah.connor@gmail.com',
    mobilePhone: '+1 555 302 2233',

    employeeNumber: 'EMP-002',
    dateOfHire: new Date('2023-01-15'),
    workEmail: 'sarah.connor@company.com',
    contractType: 'FULL_TIME_CONTRACT',
    contractStartDate: new Date('2023-01-15'),
    contractEndDate: new Date('2024-01-15'),
    workType: 'PART_TIME',

    primaryPositionId: new Types.ObjectId(),
    primaryDepartmentId: new Types.ObjectId(),
  },

  {
    firstName: 'Michael',
    lastName: 'Lee',
    fullName: 'Michael Lee',
    nationalId: 'NAT001003',
    gender: 'MALE',

    personalEmail: 'michael.lee@gmail.com',
    mobilePhone: '+1 555 403 3344',

    employeeNumber: 'EMP-003',
    dateOfHire: new Date('2020-04-02'),
    workEmail: 'michael.lee@company.com',
    contractType: 'FULL_TIME_CONTRACT',
    workType: 'PART_TIME',
    status: 'ACTIVE',

    primaryPositionId: new Types.ObjectId(),
    primaryDepartmentId: new Types.ObjectId(),

    lastAppraisalDate: new Date('2023-12-10'),
    lastAppraisalScore: 4.4,
    lastAppraisalRatingLabel: 'Exceeds Expectations',
    lastAppraisalScaleType: 'FIVE_POINT',
  },
];
