import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function PerfilPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNova, setShowNova] = useState(false);

  const mutation = useMutation({
    mutationFn: () => api.patch('/auth/change-password', { senhaAtual, novaSenha }),
    onSuccess: () => {
      toast.success('Senha alterada! Faça login novamente.');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmar('');
      setTimeout(() => { logout(); navigate('/login'); }, 1500);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao alterar senha');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmar) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (novaSenha.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    mutation.mutate();
  };

  const backPath = (user?.role === 'MASTER' || user?.role === 'ADMIN') ? '/admin' : '/painel';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(backPath)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Voltar
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Meu Perfil</h1>
      </div>

      <div className="flex-1 flex items-start justify-start p-4 md:p-8">
        <div className="w-full max-w-md space-y-6">

          {/* User info card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-700 font-bold text-xl flex-shrink-0">
                {user?.nome?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{user?.nome}</p>
                <p className="text-sm text-gray-400">{user?.email}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-violet-50 text-violet-700 text-xs font-medium rounded-full capitalize">
                  {user?.role?.toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Change password card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-5">Alterar Senha</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Senha atual */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha atual
                </label>
                <div className="relative">
                  <input
                    type={showSenhaAtual ? 'text' : 'password'}
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                    placeholder="Digite sua senha atual"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenhaAtual((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                  >
                    {showSenhaAtual ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-4">
                {/* Nova senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nova senha
                  </label>
                  <div className="relative">
                    <input
                      type={showNova ? 'text' : 'password'}
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNova((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                    >
                      {showNova ? '🙈' : '👁️'}
                    </button>
                  </div>

                  {/* Strength indicator */}
                  {novaSenha && (
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            novaSenha.length >= i * 3
                              ? novaSenha.length >= 10
                                ? 'bg-green-400'
                                : novaSenha.length >= 7
                                ? 'bg-yellow-400'
                                : 'bg-red-400'
                              : 'bg-gray-100'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirmar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar nova senha
                  </label>
                  <input
                    type="password"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm ${
                      confirmar && confirmar !== novaSenha
                        ? 'border-red-300 bg-red-50'
                        : confirmar && confirmar === novaSenha
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200'
                    }`}
                    placeholder="Repita a nova senha"
                    required
                  />
                  {confirmar && confirmar !== novaSenha && (
                    <p className="text-xs text-red-500 mt-1">As senhas não coincidem</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={mutation.isPending || !senhaAtual || !novaSenha || novaSenha !== confirmar}
                className="w-full py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {mutation.isPending ? 'Alterando...' : 'Alterar senha'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
