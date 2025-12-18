import { AppraisalTemplateType } from '../enums/performance.enums';
import { RatingScaleDefinitionDto } from './rating-scale-definition.dto';
import { EvaluationCriterionDto } from './evaluation-criterion.dto';
export declare class CreateAppraisalTemplateDto {
    name: string;
    description?: string;
    templateType: AppraisalTemplateType;
    ratingScale: RatingScaleDefinitionDto;
    criteria: EvaluationCriterionDto[];
    instructions?: string;
    applicableDepartmentIds?: string[];
    applicablePositionIds?: string[];
}
