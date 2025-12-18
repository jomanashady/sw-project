import { AppraisalRatingScaleType } from '../enums/performance.enums';
export declare class RatingScaleDefinitionDto {
    type: AppraisalRatingScaleType;
    min: number;
    max: number;
    step?: number;
    labels?: string[];
}
