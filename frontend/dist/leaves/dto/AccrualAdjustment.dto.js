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
exports.AccrualSuspensionDto = exports.AccrualAdjustmentDto = exports.AccrualAdjustmentType = void 0;
const class_validator_1 = require("class-validator");
var AccrualAdjustmentType;
(function (AccrualAdjustmentType) {
    AccrualAdjustmentType["SUSPENSION"] = "suspension";
    AccrualAdjustmentType["REDUCTION"] = "reduction";
    AccrualAdjustmentType["ADJUSTMENT"] = "adjustment";
    AccrualAdjustmentType["RESTORATION"] = "restoration";
})(AccrualAdjustmentType || (exports.AccrualAdjustmentType = AccrualAdjustmentType = {}));
class AccrualAdjustmentDto {
}
exports.AccrualAdjustmentDto = AccrualAdjustmentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccrualAdjustmentDto.prototype, "employeeId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccrualAdjustmentDto.prototype, "leaveTypeId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(AccrualAdjustmentType),
    __metadata("design:type", String)
], AccrualAdjustmentDto.prototype, "adjustmentType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AccrualAdjustmentDto.prototype, "adjustmentAmount", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], AccrualAdjustmentDto.prototype, "fromDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], AccrualAdjustmentDto.prototype, "toDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccrualAdjustmentDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccrualAdjustmentDto.prototype, "notes", void 0);
class AccrualSuspensionDto {
}
exports.AccrualSuspensionDto = AccrualSuspensionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccrualSuspensionDto.prototype, "employeeId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccrualSuspensionDto.prototype, "leaveTypeId", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], AccrualSuspensionDto.prototype, "suspensionFromDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], AccrualSuspensionDto.prototype, "suspensionToDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccrualSuspensionDto.prototype, "suspensionReason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccrualSuspensionDto.prototype, "notes", void 0);
//# sourceMappingURL=AccrualAdjustment.dto.js.map