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
exports.CreateAppraisalCycleDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const performance_enums_1 = require("../enums/performance.enums");
const cycle_template_assignment_dto_1 = require("./cycle-template-assignment.dto");
const cycle_assignment_dto_1 = require("./cycle-assignment.dto");
class CreateAppraisalCycleDto {
}
exports.CreateAppraisalCycleDto = CreateAppraisalCycleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppraisalCycleDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppraisalCycleDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(performance_enums_1.AppraisalTemplateType),
    __metadata("design:type", String)
], CreateAppraisalCycleDto.prototype, "cycleType", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAppraisalCycleDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAppraisalCycleDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAppraisalCycleDto.prototype, "managerDueDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAppraisalCycleDto.prototype, "employeeAcknowledgementDueDate", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => cycle_template_assignment_dto_1.CycleTemplateAssignmentDto),
    __metadata("design:type", Array)
], CreateAppraisalCycleDto.prototype, "templateAssignments", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => cycle_assignment_dto_1.CycleAssignmentDto),
    __metadata("design:type", Array)
], CreateAppraisalCycleDto.prototype, "assignments", void 0);
//# sourceMappingURL=create-appraisal-cycle.dto.js.map