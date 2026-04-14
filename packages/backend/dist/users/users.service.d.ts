import { Repository } from 'typeorm';
import { User } from './user.entity';
import { ResponsavelAluno } from '../responsavel-aluno/responsavel-aluno.entity';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private repo;
    private raRepo;
    constructor(repo: Repository<User>, raRepo: Repository<ResponsavelAluno>);
    findAll(tenantId?: string): Promise<{
        id: string;
        tenantId: string;
        tenant: import("../tenants/tenant.entity").Tenant;
        selectedTenantId: string;
        nome: string;
        email: string;
        cpf: string;
        telefone: string;
        role: import("./user.entity").UserRole;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string, tenantId?: string): Promise<{
        id: string;
        tenantId: string;
        tenant: import("../tenants/tenant.entity").Tenant;
        selectedTenantId: string;
        nome: string;
        email: string;
        cpf: string;
        telefone: string;
        role: import("./user.entity").UserRole;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAlunos(userId: string): Promise<import("../alunos/aluno.entity").Aluno[]>;
    create(tenantId: string, dto: CreateUserDto): Promise<{
        id: string;
        tenantId: string;
        tenant: import("../tenants/tenant.entity").Tenant;
        selectedTenantId: string;
        nome: string;
        email: string;
        cpf: string;
        telefone: string;
        role: import("./user.entity").UserRole;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, tenantId: string | undefined, dto: Partial<CreateUserDto>): Promise<{
        id: string;
        tenantId: string;
        tenant: import("../tenants/tenant.entity").Tenant;
        selectedTenantId: string;
        nome: string;
        email: string;
        cpf: string;
        telefone: string;
        role: import("./user.entity").UserRole;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, tenantId?: string): Promise<{
        success: boolean;
    }>;
    findByEmail(email: string): Promise<User>;
    updateSelectedTenant(userId: string, selectedTenantId: string | null): Promise<{
        id: string;
        tenantId: string;
        tenant: import("../tenants/tenant.entity").Tenant;
        selectedTenantId: string;
        nome: string;
        email: string;
        cpf: string;
        telefone: string;
        role: import("./user.entity").UserRole;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
