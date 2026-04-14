import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
export declare class TenantsController {
    private service;
    constructor(service: TenantsService);
    findAll(): Promise<import("./tenant.entity").Tenant[]>;
    getMyTenant(user: any): Promise<import("./tenant.entity").Tenant>;
    findOne(id: string): Promise<import("./tenant.entity").Tenant>;
    create(dto: CreateTenantDto): Promise<import("./tenant.entity").Tenant>;
    updateMe(user: any, dto: Partial<CreateTenantDto>): Promise<import("./tenant.entity").Tenant>;
    update(id: string, dto: Partial<CreateTenantDto>): Promise<import("./tenant.entity").Tenant>;
    uploadLogo(user: any, file: Express.Multer.File): Promise<import("./tenant.entity").Tenant>;
    uploadLogoById(id: string, file: Express.Multer.File): Promise<import("./tenant.entity").Tenant>;
}
