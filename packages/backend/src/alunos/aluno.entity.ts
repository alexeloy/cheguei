import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { ResponsavelAluno } from '../responsavel-aluno/responsavel-aluno.entity';

@Entity('alunos')
export class Aluno {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  nome: string;

  @Column({ nullable: true })
  turma: string;

  @Column({ nullable: true })
  nomeFonetico: string;

  @Column({ nullable: true })
  fotoUrl: string;

  @Column({ default: true })
  ativo: boolean;

  @OneToMany(() => ResponsavelAluno, (ra) => ra.aluno)
  responsaveis: ResponsavelAluno[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
