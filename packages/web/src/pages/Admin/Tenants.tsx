import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PLANOS = ['FREE', 'BASIC', 'PREMIUM'];

const planoColors: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-600',
  BASIC: 'bg-blue-100 text-blue-700',
  PREMIUM: 'bg-violet-100 text-violet-700',
};

interface Tenant {
  id: string;
  nome: string;
  plano: string;
  ativo: boolean;
  subdomain?: string;
  primaryColor: string;
  preferredVoiceName?: string;
  logoUrl?: string;
  anuncioTemplate?: string;
  createdAt: string;
}

function TenantModal({
  tenant,
  onClose,
}: {
  tenant: Tenant | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [nome, setNome] = useState(tenant?.nome || '');
  const [plano, setPlano] = useState(tenant?.plano || 'FREE');
  const [subdomain, setSubdomain] = useState(tenant?.subdomain || '');
  const [primaryColor, setPrimaryColor] = useState(tenant?.primaryColor || '#7C3AED');
  const [ativo, setAtivo] = useState(tenant?.ativo ?? true);
  const [preferredVoiceName, setPreferredVoiceName] = useState(tenant?.preferredVoiceName || '');
  const [anuncioTemplate, setAnuncioTemplate] = useState(tenant?.anuncioTemplate || '<nome> do <turma>');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState(tenant?.logoUrl || '');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Carregar vozes disponíveis
  useEffect(() => {
    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const ptBrVoices = voices.filter(v => v.lang.includes('pt-BR'));
      setAvailableVoices(ptBrVoices);
    };

    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    updateVoices();
    return () => window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
  }, []);

  // Campos extras só para criação: primeiro usuário admin
  const [adminNome, setAdminNome] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminSenha, setAdminSenha] = useState('');

  const save = useMutation({
    mutationFn: async () => {
      if (tenant) {
        // Update existing tenant
        let finalLogoUrl = logoUrl;
        if (logoFile) {
          const formData = new FormData();
          formData.append('file', logoFile);
          const uploadResponse = await api.post(`/tenants/${tenant.id}/logo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          finalLogoUrl = uploadResponse.data.logoUrl;
        }
        return api.patch(`/tenants/${tenant.id}`, { nome, plano, subdomain, primaryColor, ativo, preferredVoiceName, logoUrl: finalLogoUrl, anuncioTemplate });
      } else {
        // Create new tenant
        const { data: novoTenant } = await api.post('/tenants', {
          nome, plano, subdomain, primaryColor, preferredVoiceName, anuncioTemplate,
        });
        // Upload logo if selected
        if (logoFile) {
          const formData = new FormData();
          formData.append('file', logoFile);
          await api.post(`/tenants/${novoTenant.id}/logo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
        // Cria o primeiro admin do tenant
        if (adminEmail && adminSenha) {
          await api.post('/users', {
            nome: adminNome || nome,
            email: adminEmail,
            password: adminSenha,
            role: 'ADMIN',
            tenantId: novoTenant.id,
          });
        }
        return novoTenant;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants'] });
      toast.success(tenant ? 'Tenant atualizado!' : 'Tenant criado!');
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erro ao salvar'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-4 md:p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">
            {tenant ? 'Editar Tenant' : 'Novo Tenant'}
          </h2>
          <button
            onClick={onClose}
            className="md:hidden p-1 hover:bg-gray-100 rounded"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Dados do tenant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da escola *</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              placeholder="Ex: Colégio Vita"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
              <select
                value={plano}
                onChange={(e) => setPlano(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              >
                {PLANOS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subdomínio</label>
              <input
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-mono"
                placeholder="minha-escola"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cor primária</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-xl border-0 cursor-pointer"
              />
              <input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-mono"
              />
              {/* Preview */}
              <div
                className="w-10 h-10 rounded-xl flex-shrink-0"
                style={{ background: primaryColor }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logomarca da escola</label>
            <div className="space-y-2">
              {logoUrl && (
                <div className="flex items-center gap-2">
                  <img src={logoUrl} alt="Logo atual" className="w-12 h-12 object-contain border rounded" />
                  <span className="text-sm text-gray-500">Logo atual</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setLogoFile(file);
                    setLogoUrl(URL.createObjectURL(file)); // Preview
                  }
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm file:mr-4 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
            </div>
          </div>

          {availableVoices.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voz para anúncios</label>
              <select
                value={preferredVoiceName}
                onChange={(e) => setPreferredVoiceName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              >
                <option value="">Voz padrão do sistema</option>
                {availableVoices.map(voice => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template de anúncio</label>
            <textarea
              value={anuncioTemplate}
              onChange={(e) => setAnuncioTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              placeholder="Use &lt;nome&gt; e &lt;turma&gt; para os campos dinâmicos"
              rows={2}
            />
            <p className="text-xs text-gray-400 mt-1">Exemplo: &lt;nome&gt; da turma &lt;turma&gt;</p>
          </div>

          {tenant && (
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setAtivo((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  ativo ? 'bg-violet-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    ativo ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600">Tenant {ativo ? 'ativo' : 'inativo'}</span>
            </div>
          )}

          {/* Primeiro admin — só na criação */}
          {!tenant && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Usuário administrador inicial <span className="text-gray-400 font-normal">(opcional)</span>
              </p>
              <div className="space-y-3">
                <input
                  value={adminNome}
                  onChange={(e) => setAdminNome(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                  placeholder="Nome do administrador"
                />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                  placeholder="email@escola.com"
                />
                <input
                  type="password"
                  value={adminSenha}
                  onChange={(e) => setAdminSenha(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                  placeholder="Senha (mín. 6 caracteres)"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => save.mutate()}
            disabled={!nome || save.isPending}
            className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
          >
            {save.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminTenants() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Tenant | null | undefined>(undefined);
  const [search, setSearch] = useState('');

  const { data: tenants = [], isLoading } = useQuery<Tenant[]>({
    queryKey: ['tenants'],
    queryFn: () => api.get('/tenants').then((r) => r.data),
  });

  const toggleAtivo = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) =>
      api.patch(`/tenants/${id}`, { ativo }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  });

  const filtered = tenants.filter((t) =>
    t.nome.toLowerCase().includes(search.toLowerCase()) ||
    t.subdomain?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tenants</h1>
          <p className="text-sm text-gray-400 mt-0.5">{tenants.length} escola{tenants.length !== 1 ? 's' : ''} cadastrada{tenants.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setEditing(null)}
          className="w-full md:w-auto px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          + Novo Tenant
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nome ou subdomínio..."
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm mb-4"
      />

      {isLoading ? (
        <div className="text-gray-400 text-sm">Carregando...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map((tenant) => (
              <div key={tenant.id} className="px-3 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50 transition-colors gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Color swatch */}
                  <div
                    className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm"
                    style={{ background: tenant.primaryColor || '#7C3AED' }}
                  >
                    {tenant.nome[0]}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-800 truncate">{tenant.nome}</p>
                      {!tenant.ativo && (
                        <span className="px-2 py-0.5 bg-red-50 text-red-500 text-xs rounded-full font-medium flex-shrink-0">
                          Inativo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {tenant.subdomain && (
                        <span className="text-xs text-gray-400 font-mono truncate">{tenant.subdomain}</span>
                      )}
                      {tenant.subdomain && <span className="text-gray-200">·</span>}
                      <span className="text-xs text-gray-400 font-mono flex-shrink-0">{tenant.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-start sm:justify-normal flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${planoColors[tenant.plano] || planoColors.FREE}`}>
                    {tenant.plano}
                  </span>

                  <button
                    onClick={() => toggleAtivo.mutate({ id: tenant.id, ativo: !tenant.ativo })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
                      tenant.ativo ? 'bg-violet-600' : 'bg-gray-200'
                    }`}
                    title={tenant.ativo ? 'Desativar' : 'Ativar'}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        tenant.ativo ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => setEditing(tenant)}
                    className="px-3 py-1.5 text-sm text-violet-600 hover:bg-violet-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="px-4 md:px-6 py-16 text-center">
                <div className="text-3xl mb-3">🏫</div>
                <p className="text-gray-400 text-sm">
                  {search ? 'Nenhum tenant encontrado' : 'Nenhum tenant cadastrado'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {editing !== undefined && (
        <TenantModal tenant={editing} onClose={() => setEditing(undefined)} />
      )}
    </div>
  );
}
