import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/Login';
import PanelPage from './pages/Panel';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminAlunos from './pages/Admin/Alunos';
import AdminUsers from './pages/Admin/Users';
import AdminMedia from './pages/Admin/Media';
import AdminSettings from './pages/Admin/Settings';
import AdminTenants from './pages/Admin/Tenants';
import PerfilPage from './pages/Perfil';

function ProtectedRoute({ children, roles }: { children: JSX.Element; roles?: string[] }) {
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  // Aguarda init() terminar antes de decidir redirecionar
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => { init(); }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/painel"
          element={
            <ProtectedRoute roles={['MASTER', 'ADMIN', 'RECEPCAO']}>
              <PanelPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['MASTER', 'ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route
            path="tenants"
            element={
              <ProtectedRoute roles={['MASTER']}>
                <AdminTenants />
              </ProtectedRoute>
            }
          />
          <Route path="alunos" element={<AdminAlunos />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <PerfilPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RedirectByRole />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function RedirectByRole() {
  const user = useAuthStore((s) => s.user);
  if (user?.role === 'MASTER' || user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user?.role === 'RECEPCAO') return <Navigate to="/painel" replace />;
  return <Navigate to="/login" replace />;
}
