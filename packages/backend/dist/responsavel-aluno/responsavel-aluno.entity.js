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
exports.ResponsavelAluno = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("../tenants/tenant.entity");
const user_entity_1 = require("../users/user.entity");
const aluno_entity_1 = require("../alunos/aluno.entity");
let ResponsavelAluno = class ResponsavelAluno {
};
exports.ResponsavelAluno = ResponsavelAluno;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ResponsavelAluno.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ResponsavelAluno.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant),
    (0, typeorm_1.JoinColumn)({ name: 'tenantId' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], ResponsavelAluno.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ResponsavelAluno.prototype, "responsavelId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'responsavelId' }),
    __metadata("design:type", user_entity_1.User)
], ResponsavelAluno.prototype, "responsavel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ResponsavelAluno.prototype, "alunoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => aluno_entity_1.Aluno, (a) => a.responsaveis),
    (0, typeorm_1.JoinColumn)({ name: 'alunoId' }),
    __metadata("design:type", aluno_entity_1.Aluno)
], ResponsavelAluno.prototype, "aluno", void 0);
exports.ResponsavelAluno = ResponsavelAluno = __decorate([
    (0, typeorm_1.Entity)('responsavel_aluno'),
    (0, typeorm_1.Unique)(['responsavelId', 'alunoId'])
], ResponsavelAluno);
//# sourceMappingURL=responsavel-aluno.entity.js.map