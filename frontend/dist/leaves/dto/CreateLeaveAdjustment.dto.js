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
exports.CreateLeaveAdjustmentDto = void 0;
const class_validator_1 = require("class-validator");
const adjustment_type_enum_1 = require("../enums/adjustment-type.enum");
class CreateLeaveAdjustmentDto {
}
exports.CreateLeaveAdjustmentDto = CreateLeaveAdjustmentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeaveAdjustmentDto.prototype, "employeeId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeaveAdjustmentDto.prototype, "leaveTypeId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(adjustment_type_enum_1.AdjustmentType),
    __metadata("design:type", String)
], CreateLeaveAdjustmentDto.prototype, "adjustmentType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLeaveAdjustmentDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeaveAdjustmentDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeaveAdjustmentDto.prototype, "hrUserId", void 0);
//# sourceMappingURL=CreateLeaveAdjustment.dto.js.map