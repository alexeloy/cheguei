import { CheckinService } from './checkin.service';
import { CheckinStatus } from './checkin.entity';
declare class CreateCheckinDto {
    alunoId: string;
    status?: CheckinStatus;
}
declare class UpdateStatusDto {
    status: CheckinStatus;
}
declare class UpdateLocalizacaoDto {
    latitude: number;
    longitude: number;
}
export declare class CheckinController {
    private service;
    constructor(service: CheckinService);
    getAtivos(user: any): Promise<import("./checkin.entity").Checkin[]>;
    getAll(user: any): Promise<import("./checkin.entity").Checkin[]>;
    getMeus(user: any): Promise<import("./checkin.entity").Checkin[]>;
    create(dto: CreateCheckinDto, user: any): Promise<import("./checkin.entity").Checkin>;
    updateStatus(id: string, dto: UpdateStatusDto, user: any): Promise<import("./checkin.entity").Checkin>;
    updateLocalizacao(id: string, dto: UpdateLocalizacaoDto, user: any): Promise<import("./checkin.entity").Checkin>;
    cancelar(id: string, user: any): Promise<import("./checkin.entity").Checkin>;
}
export {};
