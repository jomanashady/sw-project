"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAppraisalTemplateDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const performance_enums_1 = require("../enums/performance.enums");
const rating_scale_definition_dto_1 = require("./rating-scale-definition.dto");
const evaluation_criterion_dto_1 = require("./evaluation-criterion.dto");
class CreateAppraisalTemplateDto {
}
exports.CreateAppraisalTemplateDto = CreateAppraisalTemplateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppraisalTemplateDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppraisalTemplateDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(performance_enums_1.AppraisalTemplateType),
    __metadata("design:type", String)
], CreateAppraisalTemplateDto.prototype, "templateType", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => rating_scale_definition_dto_1.RatingScaleDefinitionDto),
    __metadata("design:type", rating_scale_definition_dto_1.RatingScaleDefinitionDto)
], CreateAppraisalTemplateDto.prototype, "ratingScale", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => evaluation_criterion_dto_1.EvaluationCriterionDto),
    __metadata("design:type", Array)
], CreateAppraisalTemplateDto.prototype, "criteria", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppraisalTemplateDto.prototype, "instructions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], CreateAppraisalTemplateDto.prototype, "applicableDepartmentIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], CreateAppraisalTemplateDto.prototype, "applicablePositionIds", void 0);
//# sourceMappingURL=create-appraisal-template.dto.js.map