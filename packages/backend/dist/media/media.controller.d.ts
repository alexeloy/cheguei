import { MediaService } from './media.service';
export declare class MediaController {
    private service;
    constructor(service: MediaService);
    findAll(user: any, tenantId?: string): Promise<import("./media.entity").Media[]>;
    findAtivas(user: any): Promise<import("./media.entity").Media[]>;
    upload(file: Express.Multer.File, body: any, user: any): Promise<import("./media.entity").Media>;
    update(id: string, body: any, user: any): Promise<import("./media.entity").Media>;
    remove(id: string, user: any): Promise<{
        success: boolean;
    }>;
}
