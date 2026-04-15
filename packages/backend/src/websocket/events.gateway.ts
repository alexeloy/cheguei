import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST'],
  },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (token) {
        const payload = this.jwtService.verify(token, {
          secret: this.configService.get('JWT_SECRET') || 'cheguei-secret',
        });
        client.data.tenantId = payload.tenantId;
        client.data.userId = payload.sub;
        client.data.role = payload.role;
        client.join(`tenant:${payload.tenantId}`);
      }
    } catch {
      // Cliente sem auth ainda pode se conectar mas sem sala
    }
  }

  handleDisconnect(client: Socket) {}

  @SubscribeMessage('join_tenant')
  handleJoinTenant(@ConnectedSocket() client: Socket, @MessageBody() data: { tenantId: string }) {
    if (data?.tenantId) {
      client.join(`tenant:${data.tenantId}`);
    }
  }

  @OnEvent('checkin.novo')
  handleNovoCheckin(payload: { tenantId: string; checkin: any }) {
    this.server.to(`tenant:${payload.tenantId}`).emit('novo_checkin', payload.checkin);
  }

  @OnEvent('checkin.statusAtualizado')
  handleStatusAtualizado(payload: { tenantId: string; checkin: any }) {
    this.server.to(`tenant:${payload.tenantId}`).emit('status_atualizado', payload.checkin);
  }

  @OnEvent('checkin.expirado')
  handleCheckinExpirado(payload: { tenantId: string; checkin: any }) {
    this.server.to(`tenant:${payload.tenantId}`).emit('checkin_expirado', payload.checkin);
  }

  @OnEvent('checkin.localizacaoAtualizada')
  handleLocalizacaoAtualizada(payload: { tenantId: string; checkin: any }) {
    const { checkin } = payload;
    this.server.to(`tenant:${payload.tenantId}`).emit('localizacao_atualizada', {
      checkinId: checkin.id,
      alunoId: checkin.alunoId,
      etaMinutos: checkin.etaMinutos,
      distanciaMetros: checkin.distanciaMetros,
      ultimaLocalizacaoAt: checkin.ultimaLocalizacaoAt,
    });
  }

}
