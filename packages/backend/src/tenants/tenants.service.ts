import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(@InjectRepository(Tenant) private repo: Repository<Tenant>) {}

  findAll() {
    return this.repo.find();
  }

  async findOne(id: string) {
    const tenant = await this.repo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');
    return tenant;
  }

  create(dto: CreateTenantDto) {
    const tenant = this.repo.create(dto);
    return this.repo.save(tenant);
  }

  async update(id: string, dto: Partial<CreateTenantDto>) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repo.delete(id);
    return { success: true };
  }
}
