"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcryptjs");
const user_entity_1 = require("../users/user.entity");
let AuthService = class AuthService {
    constructor(usersRepo, jwtService) {
        this.usersRepo = usersRepo;
        this.jwtService = jwtService;
    }
    async login(email, password) {
        const user = await this.usersRepo.findOne({
            where: { email },
            relations: ['tenant'],
        });
        if (!user || !user.ativo) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const payload = {
            sub: user.id,
            tenantId: user.tenantId,
            email: user.email,
            role: user.role,
        };
        const token = this.jwtService.sign(payload);
        return {
            accessToken: token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
                tenant: user.tenant,
                selectedTenantId: user.selectedTenantId ?? null,
            },
        };
    }
    async getMe(userId) {
        const user = await this.usersRepo.findOne({
            where: { id: userId },
            relations: ['tenant'],
        });
        if (!user)
            throw new common_1.UnauthorizedException();
        const { passwordHash, ...result } = user;
        return result;
    }
    async changePassword(userId, senhaAtual, novaSenha) {
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException();
        const valid = await bcrypt.compare(senhaAtual, user.passwordHash);
        if (!valid)
            throw new common_1.BadRequestException('Senha atual incorreta');
        if (novaSenha.length < 6) {
            throw new common_1.BadRequestException('A nova senha deve ter pelo menos 6 caracteres');
        }
        const passwordHash = await bcrypt.hash(novaSenha, 10);
        await this.usersRepo.update(userId, { passwordHash });
        return { message: 'Senha alterada com sucesso' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map