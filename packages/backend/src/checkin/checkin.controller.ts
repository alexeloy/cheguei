import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CheckinService } from './checkin.service';
import { CheckinStatus } from './checkin.entity';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../users/user.entity';

class CreateCheckinDto {
  @IsString()
  alunoId: string;

  // ADMIN/RECEPCAO podem criar direto como CHEGOU (chamada direta no painel)
  @IsOptional()
  @IsEnum(CheckinStatus)
  status?: CheckinStatus;
}

class UpdateStatusDto {
  @IsEnum(CheckinStatus)
  status: CheckinStatus;
}

class UpdateLocalizacaoDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

@Controller('checkin')
@UseGuards(JwtAuthGuard)
export class CheckinController {
  constructor(private service: CheckinService) {}

  @Get('ativos')
  getAtivos(@CurrentUser() user: any) {
    return this.service.getAtivos(user.tenantId);
  }

  @Get()
  getAll(@CurrentUser() user: any) {
    return this.service.getAll(user.tenantId);
  }

  @Get('meus')
  getMeus(@CurrentUser() user: any) {
    return this.service.findByResponsavel(user.id, user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateCheckinDto, @CurrentUser() user: any) {
    const isStaff = user.role === UserRole.MASTER || user.role === UserRole.ADMIN || user.role === UserRole.RECEPCAO;
    const status = (isStaff && dto.status) ? dto.status : CheckinStatus.A_CAMINHO;
    return this.service.create(user.tenantId, user.id, dto.alunoId, status);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.service.updateStatus(id, user.tenantId, dto.status);
  }

  @Patch(':id/localizacao')
  updateLocalizacao(
    @Param('id') id: string,
    @Body() dto: UpdateLocalizacaoDto,
    @CurrentUser() user: any,
  ) {
    return this.service.updateLocalizacao(id, user.tenantId, user.id, dto.latitude, dto.longitude);
  }

  // ADMIN/RECEPCAO podem cancelar um checkin (remover aluno da fila)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MASTER, UserRole.ADMIN, UserRole.RECEPCAO)
  cancelar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.updateStatus(id, user.tenantId, CheckinStatus.EXPIRADO);
  }
}
