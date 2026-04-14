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
import { MediaService } from './media.service';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private service: MediaService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query('tenantId') tenantId?: string) {
    if (user.role === UserRole.MASTER) {
      return this.service.findAll(tenantId || undefined);
    }
    return this.service.findAll(user.tenantId);
  }

  @Get('ativas')
  findAtivas(@CurrentUser() user: any) {
    return this.service.findAtivas(user.tenantId);
  }

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MASTER, UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, UPLOAD_DIR);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `media-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|mp4|webm|mov)$/)) {
          return cb(new Error('Formato não suportado'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @CurrentUser() user: any,
  ) {
    const isVideo = file.mimetype.startsWith('video/');
    const url = `/uploads/${file.filename}`;
    return this.service.create(user.tenantId, {
      titulo: body.titulo || file.originalname,
      tipo: isVideo ? 'VIDEO' : ('IMAGEM' as any),
      url,
      ativo: true,
      diasSemana: body.diasSemana ? JSON.parse(body.diasSemana) : [],
      horaInicio: body.horaInicio || null,
      horaFim: body.horaFim || null,
      dataExpiracao: body.dataExpiracao || null,
      duracaoTransicao: body.duracaoTransicao ? parseInt(body.duracaoTransicao) : 5,
      ordem: body.ordem ? parseInt(body.ordem) : 0,
    });
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MASTER, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, user.tenantId, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MASTER, UserRole.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user.tenantId);
  }
}
