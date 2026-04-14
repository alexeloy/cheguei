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
exports.AlunosController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const upload_config_1 = require("../config/upload.config");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const user_entity_1 = require("../users/user.entity");
const alunos_service_1 = require("./alunos.service");
const create_aluno_dto_1 = require("./dto/create-aluno.dto");
let AlunosController = class AlunosController {
    constructor(service) {
        this.service = service;
    }
    findAll(user, tenantId) {
        if (user.role === user_entity_1.UserRole.RESPONSAVEL) {
            return this.service.findByResponsavel(user.id, user.tenantId);
        }
        if (user.role === user_entity_1.UserRole.MASTER) {
            return this.service.findAll(tenantId || undefined);
        }
        return this.service.findAll(user.tenantId);
    }
    findResponsaveis(id) {
        return this.service.findResponsaveis(id);
    }
    findOne(id, user) {
        return this.service.findOne(id, user.role === user_entity_1.UserRole.MASTER ? undefined : user.tenantId);
    }
    create(dto, user) {
        const tenantId = (user.role === user_entity_1.UserRole.MASTER && dto.tenantId) ? dto.tenantId : user.tenantId;
        const { tenantId: _, ...rest } = dto;
        return this.service.create(tenantId, rest);
    }
    update(id, dto, user) {
        return this.service.update(id, user.role === user_entity_1.UserRole.MASTER ? undefined : user.tenantId, dto);
    }
    remove(id, user) {
        return this.service.remove(id, user.role === user_entity_1.UserRole.MASTER ? undefined : user.tenantId);
    }
    vincularResponsavel(id, responsavelId, user) {
        return this.service.vincularResponsavel(id, responsavelId, user.role === user_entity_1.UserRole.MASTER ? undefined : user.tenantId);
    }
    desvincularResponsavel(id, responsavelId) {
        return this.service.desvincularResponsavel(id, responsavelId);
    }
    async uploadFoto(id, file, user) {
        const fotoUrl = `/uploads/${file.filename}`;
        return this.service.update(id, user.role === user_entity_1.UserRole.MASTER ? undefined : user.tenantId, { fotoUrl });
    }
};
exports.AlunosController = AlunosController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AlunosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/responsaveis'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.MASTER, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.RECEPCAO),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AlunosController.prototype, "findResponsaveis", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AlunosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.MASTER, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.RECEPCAO),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_aluno_dto_1.CreateAlunoDto, Object]),
    __metadata("design:returntype", void 0)
], AlunosController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.MASTER, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.RECEPCAO),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AlunosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.MASTER, user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AlunosController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/responsaveis/:responsavelId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.MASTER, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.RECEPCAO),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('responsavelId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AlunosController.prototype, "vincularResponsavel", null);
__decorate([
    (0, common_1.Delete)(':id/responsaveis/:responsavelId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.MASTER, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.RECEPCAO),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('responsavelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AlunosController.prototype, "desvincularResponsavel", null);
__decorate([
    (0, common_1.Post)(':id/foto'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.MASTER, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.RECEPCAO),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                cb(null, upload_config_1.UPLOAD_DIR);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `aluno-${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                return cb(new Error('Apenas imagens são permitidas'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AlunosController.prototype, "uploadFoto", null);
exports.AlunosController = AlunosController = __decorate([
    (0, common_1.Controller)('alunos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [alunos_service_1.AlunosService])
], AlunosController);
//# sourceMappingURL=alunos.controller.js.map