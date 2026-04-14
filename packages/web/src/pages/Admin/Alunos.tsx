import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getMediaUrl } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

interface Tenant { id: string; nome: string; primaryColor: string }
interface User { id: string; nome: string; email: string; role: string; tenantId: string }
interface Aluno {
  id: string;
  nome: string;
  turma: string;
  nomeFonetico: string;
  fotoUrl?: string;
  ativo: boolean;
  tenantId: string;
  tenant?: Tenant;
}

// --- Tenant filter (only for ADMIN) ---
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

// --- Responsáveis panel inside edit modal ---
function ResponsaveisPanel({ aluno, availableUsers }: { aluno: Aluno; availableUsers: User[] }) {
  const qc = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState('');

  const { data: responsaveis = [], isLoading } = useQuery<User[]>({
    queryKey: ['aluno-responsaveis', aluno.id],
    queryFn: () => api.get(`/alunos/${aluno.id}/responsaveis`).then((r) => r.data),
  });

  const vincular = useMutation({
    mutationFn: (responsavelId: string) =>
      api.post(`/alunos/${aluno.id}/responsaveis/${responsavelId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['aluno-responsaveis', aluno.id] });
      setSelectedUserId('');
      toast.success('Responsável vinculado!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erro ao vincular'),
  });

  const desvincular = useMutation({
    mutationFn: (responsavelId: string) =>
      api.delete(`/alunos/${aluno.id}/responsaveis/${responsavelId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['aluno-responsaveis', aluno.id] });
      toast.success('Responsável removido');
    },
  });

  const linkedIds = new Set(responsaveis.map((r) => r.id));
  const options = availableUsers.filter(
    (u) => u.role === 'RESPONSAVEL' && u.tenantId === aluno.tenantId && !linkedIds.has(u.id),
  );

  return (
    <div className="border-t border-gray-100 pt-4">
      <p className="text-sm font-medium text-gray-700 mb-3">Responsáveis</p>
      {isLoading ? (
        <p className="text-xs text-gray-400">Carregando...</p>
      ) : (
        <div className="space-y-2 mb-3">
          {responsaveis.length === 0 ? (
            <p className="text-xs text-gray-400">Nenhum responsável vinculado</p>
          ) : (
            responsaveis.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">{r.nome}</p>
                  <p className="text-xs text-gray-400">{r.email}</p>
                </div>
                <button
                  onClick={() => desvincular.mutate(r.id)}
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
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Selecionar responsável...</option>
            {options.map((u) => (
              <option key={u.id} value={u.id}>{u.nome} ({u.email})</option>
            ))}
          </select>
          <button
            onClick={() => selectedUserId && vincular.mutate(selectedUserId)}
            disabled={!selectedUserId || vincular.isPending}
            className="px-3 py-2 bg-violet-600 text-white rounded-xl text-sm hover:bg-violet-700 disabled:opacity-50"
          >
            + Adicionar
          </button>
        </div>
      )}
    </div>
  );
}

// --- Aluno Modal ---
function AlunoModal({
  aluno,
  allUsers,
  tenants,
  isAdmin,
  onClose,
}: {
  aluno: Aluno | null;
  allUsers: User[];
  tenants: Tenant[];
  isAdmin: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [nome, setNome] = useState(aluno?.nome || '');
  const [turma, setTurma] = useState(aluno?.turma || '');
  const [nomeFonetico, setNomeFonetico] = useState(aluno?.nomeFonetico || '');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [tenantId, setTenantId] = useState(aluno?.tenantId || '');

  const save = useMutation({
    mutationFn: async () => {
      let result;
      if (aluno) {
        result = await api.patch(`/alunos/${aluno.id}`, { nome, turma, nomeFonetico });
      } else {
        const body: any = { nome, turma, nomeFonetico };
        if (isAdmin && tenantId) body.tenantId = tenantId;
        result = await api.post('/alunos', body);
      }
      if (fotoFile) {
        const fd = new FormData();
        fd.append('file', fotoFile);
        await api.post(`/alunos/${result.data.id}/foto`, fd);
      }
      return result.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alunos'], exact: false });
      toast.success(aluno ? 'Aluno atualizado!' : 'Aluno criado!');
      if (!aluno) onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erro ao salvar'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {aluno ? 'Editar Aluno' : 'Novo Aluno'}
        </h2>
        <div className="space-y-4">
          {isAdmin && !aluno && (
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
          {isAdmin && aluno && aluno.tenant && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ background: aluno.tenant.primaryColor || '#7C3AED' }}
              />
              <span className="text-sm text-gray-600">Escola: <strong>{aluno.tenant.nome}</strong></span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              placeholder="Nome do aluno"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
              <input
                value={turma}
                onChange={(e) => setTurma(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                placeholder="Ex: 3º C"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fonético</label>
              <input
                value={nomeFonetico}
                onChange={(e) => setNomeFonetico(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                placeholder="Para fala"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFotoFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
          </div>

          {/* Responsáveis — only on edit */}
          {aluno && (
            <ResponsaveisPanel aluno={aluno} availableUsers={allUsers} />
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            {aluno ? 'Fechar' : 'Cancelar'}
          </button>
          <button
            onClick={() => save.mutate()}
            disabled={!nome || (isAdmin && !aluno && !tenantId) || save.isPending}
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
export default function AdminAlunos() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const selectedTenantId = useAuthStore((s) => s.selectedTenantId);
  const isMaster = user?.role === 'MASTER';
  // MASTER sem tenant selecionado → modo cross-tenant (filtro + badges)
  const isAdmin = isMaster && !selectedTenantId;

  const [editing, setEditing] = useState<Aluno | null | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [tenantFilter, setTenantFilter] = useState('');

  // Quando MASTER tem tenant selecionado, usa ele como filtro fixo
  const effectiveTenantFilter = selectedTenantId || tenantFilter;

  const { data: tenants = [] } = useQuery<Tenant[]>({
    queryKey: ['tenants'],
    queryFn: () => api.get('/tenants').then((r) => r.data),
    enabled: isMaster,
  });

  const alunosQuery = useQuery<Aluno[]>({
    queryKey: ['alunos', effectiveTenantFilter],
    queryFn: () => {
      const params = isMaster && effectiveTenantFilter ? `?tenantId=${effectiveTenantFilter}` : '';
      return api.get(`/alunos${params}`).then((r) => r.data);
    },
  });
  const alunos = alunosQuery.data || [];

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ['users', ''],
    queryFn: () => api.get('/users').then((r) => r.data),
    enabled: isAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/alunos/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alunos'], exact: false });
      toast.success('Aluno removido');
    },
  });

  const filtered = alunos.filter((a) =>
    a.nome.toLowerCase().includes(search.toLowerCase()) ||
    a.turma?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Alunos</h1>
          <p className="text-sm text-gray-400 mt-0.5">{alunos.length} aluno{alunos.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setEditing(null)}
          className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700"
        >
          + Novo Aluno
        </button>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou turma..."
          className="flex-1 min-w-[200px] max-w-sm px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
        />
        {isAdmin && (
          <TenantFilter tenants={tenants} value={tenantFilter} onChange={setTenantFilter} />
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {filtered.map((aluno) => (
            <div key={aluno.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-violet-100 flex-shrink-0">
                  {aluno.fotoUrl ? (
                    <img src={getMediaUrl(aluno.fotoUrl)} alt={aluno.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-violet-700 font-bold">
                      {aluno.nome[0]}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-800">{aluno.nome}</p>
                    {isAdmin && aluno.tenant && (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ background: aluno.tenant.primaryColor || '#7C3AED' }}
                      >
                        {aluno.tenant.nome}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{aluno.turma || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(aluno)}
                  className="px-3 py-1.5 text-sm text-violet-600 hover:bg-violet-50 rounded-lg"
                >
                  Editar
                </button>
                <button
                  onClick={() => { if (confirm('Remover aluno?')) deleteMutation.mutate(aluno.id); }}
                  className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">
              {search ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
            </div>
          )}
        </div>
      </div>

      {editing !== undefined && (
        <AlunoModal
          aluno={editing}
          allUsers={allUsers}
          tenants={tenants}
          isAdmin={isAdmin}
          onClose={() => setEditing(undefined)}
        />
      )}
    </div>
  );
}
