import { UserRole } from '../user.entity';
export declare class CreateUserDto {
    nome: string;
    email: string;
    cpf?: string;
    telefone?: string;
    password: string;
    role: UserRole;
    tenantId?: string;
}
