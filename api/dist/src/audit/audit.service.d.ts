import { PrismaService } from '../database/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(params: {
        action: string;
        entity: string;
        entityId?: string;
        details?: string;
        userId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        entity: string;
        entityId: string | null;
        details: string | null;
        userId: string | null;
    }>;
    findAll(requester: any, { page, limit, search }?: {
        page?: number | undefined;
        limit?: number | undefined;
        search?: string | undefined;
    }): Promise<{
        data: ({
            user: {
                username: string;
                equipe: string;
                role: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            action: string;
            entity: string;
            entityId: string | null;
            details: string | null;
            userId: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
