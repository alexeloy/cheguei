import { Controller, Post, Body, Get, Patch, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

class ChangePasswordDto {
  @IsString()
  senhaAtual: string;

  @IsString()
  @MinLength(6)
  novaSenha: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: any) {
    return this.authService.getMe(user.id);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() user: any) {
    return this.authService.changePassword(user.id, dto.senhaAtual, dto.novaSenha);
  }
}
