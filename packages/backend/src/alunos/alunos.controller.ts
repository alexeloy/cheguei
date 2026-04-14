import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UPLOAD_DIR } from '../config/upload.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';
import { AlunosService } from './alunos.service';
import { CreateAlunoDto } from './dto/create-aluno.dto';

@Controller('alunos')
@UseGuards(JwtAuthGuard)
export class AlunosController {
  constructor(private service: AlunosService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query('tenantId') tenantId?: string) {
    if (user.role === UserRole.RESPONSAVEL) {
      return this.service.findByResponsavel(user.id, user.tenantId);
    }
    if (user.role === UserRole.MASTER) {
      return this.service.findAll(tenantId || undefined);
    }
    return this.service.findAll(user.tenantId);
  }

  @Get(':id/responsaveis')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MASTER, UserRole.ADMIN, UserRole.RECEPCAO)
  findResponsaveis(@Param('id') id: string) {
    return this.service.findResponsaveis(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user.role === UserRole.MASTER ? undefined : user.tenantId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.MASTER, UserRole.ADMIN, UserRole.RECEPCAO)
  create(@Body() dto: CreateAlunoDto, @CurrentUser() user: any) {
    const tenantId = (user.role === UserRole.MASTER && dto.tenantId) ? dto.tenantId : user.tenantId;
    const { tenantId: _, ...rest } = dto;
    return this.service.create(tenantId, rest as CreateAlunoDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MASTER, UserRole.ADMIN, UserRole.RECEPCAO)
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAlunoDto>,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, user.role === UserRole.MASTER ? undefined : user.tenantId, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MASTER, UserRole.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user.role === UserRole.MASTER ? undefined : user.tenantId);
  }

  @Post(':id/responsaveis/:responsavelId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MASTER, UserRole.ADMIN, UserRole.RECEPCAO)
  vincularResponsavel(
    @Param('id') id: string,
    @Param('responsavelId') responsavelId: string,
    @CurrentUser() user: any,
  ) {
    return this.service.vincularResponsavel(id, responsavelId, user.role === UserRole.MASTER ? undefined : user.tenantId);
  }

  @Delete(':id/responsaveis/:responsavelId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MASTER, UserRole.ADMIN, UserRole.RECEPCAO)
  desvincularResponsavel(
    @Param('id') id: string,
    @Param('responsavelId') responsavelId: string,
  ) {
    return this.service.desvincularResponsavel(id, responsavelId);
  }

  @Post(':id/foto')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MASTER, UserRole.ADMIN, UserRole.RECEPCAO)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, UPLOAD_DIR);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `aluno-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Apenas imagens são permitidas'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    const fotoUrl = `/uploads/${file.filename}`;
    return this.service.update(id, user.role === UserRole.MASTER ? undefined : user.tenantId, { fotoUrl });
  }
}
