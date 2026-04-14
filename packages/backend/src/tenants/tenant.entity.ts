import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany,
} from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ default: 'FREE' })
  plano: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ default: '#7C3AED' })
  primaryColor: string;

  @Column({ default: '#4F46E5' })
  secondaryColor: string;

  @Column({ default: '#A78BFA' })
  accentColor: string;

  @Column({ default: '#FFFFFF' })
  textColor: string;

  @Column({ default: 'Inter' })
  fontFamily: string;

  @Column({ default: 60 })
  checkinExpiryMinutes: number;

  @Column({ default: 40 })
  rechamadaCooldownSeconds: number;

  @Column({ default: 5 })
  imagemTransicaoSegundos: number;

  @Column({ nullable: true })
  preferredVoiceName: string;

  @Column({ nullable: true })
  subdomain: string;

  @Column({ default: '<nome> do <turma>' })
  anuncioTemplate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
