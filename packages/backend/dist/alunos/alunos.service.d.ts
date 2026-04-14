import { Repository } from 'typeorm';
import { Aluno } from './aluno.entity';
import { ResponsavelAluno } from '../responsavel-aluno/responsavel-aluno.entity';
import { CreateAlunoDto } from './dto/create-aluno.dto';
export declare class AlunosService {
    private alunosRepo;
    private raRepo;
    constructor(alunosRepo: Repository<Aluno>, raRepo: Repository<ResponsavelAluno>);
    findAll(tenantId?: string): Promise<Aluno[]>;
    findOne(id: string, tenantId?: string): Promise<Aluno>;
    findByResponsavel(responsavelId: string, tenantId: string): Promise<Aluno[]>;
    findResponsaveis(alunoId: string): Promise<any[]>;
    create(tenantId: string, dto: CreateAlunoDto): Promise<Aluno>;
    update(id: string, tenantId: string, dto: Partial<CreateAlunoDto>): Promise<Aluno>;
    remove(id: string, tenantId: string): Promise<{
        success: boolean;
    }>;
    vincularResponsavel(alunoId: string, responsavelId: string, tenantId: string): Promise<ResponsavelAluno>;
    desvincularResponsavel(alunoId: string, responsavelId: string): Promise<{
        success: boolean;
    }>;
}
