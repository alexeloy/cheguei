import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
declare class ChangePasswordDto {
    senhaAtual: string;
    novaSenha: string;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
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
    me(user: any): Promise<{
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
    changePassword(dto: ChangePasswordDto, user: any): Promise<{
        message: string;
    }>;
}
export {};
