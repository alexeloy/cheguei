# 📌 Sistema de Retirada Escolar (ChegueiApp)

------------------------------------------------------------------------

# 🧠 Visão Geral

Sistema SaaS multi-tenant para gerenciamento de retirada de alunos na
recpção da escola.

Permite que responsáveis informem sua chegada e que a escola visualize
isso em tempo real em um painel.

------------------------------------------------------------------------

# 🏗️ Arquitetura

## Stack

-   Backend: Node.js (NestJS)
-   Web: React
-   Mobile: React Native
-   Cloud: AWS

------------------------------------------------------------------------

# ☁️ Arquitetura AWS

-   API Gateway
-   Lambda ou ECS (Fargate)
-   Cognito (Auth)
-   DynamoDB
-   SNS (notificações)
-   SQS (filas)
-   WebSocket (tempo real)
-   S3 + CloudFront (frontend)
-   CloudWatch (logs)

------------------------------------------------------------------------

# 🧩 Multi-Tenant

## Estratégia

-   Isolamento por `tenantId`
-   Todos os dados devem conter `tenantId`

## Modelos

### Tenant

-   id
-   nome
-   plano
-   ativo
(crie outros campos em que eu possa estilizar logomarca e temas para que cada tenant tenha uma identidade visual)

### User

-   id
-   tenantId
-   nome
-   email
-   role (ADMIN, RECEPCAO, RESPONSAVEL)

### Aluno

-   id
-   tenantId
-   nome
-   turma
-   nomeFonetico
-   foto (pode ser base64 ou algo que vc sugira)

### ResponsavelAluno

-   id
-   tenantId
-   responsavelId
-   alunoId

### Checkin

-   id
-   tenantId
-   responsavelId
-   alunoId
-   status (AGUARDANDO, ENTREGUE)
-   timestamp

------------------------------------------------------------------------

# 🔐 Autenticação

-   AWS Cognito
-   JWT contendo:
    -   userId
    -   tenantId
    -   role

------------------------------------------------------------------------

# 📲 App Mobile (Pais)

## Funcionalidades

-   Login
-   Lista de filhos
-   Botão "Cheguei"
-   Acompanhamento de status


## Fluxo

1.  Usuário abre app
2.  Seleciona filho
3.  Clica "Cheguei"
4.  Sistema registra check-in
5.  Painel atualiza em tempo real

------------------------------------------------------------------------

# 🖥️ Painel Web (Recepção)

## Funcionalidades

-   Login
-   Lista de check-ins em tempo real
-   Ordenação por horário
-   Fala nome do aluno quando o responsável chega no hoário
-   Atualização de status:
    -   Aguardando
    -   Entregue
-   Possibilidade de exibir no painel midias (imagens e/ou videos institucionais). Para as imagens será definido um tempo padrao para a transicao das imagens, para os videos, será a duracao do vídeo.

## UI

-   Layout estilo painel (TV)
-   Atualização via WebSocket
-   Layout deve ser baseado nos prints que estao no diretório resources/assets
-   Toda interface (temas de cores/logomarca/etc deverá ser parametrizável)

------------------------------------------------------------------------

# ⚙️ Backend (NestJS)

## Módulos

-   Auth
-   Tenant
-   Users
-   Alunos
-   Checkin
-   Notificações
-   Integracao (possibilidade de importar dados de outro sistemas)

------------------------------------------------------------------------

# 📡 Endpoints

## Auth

POST /auth/login

------------------------------------------------------------------------

## Alunos

GET /alunos\
GET /alunos/:id

------------------------------------------------------------------------

## Check-in

POST /checkin { "alunoId": "string" }

GET /checkin/ativos

PATCH /checkin/:id/status { "status": "ENTREGUE" }

------------------------------------------------------------------------

# 🔄 Tempo Real

## Tecnologia

-   WebSocket via API Gateway

## Eventos

-   novo_checkin
-   status_atualizado

------------------------------------------------------------------------

# 🔔 Notificações

-   SNS

## Eventos

-   Check-in criado
-   Status alterado

------------------------------------------------------------------------

# 📊 Regras de Negócio

-   Responsável pode ter vários alunos
-   Aluno pode ter vários responsáveis
-   Apenas 1 check-in ativo por aluno
-   Check-in expira (configurável por tenant)
-   Quando o responsavel indicar que chegou, será falado o nome do aluno no painel durante X tempo (com uma animacao que possa indicar o tempo regressivo que aquela informacao vai sair do painel, caso tenha outro aluno para ser exibido em tela)
-   O admin pode cadastrar midias (imagens e videos) e agendar a exibição destas midias (Exibir todos os dias da semana, exibir em um dia e intervalo de horario especifico, definir data para expiração da midia, habilitar/desabilitar exibição da midia)
-   No app o responsável pode clicar novamente no botão cheguei para que o aluno seja chamado novamente, mas depois de X tempo da última chamada. Esse tempo deve ser configurável via interface pelo admin do sistema.

------------------------------------------------------------------------

# 🔒 Segurança

-   Isolamento por tenant obrigatório
-   Validação de acesso em todas as rotas
-   Logs auditáveis

------------------------------------------------------------------------

# 🚀 Escalabilidade

-   Backend stateless
-   DynamoDB com partition key: tenantId
-   Uso de SQS para picos

------------------------------------------------------------------------

# 📦 Deploy

-   Backend: ECS Fargate ou Lambda
-   Frontend: S3 + CloudFront
-   CI/CD: GitHub Actions ou CodePipeline

------------------------------------------------------------------------

# 🧪 Testes

-   Unitários (Jest)
-   Integração (Supertest)
-   E2E (opcional)

------------------------------------------------------------------------

# 📈 Futuro

-   Geolocalização automática
-   QR Code
-   Integração com câmeras
-   IA para previsão de chegada
-   Dashboard analítico

------------------------------------------------------------------------

# 🎯 Diferenciais

-   Tempo real
-   Multi-tenant
-   Escalável
-   UX simples
