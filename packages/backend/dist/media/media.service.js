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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const media_entity_1 = require("./media.entity");
let MediaService = class MediaService {
    constructor(repo) {
        this.repo = repo;
    }
    findAll(tenantId) {
        return this.repo.find({
            where: tenantId ? { tenantId } : {},
            relations: ['tenant'],
            order: { ordem: 'ASC', createdAt: 'ASC' },
        });
    }
    async findAtivas(tenantId) {
        const all = await this.repo.find({
            where: { tenantId, ativo: true },
            order: { ordem: 'ASC' },
        });
        const agora = new Date();
        const diaSemana = ['DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'][agora.getDay()];
        const horaAtual = agora.toTimeString().slice(0, 5);
        return all.filter((media) => {
            if (media.dataExpiracao && new Date(media.dataExpiracao) < agora)
                return false;
            if (media.diasSemana && media.diasSemana.length > 0) {
                if (!media.diasSemana.includes(diaSemana))
                    return false;
            }
            if (media.horaInicio && media.horaFim) {
                if (horaAtual < media.horaInicio || horaAtual > media.horaFim)
                    return false;
            }
            return true;
        });
    }
    async create(tenantId, data) {
        const media = this.repo.create({ ...data, tenantId });
        return this.repo.save(media);
    }
    async update(id, tenantId, data) {
        const media = await this.repo.findOne({ where: { id, tenantId } });
        if (!media)
            throw new common_1.NotFoundException('Mídia não encontrada');
        await this.repo.update(id, data);
        return this.repo.findOne({ where: { id } });
    }
    async remove(id, tenantId) {
        const media = await this.repo.findOne({ where: { id, tenantId } });
        if (!media)
            throw new common_1.NotFoundException('Mídia não encontrada');
        await this.repo.delete(id);
        return { success: true };
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(media_entity_1.Media)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MediaService);
//# sourceMappingURL=media.service.js.map