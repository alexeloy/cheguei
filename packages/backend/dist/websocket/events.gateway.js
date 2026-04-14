"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const event_emitter_1 = require("@nestjs/event-emitter");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let EventsGateway = class EventsGateway {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ||
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
        }
        catch {
        }
    }
    handleDisconnect(client) { }
    handleJoinTenant(client, data) {
        if (data?.tenantId) {
            client.join(`tenant:${data.tenantId}`);
        }
    }
    handleNovoCheckin(payload) {
        this.server.to(`tenant:${payload.tenantId}`).emit('novo_checkin', payload.checkin);
    }
    handleStatusAtualizado(payload) {
        this.server.to(`tenant:${payload.tenantId}`).emit('status_atualizado', payload.checkin);
    }
    handleCheckinExpirado(payload) {
        this.server.to(`tenant:${payload.tenantId}`).emit('checkin_expirado', payload.checkin);
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_tenant'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleJoinTenant", null);
__decorate([
    (0, event_emitter_1.OnEvent)('checkin.novo'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleNovoCheckin", null);
__decorate([
    (0, event_emitter_1.OnEvent)('checkin.statusAtualizado'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleStatusAtualizado", null);
__decorate([
    (0, event_emitter_1.OnEvent)('checkin.expirado'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleCheckinExpirado", null);
exports.EventsGateway = EventsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: true,
            credentials: true,
            methods: ['GET', 'POST'],
        },
        namespace: '/',
        transports: ['websocket', 'polling'],
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map