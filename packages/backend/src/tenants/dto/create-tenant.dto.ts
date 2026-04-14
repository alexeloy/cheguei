import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  plano?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  accentColor?: string;

  @IsOptional()
  @IsString()
  textColor?: string;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @IsNumber()
  checkinExpiryMinutes?: number;

  @IsOptional()
  @IsNumber()
  rechamadaCooldownSeconds?: number;

  @IsOptional()
  @IsNumber()
  imagemTransicaoSegundos?: number;

  @IsOptional()
  @IsString()
  preferredVoiceName?: string;

  @IsOptional()
  @IsString()
  subdomain?: string;

  @IsOptional()
  @IsString()
  anuncioTemplate?: string;
}
