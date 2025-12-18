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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileChangeRequestService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const ep_change_request_schema_1 = require("../models/ep-change-request.schema");
const employee_profile_enums_1 = require("../enums/employee-profile.enums");
let ProfileChangeRequestService = class ProfileChangeRequestService {
    constructor(changeRequestModel) {
        this.changeRequestModel = changeRequestModel;
    }
    async create(employeeId, createDto) {
        const requestId = await this.generateRequestId();
        const changeRequest = await this.changeRequestModel.create({
            requestId,
            employeeProfileId: new mongoose_2.Types.ObjectId(employeeId),
            requestDescription: createDto.requestDescription,
            reason: createDto.reason,
            status: employee_profile_enums_1.ProfileChangeStatus.PENDING,
            submittedAt: new Date(),
        });
        return changeRequest;
    }
    async findAll(query) {
        const filter = {};
        if (query.status) {
            filter.status = query.status;
        }
        if (query.employeeId) {
            filter.employeeProfileId = new mongoose_2.Types.ObjectId(query.employeeId);
        }
        return this.changeRequestModel
            .find(filter)
            .populate('employeeProfileId', 'firstName lastName employeeNumber')
            .sort({ submittedAt: -1 })
            .exec();
    }
    async findOne(id) {
        const request = await this.changeRequestModel
            .findById(id)
            .populate('employeeProfileId')
            .exec();
        if (!request) {
            throw new common_1.NotFoundException(`Change request with ID ${id} not found`);
        }
        return request;
    }
    async process(id, processDto) {
        const request = await this.findOne(id);
        if (request.status !== employee_profile_enums_1.ProfileChangeStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending requests can be processed');
        }
        const updated = await this.changeRequestModel.findByIdAndUpdate(id, {
            $set: {
                status: processDto.status,
                processedAt: new Date(),
                reason: processDto.reason || request.reason,
            },
        }, { new: true });
        return updated;
    }
    async cancel(id, employeeId) {
        const request = await this.findOne(id);
        if (request.employeeProfileId.toString() !== employeeId) {
            throw new common_1.BadRequestException('You can only cancel your own requests');
        }
        if (request.status !== employee_profile_enums_1.ProfileChangeStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending requests can be canceled');
        }
        const updated = await this.changeRequestModel.findByIdAndUpdate(id, {
            $set: {
                status: employee_profile_enums_1.ProfileChangeStatus.CANCELED,
                processedAt: new Date(),
            },
        }, { new: true });
        return updated;
    }
    async generateRequestId() {
        const year = new Date().getFullYear();
        const prefix = `PCR-${year}`;
        const lastRequest = await this.changeRequestModel
            .findOne({ requestId: { $regex: `^${prefix}` } })
            .sort({ requestId: -1 })
            .exec();
        let sequence = 1;
        if (lastRequest) {
            const lastSequence = parseInt(lastRequest.requestId.split('-')[2], 10);
            sequence = lastSequence + 1;
        }
        return `${prefix}-${sequence.toString().padStart(4, '0')}`;
    }
};
exports.ProfileChangeRequestService = ProfileChangeRequestService;
exports.ProfileChangeRequestService = ProfileChangeRequestService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(ep_change_request_schema_1.EmployeeProfileChangeRequest.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProfileChangeRequestService);
//# sourceMappingURL=profile-change-request.service.js.map