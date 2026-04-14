# 🌐 Acessar ChegueiApp via Rede

## 📱 Acesso Local (Mesmo PC)

```
Frontend: http://localhost:5173
Backend:  http://localhost:3001 (automático via proxy do Vite)
```

## 🖥️ Acesso via Rede (Outro PC)

### Passo 1: Encontrar a IP da máquina servidor

**Windows:**
```powershell
ipconfig
# Procure por "IPv4 Address" na seção do seu adaptador de rede
# Exemplo: 192.168.18.145
```

**Linux/Mac:**
```bash
ifconfig
# ou
hostname -I
```

### Passo 2: Acessar do outro PC

**Frontend (painel admin):**
```
http://<IP_DA_MAQUINA>:5173
```

**Painel (TV):**
```
http://<IP_DA_MAQUINA>:5173/painel
```

**Exemplo com IP 192.168.18.145:**
```
- Admin: http://192.168.18.145:5173/admin
- Painel: http://192.168.18.145:5173/painel
- Login: http://192.168.18.145:5173/login
```

## 🔥 Liberando Portas no Firewall (Windows)

Se não conseguir acessar, pode ser que o firewall esteja bloqueando. Faça o seguinte:

### Opção 1: Via PowerShell (Admin)
```powershell
# Liberar portas
netsh advfirewall firewall add rule name="ChegueiApp-Frontend" dir=in action=allow protocol=tcp localport=5173
netsh advfirewall firewall add rule name="ChegueiApp-Backend" dir=in action=allow protocol=tcp localport=3001

# Remover regras (se necess.)
netsh advfirewall firewall delete rule name="ChegueiApp-Frontend"
netsh advfirewall firewall delete rule name="ChegueiApp-Backend"
```

### Opção 2: Via Windows Defender Firewall (GUI)
1. Abra "Windows Defender Firewall" > "Allow an app through firewall"
2. Clique "Allow another app"
3. Selecione a pasta `packages/backend` e as portas 3001 e 5173

## 🌍 Como Funciona o Acesso

1. **Você acessa**: `http://192.168.18.145:5173`
2. **Frontend detecta**: Host é `192.168.18.145`
3. **Frontend faz requisições para**: `http://192.168.18.145:3001` (automático!)
4. **Docker interno**: Backend está ouvindo em `0.0.0.0:3001` (acessível de qualquer IP)

## 📡 Variáveis de Ambiente

Se quiser forçar uma URL específica:

**`.env` do frontend:**
```
# Deixe em branco para auto-detect ou use uma URL específica
VITE_API_URL=http://192.168.18.145:3001
```

## ✅ Testando Conectividade

### Testar se Backend está acessível
```bash
# Do PC cliente, teste a conexão
curl http://192.168.18.145:3001/health
# ou pelo navegador
http://192.168.18.145:3001/health
```

### Testar CORS
```bash
# Verifique se o backend permite a origem do frontend
curl -i -X OPTIONS http://192.168.18.145:3001/health \
  -H "Origin: http://192.168.18.145:5173"
# Procure por "Access-Control-Allow-Origin"
```

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| "Credenciais inválidas" na rede | Verifique se Backend está acessível (veja "Testando Conectividade") |
| Requisição não chega no backend | Libere a porta **3001** no firewall |
| Frontend carrega, mas API dá erro | Verifique CORS: `Access-Control-Allow-Origin` deve permitir sua IP |
| Timeout de conexão | Firewall ou Backend não respondendo |
| WebSocket não funciona no painel | Certifique-se de que port **3001** está aberta para WebSocket |

---

**Desenvolvido com ❤️ para ChegueiApp**
