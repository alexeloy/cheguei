import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'cheguei-secret',
    });
  }

  async validate(payload: any) {
    const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
    if (!user || !user.ativo) throw new UnauthorizedException();
    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      nome: user.nome,
      role: user.role,
    };
  }
}
