import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getMediaUrl } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

interface Tenant { id: string; nome: string; primaryColor: string }

const DIAS = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO'];
const diasLabel: Record<string, string> = {
  SEGUNDA: 'Seg', TERCA: 'Ter', QUARTA: 'Qua', QUINTA: 'Qui',
  SEXTA: 'Sex', SABADO: 'Sáb', DOMINGO: 'Dom',
};

function MediaEditModal({ media, onClose }: { media: any; onClose: () => void }) {
  const qc = useQueryClient();
  const [titulo, setTitulo] = useState(media.titulo || '');
  const [dias, setDias] = useState<string[]>(media.diasSemana || []);
  const [horaInicio, setHoraInicio] = useState(media.horaInicio || '');
  const [horaFim, setHoraFim] = useState(media.horaFim || '');
  const [dataExpiracao, setDataExpiracao] = useState(media.dataExpiracao ? media.dataExpiracao.split('T')[0] : '');
  const [duracao, setDuracao] = useState(media.duracaoTransicao?.toString() || '5');
  const [ativo, setAtivo] = useState(media.ativo ?? true);

  const toggleDia = (d: string) => {
    setDias((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };

  const update = useMutation({
    mutationFn: async () => {
      return api.patch(`/media/${media.id}`, {
        titulo,
        diasSemana: dias,
        horaInicio: horaInicio || null,
        horaFim: horaFim || null,
        dataExpiracao: dataExpiracao || null,
        duracaoTransicao: parseInt(duracao),
        ativo,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medias'], exact: false });
      toast.success('Mídia atualizada!');
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erro ao atualizar'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Editar Mídia</h2>

        {/* Preview */}
        <div className="relative rounded-xl overflow-hidden mb-4 aspect-video bg-gray-100">
          {media.tipo === 'VIDEO' ? (
            <video src={getMediaUrl(media.url)} className="w-full h-full object-cover" muted controls />
          ) : (
            <img src={getMediaUrl(media.url)} alt={media.titulo} className="w-full h-full object-cover" />
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              placeholder="Nome da mídia"
            />
          </div>

          {media.tipo === 'IMAGEM' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duração de exibição (segundos)
              </label>
              <input
                type="number"
                value={duracao}
                onChange={(e) => setDuracao(e.target.value)}
                min="1"
                max="60"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dias da semana</label>
            <div className="flex flex-wrap gap-2">
              {DIAS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDia(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    dias.includes(d) ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {diasLabel[d]}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">Vazio = todos os dias</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora início</label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora fim</label>
              <input
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de expiração</label>
            <input
              type="date"
              value={dataExpiracao}
              onChange={(e) => setDataExpiracao(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="ativo"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="w-4 h-4 text-violet-600 bg-gray-100 border-gray-300 rounded focus:ring-violet-500"
            />
            <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
              Mídia ativa
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => update.mutate()}
            disabled={update.isPending}
            className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
          >
            {update.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MediaUploadModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [titulo, setTitulo] = useState('');
  const [dias, setDias] = useState<string[]>([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [dataExpiracao, setDataExpiracao] = useState('');
  const [duracao, setDuracao] = useState('5');
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    if (!titulo) setTitulo(f.name.split('.')[0]);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const toggleDia = (d: string) => {
    setDias((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };

  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Selecione um arquivo');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('titulo', titulo || file.name);
      fd.append('diasSemana', JSON.stringify(dias));
      if (horaInicio) fd.append('horaInicio', horaInicio);
      if (horaFim) fd.append('horaFim', horaFim);
      if (dataExpiracao) fd.append('dataExpiracao', dataExpiracao);
      fd.append('duracaoTransicao', duracao);
      return api.post('/media/upload', fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medias'], exact: false });
      toast.success('Mídia enviada!');
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erro ao enviar'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Nova Mídia</h2>

        {!file ? (
          <label className="block border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-colors">
            <div className="text-3xl mb-2">📁</div>
            <p className="text-sm text-gray-500">Clique para selecionar imagem ou vídeo</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, MP4, WebM (máx. 100MB)</p>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
        ) : (
          <div className="relative rounded-xl overflow-hidden mb-4 aspect-video bg-gray-100">
            {file.type.startsWith('video/') ? (
              <video src={preview!} className="w-full h-full object-cover" muted />
            ) : (
              <img src={preview!} alt="preview" className="w-full h-full object-cover" />
            )}
            <button onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full text-white text-sm flex items-center justify-center hover:bg-black/70">
              ✕
            </button>
          </div>
        )}

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              placeholder="Nome da mídia" />
          </div>

          {file && !file.type.startsWith('video/') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duração de exibição (segundos)
              </label>
              <input type="number" value={duracao} onChange={(e) => setDuracao(e.target.value)}
                min="1" max="60"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dias da semana</label>
            <div className="flex flex-wrap gap-2">
              {DIAS.map((d) => (
                <button key={d} type="button" onClick={() => toggleDia(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    dias.includes(d) ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {diasLabel[d]}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">Vazio = todos os dias</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora início</label>
              <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora fim</label>
              <input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de expiração</label>
            <input type="date" value={dataExpiracao} onChange={(e) => setDataExpiracao(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={() => upload.mutate()} disabled={!file || upload.isPending}
            className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50">
            {upload.isPending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminMedia() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const selectedTenantId = useAuthStore((s) => s.selectedTenantId);
  const isMaster = user?.role === 'MASTER';
  const isAdmin = isMaster && !selectedTenantId;

  const [showUpload, setShowUpload] = useState(false);
  const [editingMedia, setEditingMedia] = useState<any>(null);
  const [tenantFilter, setTenantFilter] = useState('');

  const effectiveTenantFilter = selectedTenantId || tenantFilter;

  const { data: tenants = [] } = useQuery<Tenant[]>({
    queryKey: ['tenants'],
    queryFn: () => api.get('/tenants').then((r) => r.data),
    enabled: isMaster,
  });

  const { data: medias = [] } = useQuery({
    queryKey: ['medias', effectiveTenantFilter],
    queryFn: () => {
      const params = isMaster && effectiveTenantFilter ? `?tenantId=${effectiveTenantFilter}` : '';
      return api.get(`/media${params}`).then((r) => r.data);
    },
  });

  const toggleAtivo = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) =>
      api.patch(`/media/${id}`, { ativo }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medias'], exact: false }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['medias'], exact: false }); toast.success('Mídia removida'); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mídias</h1>
          <p className="text-sm text-gray-400 mt-0.5">{medias.length} mídia{medias.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700">
          + Adicionar Mídia
        </button>
      </div>

      {isAdmin && (
        <div className="mb-4">
          <select
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
          >
            <option value="">Todas as escolas</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {medias.map((media: any) => (
          <div key={media.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="aspect-video bg-gray-100 relative">
              {media.tipo === 'VIDEO' ? (
                <video src={getMediaUrl(media.url)} className="w-full h-full object-cover" muted />
              ) : (
                <img src={getMediaUrl(media.url)} alt={media.titulo} className="w-full h-full object-cover" />
              )}
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  media.tipo === 'VIDEO' ? 'bg-blue-600 text-white' : 'bg-violet-600 text-white'
                }`}>
                  {media.tipo}
                </span>
              </div>
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  media.ativo ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                }`}>
                  {media.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-medium text-gray-800 text-sm truncate flex-1">{media.titulo}</p>
                {isAdmin && media.tenant && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white flex-shrink-0"
                    style={{ background: media.tenant.primaryColor || '#7C3AED' }}
                  >
                    {media.tenant.nome}
                  </span>
                )}
              </div>
              {media.diasSemana?.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {media.diasSemana.map((d: string) => diasLabel[d]).join(', ')}
                </p>
              )}
              {media.horaInicio && (
                <p className="text-xs text-gray-400">{media.horaInicio} – {media.horaFim}</p>
              )}
              {media.tipo === 'IMAGEM' && (
                <p className="text-xs text-gray-400">{media.duracaoTransicao}s por slide</p>
              )}
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <button
                onClick={() => setEditingMedia(media)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => toggleAtivo.mutate({ id: media.id, ativo: !media.ativo })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  media.ativo
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                {media.ativo ? 'Desativar' : 'Ativar'}
              </button>
              <button
                onClick={() => { if (confirm('Remover mídia?')) deleteMutation.mutate(media.id); }}
                className="px-3 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
        {medias.length === 0 && (
          <div className="col-span-3 py-20 text-center text-gray-400">
            <div className="text-4xl mb-3">🖼️</div>
            <p>Nenhuma mídia cadastrada</p>
            <p className="text-sm mt-1">Adicione imagens ou vídeos para exibir no painel</p>
          </div>
        )}
      </div>

      {showUpload && <MediaUploadModal onClose={() => setShowUpload(false)} />}
      {editingMedia && <MediaEditModal media={editingMedia} onClose={() => setEditingMedia(null)} />}
    </div>
  );
}
