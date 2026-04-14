import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      const user = useAuthStore.getState().user;
      if (user?.role === 'MASTER' || user?.role === 'ADMIN') navigate('/admin');
      else if (user?.role === 'RECEPCAO') navigate('/painel');
      else navigate('/painel');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Credenciais inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-700 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-2xl mb-4">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 4L4 14v12l16 10 16-10V14L20 4z" fill="#7C3AED" opacity="0.2" />
              <path d="M20 4L4 14l16 10 16-10L20 4z" fill="#7C3AED" />
              <path d="M4 14v12l16 10V24L4 14z" fill="#4F46E5" />
              <path d="M36 14v12L20 36V24l16-10z" fill="#7C3AED" opacity="0.7" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">ChegueiApp</h1>
          <p className="text-gray-500 text-sm mt-1">Sistema de Retirada Escolar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-800"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-800"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-500">
          <p className="font-semibold mb-1">Usuários de teste:</p>
          <p className="truncate">Master: master@cheguei.com / mastercheguei123</p>
          <p className="truncate">Admin: admin@cheguei.com / adminCheguei123</p>
          <p className="truncate">Recepção: recepcao@cheguei.com / recepcao123</p>
        </div>
      </div>
    </div>
  );
}
