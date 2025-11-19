import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Candidate, CandidateSchema } from './schemas/candidate.schema';
import { Job, JobSchema } from './schemas/job.schema';
import { Application, ApplicationSchema } from './schemas/application.schema';
import { CommunicationLog, CommunicationLogSchema } from './schemas/communication-log.schema';
import { Interview, InterviewSchema } from './schemas/interview.schema';
import { InterviewFeedback, InterviewFeedbackSchema } from './schemas/interview-feedback.schema';
import { Offer, OfferSchema } from './schemas/offer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
      { name: Job.name, schema: JobSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: CommunicationLog.name, schema: CommunicationLogSchema },
      { name: Interview.name, schema: InterviewSchema },
      { name: InterviewFeedback.name, schema: InterviewFeedbackSchema },
      { name: Offer.name, schema: OfferSchema },
    ]),
  ],
  // Any module that imports RecModule now has access to all these models
  exports: [MongooseModule],
})
export class RecModule {}
