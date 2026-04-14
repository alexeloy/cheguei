import { IsString, IsOptional } from 'class-validator';

export class CreateAlunoDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  turma?: string;

  @IsOptional()
  @IsString()
  nomeFonetico?: string;

  @IsOptional()
  @IsString()
  fotoUrl?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}
