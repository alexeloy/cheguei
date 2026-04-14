import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';

export enum UserRole {
  MASTER = 'MASTER',
  ADMIN = 'ADMIN',
  RECEPCAO = 'RECEPCAO',
  RESPONSAVEL = 'RESPONSAVEL',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // MASTER: último tenant selecionado para contexto de visualização
  @Column({ nullable: true })
  selectedTenantId: string;

  @Column()
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  cpf: string;

  @Column({ nullable: true })
  telefone: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'varchar', default: UserRole.RESPONSAVEL })
  role: UserRole;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
