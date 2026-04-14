import { useQuery } from '@tanstack/react-query';
import api, { getMediaUrl } from '../../services/api';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuthStore } from '../../stores/authStore';

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  A_CAMINHO: { label: 'A caminho',  bg: 'bg-orange-100', text: 'text-orange-700' },
  CHEGOU:    { label: 'Chegou',     bg: 'bg-yellow-100', text: 'text-yellow-700' },
  ANUNCIADO: { label: 'Anunciado',  bg: 'bg-green-100',  text: 'text-green-700'  },
  EXPIRADO:  { label: 'Expirado',   bg: 'bg-gray-100',   text: 'text-gray-500'   },
};

function Shimmer({ className }: { className: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  );
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-5 gap-4 mb-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <Shimmer className="w-10 h-10 rounded-xl mb-3" />
          <Shimmer className="w-12 h-8 mb-2" />
          <Shimmer className="w-20 h-4" />
        </div>
      ))}
    </div>
  );
}

function CheckinsSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <Shimmer className="w-36 h-5" />
        <Shimmer className="w-16 h-4" />
      </div>
      <div className="divide-y divide-gray-50">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shimmer className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="space-y-1.5">
                <Shimmer className="w-32 h-4" />
                <Shimmer className="w-44 h-3" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shimmer className="w-10 h-3" />
              <Shimmer className="w-20 h-5 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const selectedTenantId = useAuthStore((s) => s.selectedTenantId);
  const isMaster = user?.role === 'MASTER';
  const tenantParam = isMaster && selectedTenantId ? `?tenantId=${selectedTenantId}` : '';

  const { data: checkins = [], isLoading: loadingCheckins } = useQuery({
    queryKey: ['checkins-dashboard', selectedTenantId],
    queryFn: () => api.get('/checkin').then((r) => r.data),
    refetchInterval: 10000,
  });

  const { data: alunos = [], isLoading: loadingAlunos } = useQuery({
    queryKey: ['alunos-dashboard', selectedTenantId],
    queryFn: () => api.get(`/alunos${tenantParam}`).then((r) => r.data),
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['users-dashboard', selectedTenantId],
    queryFn: () => api.get(`/users${tenantParam}`).then((r) => r.data),
  });

  const isLoading = loadingCheckins || loadingAlunos || loadingUsers;

  const aCaminho  = checkins.filter((c: any) => c.status === 'A_CAMINHO');
  const chegou    = checkins.filter((c: any) => c.status === 'CHEGOU');
  const anunciados = checkins.filter((c: any) => c.status === 'ANUNCIADO');

  const cards = [
    { label: 'A caminho',  value: aCaminho.length,   color: 'bg-orange-50 text-orange-700', icon: '🚗' },
    { label: 'Chegou',     value: chegou.length,      color: 'bg-yellow-50 text-yellow-700', icon: '📍' },
    { label: 'Anunciados', value: anunciados.length,  color: 'bg-green-50 text-green-700',   icon: '✅' },
    { label: 'Alunos',     value: alunos.length,      color: 'bg-blue-50 text-blue-700',     icon: '🎒' },
    { label: 'Usuários',   value: users.length,       color: 'bg-violet-50 text-violet-700', icon: '👥' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <Link
          to="/painel"
          target="_blank"
          className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          Abrir Painel TV →
        </Link>
      </div>

      {/* Cards */}
      {isLoading ? (
        <CardsSkeleton />
      ) : (
        <div className="grid grid-cols-5 gap-4 mb-8">
          {cards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 text-xl ${card.color}`}>
                {card.icon}
              </div>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Check-ins recentes */}
      {isLoading ? (
        <CheckinsSkeleton />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Check-ins Recentes</h2>
            <span className="text-sm text-gray-400">{checkins.length} total</span>
          </div>
          <div className="divide-y divide-gray-50">
            {checkins.slice(0, 15).map((c: any) => {
              const fotoUrl = c.aluno?.fotoUrl ? getMediaUrl(c.aluno.fotoUrl) : null;
              const st = statusConfig[c.status] ?? { label: c.status, bg: 'bg-gray-100', text: 'text-gray-500' };
              return (
                <div key={c.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-violet-100 flex-shrink-0">
                      {fotoUrl ? (
                        <img src={fotoUrl} alt={c.aluno?.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-violet-700 font-bold text-sm">
                          {c.aluno?.nome?.[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{c.aluno?.nome}</p>
                      <p className="text-xs text-gray-400">
                        {c.aluno?.turma}{c.aluno?.turma && c.responsavel?.nome ? ' · ' : ''}{c.responsavel?.nome}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {format(new Date(c.timestamp), 'HH:mm')}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
                      {st.label}
                    </span>
                  </div>
                </div>
              );
            })}
            {checkins.length === 0 && (
              <div className="px-6 py-12 text-center text-gray-400 text-sm">
                Nenhum check-in registrado ainda
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
