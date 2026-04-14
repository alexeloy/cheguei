import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Checkin, CheckinStatus } from './checkin.entity';
import { Tenant } from '../tenants/tenant.entity';
export declare class CheckinService {
    private repo;
    private tenantsRepo;
    private eventEmitter;
    constructor(repo: Repository<Checkin>, tenantsRepo: Repository<Tenant>, eventEmitter: EventEmitter2);
    getAtivos(tenantId: string): Promise<Checkin[]>;
    getAll(tenantId: string): Promise<Checkin[]>;
    create(tenantId: string, responsavelId: string, alunoId: string, initialStatus?: CheckinStatus): Promise<Checkin>;
    updateStatus(id: string, tenantId: string, status: CheckinStatus): Promise<Checkin>;
    findByResponsavel(responsavelId: string, tenantId: string): Promise<Checkin[]>;
    expirarCheckins(): Promise<void>;
}
