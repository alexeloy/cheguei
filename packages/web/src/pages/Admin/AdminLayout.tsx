import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import api, { getMediaUrl } from '../../services/api';

const baseNav = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true, masterOnly: false },
  { to: '/admin/tenants', label: 'Tenants', icon: '🏫', masterOnly: true },
  { to: '/admin/alunos', label: 'Alunos', icon: '🎒', masterOnly: false },
  { to: '/admin/users', label: 'Usuários', icon: '👥', masterOnly: false },
  { to: '/admin/media', label: 'Mídias', icon: '🖼️', masterOnly: false },
  { to: '/admin/settings', label: 'Configurações', icon: '⚙️', masterOnly: false },
];

interface Tenant { id: string; nome: string; logoUrl?: string; ativo: boolean; }

export default function AdminLayout() {
  const { user, logout, selectedTenantId, setSelectedTenant } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMaster = user?.role === 'MASTER';
  const nav = baseNav.filter((item) => !item.masterOnly || isMaster);

  const closeSidebar = () => setSidebarOpen(false);

  // Busca tenants só para o MASTER (para o seletor e branding)
  const { data: tenants = [] } = useQuery<Tenant[]>({
    queryKey: ['tenants-list'],
    queryFn: () => api.get('/tenants').then((r) => r.data),
    enabled: isMaster,
  });

  const activeTenant = isMaster
    ? tenants.find((t) => t.id === selectedTenantId)
    : user?.tenant;

  // Branding: MASTER sem tenant selecionado → app; senão → escola
  const showSchoolBranding = !isMaster || (isMaster && !!selectedTenantId);
  const logoUrl = showSchoolBranding && activeTenant?.logoUrl
    ? getMediaUrl(activeTenant.logoUrl)
    : null;
  const brandName = showSchoolBranding && activeTenant?.nome
    ? activeTenant.nome
    : 'ChegueiApp';
  const brandSub = isMaster ? 'Master' : 'Painel Admin';

  const SidebarLogo = () => (
    <div className="flex items-center gap-3">
      {logoUrl ? (
        <img src={logoUrl} alt={brandName} className="w-10 h-10 object-contain rounded-xl" />
      ) : (
        <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
            <path d="M20 4L4 14l16 10 16-10L20 4z" fill="white" />
          </svg>
        </div>
      )}
      <div className="min-w-0">
        <p className="font-bold text-gray-800 text-sm truncate">{brandName}</p>
        <p className="text-xs text-gray-400">{brandSub}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt={brandName} className="h-8 object-contain" />
          ) : (
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
                <path d="M20 4L4 14l16 10 16-10L20 4z" fill="white" />
              </svg>
            </div>
          )}
          <span className="font-bold text-gray-800 text-sm truncate max-w-[120px]">{brandName}</span>
        </div>
        <div className="w-8" />
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'fixed md:relative' : '-translate-x-full md:translate-x-0'
      } md:translate-x-0 top-0 left-0 z-50 w-64 h-screen md:h-auto bg-white border-r border-gray-100 flex flex-col shadow-lg md:shadow-sm transition-transform duration-300 ease-out`}>

        {/* Desktop header */}
        <div className="hidden md:block p-6 border-b border-gray-100">
          <SidebarLogo />
        </div>

        {/* Mobile header sidebar */}
        <div className="md:hidden p-4 border-b border-gray-100 flex items-center justify-between">
          <SidebarLogo />
          <button onClick={closeSidebar} className="p-1 hover:bg-gray-50 rounded transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Seletor de tenant — só para MASTER */}
        {isMaster && (
          <div className="px-4 py-3 border-b border-gray-100 bg-violet-50">
            <p className="text-xs font-semibold text-violet-500 mb-1.5 uppercase tracking-wide">Visualizando escola</p>
            <select
              value={selectedTenantId ?? ''}
              onChange={(e) => setSelectedTenant(e.target.value || null)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-violet-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              <option value="">— Todas as escolas —</option>
              {tenants.filter((t) => t.ativo).map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
            {selectedTenantId && (
              <button
                onClick={() => setSelectedTenant(null)}
                className="mt-1.5 text-xs text-violet-500 hover:text-violet-700 transition-colors"
              >
                Limpar seleção
              </button>
            )}
          </div>
        )}

        <nav className="flex-1 p-3 md:p-4 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`
              }
            >
              <span>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 md:p-4 border-t border-gray-100 space-y-2">
          <button
            onClick={() => { navigate('/perfil'); closeSidebar(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors group"
          >
            <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold text-xs flex-shrink-0">
              {user?.nome?.[0]}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-700 truncate">{user?.nome}</p>
              <p className="text-xs text-violet-400 group-hover:text-violet-600 transition-colors">Alterar senha</p>
            </div>
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full text-sm text-gray-400 hover:text-red-500 transition-colors text-left px-3 py-2"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
