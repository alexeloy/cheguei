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
exports.CheckinService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const checkin_entity_1 = require("./checkin.entity");
const tenant_entity_1 = require("../tenants/tenant.entity");
const ACTIVE_STATUSES = [checkin_entity_1.CheckinStatus.A_CAMINHO, checkin_entity_1.CheckinStatus.CHEGOU];
let CheckinService = class CheckinService {
    constructor(repo, tenantsRepo, eventEmitter) {
        this.repo = repo;
        this.tenantsRepo = tenantsRepo;
        this.eventEmitter = eventEmitter;
    }
    async getAtivos(tenantId) {
        return this.repo.find({
            where: { tenantId, status: (0, typeorm_2.In)(ACTIVE_STATUSES) },
            relations: ['aluno', 'responsavel'],
            order: { timestamp: 'ASC' },
        });
    }
    async getAll(tenantId) {
        return this.repo.find({
            where: { tenantId },
            relations: ['aluno', 'responsavel'],
            order: { timestamp: 'DESC' },
        });
    }
    async create(tenantId, responsavelId, alunoId, initialStatus = checkin_entity_1.CheckinStatus.A_CAMINHO) {
        const tenant = await this.tenantsRepo.findOne({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant não encontrado');
        const existente = await this.repo.findOne({
            where: { tenantId, alunoId, status: (0, typeorm_2.In)(ACTIVE_STATUSES) },
        });
        if (existente) {
            throw new common_1.ConflictException('Já existe um check-in ativo para este aluno');
        }
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + (tenant.checkinExpiryMinutes || 60));
        const checkin = this.repo.create({
            tenantId,
            responsavelId,
            alunoId,
            status: initialStatus,
            timestamp: new Date(),
            expiresAt,
            ultimaChamada: new Date(),
        });
        const saved = await this.repo.save(checkin);
        const full = await this.repo.findOne({
            where: { id: saved.id },
            relations: ['aluno', 'responsavel'],
        });
        this.eventEmitter.emit('checkin.novo', { tenantId, checkin: full });
        return full;
    }
    async updateStatus(id, tenantId, status) {
        const checkin = await this.repo.findOne({ where: { id, tenantId } });
        if (!checkin)
            throw new common_1.NotFoundException('Check-in não encontrado');
        await this.repo.update(id, { status });
        const updated = await this.repo.findOne({
            where: { id },
            relations: ['aluno', 'responsavel'],
        });
        this.eventEmitter.emit('checkin.statusAtualizado', { tenantId, checkin: updated });
        return updated;
    }
    async findByResponsavel(responsavelId, tenantId) {
        return this.repo.find({
            where: { responsavelId, tenantId, status: (0, typeorm_2.In)(ACTIVE_STATUSES) },
            relations: ['aluno'],
            order: { timestamp: 'DESC' },
        });
    }
    async expirarCheckins() {
        const expirados = await this.repo
            .createQueryBuilder('c')
            .where('c.status IN (:...statuses)', { statuses: ACTIVE_STATUSES })
            .andWhere('c.expiresAt < NOW()')
            .getMany();
        for (const checkin of expirados) {
            await this.repo.update(checkin.id, { status: checkin_entity_1.CheckinStatus.EXPIRADO });
            this.eventEmitter.emit('checkin.expirado', {
                tenantId: checkin.tenantId,
                checkin,
            });
        }
    }
};
exports.CheckinService = CheckinService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CheckinService.prototype, "expirarCheckins", null);
exports.CheckinService = CheckinService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(checkin_entity_1.Checkin)),
    __param(1, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], CheckinService);
//# sourceMappingURL=checkin.service.js.map