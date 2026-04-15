import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Checkin, CheckinStatus } from './checkin.entity';
import { Tenant } from '../tenants/tenant.entity';
import { MapsService } from './maps.service';

const ACTIVE_STATUSES = [CheckinStatus.A_CAMINHO, CheckinStatus.CHEGOU];

@Injectable()
export class CheckinService {
  constructor(
    @InjectRepository(Checkin) private repo: Repository<Checkin>,
    @InjectRepository(Tenant) private tenantsRepo: Repository<Tenant>,
    private eventEmitter: EventEmitter2,
    private mapsService: MapsService,
  ) {}

  async getAtivos(tenantId: string) {
    return this.repo.find({
      where: { tenantId, status: In(ACTIVE_STATUSES) },
      relations: ['aluno', 'responsavel'],
      order: { timestamp: 'ASC' },
    });
  }

  async getAll(tenantId: string) {
    return this.repo.find({
      where: { tenantId },
      relations: ['aluno', 'responsavel'],
      order: { timestamp: 'DESC' },
    });
  }

  async create(tenantId: string, responsavelId: string, alunoId: string, initialStatus = CheckinStatus.A_CAMINHO) {
    const tenant = await this.tenantsRepo.findOne({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');

    // Verifica se já existe checkin ativo (A_CAMINHO ou CHEGOU) para este aluno
    const existente = await this.repo.findOne({
      where: { tenantId, alunoId, status: In(ACTIVE_STATUSES) },
    });
    if (existente) {
      throw new ConflictException('Já existe um check-in ativo para este aluno');
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

  async updateStatus(id: string, tenantId: string, status: CheckinStatus) {
    const checkin = await this.repo.findOne({ where: { id, tenantId } });
    if (!checkin) throw new NotFoundException('Check-in não encontrado');

    await this.repo.update(id, { status });
    const updated = await this.repo.findOne({
      where: { id },
      relations: ['aluno', 'responsavel'],
    });

    this.eventEmitter.emit('checkin.statusAtualizado', { tenantId, checkin: updated });
    return updated;
  }

  async updateLocalizacao(
    checkinId: string,
    tenantId: string,
    responsavelId: string,
    latitude: number,
    longitude: number,
  ) {
    const checkin = await this.repo.findOne({
      where: { id: checkinId, tenantId, responsavelId, status: CheckinStatus.A_CAMINHO },
      relations: ['tenant', 'aluno', 'responsavel'],
    });
    if (!checkin) throw new NotFoundException('Checkin não encontrado ou não está A_CAMINHO');

    if (!checkin.tenant.latitude || !checkin.tenant.longitude) {
      throw new BadRequestException('Localização da escola não configurada. Configure no painel administrativo.');
    }

    const { etaSegundos, distanciaMetros } = await this.mapsService.calcularETA(
      latitude, longitude,
      checkin.tenant.latitude, checkin.tenant.longitude,
    );

    checkin.ultimaLatitude = latitude;
    checkin.ultimaLongitude = longitude;
    checkin.ultimaLocalizacaoAt = new Date();
    checkin.etaMinutos = Math.ceil(etaSegundos / 60);
    checkin.distanciaMetros = distanciaMetros;

    const saved = await this.repo.save(checkin);

    this.eventEmitter.emit('checkin.localizacaoAtualizada', {
      tenantId,
      checkin: saved,
    });

    return saved;
  }

  async findByResponsavel(responsavelId: string, tenantId: string) {
    return this.repo.find({
      where: { responsavelId, tenantId, status: In(ACTIVE_STATUSES) },
      relations: ['aluno'],
      order: { timestamp: 'DESC' },
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async expirarCheckins() {
    const expirados = await this.repo
      .createQueryBuilder('c')
      .where('c.status IN (:...statuses)', { statuses: ACTIVE_STATUSES })
      .andWhere('c.expiresAt < NOW()')
      .getMany();

    for (const checkin of expirados) {
      await this.repo.update(checkin.id, { status: CheckinStatus.EXPIRADO });
      this.eventEmitter.emit('checkin.expirado', {
        tenantId: checkin.tenantId,
        checkin,
      });
    }
  }
}
