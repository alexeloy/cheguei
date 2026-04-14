import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aluno } from './aluno.entity';
import { ResponsavelAluno } from '../responsavel-aluno/responsavel-aluno.entity';
import { CreateAlunoDto } from './dto/create-aluno.dto';

@Injectable()
export class AlunosService {
  constructor(
    @InjectRepository(Aluno) private alunosRepo: Repository<Aluno>,
    @InjectRepository(ResponsavelAluno) private raRepo: Repository<ResponsavelAluno>,
  ) {}

  findAll(tenantId?: string) {
    return this.alunosRepo.find({
      where: tenantId ? { tenantId, ativo: true } : { ativo: true },
      relations: ['tenant'],
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: string, tenantId?: string) {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;
    const aluno = await this.alunosRepo.findOne({ where });
    if (!aluno) throw new NotFoundException('Aluno não encontrado');
    return aluno;
  }

  async findByResponsavel(responsavelId: string, tenantId: string) {
    const relations = await this.raRepo.find({
      where: { responsavelId, tenantId },
      relations: ['aluno'],
    });
    return relations.map((r) => r.aluno).filter((a) => a.ativo);
  }

  async findResponsaveis(alunoId: string) {
    const relations = await this.raRepo.find({
      where: { alunoId },
      relations: ['responsavel'],
    });
    return relations.map((r) => {
      const { passwordHash, ...user } = r.responsavel as any;
      return user;
    });
  }

  async create(tenantId: string, dto: CreateAlunoDto) {
    const aluno = this.alunosRepo.create({ ...dto, tenantId });
    return this.alunosRepo.save(aluno);
  }

  async update(id: string, tenantId: string, dto: Partial<CreateAlunoDto>) {
    const aluno = await this.alunosRepo.findOne({ where: { id, tenantId } });
    if (!aluno) throw new NotFoundException('Aluno não encontrado');
    await this.alunosRepo.update(id, dto);
    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId: string) {
    const aluno = await this.alunosRepo.findOne({ where: { id, tenantId } });
    if (!aluno) throw new NotFoundException('Aluno não encontrado');
    await this.alunosRepo.update(id, { ativo: false });
    return { success: true };
  }

  async vincularResponsavel(alunoId: string, responsavelId: string, tenantId: string) {
    const existing = await this.raRepo.findOne({ where: { alunoId, responsavelId } });
    if (existing) return existing;
    // Use the aluno's own tenantId for the association
    const aluno = await this.alunosRepo.findOne({ where: { id: alunoId } });
    const actualTenantId = aluno?.tenantId || tenantId;
    const ra = this.raRepo.create({ alunoId, responsavelId, tenantId: actualTenantId });
    return this.raRepo.save(ra);
  }

  async desvincularResponsavel(alunoId: string, responsavelId: string) {
    await this.raRepo.delete({ alunoId, responsavelId });
    return { success: true };
  }
}
