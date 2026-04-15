import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { User } from '../users/user.entity';
import { Aluno } from '../alunos/aluno.entity';

export enum CheckinStatus {
  A_CAMINHO = 'A_CAMINHO',   // Pai indicou que está vindo — aparece na faixa inferior
  CHEGOU = 'CHEGOU',         // Pai chegou — entra na fila de anúncio do painel
  ANUNCIADO = 'ANUNCIADO',   // Painel anunciou e timer expirou — concluído
  EXPIRADO = 'EXPIRADO',     // Cron expirou sem conclusão
}

@Entity('checkins')
export class Checkin {
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

  @ManyToOne(() => Aluno)
  @JoinColumn({ name: 'alunoId' })
  aluno: Aluno;

  @Column({ type: 'varchar', default: CheckinStatus.A_CAMINHO })
  status: CheckinStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  ultimaChamada: Date;

  @Column({ type: 'float', nullable: true })
  ultimaLatitude: number;

  @Column({ type: 'float', nullable: true })
  ultimaLongitude: number;

  @Column({ type: 'timestamp', nullable: true })
  ultimaLocalizacaoAt: Date;

  @Column({ nullable: true })
  etaMinutos: number;

  @Column({ nullable: true })
  distanciaMetros: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
