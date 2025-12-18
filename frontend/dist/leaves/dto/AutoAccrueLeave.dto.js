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
exports.AccrueAllEmployeesDto = exports.AutoAccrueLeaveDto = exports.AccrualType = void 0;
const class_validator_1 = require("class-validator");
var AccrualType;
(function (AccrualType) {
    AccrualType["MONTHLY"] = "monthly";
    AccrualType["YEARLY"] = "yearly";
    AccrualType["QUARTERLY"] = "quarterly";
    AccrualType["SEMI_ANNUAL"] = "semi_annual";
})(AccrualType || (exports.AccrualType = AccrualType = {}));
class AutoAccrueLeaveDto {
}
exports.AutoAccrueLeaveDto = AutoAccrueLeaveDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AutoAccrueLeaveDto.prototype, "employeeId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AutoAccrueLeaveDto.prototype, "leaveTypeId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AutoAccrueLeaveDto.prototype, "accrualAmount", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(AccrualType),
    __metadata("design:type", String)
], AutoAccrueLeaveDto.prototype, "accrualType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AutoAccrueLeaveDto.prototype, "policyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], AutoAccrueLeaveDto.prototype, "accrualDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AutoAccrueLeaveDto.prototype, "notes", void 0);
class AccrueAllEmployeesDto {
}
exports.AccrueAllEmployeesDto = AccrueAllEmployeesDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccrueAllEmployeesDto.prototype, "leaveTypeId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AccrueAllEmployeesDto.prototype, "accrualAmount", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(AccrualType),
    __metadata("design:type", String)
], AccrueAllEmployeesDto.prototype, "accrualType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccrueAllEmployeesDto.prototype, "policyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccrueAllEmployeesDto.prototype, "departmentId", void 0);
//# sourceMappingURL=AutoAccrueLeave.dto.js.map