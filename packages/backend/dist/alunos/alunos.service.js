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
exports.AlunosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const aluno_entity_1 = require("./aluno.entity");
const responsavel_aluno_entity_1 = require("../responsavel-aluno/responsavel-aluno.entity");
let AlunosService = class AlunosService {
    constructor(alunosRepo, raRepo) {
        this.alunosRepo = alunosRepo;
        this.raRepo = raRepo;
    }
    findAll(tenantId) {
        return this.alunosRepo.find({
            where: tenantId ? { tenantId, ativo: true } : { ativo: true },
            relations: ['tenant'],
            order: { nome: 'ASC' },
        });
    }
    async findOne(id, tenantId) {
        const where = { id };
        if (tenantId)
            where.tenantId = tenantId;
        const aluno = await this.alunosRepo.findOne({ where });
        if (!aluno)
            throw new common_1.NotFoundException('Aluno não encontrado');
        return aluno;
    }
    async findByResponsavel(responsavelId, tenantId) {
        const relations = await this.raRepo.find({
            where: { responsavelId, tenantId },
            relations: ['aluno'],
        });
        return relations.map((r) => r.aluno).filter((a) => a.ativo);
    }
    async findResponsaveis(alunoId) {
        const relations = await this.raRepo.find({
            where: { alunoId },
            relations: ['responsavel'],
        });
        return relations.map((r) => {
            const { passwordHash, ...user } = r.responsavel;
            return user;
        });
    }
    async create(tenantId, dto) {
        const aluno = this.alunosRepo.create({ ...dto, tenantId });
        return this.alunosRepo.save(aluno);
    }
    async update(id, tenantId, dto) {
        const aluno = await this.alunosRepo.findOne({ where: { id, tenantId } });
        if (!aluno)
            throw new common_1.NotFoundException('Aluno não encontrado');
        await this.alunosRepo.update(id, dto);
        return this.findOne(id, tenantId);
    }
    async remove(id, tenantId) {
        const aluno = await this.alunosRepo.findOne({ where: { id, tenantId } });
        if (!aluno)
            throw new common_1.NotFoundException('Aluno não encontrado');
        await this.alunosRepo.update(id, { ativo: false });
        return { success: true };
    }
    async vincularResponsavel(alunoId, responsavelId, tenantId) {
        const existing = await this.raRepo.findOne({ where: { alunoId, responsavelId } });
        if (existing)
            return existing;
        const aluno = await this.alunosRepo.findOne({ where: { id: alunoId } });
        const actualTenantId = aluno?.tenantId || tenantId;
        const ra = this.raRepo.create({ alunoId, responsavelId, tenantId: actualTenantId });
        return this.raRepo.save(ra);
    }
    async desvincularResponsavel(alunoId, responsavelId) {
        await this.raRepo.delete({ alunoId, responsavelId });
        return { success: true };
    }
};
exports.AlunosService = AlunosService;
exports.AlunosService = AlunosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(aluno_entity_1.Aluno)),
    __param(1, (0, typeorm_1.InjectRepository)(responsavel_aluno_entity_1.ResponsavelAluno)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AlunosService);
//# sourceMappingURL=alunos.service.js.map