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
exports.Tenant = void 0;
const typeorm_1 = require("typeorm");
let Tenant = class Tenant {
};
exports.Tenant = Tenant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Tenant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Tenant.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'FREE' }),
    __metadata("design:type", String)
], Tenant.prototype, "plano", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Tenant.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "logoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '#7C3AED' }),
    __metadata("design:type", String)
], Tenant.prototype, "primaryColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '#4F46E5' }),
    __metadata("design:type", String)
], Tenant.prototype, "secondaryColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '#A78BFA' }),
    __metadata("design:type", String)
], Tenant.prototype, "accentColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '#FFFFFF' }),
    __metadata("design:type", String)
], Tenant.prototype, "textColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Inter' }),
    __metadata("design:type", String)
], Tenant.prototype, "fontFamily", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 60 }),
    __metadata("design:type", Number)
], Tenant.prototype, "checkinExpiryMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 40 }),
    __metadata("design:type", Number)
], Tenant.prototype, "rechamadaCooldownSeconds", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 5 }),
    __metadata("design:type", Number)
], Tenant.prototype, "imagemTransicaoSegundos", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "preferredVoiceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "subdomain", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '<nome> do <turma>' }),
    __metadata("design:type", String)
], Tenant.prototype, "anuncioTemplate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Tenant.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Tenant.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Tenant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Tenant.prototype, "updatedAt", void 0);
exports.Tenant = Tenant = __decorate([
    (0, typeorm_1.Entity)('tenants')
], Tenant);
//# sourceMappingURL=tenant.entity.js.map