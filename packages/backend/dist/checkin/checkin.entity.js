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
exports.Checkin = exports.CheckinStatus = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("../tenants/tenant.entity");
const user_entity_1 = require("../users/user.entity");
const aluno_entity_1 = require("../alunos/aluno.entity");
var CheckinStatus;
(function (CheckinStatus) {
    CheckinStatus["A_CAMINHO"] = "A_CAMINHO";
    CheckinStatus["CHEGOU"] = "CHEGOU";
    CheckinStatus["ANUNCIADO"] = "ANUNCIADO";
    CheckinStatus["EXPIRADO"] = "EXPIRADO";
})(CheckinStatus || (exports.CheckinStatus = CheckinStatus = {}));
let Checkin = class Checkin {
};
exports.Checkin = Checkin;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Checkin.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Checkin.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant),
    (0, typeorm_1.JoinColumn)({ name: 'tenantId' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], Checkin.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Checkin.prototype, "responsavelId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'responsavelId' }),
    __metadata("design:type", user_entity_1.User)
], Checkin.prototype, "responsavel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Checkin.prototype, "alunoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => aluno_entity_1.Aluno),
    (0, typeorm_1.JoinColumn)({ name: 'alunoId' }),
    __metadata("design:type", aluno_entity_1.Aluno)
], Checkin.prototype, "aluno", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: CheckinStatus.A_CAMINHO }),
    __metadata("design:type", String)
], Checkin.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Checkin.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Checkin.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Checkin.prototype, "ultimaChamada", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Checkin.prototype, "ultimaLatitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Checkin.prototype, "ultimaLongitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Checkin.prototype, "ultimaLocalizacaoAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Checkin.prototype, "etaMinutos", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Checkin.prototype, "distanciaMetros", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Checkin.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Checkin.prototype, "updatedAt", void 0);
exports.Checkin = Checkin = __decorate([
    (0, typeorm_1.Entity)('checkins')
], Checkin);
//# sourceMappingURL=checkin.entity.js.map