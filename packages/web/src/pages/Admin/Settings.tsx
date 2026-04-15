import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getMediaUrl } from '../../services/api';
import toast from 'react-hot-toast';

const FONTS = ['Inter', 'Roboto', 'Poppins', 'Nunito', 'Lato'];

export default function AdminSettings() {
  const qc = useQueryClient();
  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant'],
    queryFn: () => api.get('/tenants/me').then((r) => r.data),
  });

  const [form, setForm] = useState<any>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (tenant) setForm({ ...tenant });
  }, [tenant]);

  const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { id, createdAt, updatedAt, ...body } = form;
      await api.patch('/tenants/me', body);
      if (logoFile) {
        const fd = new FormData();
        fd.append('file', logoFile);
        await api.post('/tenants/me/logo', fd);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant'] });
      toast.success('Configurações salvas!');
    },
    onError: () => toast.error('Erro ao salvar'),
  });

  if (isLoading) return <div className="text-gray-400">Carregando...</div>;

  const logoUrl = logoPreview || (tenant?.logoUrl ? getMediaUrl(tenant.logoUrl) : null);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configurações</h1>

      <div className="space-y-6">
        {/* Identity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Identidade Visual</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Logomarca</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-2xl">🏫</span>
                )}
              </div>
              <label className="cursor-pointer px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                Alterar logo
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }
                  }} />
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da escola</label>
            <input value={form.nome || ''} onChange={(e) => set('nome', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fonte</label>
            <select value={form.fontFamily || 'Inter'} onChange={(e) => set('fontFamily', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm">
              {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'primaryColor', label: 'Cor primária' },
              { key: 'secondaryColor', label: 'Cor secundária' },
              { key: 'accentColor', label: 'Cor destaque' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form[key] || '#7C3AED'} onChange={(e) => set(key, e.target.value)}
                    className="w-10 h-10 rounded-xl border-0 cursor-pointer" />
                  <input value={form[key] || ''} onChange={(e) => set(key, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-mono"
                    placeholder="#7C3AED" />
                </div>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="mt-4 rounded-xl overflow-hidden border border-gray-200">
            <div className="px-4 py-3 flex items-center gap-3" style={{ background: form.primaryColor || '#7C3AED' }}>
              <div className="w-6 h-6 bg-white/30 rounded" />
              <span className="text-white font-medium text-sm" style={{ fontFamily: form.fontFamily }}>
                {form.nome || 'Escola'}
              </span>
            </div>
          </div>
        </div>

        {/* School Location */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-1">Localização da Escola</h2>
          <p className="text-xs text-gray-400 mb-4">
            Necessário para calcular o tempo estimado de chegada dos responsáveis.{' '}
            <a
              href="https://support.google.com/maps/answer/18539"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-500 hover:underline"
            >
              Como encontrar as coordenadas no Google Maps
            </a>
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                placeholder="Ex: -23.5505"
                value={form.latitude ?? ''}
                onChange={(e) => set('latitude', e.target.value === '' ? null : parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                placeholder="Ex: -46.6333"
                value={form.longitude ?? ''}
                onChange={(e) => set('longitude', e.target.value === '' ? null : parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-mono"
              />
            </div>
          </div>
          {form.latitude && form.longitude && (
            <p className="mt-2 text-xs text-green-600 font-medium">
              Localização configurada: {form.latitude}, {form.longitude}
            </p>
          )}
          {(!form.latitude || !form.longitude) && (
            <p className="mt-2 text-xs text-amber-500">
              Sem localização configurada — o ETA dos responsáveis não será calculado.
            </p>
          )}
        </div>

        {/* Timings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Tempos e Intervalos</h2>
          <div className="space-y-4">
            {[
              { key: 'checkinExpiryMinutes', label: 'Expiração do check-in (minutos)', min: 5, max: 480 },
              { key: 'rechamadaCooldownSeconds', label: 'Intervalo para rechamada (segundos)', min: 10, max: 300 },
              { key: 'imagemTransicaoSegundos', label: 'Tempo de transição de imagens (segundos)', min: 1, max: 60 },
            ].map(({ key, label, min, max }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={min} max={max} value={form[key] || min}
                    onChange={(e) => set(key, parseInt(e.target.value))}
                    className="flex-1 accent-violet-600" />
                  <span className="w-12 text-right text-sm font-medium text-gray-700">
                    {form[key] || min}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          {saveMutation.isPending ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </div>
    </div>
  );
}
