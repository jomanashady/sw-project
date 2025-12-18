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
exports.CreateLeavePolicyDto = void 0;
const class_validator_1 = require("class-validator");
const accrual_method_enum_1 = require("../enums/accrual-method.enum");
const rounding_rule_enum_1 = require("../enums/rounding-rule.enum");
class CreateLeavePolicyDto {
}
exports.CreateLeavePolicyDto = CreateLeavePolicyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeavePolicyDto.prototype, "leaveTypeId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(accrual_method_enum_1.AccrualMethod),
    __metadata("design:type", String)
], CreateLeavePolicyDto.prototype, "accrualMethod", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLeavePolicyDto.prototype, "monthlyRate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLeavePolicyDto.prototype, "yearlyRate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(rounding_rule_enum_1.RoundingRule),
    __metadata("design:type", String)
], CreateLeavePolicyDto.prototype, "roundingRule", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLeavePolicyDto.prototype, "maxCarryForward", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLeavePolicyDto.prototype, "minNoticeDays", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLeavePolicyDto.prototype, "maxConsecutiveDays", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateLeavePolicyDto.prototype, "eligibility", void 0);
//# sourceMappingURL=CreateLeavePolicy.dto.js.map