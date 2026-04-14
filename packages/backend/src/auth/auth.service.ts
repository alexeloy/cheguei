import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersRepo.findOne({
      where: { email },
      relations: ['tenant'],
    });

    if (!user || !user.ativo) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Credenciais inválidas');
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

  async getMe(userId: string) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['tenant'],
    });
    if (!user) throw new UnauthorizedException();
    const { passwordHash, ...result } = user;
    return result;
  }

  async changePassword(userId: string, senhaAtual: string, novaSenha: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const valid = await bcrypt.compare(senhaAtual, user.passwordHash);
    if (!valid) throw new BadRequestException('Senha atual incorreta');

    if (novaSenha.length < 6) {
      throw new BadRequestException('A nova senha deve ter pelo menos 6 caracteres');
    }

    const passwordHash = await bcrypt.hash(novaSenha, 10);
    await this.usersRepo.update(userId, { passwordHash });
    return { message: 'Senha alterada com sucesso' };
  }
}
