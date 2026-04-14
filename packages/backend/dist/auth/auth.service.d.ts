import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
export declare class AuthService {
    private usersRepo;
    private jwtService;
    constructor(usersRepo: Repository<User>, jwtService: JwtService);
    login(email: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            nome: string;
            email: string;
            role: import("../users/user.entity").UserRole;
            tenantId: string;
            tenant: import("../tenants/tenant.entity").Tenant;
            selectedTenantId: string;
        };
    }>;
    getMe(userId: string): Promise<{
        id: string;
        tenantId: string;
        tenant: import("../tenants/tenant.entity").Tenant;
        selectedTenantId: string;
        nome: string;
        email: string;
        cpf: string;
        telefone: string;
        role: import("../users/user.entity").UserRole;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    changePassword(userId: string, senhaAtual: string, novaSenha: string): Promise<{
        message: string;
    }>;
}
