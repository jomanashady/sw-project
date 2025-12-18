import { RatingScaleDefinitionDto } from './rating-scale-definition.dto';
import { EvaluationCriterionDto } from './evaluation-criterion.dto';
export declare class UpdateAppraisalTemplateDto {
    description?: string;
    ratingScale?: RatingScaleDefinitionDto;
    criteria?: EvaluationCriterionDto[];
    instructions?: string;
    applicableDepartmentIds?: string[];
    applicablePositionIds?: string[];
    isActive?: boolean;
}
