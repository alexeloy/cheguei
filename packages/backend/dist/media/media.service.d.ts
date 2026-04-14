import { Repository } from 'typeorm';
import { Media } from './media.entity';
export declare class MediaService {
    private repo;
    constructor(repo: Repository<Media>);
    findAll(tenantId?: string): Promise<Media[]>;
    findAtivas(tenantId: string): Promise<Media[]>;
    create(tenantId: string, data: Partial<Media>): Promise<Media>;
    update(id: string, tenantId: string, data: Partial<Media>): Promise<Media>;
    remove(id: string, tenantId: string): Promise<{
        success: boolean;
    }>;
}
