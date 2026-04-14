import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

const ROLES = ['ADMIN', 'RECEPCAO', 'RESPONSAVEL'];
const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  RECEPCAO: 'Recepção',
  RESPONSAVEL: 'Responsável',
};
const roleColors: Record<string, string> = {
  ADMIN: 'bg-violet-100 text-violet-700',
  RECEPCAO: 'bg-blue-100 text-blue-700',
  RESPONSAVEL: 'bg-green-100 text-green-700',
};

interface Tenant { id: string; nome: string; primaryColor: string }
interface Aluno { id: string; nome: string; turma: string; tenantId: string }
interface UserRow {
  id: string;
  nome: string;
  email: string;
  cpf?: string;
  telefone?: string;
  role: string;
  tenantId: string;
  tenant?: Tenant;
}

function TenantFilter({
  tenants,
  value,
  onChange,
}: {
  tenants: Tenant[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
    >
      <option value="">Todas as escolas</option>
      {tenants.map((t) => (
        <option key={t.id} value={t.id}>{t.nome}</option>
      ))}
    </select>
  );
}

// --- Alunos panel inside User modal (for RESPONSAVEL) ---
function AlunosPanel({ user, allAlunos }: { user: UserRow; allAlunos: Aluno[] }) {
  const qc = useQueryClient();
  const [selectedAlunoId, setSelectedAlunoId] = useState('');

  const { data: alunos = [], isLoading } = useQuery<Aluno[]>({
    queryKey: ['user-alunos', user.id],
    queryFn: () => api.get(`/users/${user.id}/alunos`).then((r) => r.data),
  });

  const vincular = useMutation({
    mutationFn: (alunoId: string) =>
      api.post(`/alunos/${alunoId}/responsaveis/${user.id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-alunos', user.id] });
      setSelectedAlunoId('');
      toast.success('Aluno vinculado!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erro ao vincular'),
  });

  const desvincular = useMutation({
    mutationFn: (alunoId: string) =>
      api.delete(`/alunos/${alunoId}/responsaveis/${user.id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-alunos', user.id] });
      toast.success('Aluno desvinculado');
    },
  });

  const linkedIds = new Set(alunos.map((a) => a.id));
  const options = allAlunos.filter(
    (a) => a.tenantId === user.tenantId && !linkedIds.has(a.id),
  );

  return (
    <div className="border-t border-gray-100 pt-4">
      <p className="text-sm font-medium text-gray-700 mb-3">Alunos vinculados</p>
      {isLoading ? (
        <p className="text-xs text-gray-400">Carregando...</p>
      ) : (
        <div className="space-y-2 mb-3">
          {alunos.length === 0 ? (
            <p className="text-xs text-gray-400">Nenhum aluno vinculado</p>
          ) : (
            alunos.map((a) => (
              <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">{a.nome}</p>
                  <p className="text-xs text-gray-400">{a.turma || '—'}</p>
                </div>
                <button
                  onClick={() => desvincular.mutate(a.id)}
                  disabled={desvincular.isPending}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remover
                </button>
              </div>
            ))
          )}
        </div>
      )}
      {options.length > 0 && (
        <div className="flex gap-2">
          <select
            value={selectedAlunoId}
            onChange={(e) => setSelectedAlunoId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Selecionar aluno...</option>
            {options.map((a) => (
              <option key={a.id} value={a.id}>{a.nome} — {a.turma || 'sem turma'}</option>
            ))}
          </select>
          <button
            onClick={() => selectedAlunoId && vincular.mutate(selectedAlunoId)}
            disabled={!selectedAlunoId || vincular.isPending}
            className="px-3 py-2 bg-violet-600 text-white rounded-xl text-sm hover:bg-violet-700 disabled:opacity-50"
          >
            + Adicionar
          </button>
        </div>
      )}
    </div>
  );
}

// --- User modal ---
function UserModal({
  user,
  allAlunos,
  tenants,
  isAdmin,
  onClose,
}: {
  user: UserRow | null;
  allAlunos: Aluno[];
  tenants: Tenant[];
  isAdmin: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [cpf, setCpf] = useState(user?.cpf || '');
  const [telefone, setTelefone] = useState(user?.telefone || '');
  const [role, setRole] = useState(user?.role || 'RESPONSAVEL');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState(user?.tenantId || '');

  const save = useMutation({
    mutationFn: async () => {
      const body: any = { nome, email, cpf, telefone, role };
      if (password) body.password = password;
      if (!user) body.password = password || '123456';
      if (isAdmin && tenantId) body.tenantId = tenantId;
      if (user) return api.patch(`/users/${user.id}`, body);
      return api.post('/users', body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'], exact: false });
      toast.success(user ? 'Usuário atualizado!' : 'Usuário criado!');
      if (!user) onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erro ao salvar'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {user ? 'Editar Usuário' : 'Novo Usuário'}
        </h2>
        <div className="space-y-4">
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Escola (Tenant) *</label>
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              >
                <option value="">Selecionar escola...</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              placeholder="Nome completo" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              placeholder="email@exemplo.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <input value={cpf} onChange={(e) => setCpf(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                placeholder="000.000.000-00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input value={telefone} onChange={(e) => setTelefone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                placeholder="(00) 00000-0000" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm">
              {ROLES.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {user ? 'Nova senha (deixe em branco para manter)' : 'Senha *'}
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              placeholder={user ? '••••••••' : 'Mínimo 6 caracteres'} />
          </div>

          {/* Alunos panel — only for RESPONSAVEL and on edit */}
          {user && (role === 'RESPONSAVEL' || user.role === 'RESPONSAVEL') && (
            <AlunosPanel user={user} allAlunos={allAlunos} />
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            {user ? 'Fechar' : 'Cancelar'}
          </button>
          <button
            onClick={() => save.mutate()}
            disabled={!nome || !email || (isAdmin && !tenantId) || save.isPending}
            className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
          >
            {save.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main page ---
export default function AdminUsers() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const selectedTenantId = useAuthStore((s) => s.selectedTenantId);
  const isMaster = user?.role === 'MASTER';
  const isAdmin = isMaster && !selectedTenantId;

  const [editing, setEditing] = useState<UserRow | null | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [tenantFilter, setTenantFilter] = useState('');

  const effectiveTenantFilter = selectedTenantId || tenantFilter;

  const { data: tenants = [] } = useQuery<Tenant[]>({
    queryKey: ['tenants'],
    queryFn: () => api.get('/tenants').then((r) => r.data),
    enabled: isMaster,
  });

  const usersQuery = useQuery<UserRow[]>({
    queryKey: ['users', effectiveTenantFilter],
    queryFn: () => {
      const params = isMaster && effectiveTenantFilter ? `?tenantId=${effectiveTenantFilter}` : '';
      return api.get(`/users${params}`).then((r) => r.data);
    },
  });
  const users = usersQuery.data || [];

  const { data: allAlunos = [] } = useQuery<Aluno[]>({
    queryKey: ['alunos', ''],
    queryFn: () => api.get('/alunos').then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'], exact: false });
      toast.success('Usuário removido');
    },
  });

  const filtered = users.filter((u) =>
    u.nome.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
          <p className="text-sm text-gray-400 mt-0.5">{users.length} usuário{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setEditing(null)}
          className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700">
          + Novo Usuário
        </button>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou email..."
          className="flex-1 min-w-[200px] max-w-sm px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
        {isAdmin && (
          <TenantFilter tenants={tenants} value={tenantFilter} onChange={setTenantFilter} />
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {filtered.map((u) => (
            <div key={u.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold text-sm">
                  {u.nome[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-800 text-sm">{u.nome}</p>
                    {isAdmin && u.tenant && (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ background: u.tenant.primaryColor || '#7C3AED' }}
                      >
                        {u.tenant.nome}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[u.role]}`}>
                  {roleLabels[u.role]}
                </span>
                <button onClick={() => setEditing(u)}
                  className="px-3 py-1.5 text-sm text-violet-600 hover:bg-violet-50 rounded-lg">Editar</button>
                <button onClick={() => { if (confirm('Remover usuário?')) deleteMutation.mutate(u.id); }}
                  className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg">Remover</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">Nenhum usuário encontrado</div>
          )}
        </div>
      </div>

      {editing !== undefined && (
        <UserModal
          user={editing}
          allAlunos={allAlunos}
          tenants={tenants}
          isAdmin={isAdmin}
          onClose={() => setEditing(undefined)}
        />
      )}
    </div>
  );
}
