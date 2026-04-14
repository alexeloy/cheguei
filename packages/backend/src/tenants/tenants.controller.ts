import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, UseInterceptors, UploadedFile,
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
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private service: TenantsService) {}

  @Get()
  @Roles(UserRole.MASTER)
  @UseGuards(RolesGuard)
  findAll() {
    return this.service.findAll();
  }

  @Get('me')
  getMyTenant(@CurrentUser() user: any) {
    return this.service.findOne(user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(UserRole.MASTER)
  @UseGuards(RolesGuard)
  create(@Body() dto: CreateTenantDto) {
    return this.service.create(dto);
  }

  @Patch('me')
  @Roles(UserRole.MASTER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  updateMe(@CurrentUser() user: any, @Body() dto: Partial<CreateTenantDto>) {
    return this.service.update(user.tenantId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.MASTER)
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() dto: Partial<CreateTenantDto>) {
    return this.service.update(id, dto);
  }

  @Post('me/logo')
  @Roles(UserRole.MASTER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, UPLOAD_DIR);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `logo-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadLogo(@CurrentUser() user: any, @UploadedFile() file: Express.Multer.File) {
    const logoUrl = `/uploads/${file.filename}`;
    return this.service.update(user.tenantId, { logoUrl });
  }

  @Post(':id/logo')
  @Roles(UserRole.MASTER)
  @UseGuards(RolesGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, UPLOAD_DIR);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `logo-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadLogoById(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const logoUrl = `/uploads/${file.filename}`;
    return this.service.update(id, { logoUrl });
  }
}
