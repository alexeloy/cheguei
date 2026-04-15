import { Tenant } from '../tenants/tenant.entity';
import { User } from '../users/user.entity';
import { Aluno } from '../alunos/aluno.entity';
export declare enum CheckinStatus {
    A_CAMINHO = "A_CAMINHO",
    CHEGOU = "CHEGOU",
    ANUNCIADO = "ANUNCIADO",
    EXPIRADO = "EXPIRADO"
}
export declare class Checkin {
    id: string;
    tenantId: string;
    tenant: Tenant;
    responsavelId: string;
    responsavel: User;
    alunoId: string;
    aluno: Aluno;
    status: CheckinStatus;
    timestamp: Date;
    expiresAt: Date;
    ultimaChamada: Date;
    ultimaLatitude: number;
    ultimaLongitude: number;
    ultimaLocalizacaoAt: Date;
    etaMinutos: number;
    distanciaMetros: number;
    createdAt: Date;
    updatedAt: Date;
}
