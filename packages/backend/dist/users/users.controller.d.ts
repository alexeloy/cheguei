import { UserRole } from './user.entity';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private service;
    constructor(service: UsersService);
    findAll(user: any, tenantId?: string): Promise<{
        id: string;
        tenantId: string;
        tenant: import("../tenants/tenant.entity").Tenant;
        selectedTenantId: string;
        nome: string;
        email: string;
        cpf: string;
        telefone: string;
        role: UserRole;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findAlunos(id: string): Promise<import("../alunos/aluno.entity").Aluno[]>;
    findOne(id: string, user: any): Promise<{
        id: string;
        tenantId: string;
        tenant: import("../tenants/tenant.entity").Tenant;
        selectedTenantId: string;
        nome: string;
        email: string;
        cpf: string;
        telefone: string;
        role: UserRole;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateUserDto, user: any): Promise<{
        id: string;
        tenantId: string;
        tenant: import("../tenants/tenant.entity").Tenant;
        selectedTenantId: string;
        nome: string;
        email: string;
        cpf: string;
        telefone: string;
        role: UserRole;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: Partial<CreateUserDto>, user: any): Promise<{
        id: string;
        tenantId: string;
        tenant: import("../tenants/tenant.entity").Tenant;
        selectedTenantId: string;
        nome: string;
        email: string;
        cpf: string;
        telefone: string;
        role: UserRole;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, user: any): Promise<{
        success: boolean;
    }>;
    updateSelectedTenant(body: {
        selectedTenantId: string | null;
    }, user: any): Promise<{
        id: string;
        tenantId: string;
        tenant: import("../tenants/tenant.entity").Tenant;
        selectedTenantId: string;
        nome: string;
        email: string;
        cpf: string;
        telefone: string;
        role: UserRole;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
