import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';

export enum MediaTipo {
  IMAGEM = 'IMAGEM',
  VIDEO = 'VIDEO',
}

@Entity('medias')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  titulo: string;

  @Column({ type: 'varchar', default: MediaTipo.IMAGEM })
  tipo: MediaTipo;

  @Column()
  url: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ type: 'simple-array', nullable: true })
  diasSemana: string[];

  @Column({ nullable: true })
  horaInicio: string;

  @Column({ nullable: true })
  horaFim: string;

  @Column({ type: 'date', nullable: true })
  dataExpiracao: string;

  @Column({ default: 5 })
  duracaoTransicao: number;

  @Column({ default: 0 })
  ordem: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
