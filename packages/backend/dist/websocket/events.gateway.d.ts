import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private configService;
    server: Server;
    constructor(jwtService: JwtService, configService: ConfigService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinTenant(client: Socket, data: {
        tenantId: string;
    }): void;
    handleNovoCheckin(payload: {
        tenantId: string;
        checkin: any;
    }): void;
    handleStatusAtualizado(payload: {
        tenantId: string;
        checkin: any;
    }): void;
    handleCheckinExpirado(payload: {
        tenantId: string;
        checkin: any;
    }): void;
    handleLocalizacaoAtualizada(payload: {
        tenantId: string;
        checkin: any;
    }): void;
}
