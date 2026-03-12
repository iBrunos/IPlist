import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class IpsService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    create(data: any, requester: any): Promise<{
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
    findAll(requester: any, { page, limit, search }?: {
        page?: number | undefined;
        limit?: number | undefined;
        search?: string | undefined;
    }): Promise<{
        data: ({
            createdBy: {
                username: string;
                equipe: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            address: string;
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
    approve(id: string, requester: any): Promise<{
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
    update(id: string, data: any, requester: any): Promise<{
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
    remove(id: string, requester: any): Promise<{
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
