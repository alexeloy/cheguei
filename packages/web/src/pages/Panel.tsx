import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api, { getMediaUrl } from '../services/api';
import { useAuthStore } from '../stores/authStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
const ANNOUNCEMENT_SECONDS = 10;

interface Checkin {
  id: string;
  aluno: { nome: string; turma: string; fotoUrl?: string; nomeFonetico?: string };
  responsavel: { nome: string };
  timestamp: string;
  status: string;
}

interface Media {
  id: string;
  tipo: 'IMAGEM' | 'VIDEO';
  url: string;
  duracaoTransicao: number;
  titulo: string;
}

interface Tenant {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  nome: string;
  imagemTransicaoSegundos: number;
  anuncioTemplate?: string;
}

function useTheme(tenant: Tenant | undefined) {
  useEffect(() => {
    if (!tenant) return;
    const root = document.documentElement;
    root.style.setProperty('--primary', tenant.primaryColor || '#7C3AED');
    root.style.setProperty('--secondary', tenant.secondaryColor || '#4F46E5');
    root.style.setProperty('--accent', tenant.accentColor || '#A78BFA');
  }, [tenant]);
}

function buildAnuncio(template: string | undefined, aluno: Checkin['aluno']): string {
  const tpl = template || '<nome>';
  return tpl
    .replace(/<nome>/g, aluno.nomeFonetico || aluno.nome)
    .replace(/<turma>/g, aluno.turma || '');
}

function speak(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR';
  utterance.rate = 0.9;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

// Gradient glow ring — counts down + pulsing gradient
function AnnouncementRing({ startedAt, primaryColor }: { startedAt: number; primaryColor: string }) {
  const [progress, setProgress] = useState(1);
  const id = useRef(`ring-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    const total = ANNOUNCEMENT_SECONDS * 1000;
    const end = startedAt + total;
    const t = setInterval(() => {
      const pct = Math.max(0, Math.min(1, (end - Date.now()) / total));
      setProgress(pct);
      if (pct <= 0) clearInterval(t);
    }, 50);
    return () => clearInterval(t);
  }, [startedAt]);

  const S = 80;
  const cx = S / 2;
  const cy = S / 2;
  const strokeW = 4;
  const r = cx - strokeW / 2 - 3;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={S} height={S}
      viewBox={`0 0 ${S} ${S}`}
      style={{ transform: 'rotate(-90deg)' }}
    >
      <defs>
        <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="0.1">
            <animate attributeName="stop-opacity" values="0.1;0.8;0.1" dur="1.8s" repeatCount="indefinite" />
          </stop>
          <stop offset="40%" stopColor="white" stopOpacity="1">
            <animate attributeName="stop-opacity" values="1;0.5;1" dur="1.8s" repeatCount="indefinite" />
          </stop>
          <stop offset="70%" stopColor={primaryColor} stopOpacity="0.9">
            <animate attributeName="stop-opacity" values="0.9;0.3;0.9" dur="1.8s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0.2">
            <animate attributeName="stop-opacity" values="0.2;0.9;0.2" dur="1.8s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
        <filter id={`glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeW} />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={`url(#grad-${id})`}
        strokeWidth={strokeW}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        filter={`url(#glow-${id})`}
        style={{ transition: 'stroke-dashoffset 0.05s linear' }}
      />
    </svg>
  );
}

function StudentQueueItem({
  checkin, isAnnouncing, primaryColor, startedAt,
}: {
  checkin: Checkin;
  isAnnouncing: boolean;
  primaryColor: string;
  startedAt?: number;
}) {
  const foto = checkin.aluno.fotoUrl ? getMediaUrl(checkin.aluno.fotoUrl) : null;
  const mins = Math.max(0, Math.floor((Date.now() - new Date(checkin.timestamp).getTime()) / 60000));
  const isChegou = checkin.status === 'CHEGOU';

  return (
    <div className={`flex flex-col items-center gap-1.5 transition-all flex-shrink-0 ${!isAnnouncing && !isChegou ? 'opacity-60' : ''}`}>
      <div className="relative w-20 h-20 flex items-center justify-center">
        {isAnnouncing && startedAt && (
          <AnnouncementRing startedAt={startedAt} primaryColor={primaryColor} />
        )}
        <div
          className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
          style={{ background: primaryColor }}
        >
          {foto ? (
            <img src={foto} alt={checkin.aluno.nome} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
              {checkin.aluno.nome[0]}
            </div>
          )}
        </div>
        {!isAnnouncing && isChegou && (
          <div className="absolute top-1 right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white animate-pulse" />
        )}
        {checkin.status === 'A_CAMINHO' && (
          <div className="absolute top-1 right-1 w-4 h-4 bg-orange-400 rounded-full border-2 border-white animate-pulse" />
        )}
      </div>
      <span className="text-white text-xs font-medium">
        {mins === 0 ? 'agora' : `${mins}m`}
      </span>
    </div>
  );
}

