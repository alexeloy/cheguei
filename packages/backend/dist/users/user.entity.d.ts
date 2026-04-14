import { Tenant } from '../tenants/tenant.entity';
export declare enum UserRole {
    MASTER = "MASTER",
    ADMIN = "ADMIN",
    RECEPCAO = "RECEPCAO",
    RESPONSAVEL = "RESPONSAVEL"
}
export declare class User {
    id: string;
    tenantId: string;
    tenant: Tenant;
    selectedTenantId: string;
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
    passwordHash: string;
    role: UserRole;
    ativo: boolean;
    createdAt: Date;
    updatedAt: Date;
}
