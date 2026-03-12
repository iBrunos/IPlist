import { DomainsService } from './domains.service';
export declare class DomainsController {
    private readonly domainsService;
    constructor(domainsService: DomainsService);
    create(body: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        domain: string;
        description: string | null;
        expiresAt: Date | null;
        status: string;
        createdById: string;
        approvedById: string | null;
    }>;
    findAll(req: any, page?: string, limit?: string, search?: string): Promise<{
        data: ({
            createdBy: {
                username: string;
                equipe: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            domain: string;
            description: string | null;
            expiresAt: Date | null;
            status: string;
            createdById: string;
            approvedById: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    approve(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        domain: string;
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
        domain: string;
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
        domain: string;
        description: string | null;
        expiresAt: Date | null;
        status: string;
        createdById: string;
        approvedById: string | null;
    }>;
}
