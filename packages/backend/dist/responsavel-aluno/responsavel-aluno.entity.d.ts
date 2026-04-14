import { Tenant } from '../tenants/tenant.entity';
import { User } from '../users/user.entity';
import { Aluno } from '../alunos/aluno.entity';
export declare class ResponsavelAluno {
    id: string;
    tenantId: string;
    tenant: Tenant;
    responsavelId: string;
    responsavel: User;
    alunoId: string;
    aluno: Aluno;
}
