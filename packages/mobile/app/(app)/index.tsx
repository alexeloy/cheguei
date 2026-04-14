import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  ActivityIndicator, Alert, Image, StatusBar, RefreshControl,
  TextInput, ScrollView,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import api, { getImageUrl } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface Aluno {
  id: string;
  nome: string;
  turma: string;
  fotoUrl?: string;
}

interface Checkin {
  id: string;
  alunoId: string;
  status: 'A_CAMINHO' | 'CHEGOU' | 'ANUNCIADO' | 'EXPIRADO';
  timestamp: string;
  aluno?: Aluno;
  responsavel?: { nome: string };
}

function Avatar({ nome, fotoUrl, size = 48 }: { nome: string; fotoUrl?: string; size?: number }) {
  const url = getImageUrl(fotoUrl);
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: '#EDE9FE' }}>
      {url ? (
        <Image source={{ uri: url }} style={{ width: size, height: size }} />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: size * 0.38, fontWeight: '700', color: '#7C3AED' }}>{nome[0]}</Text>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TELA RESPONSÁVEL
// ─────────────────────────────────────────────────────────────────────────────
function TelaResponsavel() {
  const qc = useQueryClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data: alunos = [], isLoading, refetch } = useQuery<Aluno[]>({
    queryKey: ['meus-alunos'],
    queryFn: () => api.get('/alunos').then((r) => r.data),
  });

  const { data: checkins = [] } = useQuery<Checkin[]>({
    queryKey: ['meus-checkins'],
    queryFn: () => api.get('/checkin/meus').then((r) => r.data),
    refetchInterval: 15000,
  });

  const aCaminhoMut = useMutation({
    mutationFn: (alunoId: string) => api.post('/checkin', { alunoId }),
    onMutate: (id) => setLoadingId(id),
    onSettled: () => { setLoadingId(null); qc.invalidateQueries({ queryKey: ['meus-checkins'] }); },
    onError: (err: any) => Alert.alert('Aviso', err.response?.data?.message || 'Erro'),
  });

  const chegueiMut = useMutation({
    mutationFn: (checkinId: string) => api.patch(`/checkin/${checkinId}/status`, { status: 'CHEGOU' }),
    onMutate: () => setLoadingId('chegou'),
    onSettled: () => { setLoadingId(null); qc.invalidateQueries({ queryKey: ['meus-checkins'] }); },
    onError: (err: any) => Alert.alert('Aviso', err.response?.data?.message || 'Erro'),
  });

  const getCheckin = (alunoId: string) =>
    checkins.find((c) => c.alunoId === alunoId && (c.status === 'A_CAMINHO' || c.status === 'CHEGOU'));

  const filtered = alunos.filter((a) =>
    a.nome.toLowerCase().includes(search.toLowerCase()) ||
    (a.turma || '').toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <View style={s.center}><ActivityIndicator size="large" color="#7C3AED" /></View>;

  return (
    <View style={{ flex: 1 }}>
      <View style={s.searchBox}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar aluno..."
          placeholderTextColor="#9CA3AF"
          style={s.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: '#9CA3AF', fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(a) => a.id}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor="#7C3AED" />}
        renderItem={({ item }) => {
          const checkin = getCheckin(item.id);
          const st = checkin?.status;
          const loading = loadingId === item.id || loadingId === 'chegou';
          return (
            <View style={s.card}>
              <View style={s.cardRow}>
                <Avatar nome={item.nome} fotoUrl={item.fotoUrl} />
                <View style={{ flex: 1 }}>
                  <Text style={s.nome}>{item.nome}</Text>
                  <Text style={s.turma}>{item.turma}</Text>
                </View>
                {st === 'A_CAMINHO' && <StatusPill color="#FEF3C7" dot="#F59E0B" text="A caminho" textColor="#B45309" />}
                {st === 'CHEGOU' && <StatusPill color="#DCFCE7" dot="#22C55E" text="Chegou!" textColor="#15803D" />}
              </View>
              {!st && (
                <TouchableOpacity style={s.btnPrimary} disabled={loading} onPress={() => aCaminhoMut.mutate(item.id)}>
                  <Text style={s.btnText}>{loading ? 'Aguarde...' : '🚗  Estou a caminho'}</Text>
                </TouchableOpacity>
              )}
              {st === 'A_CAMINHO' && (
                <TouchableOpacity style={s.btnGreen} disabled={loading} onPress={() => chegueiMut.mutate(checkin!.id)}>
                  <Text style={s.btnText}>{loading ? 'Aguarde...' : '✅  Cheguei!'}</Text>
                </TouchableOpacity>
              )}
              {st === 'CHEGOU' && (
                <View style={s.btnGray}><Text style={s.btnGrayText}>📢  Anunciando...</Text></View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🎒</Text>
            <Text style={s.emptyTitle}>{search ? 'Nenhum aluno encontrado' : 'Nenhum aluno vinculado'}</Text>
            <Text style={s.emptySub}>{search ? 'Tente outro termo' : 'Entre em contato com a escola'}</Text>
          </View>
        }
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TELA STAFF (ADMIN / RECEPCAO)
// ─────────────────────────────────────────────────────────────────────────────
type StaffTab = 'fila' | 'alunos';

function TelaStaff() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<StaffTab>('fila');
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { data: checkins = [], refetch: refetchCheckins } = useQuery<Checkin[]>({
    queryKey: ['checkins-ativos'],
    queryFn: () => api.get('/checkin/ativos').then((r) => r.data),
    refetchInterval: 10000,
  });

  const { data: alunos = [], isLoading: loadingAlunos, refetch: refetchAlunos } = useQuery<Aluno[]>({
    queryKey: ['todos-alunos'],
    queryFn: () => api.get('/alunos').then((r) => r.data),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['checkins-ativos'] });
    qc.invalidateQueries({ queryKey: ['todos-alunos'] });
  };

  // Anunciar: muda A_CAMINHO → CHEGOU
  const anunciarMut = useMutation({
    mutationFn: (checkinId: string) => api.patch(`/checkin/${checkinId}/status`, { status: 'CHEGOU' }),
    onMutate: (id) => setLoadingId(id),
    onSettled: () => { setLoadingId(null); invalidate(); },
    onError: (err: any) => Alert.alert('Erro', err.response?.data?.message || 'Erro'),
  });

  // Cancelar: remove da fila
  const cancelarMut = useMutation({
    mutationFn: (checkinId: string) => api.delete(`/checkin/${checkinId}`),
    onMutate: (id) => setLoadingId(id),
    onSettled: () => { setLoadingId(null); invalidate(); },
    onError: (err: any) => Alert.alert('Erro', err.response?.data?.message || 'Erro'),
  });

  // Chamar direto: cria checkin já como CHEGOU
  const chamarDiretoMut = useMutation({
    mutationFn: (alunoId: string) => api.post('/checkin', { alunoId, status: 'CHEGOU' }),
    onMutate: (id) => setLoadingId(id),
    onSettled: () => { setLoadingId(null); invalidate(); },
    onError: (err: any) => Alert.alert('Aviso', err.response?.data?.message || 'Erro'),
  });

  const aCaminhoIds = new Set(checkins.filter(c => c.status === 'A_CAMINHO').map(c => c.alunoId));
  const chegouIds = new Set(checkins.filter(c => c.status === 'CHEGOU').map(c => c.alunoId));

  const filteredAlunos = alunos.filter((a) =>
    a.nome.toLowerCase().includes(search.toLowerCase()) ||
    (a.turma || '').toLowerCase().includes(search.toLowerCase())
  );

  const confirmCancelar = (checkinId: string, nome: string) => {
    Alert.alert('Remover da fila', `Remover ${nome} da fila de espera?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => cancelarMut.mutate(checkinId) },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Tabs */}
      <View style={s.tabs}>
        <TouchableOpacity
          style={[s.tab, tab === 'fila' && s.tabActive]}
          onPress={() => setTab('fila')}
        >
          <Text style={[s.tabText, tab === 'fila' && s.tabTextActive]}>
            Fila de espera {checkins.filter(c => c.status === 'A_CAMINHO').length > 0 && `(${checkins.filter(c => c.status === 'A_CAMINHO').length})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, tab === 'alunos' && s.tabActive]}
          onPress={() => setTab('alunos')}
        >
          <Text style={[s.tabText, tab === 'alunos' && s.tabTextActive]}>Chamar aluno</Text>
        </TouchableOpacity>
      </View>

      {/* Aba: Fila de espera */}
      {tab === 'fila' && (
        <FlatList
          data={checkins.filter(c => c.status === 'A_CAMINHO')}
          keyExtractor={(c) => c.id}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetchCheckins} tintColor="#7C3AED" />}
          renderItem={({ item }) => {
            const mins = Math.max(0, Math.floor((Date.now() - new Date(item.timestamp).getTime()) / 60000));
            const loading = loadingId === item.id;
            return (
              <View style={s.card}>
                <View style={s.cardRow}>
                  <Avatar nome={item.aluno?.nome || '?'} fotoUrl={item.aluno?.fotoUrl} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.nome}>{item.aluno?.nome}</Text>
                    <Text style={s.turma}>{item.aluno?.turma} · {item.responsavel?.nome}</Text>
                    <Text style={[s.turma, { color: '#9CA3AF' }]}>{mins === 0 ? 'Chegou agora' : `Há ${mins} min`}</Text>
                  </View>
                  <StatusPill color="#FEF3C7" dot="#F59E0B" text="A caminho" textColor="#B45309" />
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={[s.btnGreen, { flex: 1 }]}
                    disabled={loading}
                    onPress={() => anunciarMut.mutate(item.id)}
                  >
                    <Text style={s.btnText}>{loading ? 'Aguarde...' : '📢  Anunciar agora'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.btnDanger, { paddingHorizontal: 14 }]}
                    disabled={loading}
                    onPress={() => confirmCancelar(item.id, item.aluno?.nome || '')}
                  >
                    <Text style={s.btnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>✅</Text>
              <Text style={s.emptyTitle}>Fila vazia</Text>
              <Text style={s.emptySub}>Nenhum responsável aguardando</Text>
            </View>
          }
        />
      )}

      {/* Aba: Chamar aluno */}
      {tab === 'alunos' && (
        <View style={{ flex: 1 }}>
          <View style={s.searchBox}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar aluno..."
              placeholderTextColor="#9CA3AF"
              style={s.searchInput}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={{ color: '#9CA3AF', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={filteredAlunos}
            keyExtractor={(a) => a.id}
            contentContainerStyle={s.list}
            refreshControl={<RefreshControl refreshing={false} onRefresh={refetchAlunos} tintColor="#7C3AED" />}
            renderItem={({ item }) => {
              const isACaminho = aCaminhoIds.has(item.id);
              const isChegou = chegouIds.has(item.id);
              const loading = loadingId === item.id;
              return (
                <View style={s.card}>
                  <View style={s.cardRow}>
                    <Avatar nome={item.nome} fotoUrl={item.fotoUrl} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.nome}>{item.nome}</Text>
                      <Text style={s.turma}>{item.turma}</Text>
                    </View>
                    {isACaminho && <StatusPill color="#FEF3C7" dot="#F59E0B" text="A caminho" textColor="#B45309" />}
                    {isChegou && <StatusPill color="#DCFCE7" dot="#22C55E" text="Anunciando" textColor="#15803D" />}
                  </View>
                  {!isACaminho && !isChegou && (
                    <TouchableOpacity
                      style={s.btnPrimary}
                      disabled={loading}
                      onPress={() => chamarDiretoMut.mutate(item.id)}
                    >
                      <Text style={s.btnText}>{loading ? 'Aguarde...' : '📣  Chamar direto'}</Text>
                    </TouchableOpacity>
                  )}
                  {isACaminho && (
                    <View style={s.btnGray}>
                      <Text style={s.btnGrayText}>⏳  Aguardando chegada</Text>
                    </View>
                  )}
                  {isChegou && (
                    <View style={s.btnGray}>
                      <Text style={s.btnGrayText}>📢  Sendo anunciado</Text>
                    </View>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={{ fontSize: 40, marginBottom: 8 }}>🔍</Text>
                <Text style={s.emptyTitle}>Nenhum aluno encontrado</Text>
              </View>
            }
          />
        </View>
      )}
    </View>
  );
}

function StatusPill({ color, dot, text, textColor }: { color: string; dot: string; text: string; textColor: string }) {
  return (
    <View style={[s.pill, { backgroundColor: color }]}>
      <View style={[s.pillDot, { backgroundColor: dot }]} />
      <Text style={[s.pillText, { color: textColor }]}>{text}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TELA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const isStaff = user?.role === 'MASTER' || user?.role === 'ADMIN' || user?.role === 'RECEPCAO';

  useEffect(() => {
    if (!token) return;
    const socket = io(API_URL, { auth: { token }, transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.on('status_atualizado', () => {
      qc.invalidateQueries({ queryKey: ['meus-checkins'] });
      qc.invalidateQueries({ queryKey: ['checkins-ativos'] });
    });
    socket.on('novo_checkin', () => {
      qc.invalidateQueries({ queryKey: ['checkins-ativos'] });
    });
    return () => { socket.disconnect(); };
  }, [token]);

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja sair do aplicativo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" />
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Olá, {user?.nome?.split(' ')[0]}!</Text>
          <Text style={s.subtitle}>{user?.tenant?.nome || 'Escola'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={s.logoutBtn}>
          <Text style={s.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {isStaff ? <TelaStaff /> : <TelaResponsavel />}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14,
    backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  greeting: { fontSize: 17, fontWeight: '700', color: '#1F2937' },
  subtitle: { fontSize: 12, color: '#7C3AED', marginTop: 2, fontWeight: '600' },
  logoutBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F3F4F6' },
  logoutText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },

  // Busca
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'white', marginHorizontal: 16, marginVertical: 10,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 15, color: '#1F2937' },

  // Tabs (staff)
  tabs: {
    flexDirection: 'row', backgroundColor: 'white',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#7C3AED' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  tabTextActive: { color: '#7C3AED', fontWeight: '700' },

  // Cards
  list: { padding: 16, gap: 10 },
  card: {
    backgroundColor: 'white', borderRadius: 18, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, gap: 12,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nome: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  turma: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

  // Botões
  btnPrimary: { backgroundColor: '#7C3AED', borderRadius: 50, paddingVertical: 13, alignItems: 'center' },
  btnGreen: { backgroundColor: '#16A34A', borderRadius: 50, paddingVertical: 13, alignItems: 'center' },
  btnDanger: { backgroundColor: '#DC2626', borderRadius: 50, paddingVertical: 13, alignItems: 'center' },
  btnGray: { backgroundColor: '#F3F4F6', borderRadius: 50, paddingVertical: 13, alignItems: 'center' },
  btnText: { color: 'white', fontSize: 15, fontWeight: '700' },
  btnGrayText: { color: '#9CA3AF', fontSize: 15, fontWeight: '600' },

  // Status pill
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 11, fontWeight: '600' },

  // Empty
  empty: { paddingTop: 60, alignItems: 'center' },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
});
