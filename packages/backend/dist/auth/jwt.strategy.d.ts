import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private usersRepo;
    constructor(configService: ConfigService, usersRepo: Repository<User>);
    validate(payload: any): Promise<{
        id: string;
        tenantId: string;
        email: string;
        nome: string;
        role: import("../users/user.entity").UserRole;
    }>;
}
export {};
