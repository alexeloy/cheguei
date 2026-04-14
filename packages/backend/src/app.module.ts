import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { AlunosModule } from './alunos/alunos.module';
import { CheckinModule } from './checkin/checkin.module';
import { MediaModule } from './media/media.module';
import { WebsocketModule } from './websocket/websocket.module';
import { Tenant } from './tenants/tenant.entity';
import { User } from './users/user.entity';
import { Aluno } from './alunos/aluno.entity';
import { ResponsavelAluno } from './responsavel-aluno/responsavel-aluno.entity';
import { Checkin } from './checkin/checkin.entity';
import { Media } from './media/media.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [Tenant, User, Aluno, ResponsavelAluno, Checkin, Media],
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    AuthModule,
    TenantsModule,
    UsersModule,
    AlunosModule,
    CheckinModule,
    MediaModule,
    WebsocketModule,
  ],
})
export class AppModule {}
