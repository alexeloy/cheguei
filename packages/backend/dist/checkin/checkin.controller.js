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
exports.CheckinController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const checkin_service_1 = require("./checkin.service");
const checkin_entity_1 = require("./checkin.entity");
const class_validator_1 = require("class-validator");
const user_entity_1 = require("../users/user.entity");
class CreateCheckinDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCheckinDto.prototype, "alunoId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(checkin_entity_1.CheckinStatus),
    __metadata("design:type", String)
], CreateCheckinDto.prototype, "status", void 0);
class UpdateStatusDto {
}
__decorate([
    (0, class_validator_1.IsEnum)(checkin_entity_1.CheckinStatus),
    __metadata("design:type", String)
], UpdateStatusDto.prototype, "status", void 0);
class UpdateLocalizacaoDto {
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLocalizacaoDto.prototype, "latitude", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLocalizacaoDto.prototype, "longitude", void 0);
let CheckinController = class CheckinController {
    constructor(service) {
        this.service = service;
    }
    getAtivos(user) {
        return this.service.getAtivos(user.tenantId);
    }
    getAll(user) {
        return this.service.getAll(user.tenantId);
    }
    getMeus(user) {
        return this.service.findByResponsavel(user.id, user.tenantId);
    }
    create(dto, user) {
        const isStaff = user.role === user_entity_1.UserRole.MASTER || user.role === user_entity_1.UserRole.ADMIN || user.role === user_entity_1.UserRole.RECEPCAO;
        const status = (isStaff && dto.status) ? dto.status : checkin_entity_1.CheckinStatus.A_CAMINHO;
        return this.service.create(user.tenantId, user.id, dto.alunoId, status);
    }
    updateStatus(id, dto, user) {
        return this.service.updateStatus(id, user.tenantId, dto.status);
    }
    updateLocalizacao(id, dto, user) {
        return this.service.updateLocalizacao(id, user.tenantId, user.id, dto.latitude, dto.longitude);
    }
    cancelar(id, user) {
        return this.service.updateStatus(id, user.tenantId, checkin_entity_1.CheckinStatus.EXPIRADO);
    }
};
exports.CheckinController = CheckinController;
__decorate([
    (0, common_1.Get)('ativos'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CheckinController.prototype, "getAtivos", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CheckinController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('meus'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CheckinController.prototype, "getMeus", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateCheckinDto, Object]),
    __metadata("design:returntype", void 0)
], CheckinController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateStatusDto, Object]),
    __metadata("design:returntype", void 0)
], CheckinController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/localizacao'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateLocalizacaoDto, Object]),
    __metadata("design:returntype", void 0)
], CheckinController.prototype, "updateLocalizacao", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.MASTER, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.RECEPCAO),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CheckinController.prototype, "cancelar", null);
exports.CheckinController = CheckinController = __decorate([
    (0, common_1.Controller)('checkin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [checkin_service_1.CheckinService])
], CheckinController);
//# sourceMappingURL=checkin.controller.js.map