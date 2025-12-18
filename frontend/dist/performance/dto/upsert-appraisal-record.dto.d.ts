import { RatingEntryDto } from './rating-entry.dto';
export declare class UpsertAppraisalRecordDto {
    ratings: RatingEntryDto[];
    totalScore?: number;
    overallRatingLabel?: string;
    managerSummary?: string;
    strengths?: string;
    improvementAreas?: string;
}
