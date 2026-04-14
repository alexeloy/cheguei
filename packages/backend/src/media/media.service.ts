import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './media.entity';

@Injectable()
export class MediaService {
  constructor(@InjectRepository(Media) private repo: Repository<Media>) {}

  findAll(tenantId?: string) {
    return this.repo.find({
      where: tenantId ? { tenantId } : {},
      relations: ['tenant'],
      order: { ordem: 'ASC', createdAt: 'ASC' },
    });
  }

  async findAtivas(tenantId: string) {
    const all = await this.repo.find({
      where: { tenantId, ativo: true },
      order: { ordem: 'ASC' },
    });

    const agora = new Date();
    const diaSemana = ['DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'][
      agora.getDay()
    ];
    const horaAtual = agora.toTimeString().slice(0, 5); // HH:MM

    return all.filter((media) => {
      // Verifica expiração
      if (media.dataExpiracao && new Date(media.dataExpiracao) < agora) return false;

      // Verifica dias da semana
      if (media.diasSemana && media.diasSemana.length > 0) {
        if (!media.diasSemana.includes(diaSemana)) return false;
      }

      // Verifica horário
      if (media.horaInicio && media.horaFim) {
        if (horaAtual < media.horaInicio || horaAtual > media.horaFim) return false;
      }

      return true;
    });
  }

  async create(tenantId: string, data: Partial<Media>) {
    const media = this.repo.create({ ...data, tenantId });
    return this.repo.save(media);
  }

  async update(id: string, tenantId: string, data: Partial<Media>) {
    const media = await this.repo.findOne({ where: { id, tenantId } });
    if (!media) throw new NotFoundException('Mídia não encontrada');
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: string, tenantId: string) {
    const media = await this.repo.findOne({ where: { id, tenantId } });
    if (!media) throw new NotFoundException('Mídia não encontrada');
    await this.repo.delete(id);
    return { success: true };
  }
}
