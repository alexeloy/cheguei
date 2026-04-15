import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { Tenant } from '../tenants/tenant.entity';
import { User, UserRole } from '../users/user.entity';
import { Aluno } from '../alunos/aluno.entity';
import { ResponsavelAluno } from '../responsavel-aluno/responsavel-aluno.entity';
import { Checkin } from '../checkin/checkin.entity';
import { Media } from '../media/media.entity';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://cheguei:cheguei123@localhost:5432/cheguei',
  entities: [Tenant, User, Aluno, ResponsavelAluno, Checkin, Media],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('🌱 Iniciando seed...');

  const tenantRepo = dataSource.getRepository(Tenant);
  const userRepo = dataSource.getRepository(User);
  const alunoRepo = dataSource.getRepository(Aluno);
  const raRepo = dataSource.getRepository(ResponsavelAluno);

  // Tenant
  let tenant = await tenantRepo.findOne({ where: { subdomain: 'demo' } });
  if (!tenant) {
    tenant = tenantRepo.create({
      nome: 'Colégio Vita',
      plano: 'PREMIUM',
      ativo: true,
      primaryColor: '#7C3AED',
      secondaryColor: '#4F46E5',
      accentColor: '#A78BFA',
      textColor: '#FFFFFF',
      fontFamily: 'Inter',
      subdomain: 'demo',
      checkinExpiryMinutes: 60,
      rechamadaCooldownSeconds: 40,
      imagemTransicaoSegundos: 5,
    });
    tenant = await tenantRepo.save(tenant);
    console.log('✅ Tenant criado:', tenant.nome);
  }

  const hash = async (pwd: string) => bcrypt.hash(pwd, 10);

  // Master (super admin do sistema)
  let master = await userRepo.findOne({ where: { email: 'master@cheguei.com' } });
  if (!master) {
    master = userRepo.create({
      tenantId: tenant.id,
      nome: 'Master',
      email: 'master@cheguei.com',
      passwordHash: await hash('45362718'),
      role: UserRole.MASTER,
      ativo: true,
    });
    await userRepo.save(master);
    console.log('✅ Master criado: master@cheguei.com / 45362718');
  }

  // Admin (administrador do tenant)
  let admin = await userRepo.findOne({ where: { email: 'admin@cheguei.com' } });
  if (!admin) {
    admin = userRepo.create({
      tenantId: tenant.id,
      nome: 'Administrador',
      email: 'admin@cheguei.com',
      passwordHash: await hash('45362718'),
      role: UserRole.ADMIN,
      ativo: true,
    });
    await userRepo.save(admin);
    console.log('✅ Admin criado: admin@cheguei.com / 45362718');
  }

  // Recepção
  let recepcao = await userRepo.findOne({ where: { email: 'recepcao@cheguei.com' } });
  if (!recepcao) {
    recepcao = userRepo.create({
      tenantId: tenant.id,
      nome: 'Recepção',
      email: 'recepcao@cheguei.com',
      passwordHash: await hash('recepcao123'),
      role: UserRole.RECEPCAO,
      ativo: true,
    });
    await userRepo.save(recepcao);
    console.log('✅ Recepção criada: recepcao@cheguei.com / recepcao123');
  }

  // Responsáveis
  const responsaveis = [
    { nome: 'Ana Silva', email: 'ana@example.com', cpf: '111.111.111-11' },
    { nome: 'Carlos Souza', email: 'carlos@example.com', cpf: '222.222.222-22' },
    { nome: 'Maria Santos', email: 'maria@example.com', cpf: '333.333.333-33' },
  ];

  const responsaveisSalvos: User[] = [];
  for (const r of responsaveis) {
    let resp = await userRepo.findOne({ where: { email: r.email } });
    if (!resp) {
      resp = userRepo.create({
        tenantId: tenant.id,
        nome: r.nome,
        email: r.email,
        cpf: r.cpf,
        passwordHash: await hash('123456'),
        role: UserRole.RESPONSAVEL,
        ativo: true,
      });
      resp = await userRepo.save(resp);
      console.log(`✅ Responsável criado: ${r.email} / 123456`);
    }
    responsaveisSalvos.push(resp);
  }

  // Alunos
  const alunosDados = [
    { nome: 'Gustavo Eloy', turma: '3º C', nomeFonetico: 'Gustavo Eloy' },
    { nome: 'Larissa Souza', turma: '1º A', nomeFonetico: 'Larissa Souza' },
    { nome: 'Pedro Henrique', turma: '2º B', nomeFonetico: 'Pedro Henrique' },
    { nome: 'Beatriz Lima', turma: '4º D', nomeFonetico: 'Beatriz Lima' },
    { nome: 'Rafael Costa', turma: '5º A', nomeFonetico: 'Rafael Costa' },
  ];

  const alunosSalvos: Aluno[] = [];
  for (const a of alunosDados) {
    let aluno = await alunoRepo.findOne({ where: { nome: a.nome, tenantId: tenant.id } });
    if (!aluno) {
      aluno = alunoRepo.create({ ...a, tenantId: tenant.id });
      aluno = await alunoRepo.save(aluno);
      console.log(`✅ Aluno criado: ${a.nome}`);
    }
    alunosSalvos.push(aluno);
  }

  // Vínculos responsável-aluno
  const vinculos = [
    { responsavel: responsaveisSalvos[0], alunos: [alunosSalvos[0], alunosSalvos[1]] },
    { responsavel: responsaveisSalvos[1], alunos: [alunosSalvos[2]] },
    { responsavel: responsaveisSalvos[2], alunos: [alunosSalvos[3], alunosSalvos[4]] },
  ];

  for (const v of vinculos) {
    for (const aluno of v.alunos) {
      const exists = await raRepo.findOne({
        where: { responsavelId: v.responsavel.id, alunoId: aluno.id },
      });
      if (!exists) {
        await raRepo.save(
          raRepo.create({
            tenantId: tenant.id,
            responsavelId: v.responsavel.id,
            alunoId: aluno.id,
          }),
        );
        console.log(`✅ Vínculo: ${v.responsavel.nome} → ${aluno.nome}`);
      }
    }
  }

  await dataSource.destroy();
  console.log('\n🎉 Seed concluído!');
  console.log('\n📋 Usuários para teste:');
  console.log('  Master:    master@cheguei.com   / 45362718');
  console.log('  Admin:     admin@cheguei.com    / 45362718');
  console.log('  Recepção:  recepcao@cheguei.com / recepcao123');
  console.log('  Pai 1:     ana@example.com      / 123456 (filhos: Gustavo, Larissa)');
  console.log('  Pai 2:     carlos@example.com   / 123456 (filho: Pedro)');
  console.log('  Pai 3:     maria@example.com    / 123456 (filhos: Beatriz, Rafael)');
}

seed().catch((e) => {
  console.error('Erro no seed:', e);
  process.exit(1);
});
