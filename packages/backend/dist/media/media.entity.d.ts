import { Tenant } from '../tenants/tenant.entity';
export declare enum MediaTipo {
    IMAGEM = "IMAGEM",
    VIDEO = "VIDEO"
}
export declare class Media {
    id: string;
    tenantId: string;
    tenant: Tenant;
    titulo: string;
    tipo: MediaTipo;
    url: string;
    ativo: boolean;
    diasSemana: string[];
    horaInicio: string;
    horaFim: string;
    dataExpiracao: string;
    duracaoTransicao: number;
    ordem: number;
    createdAt: Date;
    updatedAt: Date;
}
