import { IpsService } from './ips.service';
export declare class IpsController {
    private readonly ipsService;
    constructor(ipsService: IpsService);
    create(body: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        description: string | null;
        expiresAt: Date | null;
        status: string;
        createdById: string;
        approvedById: string | null;
    }>;
    findAll(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        description: string | null;
        expiresAt: Date | null;
        status: string;
        createdById: string;
        approvedById: string | null;
    }[]>;
    approve(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        description: string | null;
        expiresAt: Date | null;
        status: string;
        createdById: string;
        approvedById: string | null;
    }>;
    update(id: string, body: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        description: string | null;
        expiresAt: Date | null;
        status: string;
        createdById: string;
        approvedById: string | null;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        description: string | null;
        expiresAt: Date | null;
        status: string;
        createdById: string;
        approvedById: string | null;
    }>;
}
