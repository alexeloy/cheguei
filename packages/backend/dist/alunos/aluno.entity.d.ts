import { Tenant } from '../tenants/tenant.entity';
import { ResponsavelAluno } from '../responsavel-aluno/responsavel-aluno.entity';
export declare class Aluno {
    id: string;
    tenantId: string;
    tenant: Tenant;
    nome: string;
    turma: string;
    nomeFonetico: string;
    fotoUrl: string;
    ativo: boolean;
    responsaveis: ResponsavelAluno[];
    createdAt: Date;
    updatedAt: Date;
}