function MediaSlideshow({ medias, defaultSeconds }: { medias: Media[]; defaultSeconds: number }) {
  const [idx, setIdx] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(() => {
    setIdx((i) => (i + 1) % medias.length);
  }, [medias.length]);

  useEffect(() => {
    if (!medias.length) return;
    const current = medias[idx];
    if (timerRef.current) clearTimeout(timerRef.current);
    if (current.tipo === 'IMAGEM') {
      const secs = (current.duracaoTransicao || defaultSeconds) * 1000;
      timerRef.current = setTimeout(advance, secs);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [idx, medias, advance, defaultSeconds]);

  if (!medias.length) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-800 to-indigo-900">
        <div className="text-center text-white/30">
          <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Nenhuma mídia configurada</p>
        </div>
      </div>
    );
  }

  const current = medias[idx];
  const url = getMediaUrl(current.url);

  return (
    <div className="w-full h-full relative overflow-hidden">
      {current.tipo === 'VIDEO' ? (
        <video ref={videoRef} src={url} className="w-full h-full object-cover" autoPlay muted onEnded={advance} />
      ) : (
        <img key={current.id} src={url} alt={current.titulo} className="w-full h-full object-cover animate-fade-in" />
      )}
      {medias.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {medias.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function FeaturedStudentCard({
  checkin, tenant, startedAt,
}: {
  checkin: Checkin | null;
  tenant: Tenant | undefined;
  startedAt: number;
}) {
  const primary = tenant?.primaryColor || '#7C3AED';
  const foto = checkin?.aluno.fotoUrl ? getMediaUrl(checkin.aluno.fotoUrl) : null;
  const [pct, setPct] = useState(100);

  useEffect(() => {
    if (!checkin) return;
    const total = ANNOUNCEMENT_SECONDS * 1000;
    const end = startedAt + total;
    const update = () => setPct(Math.max(0, Math.min(100, ((end - Date.now()) / total) * 100)));
    update();
    const t = setInterval(update, 100);
    return () => clearInterval(t);
  }, [checkin?.id, startedAt]);

  if (!checkin) {
    return (
      <div
        className="rounded-3xl p-6 flex flex-col items-center justify-center h-full min-h-[280px]"
        style={{ background: 'rgba(255,255,255,0.08)', border: '2px dashed rgba(255,255,255,0.2)' }}
      >
        <svg className="w-16 h-16 text-white/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <p className="text-white/30 text-center">Aguardando chegadas...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-slide-up">
      <div className="h-1.5 bg-gray-100 w-full">
        <div
          className="h-full transition-all duration-100"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${primary}, #A78BFA)` }}
        />
      </div>
      <div className="p-6 flex flex-col items-center gap-4">
        <div className="relative">
          <div
            className="w-32 h-32 rounded-full overflow-hidden border-4 shadow-lg"
            style={{ borderColor: primary }}
          >
            {foto ? (
              <img src={foto} alt={checkin.aluno.nome} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white text-4xl font-bold"
                style={{ background: primary }}
              >
                {checkin.aluno.nome[0]}
              </div>
            )}
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-wide">
            {checkin.aluno.nome}
          </h2>
          <p className="text-lg font-semibold text-gray-500">{checkin.aluno.turma}</p>
          <p className="text-sm text-gray-400 mt-1">
            Responsável: {checkin.responsavel.nome}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PanelPage() {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const [announcementStartedAt, setAnnouncementStartedAt] = useState(0);
  const announcementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const primaryColor = user?.tenant?.primaryColor || '#7C3AED';

  const { data: tenant } = useQuery<Tenant>({
    queryKey: ['tenant'],
    queryFn: () => api.get('/tenants/me').then((r) => r.data),
  });

  const { data: medias = [] } = useQuery<Media[]>({
    queryKey: ['medias-ativas'],
    queryFn: () => api.get('/media/ativas').then((r) => r.data),
    refetchInterval: 60000,
  });

  useTheme(tenant);

  const announcementQueue = checkins.filter((c) => c.status === 'CHEGOU');
  const currentAnnouncement = announcementQueue[0] || null;

  useEffect(() => {
    api.get('/checkin/ativos').then((r) => setCheckins(r.data));
  }, []);

  const prevAnnouncementId = useRef<string | null>(null);
  useEffect(() => {
    if (!currentAnnouncement) {
      prevAnnouncementId.current = null;
      return;
    }
    if (currentAnnouncement.id === prevAnnouncementId.current) return;

    prevAnnouncementId.current = currentAnnouncement.id;
    setAnnouncementStartedAt(Date.now());
    speak(buildAnuncio(tenant?.anuncioTemplate, currentAnnouncement.aluno));

    if (announcementTimerRef.current) clearTimeout(announcementTimerRef.current);
    announcementTimerRef.current = setTimeout(() => {
      api.patch(`/checkin/${currentAnnouncement.id}/status`, { status: 'ANUNCIADO' });
    }, ANNOUNCEMENT_SECONDS * 1000);

    return () => {
      if (announcementTimerRef.current) clearTimeout(announcementTimerRef.current);
    };
  }, [currentAnnouncement?.id]);

  useEffect(() => {
    if (!token) return;
    const socket = io(WS_URL, { auth: { token }, transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('novo_checkin', (checkin: Checkin) => {
      setCheckins((prev) => prev.find((c) => c.id === checkin.id) ? prev : [...prev, checkin]);
    });

    socket.on('status_atualizado', (updated: Checkin) => {
      if (updated.status === 'ANUNCIADO' || updated.status === 'EXPIRADO') {
        setCheckins((prev) => prev.filter((c) => c.id !== updated.id));
      } else {
        setCheckins((prev) => {
          const exists = prev.find((c) => c.id === updated.id);
          if (exists) return prev.map((c) => c.id === updated.id ? updated : c);
          return [...prev, updated];
        });
      }
    });

    socket.on('checkin_expirado', (expired: Checkin) => {
      setCheckins((prev) => prev.filter((c) => c.id !== expired.id));
    });

    return () => { socket.disconnect(); };
  }, [token]);

  const bgStyle = {
    background: `linear-gradient(135deg, ${tenant?.primaryColor || '#7C3AED'} 0%, ${tenant?.secondaryColor || '#4F46E5'} 100%)`,
  };

  const queueStrip = checkins;

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col" style={bgStyle}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/10">
        <div className="flex items-center gap-3">
          {tenant?.logoUrl ? (
            <img src={getMediaUrl(tenant.logoUrl)} alt="Logo" className="h-10 object-contain" />
          ) : (
            <div className="flex items-center gap-2">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                <path d="M20 4L4 14v12l16 10 16-10V14L20 4z" fill="rgba(255,255,255,0.2)" />
                <path d="M20 4L4 14l16 10 16-10L20 4z" fill="white" />
              </svg>
              <span className="text-white font-bold text-xl">{tenant?.nome || 'ChegueiApp'}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/80 text-sm">Ao vivo</span>
          </div>
          <span className="text-white/60 text-sm">{checkins.length} aguardando</span>
          <button onClick={() => navigate('/perfil')} className="text-white/50 hover:text-white/90 text-sm transition-colors">
            Meu perfil
          </button>
          <button onClick={logout} className="text-white/50 hover:text-white/90 text-sm transition-colors">
            Sair
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 grid grid-cols-5 gap-4 px-6 py-4 overflow-hidden">
        <div className="col-span-2 flex flex-col justify-center">
          <FeaturedStudentCard
            checkin={currentAnnouncement}
            tenant={tenant}
            startedAt={announcementStartedAt}
          />
        </div>
        <div className="col-span-3 rounded-3xl overflow-hidden shadow-2xl">
          <MediaSlideshow
            medias={medias}
            defaultSeconds={tenant?.imagemTransicaoSegundos || 5}
          />
        </div>
      </div>

      {/* Queue strip */}
      {queueStrip.length > 0 && (
        <div className="px-6 pb-4">
          <div className="bg-black/20 rounded-2xl px-6 py-3">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
              {queueStrip.map((c) => (
                <StudentQueueItem
                  key={c.id}
                  checkin={c}
                  isAnnouncing={c.id === currentAnnouncement?.id}
                  primaryColor={tenant?.primaryColor || primaryColor}
                  startedAt={c.id === currentAnnouncement?.id ? announcementStartedAt : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
