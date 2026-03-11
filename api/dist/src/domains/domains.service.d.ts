import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class DomainsService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    create(data: any, requester: any): Promise<{
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
    findAll(requester: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        domain: string;
        description: string | null;
        expiresAt: Date | null;
        status: string;
        createdById: string;
        approvedById: string | null;
    }[]>;
    approve(id: string, requester: any): Promise<{
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
    update(id: string, data: any, requester: any): Promise<{
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
    remove(id: string, requester: any): Promise<{
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
