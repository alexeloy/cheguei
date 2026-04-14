import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { ResponsavelAluno } from '../responsavel-aluno/responsavel-aluno.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(ResponsavelAluno) private raRepo: Repository<ResponsavelAluno>,
  ) {}

  async findAll(tenantId?: string) {
    const users = await this.repo.find({
      where: tenantId ? { tenantId } : {},
      relations: ['tenant'],
      order: { nome: 'ASC' } as any,
    });
    return users.map(({ passwordHash, ...u }) => u);
  }

  async findOne(id: string, tenantId?: string) {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;
    const user = await this.repo.findOne({ where });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const { passwordHash, ...result } = user;
    return result;
  }

  async findAlunos(userId: string) {
    const relations = await this.raRepo.find({
      where: { responsavelId: userId },
      relations: ['aluno'],
    });
    return relations.map((r) => r.aluno).filter((a) => a?.ativo);
  }

  async create(tenantId: string, dto: CreateUserDto) {
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email já cadastrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({ ...dto, tenantId, passwordHash });
    const saved = await this.repo.save(user);
    const { passwordHash: _, ...result } = saved;
    return result;
  }

  async update(id: string, tenantId: string | undefined, dto: Partial<CreateUserDto>) {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;
    const user = await this.repo.findOne({ where });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (dto.password) {
      (dto as any).passwordHash = await bcrypt.hash(dto.password, 10);
      delete dto.password;
    }

    await this.repo.update(id, dto);
    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId?: string) {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;
    const user = await this.repo.findOne({ where });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    await this.repo.delete(id);
    return { success: true };
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async updateSelectedTenant(userId: string, selectedTenantId: string | null) {
    await this.repo.update(userId, { selectedTenantId: selectedTenantId ?? undefined });
    return this.findOne(userId);
  }
}
