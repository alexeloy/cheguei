import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { User } from '../users/user.entity';
import { Aluno } from '../alunos/aluno.entity';

@Entity('responsavel_aluno')
@Unique(['responsavelId', 'alunoId'])
export class ResponsavelAluno {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  responsavelId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'responsavelId' })
  responsavel: User;

  @Column()
  alunoId: string;

  @ManyToOne(() => Aluno, (a) => a.responsaveis)
  @JoinColumn({ name: 'alunoId' })
  aluno: Aluno;
}
