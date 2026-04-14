import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aluno } from './aluno.entity';
import { ResponsavelAluno } from '../responsavel-aluno/responsavel-aluno.entity';
import { AlunosService } from './alunos.service';
import { AlunosController } from './alunos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Aluno, ResponsavelAluno])],
  providers: [AlunosService],
  controllers: [AlunosController],
  exports: [AlunosService],
})
export class AlunosModule {}
