import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from './user.entity';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MASTER, UserRole.ADMIN)
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query('tenantId') tenantId?: string) {
    if (user.role === UserRole.MASTER) {
      return this.service.findAll(tenantId || undefined);
    }
    return this.service.findAll(user.tenantId);
  }

  @Get(':id/alunos')
  findAlunos(@Param('id') id: string) {
    return this.service.findAlunos(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user.role === UserRole.MASTER ? undefined : user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateUserDto, @CurrentUser() user: any) {
    const tenantId = (user.role === UserRole.MASTER && dto.tenantId) ? dto.tenantId : user.tenantId;
    const { tenantId: _, ...rest } = dto;
    return this.service.create(tenantId, rest as CreateUserDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateUserDto>,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, user.role === UserRole.MASTER ? undefined : user.tenantId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user.role === UserRole.MASTER ? undefined : user.tenantId);
  }

  @Patch('me/selected-tenant')
  @Roles(UserRole.MASTER)
  updateSelectedTenant(@Body() body: { selectedTenantId: string | null }, @CurrentUser() user: any) {
    return this.service.updateSelectedTenant(user.id, body.selectedTenantId);
  }
}
